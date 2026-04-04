import { callClaude, extractJSON } from '../lib/anthropic.js';
import { loadLeadMagnetFormat } from '../lib/knowledge-loader.js';
import type { ContentIdea, ResearchReport, LMOutline } from '../types/index.js';

/**
 * Generates a structured outline (8 sections with titles + key points) for a Lead Magnet.
 * This feeds directly into the parallel section writers.
 */
export async function buildLMOutline(
  idea: ContentIdea,
  lmMeta: { refinedTitle: string; audiencePromise: string },
  research: ResearchReport,
): Promise<LMOutline> {
  const lmFormat = await loadLeadMagnetFormat();

  const system = `Sos un estratega de contenido B2B experto en lead magnets para GTM Engineering, outbound y automatización.

Tu trabajo es crear el esquema detallado de un Lead Magnet de 8 secciones.

# Estructura obligatoria de un LM de alto valor
${lmFormat}

Respondé SOLO con JSON válido:
{
  "title": "título final del LM",
  "audiencePromise": "promesa al lector (1 frase)",
  "sections": [
    {
      "index": 1,
      "title": "nombre de la sección",
      "description": "qué debe cubrir esta sección en 1 línea",
      "keyPoints": ["punto 1", "punto 2", "punto 3"]
    },
    ... (8 secciones en total)
  ]
}`;

  const user = `Tema del Lead Magnet: ${lmMeta.refinedTitle}
Promesa al lector: ${lmMeta.audiencePromise}
Categoría: ${idea.category}

${research.content ? `Investigación disponible (usa los datos como referencia):\n${research.content.slice(0, 3000)}` : 'No hay investigación externa — usar conocimiento propio sobre el tema.'}

Generá el esquema completo de 8 secciones.`;

  const raw = await callClaude({
    model: 'sonnet',
    system,
    user,
    maxTokens: 2048,
    retries: 2,
  });

  try {
    const parsed = JSON.parse(extractJSON(raw)) as LMOutline;
    if (!parsed.sections || parsed.sections.length < 6) {
      throw new Error('Outline has fewer than 6 sections');
    }
    return parsed;
  } catch {
    // Fallback: generate a basic 8-section structure
    return {
      title: lmMeta.refinedTitle,
      audiencePromise: lmMeta.audiencePromise,
      sections: [
        { index: 1, title: 'El Problema y la Promesa', description: 'Contexto y qué va a lograr el lector', keyPoints: ['el problema específico', 'por qué las soluciones actuales fallan', 'la promesa del documento'] },
        { index: 2, title: 'El Framework Central', description: 'El modelo mental que organiza todo el LM', keyPoints: ['nombre del framework', 'por qué funciona', 'visión general de las partes'] },
        { index: 3, title: 'Paso 1: Fundación', description: 'Primer paso de implementación', keyPoints: ['qué configurar', 'herramientas necesarias', 'error más común'] },
        { index: 4, title: 'Paso 2: Construcción', description: 'Segundo paso de implementación', keyPoints: ['cómo construir', 'casos de uso', 'validación'] },
        { index: 5, title: 'Paso 3: Ejecución', description: 'Tercer paso — poner en marcha', keyPoints: ['lanzamiento', 'métricas a trackear', 'primeros ajustes'] },
        { index: 6, title: 'Paso 4: Optimización', description: 'Escalar lo que funciona', keyPoints: ['cómo iterar', 'señales de éxito', 'cuándo escalar'] },
        { index: 7, title: 'Los 7 Errores Más Comunes', description: 'Errores frecuentes con solución para cada uno', keyPoints: ['error de implementación', 'error de estrategia', 'error de medición'] },
        { index: 8, title: 'Plan de 30 Días', description: 'Roadmap semana a semana para implementar', keyPoints: ['semana 1', 'semana 2', 'semana 3', 'semana 4'] },
      ],
    };
  }
}
