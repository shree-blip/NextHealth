#!/usr/bin/env tsx
/**
 * Crawl Site Script
 * -----------------
 * Fetches all public pages from thenextgenhealth.com, extracts text content,
 * splits into chunks, generates OpenAI embeddings, and saves to a JSON knowledge store.
 *
 * Usage:
 *   npx tsx scripts/crawl-site.ts                    # crawl production site
 *   npx tsx scripts/crawl-site.ts http://localhost:3000  # crawl local dev
 *
 * Output:
 *   data/knowledge-base.json — the embedding store used by the chatbot
 */

import { createHash } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/* ─── Config ─── */
const BASE_URL = process.argv[2] || 'https://thenextgenhealth.com';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const EMBED_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 600; // ~600 tokens per chunk
const CHUNK_OVERLAP = 80;
const OUTPUT_DIR = join(process.cwd(), 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'knowledge-base.json');

/* ─── Pages to crawl ─── */
const PAGES = [
  { path: '/', section: 'home', title: 'Home' },
  { path: '/about', section: 'about', title: 'About Us' },
  { path: '/pricing', section: 'pricing', title: 'Pricing' },
  { path: '/contact', section: 'contact', title: 'Contact / Get Started' },
  { path: '/services', section: 'services', title: 'Services Overview' },
  { path: '/services/seo-local-search', section: 'services', title: 'SEO & Local Search' },
  { path: '/services/google-ads', section: 'services', title: 'Google Ads' },
  { path: '/services/meta-ads', section: 'services', title: 'Meta Ads' },
  { path: '/services/website-design-dev', section: 'services', title: 'Website Design & Development' },
  { path: '/services/social-media-marketing', section: 'services', title: 'Social Media Marketing' },
  { path: '/services/content-copywriting', section: 'services', title: 'Content & Copywriting' },
  { path: '/services/email-drip-campaigns', section: 'services', title: 'Email Drip Campaigns' },
  { path: '/services/google-business-profile', section: 'services', title: 'Google Business Profile' },
  { path: '/services/brand-identity-design', section: 'services', title: 'Brand Identity Design' },
  { path: '/services/brochure-print-design', section: 'services', title: 'Brochure & Print Design' },
  { path: '/services/analytics-reporting', section: 'services', title: 'Analytics & Reporting' },
  { path: '/services/strategy-planning', section: 'services', title: 'Strategy & Planning' },
  { path: '/automation', section: 'automation', title: 'Marketing Automation' },
  { path: '/industries', section: 'industries', title: 'Industries We Serve' },
  { path: '/locations', section: 'locations', title: 'Locations' },
  { path: '/case-studies', section: 'results', title: 'Case Studies' },
  { path: '/proven-results', section: 'results', title: 'Proven Results' },
  { path: '/team', section: 'team', title: 'Our Team' },
  { path: '/blog', section: 'blog', title: 'Blog' },
  { path: '/news', section: 'news', title: 'News & Updates' },
  { path: '/hipaa', section: 'compliance', title: 'HIPAA Compliance' },
  { path: '/privacy', section: 'legal', title: 'Privacy Policy' },
  { path: '/terms', section: 'legal', title: 'Terms of Service' },
];

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

/* ─── HTML → Text Extraction ─── */
function htmlToText(html: string): string {
  let text = html;

  // Remove script, style, nav, footer, header tags and their content
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // Convert br, p, div, h tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?(p|div|h[1-6]|li|tr|section|article|blockquote)[^>]*>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#x2F;/g, '/');
  text = text.replace(/&rarr;/g, '→');

  // Collapse whitespace
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');

  return text.trim();
}

/* ─── Chunking ─── */
function chunkText(text: string, maxChars: number = CHUNK_SIZE * 4, overlap: number = CHUNK_OVERLAP * 4): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;

    // Try to break at paragraph or sentence boundary
    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf('\n\n', end);
      if (paragraphBreak > start + maxChars / 2) {
        end = paragraphBreak;
      } else {
        const sentenceBreak = text.lastIndexOf('. ', end);
        if (sentenceBreak > start + maxChars / 2) {
          end = sentenceBreak + 1;
        }
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.length > 50);
}

