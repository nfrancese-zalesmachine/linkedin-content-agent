import { deepResearch } from '../lib/perplexity.js';
import { callClaude, extractJSON } from '../lib/anthropic.js';
import type { ContentIdea, ResearchReport } from '../types/index.js';

const LM_TOPIC_SYSTEM = `Sos un estratega de contenido B2B. Tu trabajo es refinar una idea de contenido en un tema preciso para un Lead Magnet.

El Lead Magnet debe:
- Tener una promesa específica y cuantificable
- Estar dirigido a founders, CEOs o directores de ventas de empresas B2B SaaS/Servicios en Latinoamérica
- Ser accionable: el lector debe poder implementar algo en 30 días

Respondé SOLO con JSON:
{
  "refinedTitle": "título del LM, específico y con promesa cuantificada",
  "audiencePromise": "qué va a poder hacer el lector después de leer el LM (1 frase)",
  "researchQuery": "query para investigar en profundidad el tema"
}`;

/**
 * Step 1: Refine idea into a precise LM topic with title + audience promise
 */
export async function refineLMTopic(idea: ContentIdea): Promise<{
  refinedTitle: string;
  audiencePromise: string;
  researchQuery: string;
}> {
  const raw = await callClaude({
    model: 'sonnet',
    system: LM_TOPIC_SYSTEM,
    user: `Idea original:\nTítulo: ${idea.title}\nCategoría: ${idea.category}\nDescripción: ${idea.description}\n${idea.detail ? `Detalle: ${idea.detail}` : ''}`,
    maxTokens: 512,
    retries: 2,
  });

  try {
    return JSON.parse(extractJSON(raw)) as {
      refinedTitle: string;
      audiencePromise: string;
      researchQuery: string;
    };
  } catch {
    return {
      refinedTitle: idea.title,
      audiencePromise: `Guía completa sobre ${idea.title}`,
      researchQuery: `${idea.title} ${idea.category} B2B SaaS Latinoamérica estadísticas frameworks 2025 2026`,
    };
  }
}

/**
 * Step 2: Deep research via Perplexity
 */
export async function researchLMTopic(
  idea: ContentIdea,
  lmMeta: { refinedTitle: string; audiencePromise: string; researchQuery: string },
): Promise<ResearchReport> {
  return deepResearch(
    lmMeta.refinedTitle,
    `${lmMeta.researchQuery}. Audiencia: ${lmMeta.audiencePromise}. Categoría: ${idea.category}`,
  );
}
