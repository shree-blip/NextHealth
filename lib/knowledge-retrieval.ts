/**
 * Knowledge Retrieval
 * -------------------
 * Loads the pre-built embedding store (data/knowledge-base.json) and performs
 * cosine-similarity search to retrieve relevant chunks for RAG.
 *
 * If the JSON file doesn't exist (e.g. first deploy before crawl), returns
 * empty results gracefully so the chatbot can still function with its fallback.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const EMBED_MODEL = 'text-embedding-3-small';
const KB_PATH = join(process.cwd(), 'data', 'knowledge-base.json');
const SIMILARITY_THRESHOLD = 0.25; // minimum cosine similarity

/* ─── Types ─── */
interface KnowledgeChunk {
  id: string;
  url: string;
  title: string;
  section: string;
  content: string;
  checksum: string;
  embedding: number[];
  crawledAt: string;
}

interface KnowledgeBase {
  version: number;
  crawledAt: string;
  baseUrl: string;
  totalChunks: number;
  chunks: KnowledgeChunk[];
}

export interface RetrievedChunk {
  url: string;
  title: string;
  section: string;
  content: string;
  score: number;
}

/* ─── In-memory cache ─── */
let cachedKB: KnowledgeBase | null = null;
let lastLoadTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadKnowledgeBase(): KnowledgeBase | null {
  const now = Date.now();

  // Return cached if still fresh
  if (cachedKB && now - lastLoadTime < CACHE_TTL) {
    return cachedKB;
  }

  if (!existsSync(KB_PATH)) {
    console.warn('[Knowledge] knowledge-base.json not found — RAG disabled');
    return null;
  }

  try {
    const raw = readFileSync(KB_PATH, 'utf-8');
    cachedKB = JSON.parse(raw);
    lastLoadTime = now;
    console.log(`[Knowledge] Loaded ${cachedKB!.totalChunks} chunks from KB`);
    return cachedKB;
  } catch (err) {
    console.error('[Knowledge] Failed to load KB:', err);
    return null;
  }
}

/* ─── Cosine Similarity ─── */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/* ─── Get Query Embedding ─── */
async function getQueryEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.warn('[Knowledge] No OPENAI_API_KEY — cannot embed query');
    return null;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: text.slice(0, 8000),
      }),
    });

    if (!res.ok) {
      console.error('[Knowledge] Embedding API error:', res.status);
      return null;
    }

    const data = await res.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error('[Knowledge] Embedding failed:', err);
    return null;
  }
}

/* ─── Main Retrieval Function ─── */
export async function retrieveContext(
  query: string,
  topK: number = 5,
): Promise<RetrievedChunk[]> {
  const kb = loadKnowledgeBase();
  if (!kb || kb.chunks.length === 0) return [];

  const queryEmbedding = await getQueryEmbedding(query);
  if (!queryEmbedding) return [];

  // Score all chunks
  const scored = kb.chunks.map((chunk) => ({
    url: chunk.url,
    title: chunk.title,
    section: chunk.section,
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score, filter by threshold, take topK
  const results = scored
    .filter((c) => c.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

/* ─── Format Retrieved Context for System Prompt ─── */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '';

  const sections = chunks.map((c, i) => {
    return `[Source ${i + 1}: ${c.title}](${c.url})\n${c.content}`;
  });

  return `
RETRIEVED WEBSITE CONTENT (use ONLY this content to answer):
---
${sections.join('\n\n---\n')}
---
SOURCE URLS (include relevant ones in your answer):
${[...new Set(chunks.map((c) => `- ${c.title}: ${c.url}`))].join('\n')}
`.trim();
}

/* ─── Extract Sources for Frontend ─── */
export function extractSources(chunks: RetrievedChunk[]): { url: string; title: string }[] {
  const seen = new Set<string>();
  return chunks
    .filter((c) => {
      if (seen.has(c.url)) return false;
      seen.add(c.url);
      return true;
    })
    .map((c) => ({ url: c.url, title: c.title }));
}

/* ─── Keyword Fallback (when embeddings unavailable) ─── */
export function keywordSearch(query: string, topK: number = 3): RetrievedChunk[] {
  const kb = loadKnowledgeBase();
  if (!kb || kb.chunks.length === 0) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = kb.chunks.map((chunk) => {
    const text = `${chunk.title} ${chunk.content}`.toLowerCase();
    const matches = terms.filter((t) => text.includes(t));
    return {
      url: chunk.url,
      title: chunk.title,
      section: chunk.section,
      content: chunk.content,
      score: matches.length / Math.max(terms.length, 1),
    };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
