import { classifyPillar, classifyPillarFromProfile } from '../skills/pillar-classifier.js';

const DEFAULT_LINKEDIN_BEST_PRACTICES = `
- Hook must stop the scroll in the first line
- Short paragraphs, one idea per line
- No buzzwords, no fluff
- End with a clear takeaway or question
- 3-5 hashtags max
`.trim();

import { getFormatSpec, getOutputTemplate } from '../skills/format-rules.js';
import { getHookPatterns } from '../skills/hook-patterns.js';
import {
  loadVoiceRules,
  loadLinkedInBestPractices,
  loadPillarDefinition,
  loadFewShotExamples,
} from '../lib/knowledge-loader.js';
import type { ContentIdea, ContentFormat, SessionContext, ContentPillar, CreatorProfile } from '../types/index.js';

/**
 * Context Agent — No LLM. Assembles SessionContext from knowledge base + cache.
 * Fast and cheap: pure file reads with in-memory caching.
 *
 * When a `creatorProfile` is provided (multi-tenant / CaaS path), all knowledge
 * is taken directly from the profile — no file I/O. The Nicolas default path
 * (no profile) is completely unchanged.
 */
export async function buildSessionContext(
  idea: ContentIdea,
  format: ContentFormat,
  creatorProfile?: CreatorProfile,
): Promise<SessionContext> {
  const formatSpec = `${getOutputTemplate(format)}\n\nPROHIBICIONES DE FORMATO:\n${getFormatSpec(format).prohibitions.map(p => `- ${p}`).join('\n')}`;

  // ─── Multi-tenant path: use inline CreatorProfile ─────────────────────────
  if (creatorProfile) {
    const language = creatorProfile.language ?? 'es';
    const pillar = classifyPillarFromProfile(
      idea.category,
      idea.description,
      creatorProfile.pillars,
    );
    const pillarProfile = creatorProfile.pillars.find(p => p.id === pillar) ?? creatorProfile.pillars[0];
    const linkedinBestPractices = creatorProfile.linkedinBestPractices
      ?? await loadLinkedInBestPractices().catch(() => DEFAULT_LINKEDIN_BEST_PRACTICES);

    // Prepend language instruction so all agents write in the correct language
    const langPrefix = language !== 'es'
      ? `LANGUAGE: Write ALL content in ${language === 'en' ? 'English' : 'Portuguese'}. Never switch to another language.\n\n`
      : '';

    return {
      pillar,
      pillarDefinition: pillarProfile.definition,
      voiceRules: langPrefix + creatorProfile.voiceRules,
      formatSpec,
      fewShotExamples: pillarProfile.examples,
      linkedinBestPractices,
      hookPatterns: pillarProfile.hookPatterns,
      language,
      learnedPreferences: creatorProfile.learnedPreferences,
    };
  }

  // ─── Default path: load from Nicolas's knowledge files ───────────────────
  const pillar = classifyPillar(idea.category, idea.description) as ContentPillar;

  const [voiceRules, linkedinBestPractices, pillarDefinition, fewShotExamples] =
    await Promise.all([
      loadVoiceRules(),
      loadLinkedInBestPractices(),
      loadPillarDefinition(pillar),
      loadFewShotExamples(pillar),
    ]);

  const hookPatterns = getHookPatterns(pillar);

  return {
    pillar,
    pillarDefinition,
    voiceRules,
    formatSpec,
    fewShotExamples,
    linkedinBestPractices,
    hookPatterns,
    language: 'es',
  };
}
