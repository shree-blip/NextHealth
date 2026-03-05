import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import Replicate from 'replicate';
import prisma from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';
import { runSeoChecks, generateSocialMeta, type SeoCheckResult } from '@/lib/seo-validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// ── Internal pages for linking ──────────────────────────────────────
const INTERNAL_PAGES = [
  { url: '/services/seo-local-search', label: 'SEO & Local Search services' },
  { url: '/services/google-ads', label: 'Google Ads management' },
  { url: '/services/meta-ads', label: 'Meta & Facebook Ads' },
  { url: '/services/social-media-marketing', label: 'social media marketing' },
  { url: '/services/google-business-profile', label: 'Google Business Profile optimization' },
  { url: '/services/website-design-dev', label: 'website design & development' },
  { url: '/services/content-copywriting', label: 'content & copywriting services' },
  { url: '/services/email-drip-campaigns', label: 'email drip campaigns' },
  { url: '/services/analytics-reporting', label: 'analytics & reporting' },
  { url: '/services/brand-identity-design', label: 'brand identity design' },
  { url: '/services/strategy-planning', label: 'strategy & planning' },
  { url: '/industries', label: 'healthcare industry marketing' },
  { url: '/proven-results', label: 'proven results & case studies' },
  { url: '/case-studies', label: 'case studies' },
  { url: '/about', label: 'about our agency' },
  { url: '/contact', label: 'contact us' },
  { url: '/pricing', label: 'pricing plans' },
  { url: '/hipaa', label: 'HIPAA compliance' },
  { url: '/automation', label: 'healthcare marketing automation' },
  { url: '/blog', label: 'healthcare marketing blog' },
];

const EXTERNAL_SOURCES = [
  { url: 'https://www.cdc.gov', name: 'Centers for Disease Control and Prevention (CDC)' },
  { url: 'https://www.who.int', name: 'World Health Organization (WHO)' },
  { url: 'https://www.hhs.gov', name: 'U.S. Department of Health and Human Services' },
  { url: 'https://www.cms.gov', name: 'Centers for Medicare & Medicaid Services' },
  { url: 'https://www.nih.gov', name: 'National Institutes of Health (NIH)' },
  { url: 'https://www.ama-assn.org', name: 'American Medical Association' },
  { url: 'https://www.healthit.gov', name: 'HealthIT.gov' },
  { url: 'https://www.beckershospitalreview.com', name: "Becker's Hospital Review" },
  { url: 'https://www.fiercehealthcare.com', name: 'Fierce Healthcare' },
  { url: 'https://www.healthcareitnews.com', name: 'Healthcare IT News' },
  { url: 'https://searchengineland.com', name: 'Search Engine Land' },
  { url: 'https://blog.google', name: 'Google Blog' },
  { url: 'https://support.google.com/business', name: 'Google Business Profile Help' },
  { url: 'https://www.semrush.com/blog', name: 'Semrush Blog' },
  { url: 'https://moz.com/blog', name: 'Moz Blog' },
  { url: 'https://www.hubspot.com/marketing-statistics', name: 'HubSpot Marketing Statistics' },
];

/**
 * Generate a cover image using Replicate flux-schnell.
 */
async function generateBlogImage(focusKeyword: string, title: string): Promise<string | null> {
  if (!process.env.REPLICATE_API_TOKEN) return null;
  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = (await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt: `Professional photorealistic editorial photograph for a healthcare marketing blog article about "${title}". Modern healthcare clinic interior or hospital corridor, realistic medical professionals in lab coats or scrubs, natural window light, shallow depth of field, authentic medical equipment visible. High-end editorial photography style similar to Harvard Business Review or JAMA. No cartoons, no digital art, no illustrated style, no text overlays, no logos.`,
        aspect_ratio: '16:9',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 85,
      },
    })) as string[];
    const tempUrl = Array.isArray(output) ? output[0] : null;
    if (!tempUrl) return null;
    return await persistImage(tempUrl, 'blog');
  } catch (error) {
    console.error('Blog image generation failed:', error);
    return null;
  }
}

/**
 * ONE-SHOT Blog Draft Generator
 *
 * Uses a single GPT-4o call with an exhaustive system prompt that embeds every
 * SEO, readability, linking, and structural rule. The model returns a single
 * JSON blob containing ALL fields (SEO meta, HTML content, excerpt). No retry
 * loop — the prompt is comprehensive enough for a first-pass passing score.
 */
