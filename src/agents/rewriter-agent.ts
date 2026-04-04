import { callClaude, extractJSON } from '../lib/anthropic.js';
import { logger } from '../lib/logger.js';
import type { PostDraft, CriticReport, SessionContext } from '../types/index.js';

function buildSystem(ctx: SessionContext): string {
  return `Sos el ghost-writer de Nicolas Francese. Recibís un post que no pasó el test de calidad y el feedback detallado del crítico. Tu trabajo es reescribirlo respetando:

1. La misma idea central (no cambiar el tema)
2. La voz de Nicolas (reglas abajo)
3. El formato original (carousel, imagen, video — no cambiar)
4. Aplicar CADA sugerencia del crítico

# Voz de Nicolas
${ctx.voiceRules}

Respondé SOLO con JSON válido en el mismo schema que el post original.`;
}

function buildUser(draft: PostDraft, critic: CriticReport): string {
  const violationsText = critic.violations.length > 0
    ? `Problemas encontrados:\n${critic.violations.map(v => `- ${v}`).join('\n')}`
    : '';
  const suggestionsText = critic.suggestions.length > 0
    ? `Mejoras requeridas:\n${critic.suggestions.map(s => `- ${s}`).join('\n')}`
    : '';

  return `POST ORIGINAL (score: ${critic.score}/10):
${JSON.stringify(draft, null, 2)}

EVALUACIÓN DEL CRÍTICO:
${critic.icpReaction}

${violationsText}

${suggestionsText}

Reescribí el post aplicando todas las mejoras. Mantené la misma estructura JSON.`;
}

export async function rewritePost(
  draft: PostDraft,
  critic: CriticReport,
  ctx: SessionContext,
): Promise<PostDraft> {
  const raw = await callClaude({
    model: 'opus',
    system: buildSystem(ctx),
    user: buildUser(draft, critic),
    maxTokens: 3000,
    retries: 2,
  });

  try {
    const parsed = JSON.parse(extractJSON(raw)) as PostDraft;
    if (!parsed.hook || !parsed.body) {
      logger.warn('Rewriter produced incomplete output — keeping original');
      return draft;
    }
    return parsed;
  } catch {
    logger.warn('Rewriter parse failed — keeping original draft');
    return draft;
  }
}
