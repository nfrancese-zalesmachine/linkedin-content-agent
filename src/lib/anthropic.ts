import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { logger } from './logger.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

export interface CallOptions {
  model: 'opus' | 'sonnet';
  system: string;
  user: string;
  maxTokens?: number;
  retries?: number;
}

function modelId(model: 'opus' | 'sonnet'): string {
  return model === 'opus' ? config.opusModel : config.sonnetModel;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callClaude(opts: CallOptions): Promise<string> {
  const { model, system, user, maxTokens = 4096, retries = 2 } = opts;
  const id = modelId(model);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const msg = await client.messages.create({
        model: id,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      });

      const block = msg.content[0];
      if (block.type !== 'text') throw new Error('Non-text response from Claude');
      return block.text;
    } catch (err) {
      lastError = err as Error;
      logger.warn('Claude call failed, retrying', {
        attempt,
        model: id,
        error: lastError.message,
      });
      if (attempt < retries) await sleep(1000 * Math.pow(2, attempt));
    }
  }

  throw lastError ?? new Error('Claude call failed');
}

/**
 * Extract JSON from a Claude response that may include markdown code fences
 * or surrounding prose.
 */
export function extractJSON(text: string): string {
  // Try ```json ... ``` block
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();

  // Try first {...} or [...] block
  const obj = text.match(/(\{[\s\S]*\})/);
  if (obj?.[1]) return obj[1].trim();

  const arr = text.match(/(\[[\s\S]*\])/);
  if (arr?.[1]) return arr[1].trim();

  return text.trim();
}
