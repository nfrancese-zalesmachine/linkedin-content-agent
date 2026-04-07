import { callClaude, extractJSON } from '../lib/anthropic.js';
import { AgentError } from '../types/index.js';
import type { ContentIdea, PostDraft, SessionContext } from '../types/index.js';

function buildSystem(ctx: SessionContext, recentHooks?: string[]): string {
  const avoidSection = recentHooks?.length
    ? `\n\n# Hooks ya publicados — NO repetir estos ángulos ni variaciones similares\n${recentHooks.map(h => `- ${h}`).join('\n')}`
    : '';

  return `# Tu rol
Sos el ghost-writer de Nicolas Francese. Escribís posts de LinkedIn en su voz exacta.
Nicolas es co-fundador de ZalesMachine (GTM Engineering & outbound B2B para empresas LATAM).

# Voz y reglas de Nicolas
${ctx.voiceRules}

# Pilar de contenido
${ctx.pillarDefinition}

# Best practices de LinkedIn
${ctx.linkedinBestPractices}

# Patrones de hook para este pilar
${ctx.hookPatterns}

# Formato requerido para este post
${ctx.formatSpec}${avoidSection}

# INSTRUCCIONES CRÍTICAS
1. El hook (primera línea) debe PARAR el scroll. Usá uno de los patrones del pilar.
2. Una sola idea central. No mezclar temas.
3. Frases CORTAS. Máximo 12 palabras por línea.
4. Sin emojis en el cuerpo. Sin negritas. Sin "¡".
5. El copy debe pasar el "test del fundador": ¿podría Nicolas haberlo escrito basado en algo que vivió?
6. Responde SOLO con JSON válido siguiendo el schema.`;
}

function buildUser(idea: ContentIdea, ctx: SessionContext): string {
  return `# Idea de contenido a desarrollar
Título: ${idea.title}
Categoría: ${idea.category}
Descripción: ${idea.description}
${idea.detail ? `Detalle adicional: ${idea.detail}` : ''}
${idea.additionalNotes ? `Notas: ${idea.additionalNotes}` : ''}

# Ejemplos reales del mismo pilar (para calibrar voz)
${ctx.fewShotExamples}

# Output requerido
Respondé con JSON en este schema exacto según el formato "${ctx.formatSpec.split('\n')[0]}":

Para carousel:
{
  "format": "carousel",
  "pillar": ${ctx.pillar},
  "hook": "primera línea del caption",
  "body": "cuerpo del post sin el hook (todo a partir de la segunda línea, 80-180 palabras)",
  "hashtags": ["hashtag1", "hashtag2"],
  "slides": [
    {"heading": "COVER: título del carousel", "body": ""},
    {"heading": "Slide 2 heading", "body": "contenido del slide"},
    ...
  ]
}

Para imagen_con_copy:
{
  "format": "imagen_con_copy",
  "pillar": ${ctx.pillar},
  "hook": "primera línea del post",
  "body": "cuerpo del caption sin el hook (80-130 palabras)",
  "hashtags": ["hashtag1", "hashtag2"],
  "headline": "texto imagen ≤8 palabras",
  "subheadline": "texto secundario imagen, 1 frase"
}

Para video_script:
{
  "format": "video_script",
  "pillar": ${ctx.pillar},
  "hook": "frase de apertura del video ≤15 palabras",
  "body": "caption del post al subir el video, sin repetir el hook (50-80 palabras)",
  "hashtags": ["hashtag1", "hashtag2"],
  "videoBeats": "estructura con timings",
  "videoScript": "guión completo con [pausa] marcados"
}`;
}

export async function writePost(
  idea: ContentIdea,
  ctx: SessionContext,
  recentHooks?: string[],
): Promise<PostDraft> {
  const raw = await callClaude({
    model: 'opus',
    system: buildSystem(ctx, recentHooks),
    user: buildUser(idea, ctx),
    maxTokens: 3000,
    retries: 2,
  });

  try {
    const parsed = JSON.parse(extractJSON(raw)) as PostDraft;
    if (!parsed.hook || !parsed.body) {
      throw new Error('Missing required fields: hook or body');
    }
    return parsed;
  } catch (err) {
    throw new AgentError('phase2', 'post-writer', `Failed to parse response: ${(err as Error).message}`, raw);
  }
}
