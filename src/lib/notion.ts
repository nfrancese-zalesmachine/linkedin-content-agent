import { config } from '../config.js';
import { logger } from './logger.js';

const BASE = 'https://api.notion.com/v1';
const HEADERS = {
  'Authorization': `Bearer ${config.notionToken}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

async function notionRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${method} ${path} failed: ${res.status} — ${text}`);
  }

  return res.json();
}

/** Split text into chunks ≤ 2000 chars (Notion rich_text limit) */
function chunkText(text: string, maxLen = 1990): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxLen));
    i += maxLen;
  }
  return chunks;
}

export function textBlock(content: string): object[] {
  return chunkText(content).map(chunk => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: chunk } }],
    },
  }));
}

export function headingBlock(text: string, level: 1 | 2 | 3 = 2): object {
  const type = `heading_${level}` as const;
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }],
    },
  };
}

export function dividerBlock(): object {
  return { object: 'block', type: 'divider', divider: {} };
}

export function codeBlock(content: string): object {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [{ type: 'text', text: { content: content.slice(0, 1990) } }],
      language: 'plain text',
    },
  };
}

/**
 * Create a Notion page in the Tasks DB (content posts)
 */
export async function createTaskPage(params: {
  title: string;
  dbId?: string;
}): Promise<{ id: string; url: string }> {
  const dbId = params.dbId ?? config.notionTasksDbId;

  const res = await notionRequest('/pages', 'POST', {
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [{ text: { content: params.title.slice(0, 200) } }],
      },
      Estado: {
        status: { name: 'Ready to Review' },
      },
    },
  }) as { id: string; url: string };

  return { id: res.id, url: res.url };
}

/**
 * Create a Notion page in the Leads DB (lead magnets)
 */
export async function createLeadMagnetPage(params: {
  title: string;
  topic: string;
  pillar: number;
  dbId?: string;
}): Promise<{ id: string; url: string }> {
  const dbId = params.dbId ?? config.notionLeadsDbId;

  const res = await notionRequest('/pages', 'POST', {
    parent: { database_id: dbId },
    properties: {
      Titulo: {
        title: [{ text: { content: params.title.slice(0, 200) } }],
      },
      Topic: {
        rich_text: [{ text: { content: params.topic.slice(0, 500) } }],
      },
      Estado: {
        select: { name: 'Borrador' },
      },
    },
  }) as { id: string; url: string };

  return { id: res.id, url: res.url };
}

/**
 * Append blocks to a Notion page.
 * Automatically chunks into batches of 100 (Notion API limit).
 */
export async function appendBlocks(pageId: string, blocks: object[]): Promise<void> {
  const BATCH_SIZE = 95; // stay under 100 limit
  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    await notionRequest(`/blocks/${pageId}/children`, 'PATCH', { children: batch });
    logger.debug('Appended block batch', { pageId, batch: i / BATCH_SIZE + 1, count: batch.length });
  }
}

/**
 * Mark a content idea as "En Progreso" in the Ideas DB
 */
export async function markIdeaInProgress(notionId: string): Promise<void> {
  await notionRequest(`/pages/${notionId}`, 'PATCH', {
    properties: {
      'Post Status': { select: { name: 'En Progreso' } },
    },
  });
}
