import { buildSessionContext } from './agents/context-agent.js';
import { selectFormat } from './agents/format-selector-agent.js';
import { writePost } from './agents/post-writer-agent.js';
import { critiquePost } from './agents/critic-agent.js';
import { rewritePost } from './agents/rewriter-agent.js';
import { refineLMTopic, researchLMTopic } from './agents/research-agent.js';
import { buildLMOutline } from './agents/lm-outline-agent.js';
import { writeLMSection, assembleLM } from './agents/lm-section-writer-agent.js';
import { writePromoPost } from './agents/promo-post-writer-agent.js';
import { postDraftToBlocks, leadMagnetToBlocks } from './skills/notion-formatter.js';
import {
  createTaskPage,
  createLeadMagnetPage,
  appendBlocks,
  markIdeaInProgress,
} from './lib/notion.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import type {
  ContentIdea,
  WebhookPayload,
  GenerateResult,
  PostDraft,
  LeadMagnetDraft,
  SessionContext,
} from './types/index.js';

// ─── Regular Post Pipeline ────────────────────────────────────────────────────

async function runPostPipeline(
  idea: ContentIdea,
  isLeadMagnetWeek: boolean,
  notionOutputDbId?: string,
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Format selection
  const { format, rationale } = await selectFormat(idea, isLeadMagnetWeek);
  logger.info('Format selected', { title: idea.title, format, rationale });

  if (format === 'lead_magnet') {
    return runLeadMagnetPipeline(idea, notionOutputDbId);
  }

  // Phase 0b: Context assembly (no LLM, cached)
  const ctx = await buildSessionContext(idea, format);

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

  // Phase 4: Persist to Notion
  let notionPageId: string | undefined;
  let notionPageUrl: string | undefined;

  try {
    const blocks = postDraftToBlocks(draft);
    const page = await createTaskPage({ title: idea.title, dbId: notionOutputDbId });
    await appendBlocks(page.id, blocks);
    notionPageId = page.id;
    notionPageUrl = page.url;

    if (idea.notionId) {
      await markIdeaInProgress(idea.notionId).catch(err =>
        logger.warn('Could not mark idea in progress', { error: err.message }),
      );
    }
  } catch (err) {
    logger.error('Notion persist failed', { error: (err as Error).message });
    // Continue — return content in response body
  }

  return {
    success: true,
    ideaTitle: idea.title,
    format,
    pillar: ctx.pillar,
    criticScore: critic.score,
    rewrote,
    notionPageId,
    notionPageUrl,
    content: { post: draft },
    durationMs: Date.now() - start,
  };
}

// ─── Lead Magnet Pipeline ─────────────────────────────────────────────────────

async function runLeadMagnetPipeline(
  idea: ContentIdea,
  notionOutputDbId?: string,
): Promise<GenerateResult> {
  const start = Date.now();

  // Phase 0: Context assembly
  const ctx = await buildSessionContext(idea, 'lead_magnet') as SessionContext;

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

  // Phase 6: Persist LM to Notion
  let notionPageId: string | undefined;
  let notionPageUrl: string | undefined;

  try {
    const { part1, overflow } = leadMagnetToBlocks(lmDraft);
    const page = await createLeadMagnetPage({
      title: lmDraft.title,
      topic: lmDraft.topic,
      pillar: lmDraft.pillar,
      dbId: notionOutputDbId,
    });
    await appendBlocks(page.id, part1);
    if (overflow.length > 0) {
      await appendBlocks(page.id, overflow);
    }
    notionPageId = page.id;
    notionPageUrl = page.url;

    if (idea.notionId) {
      await markIdeaInProgress(idea.notionId).catch(() => null);
    }
  } catch (err) {
    logger.error('Notion LM persist failed', { error: (err as Error).message });
  }

  // Phase 7: Persist promo post task if available
  if (promoPost) {
    try {
      const promoTitle = `LM Promo: ${lmDraft.title}`;
      const promoPage = await createTaskPage({ title: promoTitle, dbId: notionOutputDbId });
      await appendBlocks(promoPage.id, postDraftToBlocks(promoPost));
    } catch (err) {
      logger.warn('Promo post Notion persist failed', { error: (err as Error).message });
    }
  }

  return {
    success: true,
    ideaTitle: idea.title,
    format: 'lead_magnet',
    pillar: ctx.pillar,
    criticScore: 0, // No critic on LM (length makes it impractical)
    rewrote: false,
    notionPageId,
    notionPageUrl,
    content: { leadMagnet: lmDraft, promoPost },
    durationMs: Date.now() - start,
  };
}

// ─── Batch Orchestrator ───────────────────────────────────────────────────────

export async function generateContent(payload: WebhookPayload): Promise<GenerateResult[]> {
  const { ideas, isLeadMagnetWeek, notionOutputDbId } = payload;

  logger.info('Orchestrator started', {
    count: ideas.length,
    isLeadMagnetWeek,
  });

  // Run all ideas in parallel
  const results = await Promise.all(
    ideas.map(idea =>
      runPostPipeline(idea, isLeadMagnetWeek ?? false, notionOutputDbId).catch(err => {
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
