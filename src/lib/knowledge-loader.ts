import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { knowledgeCache } from './cache.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__dirname, '..', 'knowledge');

async function readKnowledgeFile(filename: string): Promise<string> {
  const cached = knowledgeCache.get(filename);
  if (cached) return cached;

  const content = await readFile(join(KNOWLEDGE_DIR, filename), 'utf-8');
  knowledgeCache.set(filename, content);
  return content;
}

/**
 * Extract a specific H2 section from a markdown file.
 * Returns the full section content (from ## Heading to next ## or EOF).
 */
function extractSection(markdown: string, sectionTitle: string): string {
  const lines = markdown.split('\n');
  let capturing = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (capturing) break; // hit next H2, stop
      if (line.toLowerCase().includes(sectionTitle.toLowerCase())) {
        capturing = true;
        continue; // skip the heading itself
      }
    }
    if (capturing) sectionLines.push(line);
  }

  return sectionLines.join('\n').trim();
}

export async function loadVoiceRules(): Promise<string> {
  return readKnowledgeFile('nicolas-voice.md');
}

export async function loadLinkedInBestPractices(): Promise<string> {
  return readKnowledgeFile('linkedin-best-practices.md');
}

export async function loadPillarDefinition(pillar: number): Promise<string> {
  const content = await readKnowledgeFile('content-pillars.md');
  return extractSection(content, `Pilar ${pillar}`) || content;
}

export async function loadFewShotExamples(pillar: number): Promise<string> {
  const content = await readKnowledgeFile('nicolas-posts-sample.md');
  return extractSection(content, `Pilar ${pillar}`) || content;
}

export async function loadFormatGuide(format: string): Promise<string> {
  const fileMap: Record<string, string> = {
    carousel: 'carousel-format.md',
    imagen_con_copy: 'image-copy-format.md',
    video_script: 'video-script-format.md',
    lead_magnet: 'lead-magnet-format.md',
  };
  const filename = fileMap[format];
  if (!filename) throw new Error(`Unknown format: ${format}`);
  return readKnowledgeFile(filename);
}

export async function loadLeadMagnetFormat(): Promise<string> {
  return readKnowledgeFile('lead-magnet-format.md');
}
