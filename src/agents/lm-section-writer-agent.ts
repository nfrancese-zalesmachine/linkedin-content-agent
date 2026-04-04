import { callClaude } from '../lib/anthropic.js';
import { logger } from '../lib/logger.js';
import type { LMOutline, LMSection, ResearchReport } from '../types/index.js';

function buildSystem(voiceRules: string): string {
  return `Sos un ghost-writer de Nicolas Francese. Escribís secciones de Lead Magnets en profundidad.

Estilo: mismo DNA que los posts de LinkedIn de Nicolas pero con más detalle.
- Frases directas. Sin relleno.
- Datos concretos con fuente cuando los tenés.
- Herramientas nombradas: Clay, n8n, HeyReach, Instantly, Claude Code, Supabase.
- Ejemplos reales con números cuando es posible ("en un cliente reciente...", "en ZalesMachine...").
- Tablas ❌/✅ para comparaciones de enfoques.
- Sin corporativo. Sin "es importante destacar". Sin "debemos considerar".

Reglas de voz:
${voiceRules}

Respondé SOLO con el contenido de la sección en markdown. Sin JSON. Sin encabezados adicionales.`;
}

function buildUser(
  section: LMOutline['sections'][0],
  outline: LMOutline,
  research: ResearchReport,
  targetWords: number,
): string {
  const researchContext = research.content
    ? `\nInvestigación disponible (usá los datos relevantes):\n${research.content.slice(0, 2000)}`
    : '';

  return `Escribí la sección ${section.index} de ${outline.sections.length} del Lead Magnet:

TÍTULO DEL LM: ${outline.title}
PROMESA AL LECTOR: ${outline.audiencePromise}

SECCIÓN A ESCRIBIR:
Título: ${section.title}
Descripción: ${section.description}
Puntos clave a cubrir:
${section.keyPoints.map(p => `- ${p}`).join('\n')}

CONTEXTO: Esta es la sección ${section.index} de un documento de ${outline.sections.length} secciones.
No te presentes, no digas "en esta sección vamos a...". Empezá directo con el contenido.
${researchContext}

Extensión objetivo: ${targetWords} palabras.
Formato: markdown (##, ###, -, ❌, ✅, tablas si aplica).
Empezá directamente con el contenido. Primera línea = heading ## ${section.title}`;
}

/**
 * Write a single LM section. Called in parallel for all sections.
 */
export async function writeLMSection(
  section: LMOutline['sections'][0],
  outline: LMOutline,
  research: ResearchReport,
  voiceRules: string,
  targetWordsPerSection = 450,
): Promise<LMSection> {
  const maxTokens = Math.ceil(targetWordsPerSection * 2.5); // tokens ≈ 1.33x words, add buffer

  try {
    const content = await callClaude({
      model: 'opus',
      system: buildSystem(voiceRules),
      user: buildUser(section, outline, research, targetWordsPerSection),
      maxTokens,
      retries: 2,
    });

    const wordCount = content.split(/\s+/).length;

    return {
      sectionIndex: section.index,
      title: section.title,
      content,
      wordCount,
    };
  } catch (err) {
    logger.error('LM section write failed', { section: section.index, error: (err as Error).message });
    // Return a placeholder section rather than failing the whole LM
    return {
      sectionIndex: section.index,
      title: section.title,
      content: `## ${section.title}\n\n[Sección pendiente de generación — error en el proceso automático]`,
      wordCount: 0,
    };
  }
}

/**
 * Assemble all sections into a single LeadMagnetDraft.
 * Sections are written in parallel by the orchestrator; this just assembles them.
 */
export function assembleLM(
  sections: LMSection[],
  outline: LMOutline,
  pillar: number,
): { markdownContent: string; wordCount: number; sectionCount: number } {
  const sorted = sections.sort((a, b) => a.sectionIndex - b.sectionIndex);
  const markdownContent = sorted.map(s => s.content).join('\n\n---\n\n');
  const wordCount = sorted.reduce((sum, s) => sum + s.wordCount, 0);

  return {
    markdownContent,
    wordCount,
    sectionCount: sorted.length,
  };
}