async function generateOneShotBlog(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // Fetch existing titles for duplicate check
  const existingPosts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: { title: true, slug: true },
  });
  const existingTitles = existingPosts.map((p) => p.title);
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  // Pick random internal & external links
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5).slice(0, 4);
  const shuffledExternal = [...EXTERNAL_SOURCES].sort(() => Math.random() - 0.5).slice(0, 4);

  // ── Single GPT-4o call: produce everything in one shot ──────────────
  const { text: raw } = await generateText({
    model: openai('gpt-4o'),
    system: `You are an elite healthcare SEO content engineer for thenextgenhealth.com — a Healthcare Marketing and Custom Software Solutions agency in Texas. You will produce a COMPLETE blog post package in a SINGLE output that scores 75+ on a 100-point Rank Math–style SEO audit.

────────────────────────────────────────────
IMPORTANT: Respond with ONLY a JSON object. No markdown fences. No explanation.
────────────────────────────────────────────

EXISTING TITLES (do NOT duplicate):
${existingTitles.map((t) => `• ${t}`).join('\n')}

INTERNAL PAGES you MUST link to (use at least 2):
${shuffledInternal.map((l) => `• <a href="${SITE_URL}${l.url}">${l.label}</a>`).join('\n')}

EXTERNAL SOURCES you MUST cite (use at least 2):
${shuffledExternal.map((l) => `• <a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a>`).join('\n')}

═══════════════════════════════════════════
KEYWORD RULES
═══════════════════════════════════════════
• Pick ONE focus keyword: 2-5 words, long-tail, buyer-intent.
  Good: "healthcare marketing automation", "dental clinic SEO strategy"
  Bad: "how to improve your healthcare marketing strategy"
• Pick 4-6 supporting keywords.
• Topic areas: healthcare marketing, medical SEO, Google Business Profile, Google/Meta Ads for healthcare, HIPAA-safe marketing, custom software for healthcare.

═══════════════════════════════════════════
SEO TITLE RULES (seoTitle field) — STRICT
═══════════════════════════════════════════
• MUST start with the focus keyword.
• MUST contain a NUMBER (e.g., 7, 10, 5).
• MUST contain a POWER word: Proven, Essential, Ultimate, Critical, Expert, Guaranteed, Definitive, Trusted.
• MUST contain a SENTIMENT word: Boost, Devastating, Skyrocket, Transform, Dominate, Accelerate.
• MUST be 30-60 characters total (count carefully).

═══════════════════════════════════════════
META DESCRIPTION RULES
═══════════════════════════════════════════
• Include focus keyword. 140-160 characters exactly.

═══════════════════════════════════════════
BLOG TITLE (blogTitle)
═══════════════════════════════════════════
• Engaging, includes focus keyword, a number, and a power word.

═══════════════════════════════════════════
SLUG RULES
═══════════════════════════════════════════
• Short, lowercase, hyphens, contains focus keyword.

═══════════════════════════════════════════
HTML CONTENT RULES (htmlContent field) — CRITICAL
═══════════════════════════════════════════
1. Write EXACTLY 900-1200 words.
2. Clean HTML ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
3. Do NOT wrap in a container. Start directly with <p>.
4. Focus keyword placement:
   • In the FIRST SENTENCE
   • In at least ONE <h2>
   • In at least ONE <h3>
   • In the CLOSING paragraph
   • 0.8%-1.2% keyword density (8-12 uses per 1000 words, evenly spread)
5. Supporting keywords woven naturally throughout.
6. Table of Contents after the intro paragraph: <ul> with anchor links to each H2.
7. Short paragraphs: 2-3 sentences, MAXIMUM 150 words per paragraph.
8. INTERNAL links: at least 2, spread across different sections.
9. EXTERNAL links: at least 2, spread across different sections.
10. Do NOT cluster links in one paragraph.
11. Structure: Intro → TOC → 3-4 H2 sections (each with H3 sub-sections) → Conclusion with CTA.
12. Include real statistics from credible sources.
13. End with CTA directing readers to explore our services or contact us.

═══════════════════════════════════════════
READABILITY RULES — THESE DIRECTLY AFFECT SCORE
═══════════════════════════════════════════
• Average sentence length ≤ 18 words. Short, direct sentences.
• At least 30% of sentences start with TRANSITION WORDS:
  However, Also, Furthermore, For example, Additionally, Therefore, Meanwhile,
  Specifically, Moreover, In addition, Consequently, As a result, Next, Finally,
  Similarly, Notably, Because, Indeed, Instead, Nevertheless.
• ACTIVE VOICE in 90%+ sentences. Avoid "was done by", "is managed by", etc.
• Flesch Reading Ease 50-70 (professional but clear prose).
• Vary sentence length — mix short punchy sentences with medium ones.
• NO paragraph longer than 150 words.

═══════════════════════════════════════════
JSON RESPONSE FORMAT (return exactly this)
═══════════════════════════════════════════
{
  "focusKeyword": "2-5 word keyword",
  "supportingKeywords": ["kw1", "kw2", "kw3", "kw4"],
  "seoTitle": "30-60 chars, starts with keyword, has number + power + sentiment",
  "metaDescription": "140-160 chars with keyword",
  "blogTitle": "engaging title with keyword, number, power word",
  "slug": "short-slug-with-keyword",
  "htmlContent": "<p>Full HTML blog post, 900-1200 words...</p>",
  "excerpt": "1-2 sentence plain-text excerpt with keyword, max 200 chars"
}`,
    prompt: customTopic
      ? `Write a complete one-shot blog post about: "${customTopic}". Follow every rule in the system prompt. Return ONLY the JSON object.`
      : `Write a complete one-shot blog post on the best healthcare marketing topic you can find. Follow every rule in the system prompt. Return ONLY the JSON object.`,
    temperature: 0.7,
  });

  // Parse JSON
  let parsed: {
    focusKeyword: string;
    supportingKeywords: string[];
    seoTitle: string;
    metaDescription: string;
    blogTitle: string;
    slug: string;
    htmlContent: string;
    excerpt: string;
  };
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('One-shot generation failed: could not parse AI JSON response');
  }

  // Ensure slug uniqueness
  if (existingSlugs.has(parsed.slug)) {
    parsed.slug = `${parsed.slug}-${Date.now().toString(36)}`;
  }

  // Clean content
  const cleanedContent = parsed.htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  // Run SEO validation (informational — we accept the draft regardless)
  const seoCheck: SeoCheckResult = runSeoChecks({
    focusKeyword: parsed.focusKeyword,
    isKeywordUniqueToDomain: true,
    title: parsed.blogTitle,
    seoTitle: parsed.seoTitle,
    metaDesc: parsed.metaDescription,
    htmlContent: cleanedContent,
    type: 'blog',
    siteUrl: SITE_URL,
  });

  console.log(`[Blog One-Shot] Score: ${seoCheck.totalScore}/100 | Passed: ${seoCheck.passed}`, seoCheck.failures);

  // Generate image
  const imageUrl = await generateBlogImage(parsed.focusKeyword, parsed.blogTitle);

  // Generate social metadata
  const socialMeta = generateSocialMeta({
    title: parsed.seoTitle,
    description: parsed.metaDescription,
    image: imageUrl,
    slug: parsed.slug,
    siteUrl: SITE_URL,
    section: 'blog',
  });

  return {
    title: parsed.blogTitle,
    slug: parsed.slug,
    excerpt: (parsed.excerpt || '').trim().substring(0, 250),
    content: cleanedContent,
    coverImage: imageUrl,
    coverImageAlt: `${parsed.focusKeyword} - ${parsed.blogTitle}`,
    seoTitle: parsed.seoTitle,
    metaDesc: parsed.metaDescription,
    focusKeyword: parsed.focusKeyword,
    supportingKeywords: parsed.supportingKeywords,
    topic: customTopic || parsed.blogTitle,
    socialMeta,
    seoMetrics: seoCheck.metrics,
    seoValidationPassed: seoCheck.passed,
    seoScore: seoCheck.totalScore,
  };
}

