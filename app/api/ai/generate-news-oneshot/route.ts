import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import Replicate from 'replicate';
import prisma from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';
import { generateSocialMeta } from '@/lib/seo-validation';
import { pickNewsScene } from '@/lib/image-scenes';
import { runHealthcareNewsValidation, type HealthcareNewsValidationReport } from '@/lib/news-validation';

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
  { url: '/news', label: 'healthcare marketing news' },
];

const NEWS_SOURCES = [
  { url: 'https://www.beckershospitalreview.com', name: "Becker's Hospital Review" },
  { url: 'https://www.fiercehealthcare.com', name: 'Fierce Healthcare' },
  { url: 'https://www.healthcareitnews.com', name: 'Healthcare IT News' },
  { url: 'https://www.modernhealthcare.com', name: 'Modern Healthcare' },
  { url: 'https://www.healthaffairs.org', name: 'Health Affairs' },
  { url: 'https://www.cms.gov', name: 'CMS.gov' },
  { url: 'https://www.hhs.gov', name: 'HHS.gov' },
  { url: 'https://www.nih.gov', name: 'National Institutes of Health (NIH)' },
  { url: 'https://www.cdc.gov', name: 'Centers for Disease Control and Prevention (CDC)' },
  { url: 'https://www.ama-assn.org', name: 'American Medical Association' },
  { url: 'https://www.advisory.com', name: 'Advisory Board' },
  { url: 'https://www.healthcarefinancenews.com', name: 'Healthcare Finance News' },
  { url: 'https://searchengineland.com', name: 'Search Engine Land' },
  { url: 'https://www.reuters.com/business/healthcare-pharmaceuticals', name: 'Reuters Health' },
  { url: 'https://www.statnews.com', name: 'STAT News' },
  { url: 'https://www.medpagetoday.com', name: 'MedPage Today' },
];

/**
 * Generate a cover image using Replicate flux-schnell.
 */
async function generateNewsImage(focusKeyword: string, title: string, scene: string): Promise<string | null> {
  if (!process.env.REPLICATE_API_TOKEN) return null;
  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = (await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt: `Professional photojournalistic photograph for a healthcare industry news article titled "${title}". Scene: ${scene}. Realistic people in authentic settings, natural documentary-style lighting, realistic skin tones. High-end photojournalism similar to Reuters Health or STAT News. No cartoons, no digital art, no illustrated style, no text overlays, no logos.`,
        aspect_ratio: '16:9',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 85,
      },
    })) as string[];
    const tempUrl = Array.isArray(output) ? output[0] : null;
    if (!tempUrl) return null;
    return await persistImage(tempUrl, 'news');
  } catch (error) {
    console.error('News image generation failed:', error);
    return null;
  }
}

