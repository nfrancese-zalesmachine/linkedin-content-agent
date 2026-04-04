import { callClaude, extractJSON } from '../lib/anthropic.js';
import { AgentError } from '../types/index.js';
import type { LeadMagnetDraft, PostDraft, SessionContext } from '../types/index.js';

function buildSystem(ctx: SessionContext): string {
  return `Sos el ghost-writer de Nicolas Francese. Escribís el post de LinkedIn que promociona un Lead Magnet recién creado.

El post debe:
- Vender la PROMESA del LM, no el LM en sí
- Usar la voz exacta de Nicolas (frases cortas, sin emojis, datos concretos)
- Formato: imagen con copy (headline + caption)
- El lector debe pensar "quiero leer eso" después del primer párrafo

# Voz de Nicolas
${ctx.voiceRules}

Respondé SOLO con JSON:
{
  "format": "imagen_con_copy",
  "pillar": ${ctx.pillar},
  "hook": "primera línea del post, ≤15 palabras",
  "body": "caption completo del post, 80-120 palabras",
  "hashtags": ["hashtag1", "hashtag2"],
  "headline": "texto de la imagen, ≤8 palabras",
  "subheadline": "texto secundario, 1 frase"
}`;
}

export async function writePromoPost(
  lm: LeadMagnetDraft,
  ctx: SessionContext,
): Promise<PostDraft> {
  const topSections = lm.sections.slice(0, 3).map(s => `- ${s.title}`).join('\n');

  const user = `Lead Magnet creado:
Título: ${lm.title}
Promesa: ${lm.audiencePromise}
Primeras secciones:
${topSections}

Escribí el post de LinkedIn que promociona este LM.
El lector tiene que querer descargarlo después de leer el post.
Menciona la promesa concreta. No uses "increíble" ni "imperdible". Sé específico.`;

  const raw = await callClaude({
    model: 'opus',
    system: buildSystem(ctx),
    user,
    maxTokens: 1024,
    retries: 2,
  });

  try {
    return JSON.parse(extractJSON(raw)) as PostDraft;
  } catch (err) {
    throw new AgentError('phase2b', 'promo-post-writer', `Parse failed: ${(err as Error).message}`, raw);
  }
}
