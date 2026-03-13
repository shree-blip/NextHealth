import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // allow up to 60s for crawling

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const EMBED_MODEL = 'text-embedding-3-small';
const BASE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';
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
];

/* ─── Auth: admin JWT or CRON_SECRET ─── */
function isAuthorized(req: NextRequest): boolean {
  // Check CRON_SECRET header (for Vercel cron jobs)
  const cronHeader = req.headers.get('authorization');
  if (CRON_SECRET && cronHeader === `Bearer ${CRON_SECRET}`) return true;

  // Check admin cookie
  const token = req.cookies.get('auth_token')?.value;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      return decoded.role === 'admin';
    } catch {
      return false;
    }
  }

  return false;
}

/* ─── HTML → Text ─── */
function htmlToText(html: string): string {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?(p|div|h[1-6]|li|tr|section|article|blockquote)[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
  return text.trim();
}

/* ─── Chunking ─── */
function chunkText(text: string, maxChars = 2400, overlap = 320): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChars;
    if (end < text.length) {
      const pb = text.lastIndexOf('\n\n', end);
      if (pb > start + maxChars / 2) end = pb;
      else {
        const sb = text.lastIndexOf('. ', end);
        if (sb > start + maxChars / 2) end = sb + 1;
      }
    }
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start >= text.length) break;
  }
  return chunks.filter((c) => c.length > 50);
}

/* ─── Batch Embed ─── */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) return texts.map(() => new Array(1536).fill(0));
  const batchSize = 50;
  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.slice(0, 8000));
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: EMBED_MODEL, input: batch }),
    });
    if (!res.ok) throw new Error(`Embedding error: ${res.status}`);
    const data = await res.json();
    const sorted = data.data.sort((a: any, b: any) => a.index - b.index);
    all.push(...sorted.map((d: any) => d.embedding));
  }
  return all;
}

/* ─── POST handler ─── */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results: { page: string; chunks: number }[] = [];
    const errors: string[] = [];
    const allChunks: any[] = [];

    for (const page of PAGES) {
      const url = `${BASE_URL}${page.path}`;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'NexHealthBot/1.0', Accept: 'text/html' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          errors.push(`${page.path}: HTTP ${res.status}`);
          continue;
        }
        const html = await res.text();
        const text = htmlToText(html);
        if (text.length < 50) {
          errors.push(`${page.path}: content too short`);
          continue;
        }
        const chunks = chunkText(text);
        for (const chunk of chunks) {
          allChunks.push({
            id: `${page.section}-${createHash('md5').update(chunk).digest('hex').slice(0, 8)}`,
            url: `https://thenextgenhealth.com${page.path}`,
            title: page.title,
            section: page.section,
            content: chunk,
            checksum: createHash('md5').update(chunk).digest('hex'),
            crawledAt: new Date().toISOString(),
          });
        }
        results.push({ page: page.path, chunks: chunks.length });
      } catch (err) {
        errors.push(`${page.path}: ${(err as Error).message}`);
      }
    }

    // Generate embeddings
    const textsToEmbed = allChunks.map((c) => `${c.title}\n${c.content}`);
    const embeddings = await getEmbeddings(textsToEmbed);
    const withEmbeddings = allChunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));

    // Save
    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
    const kb = {
      version: 1,
      crawledAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalChunks: withEmbeddings.length,
      chunks: withEmbeddings,
    };
    writeFileSync(OUTPUT_FILE, JSON.stringify(kb));

    return NextResponse.json({
      success: true,
      totalPages: results.length,
      totalChunks: withEmbeddings.length,
      pages: results,
      errors: errors.length > 0 ? errors : undefined,
      crawledAt: kb.crawledAt,
    });
  } catch (error) {
    console.error('[Crawl] Error:', error);
    return NextResponse.json(
      { error: 'Crawl failed', details: (error as Error).message },
      { status: 500 },
    );
  }
}
