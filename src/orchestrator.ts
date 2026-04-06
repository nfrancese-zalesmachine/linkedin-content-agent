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
  WebhookPayload,
  GenerateResult,
  PostDraft,
  LeadMagnetDraft,
  SessionContext,
  CreatorProfile,
} from './types/index.js';

// ─── Regular Post Pipeline ────────────────────────────────────────────────────

async function runPostPipeline(
  idea: ContentIdea,
  isLeadMagnetWeek: boolean,
  creatorProfile?: CreatorProfile,
  clientId?: string,
  profileId?: string,
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Format selection
  const { format, rationale } = await selectFormat(idea, isLeadMagnetWeek);
  logger.info('Format selected', { title: idea.title, format, rationale });

  if (format === 'lead_magnet') {
    return runLeadMagnetPipeline(idea, creatorProfile, clientId, profileId);
  }

  // Phase 0b: Context assembly (no LLM, cached)
  const ctx = await buildSessionContext(idea, format, creatorProfile);

  // Phase 1: Write
  let draft: PostDraft = await writePost(idea, ctx);

  // Phase 2: Critique
  const critic = await critiquePost(draft);
  logger.info('Critic score', { title: idea.title, score: critic.score, passed: critic.passed });

  // Phase 3: Rewrite if needed
  let rewrote = false;
  if (!critic.passed) {
    draft = await rewritePost(draft, critic, ctx);
    rewrote = true;
  }

  // Phase 4: Persist to Supabase
  let supabasePostId: string | undefined;
  const result: GenerateResult = {
    success: true,
    ideaTitle: idea.title,
    format,
    pillar: ctx.pillar,
    criticScore: critic.score,
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
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Context assembly
  const ctx = await buildSessionContext(idea, 'lead_magnet', creatorProfile) as SessionContext;

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
  const { ideas, isLeadMagnetWeek, creatorProfile, clientId, profileId } = payload;

  logger.info('Orchestrator started', {
    count: ideas.length,
    isLeadMagnetWeek,
    tenant: creatorProfile?.creatorName ?? 'nicolas',
    clientId,
  });

  const results = await Promise.all(
    ideas.map(idea =>
      runPostPipeline(idea, isLeadMagnetWeek ?? false, creatorProfile, clientId, profileId).catch(err => {
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
