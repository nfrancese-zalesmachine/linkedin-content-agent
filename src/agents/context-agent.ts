import { classifyPillar } from '../skills/pillar-classifier.js';
import { getFormatSpec, getOutputTemplate } from '../skills/format-rules.js';
import { getHookPatterns } from '../skills/hook-patterns.js';
import {
  loadVoiceRules,
  loadLinkedInBestPractices,
  loadPillarDefinition,
  loadFewShotExamples,
} from '../lib/knowledge-loader.js';
import type { ContentIdea, ContentFormat, SessionContext, ContentPillar } from '../types/index.js';

/**
 * Context Agent — No LLM. Assembles SessionContext from knowledge base + cache.
 * Fast and cheap: pure file reads with in-memory caching.
 */
export async function buildSessionContext(
  idea: ContentIdea,
  format: ContentFormat,
): Promise<SessionContext> {
  const pillar = classifyPillar(idea.category, idea.description) as ContentPillar;

  const [voiceRules, linkedinBestPractices, pillarDefinition, fewShotExamples] =
    await Promise.all([
      loadVoiceRules(),
      loadLinkedInBestPractices(),
      loadPillarDefinition(pillar),
      loadFewShotExamples(pillar),
    ]);

  const formatSpec = `${getOutputTemplate(format)}\n\nPROHIBICIONES DE FORMATO:\n${getFormatSpec(format).prohibitions.map(p => `- ${p}`).join('\n')}`;
  const hookPatterns = getHookPatterns(pillar);

  return {
    pillar,
    pillarDefinition,
    voiceRules,
    formatSpec,
    fewShotExamples,
    linkedinBestPractices,
    hookPatterns,
  };
}