/* ─── Generate Embedding ─── */
async function getEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    // Return a zero vector as placeholder if no API key
    console.warn('  ⚠ No OPENAI_API_KEY — using zero vector placeholder');
    return new Array(1536).fill(0);
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: text.slice(0, 8000), // safety limit
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embedding error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

/* ─── Batch embeddings (up to 100 at a time) ─── */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) {
    console.warn('  ⚠ No OPENAI_API_KEY — using zero vector placeholders');
    return texts.map(() => new Array(1536).fill(0));
  }

  const batchSize = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.slice(0, 8000));
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: batch,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI embedding error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const sorted = data.data.sort((a: any, b: any) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d: any) => d.embedding));
  }

  return allEmbeddings;
}

/* ─── Fetch a Page ─── */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NexHealthBot/1.0 (internal crawler)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`  ⚠ ${url} → ${res.status}`);
      return null;
    }

    return await res.text();
  } catch (err) {
    console.warn(`  ⚠ ${url} → ${(err as Error).message}`);
    return null;
  }
}

/* ─── MD5 Checksum ─── */
function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

/* ─── Main Crawl Loop ─── */
async function main() {
  console.log(`\n🕷  Crawling ${BASE_URL}...\n`);

  // Load existing knowledge base for dedup
  let existingChecksums = new Set<string>();
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing: KnowledgeBase = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      existingChecksums = new Set(existing.chunks.map((c) => c.checksum));
      console.log(`  📦 Loaded existing KB with ${existing.totalChunks} chunks\n`);
    } catch { /* fresh start */ }
  }

  const allChunks: Omit<KnowledgeChunk, 'embedding'>[] = [];
  let skipped = 0;

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    process.stdout.write(`  📄 ${page.title} (${page.path})...`);

    const html = await fetchPage(url);
    if (!html) {
      console.log(' ❌ failed');
      continue;
    }

    const text = htmlToText(html);
    if (text.length < 50) {
      console.log(' ⚠ too short, skipped');
      continue;
    }

    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const checksum = md5(chunk);

      allChunks.push({
        id: `${page.section}-${checksum.slice(0, 8)}`,
        url: `https://thenextgenhealth.com${page.path}`,
        title: page.title,
        section: page.section,
        content: chunk,
        checksum,
        crawledAt: new Date().toISOString(),
      });
    }

    console.log(` ✅ ${chunks.length} chunks`);
  }

  // Filter out unchanged chunks
  const newChunks = allChunks.filter((c) => !existingChecksums.has(c.checksum));
  console.log(`\n  📊 Total: ${allChunks.length} chunks (${newChunks.length} new, ${allChunks.length - newChunks.length} unchanged)`);

  // Generate embeddings for all chunks
  console.log('\n  🧠 Generating embeddings...');
  const textsToEmbed = allChunks.map((c) => `${c.title}\n${c.content}`);
  const embeddings = await getEmbeddings(textsToEmbed);

  const chunksWithEmbeddings: KnowledgeChunk[] = allChunks.map((c, i) => ({
    ...c,
    embedding: embeddings[i],
  }));

  // Save
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const kb: KnowledgeBase = {
    version: 1,
    crawledAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalChunks: chunksWithEmbeddings.length,
    chunks: chunksWithEmbeddings,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(kb));
  console.log(`\n  💾 Saved ${kb.totalChunks} chunks to ${OUTPUT_FILE}`);

  // Also save a lightweight version without embeddings for debugging
  const debugKb = {
    ...kb,
    chunks: kb.chunks.map(({ embedding, ...rest }) => rest),
  };
  writeFileSync(join(OUTPUT_DIR, 'knowledge-base-debug.json'), JSON.stringify(debugKb, null, 2));
  console.log(`  📝 Debug version saved to data/knowledge-base-debug.json`);

  console.log('\n✅ Crawl complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Crawl failed:', err);
  process.exit(1);
});
