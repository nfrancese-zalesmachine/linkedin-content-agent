import { z } from 'zod';
import { PostDraftSchema, CriticReportSchema, WebhookPayloadSchema } from '../types/index.js';
import { logger } from '../lib/logger.js';

export function validatePostDraft(raw: unknown): z.infer<typeof PostDraftSchema> | null {
  const result = PostDraftSchema.safeParse(raw);
  if (!result.success) {
    logger.warn('PostDraft validation failed', { errors: result.error.flatten() });
    return null;
  }
  return result.data;
}

export function validateCriticReport(raw: unknown): z.infer<typeof CriticReportSchema> | null {
  const result = CriticReportSchema.safeParse(raw);
  if (!result.success) {
    logger.warn('CriticReport validation failed', { errors: result.error.flatten() });
    return null;
  }
  return result.data;
}

export function validateWebhookPayload(raw: unknown): z.infer<typeof WebhookPayloadSchema> {
  return WebhookPayloadSchema.parse(raw); // throws ZodError on failure
}
