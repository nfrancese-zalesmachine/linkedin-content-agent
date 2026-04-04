import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  anthropicApiKey: required('ANTHROPIC_API_KEY'),
  perplexityApiKey: process.env['PERPLEXITY_API_KEY'] ?? null,
  notionToken: required('NOTION_TOKEN'),
  notionIdeasDbId: optional('NOTION_IDEAS_DB_ID', '2eea0b460653805aa372c7903de724a5'),
  notionTasksDbId: optional('NOTION_TASKS_DB_ID', '18ca0b46065381388fd0fcaaf7c5dfd4'),
  notionLeadsDbId: optional('NOTION_LEADS_DB_ID', '313a0b46065381aa8f31c4d7368812c4'),

  port: parseInt(optional('PORT', '3000')),

  // Models
  opusModel: optional('OPUS_MODEL', 'claude-opus-4-6'),
  sonnetModel: optional('SONNET_MODEL', 'claude-sonnet-4-6'),

  // Quality gate
  criticPassThreshold: parseFloat(optional('CRITIC_PASS_THRESHOLD', '7')),
  maxRewriteCycles: parseInt(optional('MAX_REWRITE_CYCLES', '1')),

  // Lead Magnet
  lmMinWords: parseInt(optional('LM_MIN_WORDS', '3000')),
  lmMaxTokens: parseInt(optional('LM_MAX_TOKENS', '8000')),

  // Cache
  contextCacheTtlMs: parseInt(optional('CONTEXT_CACHE_TTL_MS', '86400000')),

  // Security
  webhookSecret: process.env['WEBHOOK_SECRET'] ?? null,
} as const;