function countExternalCitations(html: string): number {
  const allLinks = html.match(/<a[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  return allLinks.filter(link => !link.includes('thenextgenhealth.com')).length;
}

/**
 * ONE-SHOT News Draft Generator
 *
 * Uses a single GPT-4o call with an exhaustive system prompt that embeds
 * every SEO, YMYL, citation, readability, and structural rule. The model
 * returns a single JSON blob containing ALL fields. No retry loop.
 */
async function generateOneShotNews(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // Fetch existing titles for duplicate check
  const existingArticles = await prisma.newsArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: { title: true, slug: true },
  });
  const existingTitles = existingArticles.map((a: any) => a.title);
  const existingSlugs = new Set(existingArticles.map((a: any) => a.slug));

  // Pick random internal & external links
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5).slice(0, 4);
  const shuffledSources = [...NEWS_SOURCES].sort(() => Math.random() - 0.5);
  const primarySource = shuffledSources[0];
  const secondarySource = shuffledSources[1];
  const tertiarySource = shuffledSources[2];
  const quaternarySource = shuffledSources[3];

  // ── Single GPT-4o call: produce everything in one shot ──────────────
  const { text: raw } = await generateText({
    model: openai('gpt-4o'),
    system: `You are an elite healthcare news editor and SEO specialist for thenextgenhealth.com — a Healthcare Marketing and Custom Software Solutions agency in Texas. You will produce a COMPLETE news article package in a SINGLE output that scores 75+ on a 100-point healthcare news SEO audit.

────────────────────────────────────────────
IMPORTANT: Respond with ONLY a JSON object. No markdown fences. No explanation.
────────────────────────────────────────────

EXISTING TITLES (do NOT duplicate):
${existingTitles.map((t: string) => `• ${t}`).join('\n')}

INTERNAL PAGES you MUST link to (use at least 2):
${shuffledInternal.map((l) => `• <a href="${SITE_URL}${l.url}">${l.label}</a>`).join('\n')}

EXTERNAL SOURCES you MUST cite (use at least 3):
• <a href="${primarySource.url}" target="_blank" rel="noopener noreferrer">${primarySource.name}</a>
• <a href="${secondarySource.url}" target="_blank" rel="noopener noreferrer">${secondarySource.name}</a>
• <a href="${tertiarySource.url}" target="_blank" rel="noopener noreferrer">${tertiarySource.name}</a>
• <a href="${quaternarySource.url}" target="_blank" rel="noopener noreferrer">${quaternarySource.name}</a>

═══════════════════════════════════════════
KEYWORD RULES
═══════════════════════════════════════════
• Pick ONE focus keyword: 2-5 words, long-tail, newsworthy healthcare intent.
• Pick 4-6 supporting keywords.
• Topic areas: healthcare marketing trends, medical SEO updates, Google Business Profile, Google/Meta Ads policy changes, HIPAA marketing, telehealth trends, healthcare regulations.

═══════════════════════════════════════════
SEO TITLE RULES (seoTitle) — STRICT
═══════════════════════════════════════════
• MUST start with the focus keyword.
• MUST contain a NUMBER (e.g., 5, 3, 10).
• MUST contain a POWER word: Breaking, Critical, Major, Urgent, Essential, Proven, Definitive.
• MUST contain a SENTIMENT word: Boost, Transform, Dominate, Accelerate, Reshape.
• MUST be 30-60 characters total.

═══════════════════════════════════════════
META DESCRIPTION RULES
═══════════════════════════════════════════
• Include focus keyword. 140-160 characters exactly.

═══════════════════════════════════════════
HEADLINE (headline)
═══════════════════════════════════════════
• Journalistic, includes focus keyword.
• AVOID clickbait: do NOT start with "Watch", do NOT end with "?", no "you won't believe", no "miracle cure".

═══════════════════════════════════════════
SLUG RULES
═══════════════════════════════════════════
• Short, lowercase, hyphens, contains focus keyword.

═══════════════════════════════════════════
AUTHOR & PUBLISHER
═══════════════════════════════════════════
• publisher: "The NextGen Healthcare Marketing"
• authorName: Must include medical credentials (MD, DO, PhD, RN, BSN, NP, PA-C, PharmD, MPH, or RD).
  Example: "Dr. Sarah Johnson, MD" or "Robert Martinez, MPH"

═══════════════════════════════════════════
HTML CONTENT RULES (htmlContent) — CRITICAL
═══════════════════════════════════════════
1. Write EXACTLY 500-900 words.
2. Clean HTML ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
3. Do NOT wrap in a container. Start directly with <p>.
4. Focus keyword placement:
   • In the FIRST SENTENCE (the lead)
   • In at least ONE <h2>
   • In at least ONE <h3>
   • In the CLOSING paragraph
   • 0.8%-1.2% keyword density
5. Supporting keywords woven naturally.
6. Table of Contents after the lead paragraph: <ul> with anchor links to each H2.
7. Short paragraphs: 2-3 sentences, MAXIMUM 150 words each.
8. INTERNAL links: at least 2, spread across different sections.
9. EXTERNAL links (CITATIONS): at least 3, spread across different sections. Use .gov, .edu, CDC, NIH, or major healthcare publications.
10. Do NOT cluster links in one paragraph.
11. Write in journalistic news reporting tone. Include attributed quotes from realistic industry experts.
12. Structure: Lead paragraph (who/what/when/where/why) → TOC → Context → Key Details (H2/H3) → Industry Impact → What This Means for Providers → Medical Disclaimer → CTA.
13. MEDICAL DISCLAIMER REQUIRED at the end before CTA:
    <p><em>Medical Disclaimer: This content is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.</em></p>
14. End with CTA directing healthcare providers to explore our services.

═══════════════════════════════════════════
READABILITY RULES — DIRECTLY AFFECT SCORE
═══════════════════════════════════════════
• Average sentence length ≤ 18 words.
• At least 30% of sentences start with TRANSITION WORDS:
  However, Also, Furthermore, For example, Additionally, Therefore, Meanwhile,
  Specifically, Moreover, In addition, Consequently, As a result, Next, Finally,
  Similarly, Notably, Because, Indeed, Instead, Nevertheless.
• ACTIVE VOICE in 90%+ sentences.
• Flesch Reading Ease 50-70.
• NO paragraph longer than 150 words.

═══════════════════════════════════════════
JSON RESPONSE FORMAT (return exactly this)
═══════════════════════════════════════════
{
  "focusKeyword": "2-5 word keyword",
  "supportingKeywords": ["kw1", "kw2", "kw3", "kw4"],
  "seoTitle": "30-60 chars, starts with keyword, has number + power + sentiment",
  "metaDescription": "140-160 chars with keyword",
  "headline": "journalistic headline with keyword, no clickbait",
  "slug": "short-slug-with-keyword",
  "publisher": "The NextGen Healthcare Marketing",
  "source": "category (Industry Report, Market Analysis, Regulatory Update, Technology News)",
  "authorName": "name with credentials",
  "htmlContent": "<p>Full HTML news article, 500-900 words...</p>",
  "excerpt": "1-2 sentence plain-text excerpt with keyword, max 200 chars"
}`,
    prompt: customTopic
      ? `Write a complete one-shot healthcare news article about: "${customTopic}". Follow every rule in the system prompt. Return ONLY the JSON object.`
      : `Write a complete one-shot healthcare news article on the most newsworthy healthcare marketing topic. Follow every rule in the system prompt. Return ONLY the JSON object.`,
    temperature: 0.7,
  });

  // Parse JSON
  let parsed: {
    focusKeyword: string;
    supportingKeywords: string[];
    seoTitle: string;
    metaDescription: string;
    headline: string;
    slug: string;
    publisher: string;
    source: string;
    authorName: string;
    htmlContent: string;
    excerpt: string;
  };
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('One-shot generation failed: could not parse AI JSON response');
  }

  // Ensure defaults
  if (!parsed.publisher) parsed.publisher = 'The NextGen Healthcare Marketing';
  if (!parsed.authorName) parsed.authorName = 'Dr. Michael Chen, MD';

  // Ensure slug uniqueness
  if (existingSlugs.has(parsed.slug)) {
    parsed.slug = `${parsed.slug}-${Date.now().toString(36)}`;
  }

  // Clean content
  const cleanedContent = parsed.htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  const externalCitations = countExternalCitations(cleanedContent);
  const hasDisclaimer = cleanedContent.toLowerCase().includes('medical disclaimer') ||
    cleanedContent.toLowerCase().includes('informational purposes only');

  // Run validation (informational — we accept the draft regardless)
  const validationReport: HealthcareNewsValidationReport = runHealthcareNewsValidation({
    focusKeyword: parsed.focusKeyword,
    isKeywordUniqueToDomain: true,
    title: parsed.headline,
    seoTitle: parsed.seoTitle,
    metaDesc: parsed.metaDescription,
    htmlContent: cleanedContent,
    siteUrl: SITE_URL,
    featuredImage: undefined,
    source: parsed.source,
    sourceUrl: primarySource.url,
    publisher: parsed.publisher,
    authorName: parsed.authorName,
    publishedAt: new Date(),
    isOriginalContent: true,
    citationCount: externalCitations,
    containsMedicalDisclaimer: hasDisclaimer,
    hasC2PAManifest: false,
    isJTICertified: false,
  });

  console.log(`[News One-Shot] Score: ${validationReport.totalScore}/100 | Passed: ${validationReport.passed}`, validationReport.failures);

  // Generate image (unique scene rotation so consecutive articles never share the same visual)
  const articleCount = await prisma.newsArticle.count();
  const newsScene = pickNewsScene(articleCount);
  const imageUrl = await generateNewsImage(parsed.focusKeyword, parsed.headline, newsScene);

  // Generate social metadata
  const socialMeta = generateSocialMeta({
    title: parsed.seoTitle,
    description: parsed.metaDescription,
    image: imageUrl,
    slug: parsed.slug,
    siteUrl: SITE_URL,
    section: 'news',
  });

  return {
    title: parsed.headline,
    slug: parsed.slug,
    excerpt: (parsed.excerpt || '').trim().substring(0, 250),
    content: cleanedContent,
    coverImage: imageUrl,
    coverImageAlt: `${parsed.focusKeyword} - ${parsed.headline}`,
    seoTitle: parsed.seoTitle,
    metaDesc: parsed.metaDescription,
    focusKeyword: parsed.focusKeyword,
    supportingKeywords: parsed.supportingKeywords,
    publisher: parsed.publisher,
    source: parsed.source,
    sourceUrl: primarySource.url,
    authorName: parsed.authorName,
    topic: customTopic || parsed.headline,
    socialMeta,
    seoMetrics: validationReport.metrics,
    healthcareMetadata: validationReport.metadata,
    seoValidationPassed: validationReport.passed,
    validationScore: validationReport.totalScore,
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

    const newsData = await generateOneShotNews(topic);

    // Save to database — no hard gating, always save the draft
    const article = await (prisma.newsArticle as any).create({
      data: {
        title: newsData.title,
        slug: newsData.slug,
        excerpt: newsData.excerpt,
        content: newsData.content,
        coverImage: newsData.coverImage || null,
        coverImageAlt: newsData.coverImageAlt || null,
        seoTitle: newsData.seoTitle,
        metaDesc: newsData.metaDesc,
        publisher: newsData.publisher,
        source: newsData.source,
        sourceUrl: newsData.sourceUrl,
        sourceDate: new Date(),
        publishedAt: autoPublish ? new Date() : null,
      },
    });

    // Save AI history
    try {
      await (prisma as any).aiHistory.create({
        data: {
          userId: 'auto-news-oneshot',
          generatorType: 'news',
          prompt: newsData.topic,
          settings: {
            mode: 'one-shot',
            focusKeyword: newsData.focusKeyword,
            seoTitle: newsData.seoTitle,
            metaDesc: newsData.metaDesc,
            publisher: newsData.publisher,
            source: newsData.source,
            autoPublish,
            seoValidationPassed: newsData.seoValidationPassed,
            validationScore: newsData.validationScore,
            seoMetrics: newsData.seoMetrics,
            healthcareMetadata: newsData.healthcareMetadata,
            socialMeta: newsData.socialMeta,
          },
          output: `Article ID: ${article.id} | Slug: ${article.slug}`,
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
        revalidatePath('/news');
        revalidatePath(`/news/${article.slug}`);
      } catch (revalError) {
        console.error('Revalidation failed (non-critical):', revalError);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'one-shot',
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        seoTitle: article.seoTitle,
        metaDesc: article.metaDesc,
        focusKeyword: newsData.focusKeyword,
        coverImage: article.coverImage,
        publisher: article.publisher,
        source: article.source,
        publishedAt: article.publishedAt,
        status: article.publishedAt ? 'published' : 'draft',
        seoValidationPassed: newsData.seoValidationPassed,
        validationScore: newsData.validationScore,
        seoMetrics: newsData.seoMetrics,
        healthcareMetadata: newsData.healthcareMetadata,
      },
    });
  } catch (error) {
    console.error('One-shot news generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate news article' },
      { status: 500 }
    );
  }
}
