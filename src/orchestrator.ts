import { buildSessionContext } from './agents/context-agent.js';
import { selectFormat } from './agents/format-selector-agent.js';
import { writePost } from './agents/post-writer-agent.js';
import { critiquePost } from './agents/critic-agent.js';
import { rewritePost } from './agents/rewriter-agent.js';
import { refineLMTopic, researchLMTopic } from './agents/research-agent.js';
import { buildLMOutline } from './agents/lm-outline-agent.js';
import { writeLMSection, assembleLM } from './agents/lm-section-writer-agent.js';
import { writePromoPost } from './agents/promo-post-writer-agent.js';
import { persistPost, isSupabaseConfigured } from './lib/supabase.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import type {
  ContentIdea,
  ContentFormat,
  WebhookPayload,
  GenerateResult,
  PostDraft,
  LeadMagnetDraft,
  SessionContext,
  CreatorProfile,
} from './types/index.js';

// ─── Format pre-assignment ────────────────────────────────────────────────────

// Deterministically assigns a format to each idea slot based on the distribution
// map. Uses a simple fill-then-shuffle approach so the distribution is exact.
function preAssignFormats(count: number, distribution?: Record<string, number>): (ContentFormat | undefined)[] {
  if (!distribution || Object.keys(distribution).length === 0) {
    return Array(count).fill(undefined);
  }

  const slots: ContentFormat[] = [];
  for (const [fmt, n] of Object.entries(distribution)) {
    for (let i = 0; i < n; i++) {
      slots.push(fmt as ContentFormat);
    }
  }

  // Fisher-Yates shuffle so format order is random across positions
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  // Trim or pad to match idea count
  while (slots.length < count) {
    slots.push(slots[slots.length % slots.length] ?? 'imagen_con_copy');
  }
  return slots.slice(0, count);
}

// ─── Regular Post Pipeline ────────────────────────────────────────────────────

async function runPostPipeline(
  idea: ContentIdea,
  isLeadMagnetWeek: boolean,
  creatorProfile?: CreatorProfile,
  clientId?: string,
  profileId?: string,
  recentHooks?: string[],
  clientCompanyName?: string,
  preAssignedFormat?: ContentFormat,
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Format selection — use pre-assigned format when provided
  let format: ContentFormat;
  let rationale: string;
  if (preAssignedFormat) {
    format = preAssignedFormat;
    rationale = 'Pre-assigned by formatDistribution from platform.';
    logger.info('Format pre-assigned', { title: idea.title, format });
  } else {
    ({ format, rationale } = await selectFormat(idea, isLeadMagnetWeek));
    logger.info('Format selected', { title: idea.title, format, rationale });
  }

  if (format === 'lead_magnet') {
    return runLeadMagnetPipeline(idea, creatorProfile, clientId, profileId, clientCompanyName);
  }

  // Phase 0b: Context assembly (no LLM, cached)
  const ctx = await buildSessionContext(idea, format, creatorProfile, clientCompanyName);

  // Phase 1: Write
  let draft: PostDraft = await writePost(idea, ctx, recentHooks);

  // Phase 2: Critique
  const critic = await critiquePost(draft);
  logger.info('Critic score', { title: idea.title, score: critic.score, passed: critic.passed });

  // Phase 3: Rewrite if needed
  let rewrote = false;
  let finalCritic = critic;
  if (!critic.passed) {
    draft = await rewritePost(draft, critic, ctx);
    rewrote = true;
    finalCritic = await critiquePost(draft);
    logger.info('Post-rewrite score', { title: idea.title, before: critic.score, after: finalCritic.score });
  }

  // Phase 4: Persist to Supabase
  let supabasePostId: string | undefined;
  const result: GenerateResult = {
    success: true,
    ideaTitle: idea.title,
    format,
    pillar: ctx.pillar,
    criticScore: finalCritic.score,
    rewrote,
    content: { post: draft },
    durationMs: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const { id } = await persistPost(result, { notionId: idea.notionId, clientId, profileId, creatorName: creatorProfile?.creatorName });
      supabasePostId = id;
    } catch (err) {
      logger.error('Supabase persist failed', { error: (err as Error).message });
    }
  }

  return {
    ...result,
    supabasePostId,
    durationMs: Date.now() - start,
  };
}

// ─── Lead Magnet Pipeline ─────────────────────────────────────────────────────

