import { callClaude, extractJSON } from '../lib/anthropic.js';
import { logger } from '../lib/logger.js';
import type { ContentIdea, ContentFormat } from '../types/index.js';

const SYSTEM = `Sos un experto en estrategia de contenido para LinkedIn B2B.
Tu rol es elegir el formato óptimo para una idea de contenido.

Formatos disponibles:
- carousel: múltiples pasos, errores a enumerar, frameworks explicados slide a slide (7-12 slides)
- imagen_con_copy: contraste fuerte que se expresa en 1 frase, declaración impactante, dato clave
- video_script: historia o caso que se cuenta mejor hablando, demo de herramienta, narrativa personal

Responde SOLO con JSON válido:
{
  "format": "carousel" | "imagen_con_copy" | "video_script",
  "rationale": "1-2 líneas explicando por qué este formato"
}`;

function buildUserPrompt(idea: ContentIdea): string {
  return `Categoría: ${idea.category}
Título: ${idea.title}
Descripción: ${idea.description}
${idea.detail ? `Detalle: ${idea.detail}` : ''}
${idea.additionalNotes ? `Notas: ${idea.additionalNotes}` : ''}

Elegí el formato más adecuado para esta idea.`;
}

export async function selectFormat(
  idea: ContentIdea,
  isLeadMagnetWeek: boolean,
): Promise<{ format: ContentFormat; rationale: string }> {
  if (isLeadMagnetWeek) {
    return { format: 'lead_magnet', rationale: 'Semana de lead magnet — forzado por configuración.' };
  }

  try {
    const raw = await callClaude({
      model: 'sonnet',
      system: SYSTEM,
      user: buildUserPrompt(idea),
      maxTokens: 256,
      retries: 2,
    });

    const parsed = JSON.parse(extractJSON(raw)) as { format: ContentFormat; rationale: string };
    const validFormats: ContentFormat[] = ['carousel', 'imagen_con_copy', 'video_script'];

    if (!validFormats.includes(parsed.format)) {
      throw new Error(`Invalid format returned: ${parsed.format}`);
    }

    return parsed;
  } catch (err) {
    logger.warn('Format selector failed, defaulting to carousel', { error: (err as Error).message });
    return { format: 'carousel', rationale: 'Fallback: carousel por default.' };
  }
}
