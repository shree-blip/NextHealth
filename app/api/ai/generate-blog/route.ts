import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import Replicate from 'replicate';
import prisma from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Blog + image generation can take time

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

// ── Credible external sources (prefer .gov, .edu, CDC, NIH, CMS, WHO) ──
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
 * STEP 1: AI-driven keyword research + topic selection.
 * Uses GPT to find a low-competition, high-intent keyword and topic
 * that does NOT duplicate existing posts.
 */
async function researchKeywordAndTopic(
  customTopic: string | undefined,
  existingTitles: string[]
): Promise<{ topic: string; focusKeyword: string; supportingKeywords: string[] }> {
  const { text: keywordJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an SEO keyword research agent for thenextgenhealth.com. Our niche is Healthcare Marketing and Custom Software Solutions for healthcare businesses.

Your job is to find ONE low-competition, high-intent keyword and a blog topic for it.

KEYWORD RESEARCH RULES:
- Choose keywords that match buyer intent. Example: "healthcare marketing automation software".
- Prefer long-tail keywords with clear intent.
- Pick from these topic areas:
  • healthcare marketing
  • medical SEO
  • Google Business Profile for clinics
  • Google Ads and Meta Ads for healthcare
  • HIPAA-safe marketing and automation
  • custom software for healthcare marketing, reporting, dashboards, and workflow systems
- Create a short list of 10 keyword options internally, then select the best 1 for the post.
- Pick 1 primary keyword and 4-6 supporting keywords.

DUPLICATE CHECK:
The following titles already exist on our site. Do NOT propose a topic that overlaps with any of them. If a similar topic exists, propose a fresh angle that is clearly different.

Existing titles:
${existingTitles.map((t) => `- ${t}`).join('\n')}

Respond ONLY with valid JSON, no markdown.`,
    prompt: `${customTopic ? `The user wants a blog about: "${customTopic}". Research the best keyword for this topic.` : 'Research and propose the best keyword + topic for a new blog post.'}

Return this exact JSON structure:
{
  "focusKeyword": "the primary SEO keyword (2-5 words, long-tail, high buyer intent)",
  "supportingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "topic": "the proposed blog post topic/angle",
  "duplicateCheck": "pass or conflict — explain if a similar title exists and how this is different"
}`,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(keywordJson.replace(/```json\n?|\n?```/g, '').trim());
    return {
      topic: parsed.topic || customTopic || 'Healthcare Marketing Best Practices',
      focusKeyword: parsed.focusKeyword,
      supportingKeywords: parsed.supportingKeywords || [],
    };
  } catch {
    return {
      topic: customTopic || 'Healthcare Marketing Best Practices',
      focusKeyword: 'healthcare marketing',
      supportingKeywords: ['medical SEO', 'clinic marketing', 'patient acquisition', 'healthcare automation'],
    };
  }
}

/**
 * STEP 5: Generate a cover image for the blog post using Replicate (flux-schnell).
 *
 * IMAGE RULES:
 * - No cartoons. No illustrated art. No "AI-looking" faces.
 * - Professional editorial photography style.
 * - Alt text must include the focus keyword.
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

    // Persist to permanent storage (Replicate output URLs expire after ~1 hour)
    const permanentUrl = await persistImage(tempUrl, 'blog');
    return permanentUrl;
  } catch (error) {
    console.error('Blog image generation failed:', error);
    return null;
  }
}

/**
 * Main blog generation function — follows the full 7-step SEO agent workflow.
 */
async function generateBlogPost(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // ── STEP 3: Duplicate check — fetch existing titles ─────────────────
  const existingPosts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: { title: true },
  });
  const existingTitles = existingPosts.map((p) => p.title);

  // ── STEP 1 + 2 + 3: Keyword research + site context + duplicate check ──
  const research = await researchKeywordAndTopic(customTopic, existingTitles);
  const { topic, focusKeyword, supportingKeywords } = research;

  // Pick internal pages and external sources for linking (at least 2 each per agent rules)
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5);
  const internalLinks = shuffledInternal.slice(0, 3);
  const shuffledExternal = [...EXTERNAL_SOURCES].sort(() => Math.random() - 0.5);
  const externalLinks = shuffledExternal.slice(0, 3);

  // ── STEP 4a: Generate SEO fields with Rank Math rules ───────────────
  const { text: seoJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert healthcare SEO specialist for thenextgenhealth.com. Our niche: Healthcare Marketing and Custom Software Solutions for healthcare businesses. Respond ONLY with valid JSON, no markdown.`,
    prompt: `Generate SEO fields for a healthcare marketing blog post.

Topic: "${topic}"
Focus Keyword: "${focusKeyword}"
Supporting Keywords: ${supportingKeywords.join(', ')}

Return this exact JSON structure:
{
  "focusKeyword": "${focusKeyword}",
  "supportingKeywords": ${JSON.stringify(supportingKeywords)},
  "seoTitle": "SEO title following these rules: START with the focus keyword, include a NUMBER, include one strong POWER word (e.g., Proven, Essential, Ultimate, Critical) and one SENTIMENT word (positive or negative, e.g., Boost, Devastating, Skyrocket). MUST be under 70 characters.",
  "metaDescription": "Meta description: include the focus keyword, 140-160 characters, compelling and click-worthy",
  "slug": "short-url-slug-with-focus-keyword",
  "blogTitle": "engaging blog post title that includes the focus keyword, a number, and a power word"
}

STRICT RULES:
- seoTitle MUST start with the focus keyword
- seoTitle MUST contain a number
- seoTitle MUST contain a power word AND a sentiment word
- seoTitle MUST be under 70 characters
- metaDescription MUST be 140-160 characters
- slug MUST be short, lowercase with hyphens, contain the focus keyword
- focusKeyword MUST appear in seoTitle, metaDescription, and slug`,
    temperature: 0.7,
  });

  let seo: { focusKeyword: string; seoTitle: string; metaDescription: string; slug: string; blogTitle: string; supportingKeywords?: string[] };
  try {
    seo = JSON.parse(seoJson.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    throw new Error('Failed to parse SEO JSON from AI');
  }

  // Check slug uniqueness
  const existingPost = await prisma.post.findUnique({ where: { slug: seo.slug } });
  if (existingPost) {
    seo.slug = `${seo.slug}-${Date.now().toString(36)}`;
  }

  // ── STEP 4b: Generate the blog content (900-1200 words, 100/100 SEO) ──
  const { text: htmlContent } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert SEO content writer for thenextgenhealth.com — a Healthcare Marketing and Custom Software Solutions agency based in Texas. We serve Freestanding Emergency Rooms, Urgent Care centers, Dental clinics, Wellness & Longevity facilities, and other healthcare businesses.

OUR SERVICES (reference these naturally when relevant):
- SEO & Local Search optimization for healthcare
- Google Ads and Meta/Facebook Ads management
- Google Business Profile optimization
- Social media marketing for clinics
- Website design & development (HIPAA-compliant)
- Content & copywriting services
- Email drip campaigns for patient retention
- Analytics & reporting dashboards
- Brand identity design
- Strategy & planning
- Healthcare marketing automation software
- Custom software solutions for reporting, dashboards, and workflow systems

YOU MUST follow ALL of these SEO rules to hit a 100/100 Rank Math score:

CONTENT RULES:
1. Write EXACTLY 900-1,200 words of body content.
2. Output clean HTML only. No markdown. No code blocks.
3. Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
4. Do NOT wrap output in a container tag. Start directly with the first <p>.
5. Focus keyword: "${seo.focusKeyword}". Use it:
   - In the FIRST SENTENCE of the article
   - In at least ONE <h2> heading
   - In at least ONE <h3> heading
   - In the closing paragraph
   - At about 1% keyword density across the post (NO keyword stuffing)
6. Supporting keywords to weave in naturally: ${supportingKeywords.join(', ')}
7. Include a TABLE OF CONTENTS after the intro paragraph using an <ul> with anchor links to each H2 section.
8. Use SHORT paragraphs (2-3 sentences max) and bullet lists for scannability.

LINK RULES:
9. Include at least 2 INTERNAL links to thenextgenhealth.com service pages. Place them naturally in relevant sections.
10. Include at least 2 EXTERNAL links to credible sources (.gov, .edu, CDC, NIH, CMS, WHO, or peer-reviewed journals preferred). Use normal links (not nofollow).
11. Do NOT cluster all links in one paragraph — spread them across the article.

STRUCTURE:
12. Introduction (include focus keyword in first sentence) → Table of Contents → 3-4 main sections with H2 headings (each with H3 sub-sections) → Conclusion with clear CTA.
13. Cite real statistics or facts from credible healthcare/marketing sources.
14. Write with authority and real-world examples.
15. Include a clear call-to-action in the final section directing readers to contact or explore our services.`,
    prompt: `Write a complete blog post.

Title: "${seo.blogTitle}"
Focus Keyword: "${seo.focusKeyword}"
Supporting Keywords: ${supportingKeywords.join(', ')}

INTERNAL LINKS (use at least 2, place naturally throughout the body):
${internalLinks.map((l) => `- <a href="${SITE_URL}${l.url}">${l.label}</a> — link when discussing ${l.label}`).join('\n')}

EXTERNAL LINKS (use at least 2, place naturally as credible source citations):
${externalLinks.map((l) => `- <a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a> — cite when referencing data or authority`).join('\n')}

REMEMBER:
- 900-1,200 words
- Focus keyword in first sentence, at least 1 H2, at least 1 H3, closing paragraph
- Table of Contents after intro
- Short paragraphs and bullet lists
- At least 2 internal + 2 external links spread throughout
- Clean HTML only, start with <p> tag`,
    temperature: 0.75,
  });

  // Clean up the content
  let cleanedContent = htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  // ── STEP 5: Generate the cover image (real photo, no cartoons) ──────
  const imageUrl = await generateBlogImage(seo.focusKeyword, seo.blogTitle);

  // The cover image is saved to the post's coverImage field and rendered by
  // SinglePostLayout as a hero image above the article — do NOT embed it again
  // inside the HTML content to avoid displaying it twice.

  // ── Generate excerpt ────────────────────────────────────────────────
  const { text: excerpt } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'Generate a 1-2 sentence blog excerpt. Plain text only, no HTML. Include the focus keyword naturally.',
    prompt: `Write a short excerpt for a blog post titled "${seo.blogTitle}" with focus keyword "${seo.focusKeyword}". Max 200 characters.`,
    temperature: 0.6,
  });

  return {
    title: seo.blogTitle,
    slug: seo.slug,
    excerpt: excerpt.trim().substring(0, 250),
    content: cleanedContent,
    coverImage: imageUrl,
    coverImageAlt: `${seo.focusKeyword} - ${seo.blogTitle}`,
    seoTitle: seo.seoTitle,
    metaDesc: seo.metaDescription,
    focusKeyword: seo.focusKeyword,
    supportingKeywords: supportingKeywords,
    topic,
  };
}

// ── POST: Generate a blog post (manual trigger or cron) ─────────────
export async function POST(request: NextRequest) {
  try {
    // Auth: allow cron (via CRON_SECRET) or authenticated admin
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

    // Generate the blog post
    const blogData = await generateBlogPost(topic);

    // Save to database
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
        publishedAt: autoPublish ? new Date() : null, // null = draft
      },
    });

    // Save generation metadata to AiHistory
    try {
      await prisma.aiHistory.create({
        data: {
          userId: 'auto-blog-system',
          generatorType: 'blog',
          prompt: blogData.topic,
          settings: {
            focusKeyword: blogData.focusKeyword,
            seoTitle: blogData.seoTitle,
            metaDesc: blogData.metaDesc,
            autoPublish,
          },
          output: `Post ID: ${post.id} | Slug: ${post.slug}`,
        },
      });
    } catch (historyError) {
      console.error('Failed to save AI history (non-critical):', historyError);
    }

    // Revalidate sitemap + homepage so the new post appears immediately
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
      },
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}