async function runLeadMagnetPipeline(
  idea: ContentIdea,
  creatorProfile?: CreatorProfile,
  clientId?: string,
  profileId?: string,
  clientCompanyName?: string,
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Context assembly
  const ctx = await buildSessionContext(idea, 'lead_magnet', creatorProfile, clientCompanyName) as SessionContext;

  // Phase 1: Refine topic + Research (parallel)
  const lmMeta = await refineLMTopic(idea);
  const research = await researchLMTopic(idea, lmMeta);
  logger.info('LM research complete', { title: lmMeta.refinedTitle, words: research.wordCount, fallback: research.usedFallback });

  // Phase 2: Build outline
  const outline = await buildLMOutline(idea, lmMeta, research);
  logger.info('LM outline built', { sections: outline.sections.length });

  // Phase 3: Write all sections in parallel (Opus)
  const targetWordsPerSection = Math.ceil(config.lmMinWords / outline.sections.length);
  const sectionResults = await Promise.all(
    outline.sections.map(section =>
      writeLMSection(section, outline, research, ctx.voiceRules, targetWordsPerSection),
    ),
  );

  // Phase 4: Assemble
  const assembled = assembleLM(sectionResults, outline, ctx.pillar);
  const lmDraft: LeadMagnetDraft = {
    title: outline.title,
    topic: idea.category,
    pillar: ctx.pillar,
    audiencePromise: outline.audiencePromise,
    sections: sectionResults.sort((a, b) => a.sectionIndex - b.sectionIndex),
    ...assembled,
  };
  logger.info('LM assembled', { words: lmDraft.wordCount, sections: lmDraft.sectionCount });

  // Phase 5: Write promo post
  let promoPost: PostDraft | undefined;
  try {
    promoPost = await writePromoPost(lmDraft, ctx);
  } catch (err) {
    logger.warn('Promo post write failed', { error: (err as Error).message });
  }

  // Phase 6: Persist LM + promo to Supabase
  let supabasePostId: string | undefined;
  const lmResult: GenerateResult = {
    success: true,
    ideaTitle: idea.title,
    format: 'lead_magnet',
    pillar: ctx.pillar,
    criticScore: 0,
    rewrote: false,
    content: { leadMagnet: lmDraft, promoPost },
    durationMs: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const { id } = await persistPost(lmResult, { notionId: idea.notionId, clientId, profileId });
      supabasePostId = id;
      if (promoPost) {
        await persistPost({
          ...lmResult,
          format: 'imagen_con_copy',
          ideaTitle: `LM Promo: ${lmDraft.title}`,
          content: { post: promoPost },
        }, { clientId, profileId }).catch(err =>
          logger.warn('Supabase promo post persist failed', { error: err.message }),
        );
      }
    } catch (err) {
      logger.error('Supabase LM persist failed', { error: (err as Error).message });
    }
  }

  return {
    ...lmResult,
    supabasePostId,
    durationMs: Date.now() - start,
  };
}

// ─── Batch Orchestrator ───────────────────────────────────────────────────────

export async function generateContent(payload: WebhookPayload): Promise<GenerateResult[]> {
  const { ideas, isLeadMagnetWeek, creatorProfile, clientId, profileId, recentHooks, clientCompanyName, formatDistribution } = payload;

  // Pre-assign formats before kicking off parallel pipelines so distribution is
  // respected regardless of execution order.
  const preAssigned = preAssignFormats(ideas.length, formatDistribution);

  logger.info('Orchestrator started', {
    count: ideas.length,
    isLeadMagnetWeek,
    tenant: creatorProfile?.creatorName ?? 'nicolas',
    clientId,
    formatDistribution,
  });

  const results = await Promise.all(
    ideas.map((idea, idx) =>
      runPostPipeline(idea, isLeadMagnetWeek ?? false, creatorProfile, clientId, profileId, recentHooks, clientCompanyName, preAssigned[idx]).catch(err => {
        logger.error('Pipeline failed for idea', { title: idea.title, error: err.message });
        const result: GenerateResult = {
          success: false,
          ideaTitle: idea.title,
          format: 'carousel',
          pillar: 1,
          criticScore: 0,
          rewrote: false,
          content: {},
          error: err.message,
          durationMs: 0,
        };
        return result;
      }),
    ),
  );

  logger.info('Orchestrator complete', {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  });

  return results;
}
