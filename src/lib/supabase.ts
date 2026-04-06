import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { logger } from './logger.js';
import type { GenerateResult } from '../types/index.js';

// ─── Database types (minimal — covers only the tables we use) ─────────────────

interface Database {
  public: {
    Tables: {
      posts: {
        Row: PostInsert & { id: string; created_at: string };
        Insert: PostInsert;
        Update: Partial<PostInsert>;
      };
    };
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────

let _client: ReturnType<typeof createClient<Database>> | null = null;

function getClient() {
  if (!_client) {
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error('Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    }
    _client = createClient<Database>(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostInsert {
  client_id?: string;
  profile_id?: string;
  creator_name?: string;
  idea_title: string;
  idea_notion_id?: string;
  format: string;
  pillar: number;
  hook: string;
  body: string;
  hashtags: string[];
  format_content: Record<string, unknown>;
  critic_score: number;
  rewrote: boolean;
  status: string;
  scheduled_for?: string;
}

// ─── Persist ─────────────────────────────────────────────────────────────────

/**
 * Save a GenerateResult to Supabase posts table.
 * Returns the inserted row id and a dashboard URL.
 * Throws on error so callers can decide whether to swallow it.
 */
export async function persistPost(
  result: GenerateResult,
  opts: { clientId?: string; profileId?: string; notionId?: string; creatorName?: string } = {},
): Promise<{ id: string }> {
  const sb = getClient();

  const draft = result.content.post ?? result.content.promoPost;
  if (!draft && result.format !== 'lead_magnet') {
    throw new Error('No post draft in result to persist');
  }

  // For lead magnets the "post" is the promo post; the full LM is in format_content
  const hook = draft?.hook ?? result.content.leadMagnet?.title ?? result.ideaTitle;
  const body = draft?.body ?? result.content.leadMagnet?.markdownContent ?? '';
  const hashtags = draft?.hashtags ?? [];

  const formatContent: Record<string, unknown> = {};
  if (draft?.slides)        formatContent.slides = draft.slides;
  if (draft?.headline)      formatContent.headline = draft.headline;
  if (draft?.subheadline)   formatContent.subheadline = draft.subheadline;
  if (draft?.videoScript)   formatContent.videoScript = draft.videoScript;
  if (draft?.videoBeats)    formatContent.videoBeats = draft.videoBeats;
  if (result.content.leadMagnet) {
    formatContent.leadMagnet = {
      title: result.content.leadMagnet.title,
      wordCount: result.content.leadMagnet.wordCount,
      sectionCount: result.content.leadMagnet.sectionCount,
      audiencePromise: result.content.leadMagnet.audiencePromise,
      markdownContent: result.content.leadMagnet.markdownContent,
    };
  }

  const row: PostInsert = {
    client_id: opts.clientId,
    profile_id: opts.profileId,
    creator_name: opts.creatorName,
    idea_title: result.ideaTitle,
    idea_notion_id: opts.notionId,
    format: result.format,
    pillar: result.pillar,
    hook,
    body,
    hashtags,
    format_content: formatContent,
    critic_score: result.criticScore,
    rewrote: result.rewrote,
    status: 'ready_to_review',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('posts') as any)
    .insert(row)
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  if (!data) throw new Error('Supabase insert returned no data');

  logger.info('Post persisted to Supabase', { id: data.id, format: result.format });
  return { id: data.id };
}

/**
 * Returns true if Supabase is configured (both URL and key present).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseServiceKey);
}
