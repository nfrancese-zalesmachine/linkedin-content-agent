import type { ContentFormat, FormatSpec } from '../types/index.js';

const FORMAT_SPECS: Record<ContentFormat, FormatSpec> = {
  carousel: {
    name: 'carousel',
    slideCount: { min: 7, max: 12 },
    maxWordsPerBlock: 40,
    requiredSections: ['COVER', 'PROBLEMA', 'CONTENIDO_1', 'CTA', 'HOOK', 'CAPTION'],
    outputTemplate: `
COVER: [título del carousel, ≤8 palabras, con outcome claro]

SLIDE 2 | HEADING: [título corto 3-5 palabras] | BODY: [2-4 líneas separadas con \\n]

SLIDE 3 | HEADING: [título corto] | BODY: [2-4 líneas]

[... continuar slides hasta completar entre 7 y 12 slides totales ...]

CTA: [acción específica del slide final, no "síganme"]

HOOK: [primera línea del post caption, la que aparece antes de "ver más", ≤15 palabras]

CAPTION: [texto del post que acompaña al carousel, 100-200 palabras, voz de Nicolas]

HASHTAGS: [máximo 3 hashtags separados por coma, sin el símbolo #]
`.trim(),
    prohibitions: [
      'Más de 12 slides',
      'Menos de 7 slides',
      'Más de 40 palabras por slide de contenido',
      'Párrafos corridos en slides (usar líneas separadas)',
      'Cover con más de 8 palabras',
      'CTA genérico como "sígueme" o "dale like"',
    ],
  },

  imagen_con_copy: {
    name: 'imagen_con_copy',
    maxWordsPerBlock: 150,
    requiredSections: ['HEADLINE', 'SUBHEADLINE', 'CAPTION'],
    outputTemplate: `
HEADLINE: [texto principal de la imagen, ≤8 palabras, declarativo]

SUBHEADLINE: [texto secundario, 1 frase, 10-15 palabras]

CAPTION:
[texto completo del post, 80-150 palabras, voz de Nicolas, con hook en primera línea]

HASHTAGS: [máximo 3 hashtags separados por coma, sin el símbolo #]
`.trim(),
    prohibitions: [
      'Headline con más de 8 palabras',
      'Headline en forma de pregunta',
      'Caption genérico sin dato concreto o contraste',
      'Caption de más de 150 palabras',
    ],
  },

  video_script: {
    name: 'video_script',
    maxWordsPerBlock: 200,
    requiredSections: ['HOOK', 'ESTRUCTURA', 'GUION_COMPLETO', 'CAPTION'],
    outputTemplate: `
HOOK: [frase de apertura, ≤15 palabras, genera pregunta mental]

ESTRUCTURA:
- Problema (seg 3-20): [2-3 frases describiendo el dolor]
- Insight (seg 20-55): [3-5 frases con el framework o contraste]
- Evidencia (seg 55-80): [2-3 frases con dato o caso real]
- CTA (seg 80-90): [texto exacto del llamado a acción]

GUION_COMPLETO:
[guión completo con [pausa] marcados donde corresponda, máximo 200 palabras para 90 segundos]

CAPTION:
[texto del post al subir el video, 60-100 palabras]

HASHTAGS: [máximo 3 hashtags separados por coma, sin el símbolo #]
`.trim(),
    prohibitions: [
      'Guión de más de 200 palabras (excede 90 segundos)',
      'Empezar con "hola soy Nicolas de..."',
      'CTA genérico como "sígueme"',
      'Párrafos de más de 3 líneas en el guión',
    ],
  },

  lead_magnet: {
    name: 'lead_magnet',
    maxWordsPerBlock: 600,
    requiredSections: ['intro', 'framework', 'implementation_1', 'implementation_2', 'implementation_3', 'implementation_4', 'errores', 'plan_30_dias'],
    outputTemplate: `
Documento en markdown, 8 secciones, 3000-5000 palabras total.
Cada sección en formato JSON con: sectionIndex, title, content (markdown), wordCount.
`.trim(),
    prohibitions: [
      'Menos de 3000 palabras en total',
      'Secciones sin ejemplo real',
      'Afirmaciones sin dato o fuente',
      'Tono corporativo o genérico',
    ],
  },
};

export function getFormatSpec(format: ContentFormat): FormatSpec {
  return FORMAT_SPECS[format];
}

export function getOutputTemplate(format: ContentFormat): string {
  return FORMAT_SPECS[format].outputTemplate;
}

export function getProhibitions(format: ContentFormat): string[] {
  return FORMAT_SPECS[format].prohibitions;
}
