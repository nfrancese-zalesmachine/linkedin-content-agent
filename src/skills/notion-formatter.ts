import type { PostDraft, LeadMagnetDraft } from '../types/index.js';
import { textBlock, headingBlock, dividerBlock } from '../lib/notion.js';

/**
 * Convert a PostDraft into Notion block arrays.
 * Returns { blocks } — caller handles 100-block chunking via appendBlocks().
 */
export function postDraftToBlocks(draft: PostDraft): object[] {
  const blocks: object[] = [];

  // Format badge
  blocks.push(...textBlock(`Formato: ${draft.format.toUpperCase()} | Pilar: ${draft.pillar}`));
  blocks.push(dividerBlock());

  if (draft.format === 'carousel') {
    blocks.push(headingBlock('Hook / Caption', 2));
    blocks.push(...textBlock(draft.hook));
    blocks.push(...textBlock(draft.body));

    if (draft.slides?.length) {
      blocks.push(dividerBlock());
      blocks.push(headingBlock('Slides', 2));
      for (const [i, slide] of draft.slides.entries()) {
        blocks.push(headingBlock(`Slide ${i + 1} — ${slide.heading}`, 3));
        if (slide.body) blocks.push(...textBlock(slide.body));
      }
    }
  } else if (draft.format === 'imagen_con_copy') {
    blocks.push(headingBlock('Imagen', 2));
    blocks.push(...textBlock(`HEADLINE: ${draft.headline ?? ''}`));
    blocks.push(...textBlock(`SUBHEADLINE: ${draft.subheadline ?? ''}`));
    blocks.push(dividerBlock());
    blocks.push(headingBlock('Caption', 2));
    blocks.push(...textBlock(draft.body));
  } else if (draft.format === 'video_script') {
    blocks.push(headingBlock('Hook', 2));
    blocks.push(...textBlock(draft.hook));
    blocks.push(dividerBlock());
    if (draft.videoBeats) {
      blocks.push(headingBlock('Estructura del Video', 2));
      blocks.push(...textBlock(draft.videoBeats));
      blocks.push(dividerBlock());
    }
    blocks.push(headingBlock('Guión Completo', 2));
    blocks.push(...textBlock(draft.videoScript ?? draft.body));
    blocks.push(dividerBlock());
    blocks.push(headingBlock('Caption del Post', 2));
    blocks.push(...textBlock(draft.body));
  }

  if (draft.hashtags.length > 0) {
    blocks.push(dividerBlock());
    blocks.push(...textBlock(`Hashtags: ${draft.hashtags.map(h => `#${h}`).join(' ')}`));
  }

  return blocks;
}

/**
 * Convert a LeadMagnetDraft into Notion blocks.
 * Returns { part1, overflow } — part1 fits in one API call, overflow in subsequent calls.
 */
export function leadMagnetToBlocks(draft: LeadMagnetDraft): {
  part1: object[];
  overflow: object[];
} {
  const allBlocks: object[] = [];

  allBlocks.push(headingBlock(draft.title, 1));
  allBlocks.push(...textBlock(`Promesa: ${draft.audiencePromise}`));
  allBlocks.push(...textBlock(`Palabras: ${draft.wordCount} | Secciones: ${draft.sectionCount}`));
  allBlocks.push(dividerBlock());

  for (const section of draft.sections) {
    allBlocks.push(headingBlock(section.title, 2));
    allBlocks.push(...textBlock(section.content));
    allBlocks.push(dividerBlock());
  }

  // Split at 90 blocks per batch (safe under 100 limit)
  const BATCH = 90;
  return {
    part1: allBlocks.slice(0, BATCH),
    overflow: allBlocks.slice(BATCH),
  };
}
