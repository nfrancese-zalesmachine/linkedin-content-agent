import { callClaude, extractJSON } from '../lib/anthropic.js';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import type { PostDraft, CriticReport } from '../types/index.js';

const SYSTEM = `Sos un founder de una empresa B2B SaaS en Latinoamérica.
Tenés 2,000 conexiones en LinkedIn. Tu feed está lleno de contenido de GTM, ventas y automatización.
Sos exigente: scrolleás rápido y parás solo cuando algo es genuinamente útil o sorprendente.

Tu trabajo es evaluar un post de LinkedIn como si lo leyeras en tu feed.

Criterios de evaluación (total 10 puntos):
- Hook (0-3 pts): ¿La primera línea para tu scroll? ¿Te genera curiosidad o reconocimiento?
- Valor (0-3 pts): ¿Aprendés algo accionable? ¿Es específico o es genérico?
- Voz (0-2 pts): ¿Suena humano, desde la experiencia? ¿O suena a contenido de AI?
- Formato (0-2 pts): ¿La estructura facilita la lectura? ¿Frases cortas, una idea por línea?

Respondé SOLO con JSON válido:
{
  "score": [número de 0 a 10],
  "passed": [true si score >= ${config.criticPassThreshold}],
  "icpReaction": "descripción honesta de tu reacción como ICP al leer el post",
  "violations": ["lista de problemas concretos, vacía si no hay"],
  "suggestions": ["lista de mejoras concretas, vacía si está perfecto"]
}`;

function buildUser(draft: PostDraft): string {
  let content = `FORMATO: ${draft.format}\n\nHOOK: ${draft.hook}\n\nBODY:\n${draft.body}`;

  if (draft.format === 'carousel' && draft.slides?.length) {
    content += `\n\nSLIDES (${draft.slides.length}):\n`;
    content += draft.slides.map((s, i) => `Slide ${i + 1}: ${s.heading}\n${s.body}`).join('\n---\n');
  }
  if (draft.format === 'imagen_con_copy') {
    content += `\n\nHEADLINE: ${draft.headline}\nSUBHEADLINE: ${draft.subheadline}`;
  }
  if (draft.format === 'video_script') {
    content += `\n\nGUIÓN:\n${draft.videoScript ?? ''}`;
  }

  return `Evaluá este post como si apareciera en tu feed de LinkedIn:\n\n${content}`;
}

export async function critiquePost(draft: PostDraft): Promise<CriticReport> {
  const raw = await callClaude({
    model: 'sonnet',
    system: SYSTEM,
    user: buildUser(draft),
    maxTokens: 1024,
    retries: 2,
  });

  try {
    const parsed = JSON.parse(extractJSON(raw)) as CriticReport;
    return {
      score: parsed.score ?? 5,
      passed: (parsed.score ?? 5) >= config.criticPassThreshold,
      icpReaction: parsed.icpReaction ?? '',
      violations: parsed.violations ?? [],
      suggestions: parsed.suggestions ?? [],
    };
  } catch (err) {
    logger.warn('Critic parse failed — using default pass', { error: (err as Error).message });
    return {
      score: config.criticPassThreshold,
      passed: true,
      icpReaction: 'Evaluación no disponible.',
      violations: [],
      suggestions: [],
    };
  }
}