// ── POST handler ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCron) {
      const { requireAdmin } = await import('@/lib/auth');
      const auth = await requireAdmin(request);
      if ('response' in auth) return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const { topic, autoPublish = false } = body as { topic?: string; autoPublish?: boolean };

    const blogData = await generateOneShotBlog(topic);

    // Save to database — no hard gating, always save the draft
    const post = await prisma.post.create({
      data: {
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        coverImage: blogData.coverImage || null,
        coverImageAlt: blogData.coverImageAlt || null,
        seoTitle: blogData.seoTitle,
        metaDesc: blogData.metaDesc,
        canonical: null,
        publishedAt: autoPublish ? new Date() : null,
      },
    });

    // Save AI history
    try {
      await prisma.aiHistory.create({
        data: {
          userId: 'auto-blog-oneshot',
          generatorType: 'blog',
          prompt: blogData.topic,
          settings: {
            mode: 'one-shot',
            focusKeyword: blogData.focusKeyword,
            seoTitle: blogData.seoTitle,
            metaDesc: blogData.metaDesc,
            autoPublish,
            seoValidationPassed: blogData.seoValidationPassed,
            seoScore: blogData.seoScore,
            seoMetrics: blogData.seoMetrics,
            socialMeta: blogData.socialMeta,
          },
          output: `Post ID: ${post.id} | Slug: ${post.slug}`,
        },
      });
    } catch (historyError) {
      console.error('Failed to save AI history (non-critical):', historyError);
    }

    if (autoPublish) {
      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/sitemap.xml');
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${post.slug}`);
      } catch (revalError) {
        console.error('Revalidation failed (non-critical):', revalError);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'one-shot',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        seoTitle: post.seoTitle,
        metaDesc: post.metaDesc,
        focusKeyword: blogData.focusKeyword,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
        status: post.publishedAt ? 'published' : 'draft',
        seoValidationPassed: blogData.seoValidationPassed,
        seoScore: blogData.seoScore,
        seoMetrics: blogData.seoMetrics,
      },
    });
  } catch (error) {
    console.error('One-shot blog generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}
