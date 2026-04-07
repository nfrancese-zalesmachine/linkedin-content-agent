import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ContentFormat = 'carousel' | 'imagen_con_copy' | 'video_script' | 'lead_magnet';
export type ContentPillar = 1 | 2 | 3 | 4 | 5;

// ─── Input ────────────────────────────────────────────────────────────────────

export const ContentIdeaSchema = z.object({
  notionId: z.string().optional(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().default(''),
  detail: z.string().default(''),
  additionalNotes: z.string().default(''),
  sourceUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
});
export type ContentIdea = z.infer<typeof ContentIdeaSchema>;

// ─── Creator Profile (multi-tenant) ──────────────────────────────────────────

export const PillarProfileSchema = z.object({
  id: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  name: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  definition: z.string().min(10),
  hookPatterns: z.string().min(10),
  examples: z.string().default(''),
});
export type PillarProfile = z.infer<typeof PillarProfileSchema>;

export const CreatorProfileSchema = z.object({
  creatorName: z.string().min(1),
  voiceRules: z.string().min(10),
  icp: z.string().min(10),
  pillars: z.array(PillarProfileSchema).min(1).max(5),
  language: z.enum(['es', 'en', 'pt']).default('es'),
  linkedinBestPractices: z.string().optional(),
});
export type CreatorProfile = z.infer<typeof CreatorProfileSchema>;

export const WebhookPayloadSchema = z.object({
  clientId: z.string().optional(),
  profileId: z.string().optional(),
  ideas: z.array(ContentIdeaSchema).min(1).max(10),
  weekIndex: z.number().int().min(1).max(52).optional(),
  isLeadMagnetWeek: z.boolean().default(false),
  creatorProfile: CreatorProfileSchema.optional(),
  recentHooks: z.array(z.string()).optional(),
});
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// ─── Internal Context ─────────────────────────────────────────────────────────

export interface SessionContext {
  pillar: ContentPillar;
  pillarDefinition: string;
  voiceRules: string;
  formatSpec: string;
  fewShotExamples: string; // 3 real posts from same pillar
  linkedinBestPractices: string;
  hookPatterns: string;
  language: 'es' | 'en' | 'pt';
}

export interface FormatSpec {
  name: ContentFormat;
  slideCount?: { min: number; max: number };
  maxWordsPerBlock: number;
  requiredSections: string[];
  outputTemplate: string; // labeled section template injected into writer prompt
  prohibitions: string[];
}

// ─── Drafts ───────────────────────────────────────────────────────────────────

export const SlideSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const PostDraftSchema = z.object({
  format: z.enum(['carousel', 'imagen_con_copy', 'video_script']),
  pillar: z.number().int().min(1).max(5),
  hook: z.string().min(1),
  body: z.string().min(10),
  hashtags: z.array(z.string()).default([]),
  // carousel
  slides: z.array(SlideSchema).optional(),
  // imagen_con_copy
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  // video_script
  videoScript: z.string().optional(),
  videoBeats: z.string().optional(),
});
export type PostDraft = z.infer<typeof PostDraftSchema>;

export const LMSectionSchema = z.object({
  sectionIndex: z.number().int().min(1),
  title: z.string(),
  content: z.string().min(50),
  wordCount: z.number().int(),
});
export type LMSection = z.infer<typeof LMSectionSchema>;

export const LeadMagnetDraftSchema = z.object({
  title: z.string(),
  topic: z.string(),
  pillar: z.number().int().min(1).max(5),
  audiencePromise: z.string(),
  sections: z.array(LMSectionSchema),
  markdownContent: z.string(), // assembled full document
  wordCount: z.number().int(),
  sectionCount: z.number().int(),
});
export type LeadMagnetDraft = z.infer<typeof LeadMagnetDraftSchema>;

// ─── LM Intermediate ──────────────────────────────────────────────────────────

export const LMOutlineSchema = z.object({
  title: z.string(),
  audiencePromise: z.string(),
  sections: z.array(z.object({
    index: z.number().int(),
    title: z.string(),
    description: z.string(), // one-line: what this section must cover
    keyPoints: z.array(z.string()), // 3-5 bullet points to address
  })),
});
export type LMOutline = z.infer<typeof LMOutlineSchema>;

// ─── Research ─────────────────────────────────────────────────────────────────

export interface ResearchReport {
  topic: string;
  content: string; // raw Perplexity text
  citations: string[];
  wordCount: number;
  usedFallback: boolean; // true if Perplexity was unavailable
}

// ─── Critic ───────────────────────────────────────────────────────────────────

export const CriticReportSchema = z.object({
  score: z.number().min(0).max(10),
  passed: z.boolean(),
  icpReaction: z.string(), // "would a B2B SaaS founder stop scrolling?" + rationale
  violations: z.array(z.string()),
  suggestions: z.array(z.string()),
});
export type CriticReport = z.infer<typeof CriticReportSchema>;

// ─── Output ───────────────────────────────────────────────────────────────────

export const GenerateResultSchema = z.object({
  success: z.boolean(),
  ideaTitle: z.string(),
  format: z.enum(['carousel', 'imagen_con_copy', 'video_script', 'lead_magnet']),
  pillar: z.number().int().min(1).max(5),
  criticScore: z.number(),
  rewrote: z.boolean(),
  supabasePostId: z.string().optional(),
  content: z.object({
    post: PostDraftSchema.optional(),
    leadMagnet: LeadMagnetDraftSchema.optional(),
    promoPost: PostDraftSchema.optional(),
  }),
  error: z.string().optional(),
  durationMs: z.number().int(),
});
export type GenerateResult = z.infer<typeof GenerateResultSchema>;

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AgentError extends Error {
  constructor(
    public readonly phase: string,
    public readonly agent: string,
    message: string,
    public readonly partialOutput?: unknown,
  ) {
    super(`[${phase}/${agent}] ${message}`);
    this.name = 'AgentError';
  }
}
