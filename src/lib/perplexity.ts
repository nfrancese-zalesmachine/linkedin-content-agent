import { config } from '../config.js';
import { logger } from './logger.js';
import type { ResearchReport } from '../types/index.js';

const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

export async function deepResearch(topic: string, context: string): Promise<ResearchReport> {
  if (!config.perplexityApiKey) {
    logger.warn('Perplexity key not set — using fallback (no external research)');
    return {
      topic,
      content: '',
      citations: [],
      wordCount: 0,
      usedFallback: true,
    };
  }

  const prompt = `Investiga en profundidad el siguiente tema para crear un lead magnet de alto valor dirigido a founders y directores de ventas de empresas B2B SaaS/Servicios en Latinoamérica:

TEMA: ${topic}
CONTEXTO: ${context}

Por favor incluye:
1. Estadísticas y datos recientes (2024-2026) con fuentes
2. Frameworks y metodologías que funcionan en la práctica
3. Casos de uso reales con números concretos
4. Errores comunes y cómo evitarlos
5. Herramientas relevantes (Clay, n8n, Claude, HeyReach, Instantly, etc.)
6. Comparaciones y benchmarks del mercado

Responde en español. Sé específico con datos y ejemplos reales.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      citations?: string[];
    };

    const content = data.choices[0]?.message?.content ?? '';
    const citations = data.citations ?? [];

    return {
      topic,
      content,
      citations,
      wordCount: content.split(/\s+/).length,
      usedFallback: false,
    };
  } catch (err) {
    clearTimeout(timeout);
    logger.error('Perplexity research failed — using fallback', { error: (err as Error).message });
    return {
      topic,
      content: '',
      citations: [],
      wordCount: 0,
      usedFallback: true,
    };
  }
}
