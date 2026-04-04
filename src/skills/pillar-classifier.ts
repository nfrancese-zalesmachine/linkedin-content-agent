import type { ContentPillar } from '../types/index.js';

// Keyword → pillar mappings (ordered by specificity)
const PILLAR_KEYWORDS: Array<{ pillar: ContentPillar; keywords: string[] }> = [
  {
    pillar: 2,
    keywords: ['clay', 'n8n', 'automatiza', 'automatización', 'automation', 'flujo', 'workflow',
      'claude code', 'supabase', 'railway', 'api', 'integracion', 'integración', 'stack',
      'herramienta_tecnica', 'scraping', 'enriquecimiento'],
  },
  {
    pillar: 4,
    keywords: ['caso de éxito', 'caso de exito', 'resultado', 'win', 'cliente', 'demos',
      'conversión', 'conversion', 'número', 'numero', 'agendada', 'campaña reciente',
      'en un cliente', 'porcentaje', 'crecimiento de equipo'],
  },
  {
    pillar: 3,
    keywords: ['linkedin', 'contenido', 'content', 'algoritmo', 'dwell', 'carousel',
      'personal brand', 'publicar', 'post', 'canal', 'audiencia', 'thought leadership',
      'content-led', 'orgánico', 'organico'],
  },
  {
    pillar: 5,
    keywords: ['framework', 'checklist', 'guía', 'guia', 'tutorial', 'paso a paso',
      'error común', 'error comun', 'cómo hacer', 'como hacer', 'herramienta', 'template',
      'plantilla', 'mvp', 'minimo viable'],
  },
  {
    pillar: 1,
    keywords: ['gtm', 'outbound', 'outreach', 'icp', 'pipeline', 'funnel', 'revenue',
      'prospecting', 'prospección', 'secuencia', 'mensaje', 'cold email', 'follow-up',
      'buyer', 'deal', 'cierre', 'ventas', 'sales'],
  },
];

/**
 * Classify a content idea into a pillar (1-5) based on category and description keywords.
 * Falls back to pillar 1 (GTM Engineering) if no match found.
 */
export function classifyPillar(category: string, description: string): ContentPillar {
  const text = `${category} ${description}`.toLowerCase();

  for (const { pillar, keywords } of PILLAR_KEYWORDS) {
    if (keywords.some(k => text.includes(k))) {
      return pillar;
    }
  }

  // Fallback: pillar 1 (GTM Engineering — most general)
  return 1;
}
