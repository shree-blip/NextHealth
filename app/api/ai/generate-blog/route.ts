import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

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
  { url: '/blog', label: 'healthcare marketing blog' },
];

// ── Topic pool for daily rotation ───────────────────────────────────
const TOPIC_POOL = [
  'How to Increase Patient Volume for Freestanding Emergency Rooms',
  'Local SEO Strategies for Urgent Care Centers in Texas',
  'Google Business Profile Optimization for Healthcare Clinics',
  'Workers Compensation Marketing for Emergency Rooms',
  'Social Media Marketing Tips for Dental Clinics',
  'Why Healthcare Providers Need HIPAA-Compliant Marketing',
  'Google Ads vs Meta Ads for Emergency Room Marketing',
  'How to Reduce Patient No-Shows with Email Drip Campaigns',
  'Website Design Best Practices for Medical Clinics',
  'How Geofencing Helps Emergency Rooms Attract More Patients',
  'Content Marketing Strategies for Healthcare Providers',
  'How to Dominate the Google Local Pack for Your ER or Urgent Care',
  'Building Trust Online: Reputation Management for Healthcare',
  'Patient Acquisition Cost: How to Track and Lower It',
  'The Role of Landing Pages in Healthcare Lead Generation',
  'Emergency Room vs Urgent Care: Marketing the Difference',
  'How to Market Wellness and Longevity Clinics',
  'Pediatric Urgent Care Marketing Strategies That Work',
  'Seasonal Marketing Campaigns for Healthcare Facilities',
  'How to Use Analytics to Improve Healthcare Marketing ROI',
  'Branding Strategies for Multi-Location Healthcare Networks',
  'Video Marketing for Emergency Rooms and Urgent Care Centers',
  'How to Write Medical Blog Posts That Rank on Google',
  'The Importance of Mobile-First Design for Healthcare Websites',
  'PPC Campaign Management for Freestanding Emergency Rooms',
  'How to Market After-Hours Emergency Care Services',
  'Email Marketing for Patient Retention in Healthcare',
  'Competing Against Hospital ERs: Marketing for Freestanding Facilities',
  'How AI is Transforming Healthcare Marketing in 2026',
  'Building a Patient Referral Program That Actually Works',
];

// ── Credible medical/marketing sources for external links ──────────
const EXTERNAL_SOURCES = [
  { url: 'https://www.cdc.gov', name: 'Centers for Disease Control and Prevention (CDC)' },
  { url: 'https://www.who.int', name: 'World Health Organization (WHO)' },
  { url: 'https://www.hhs.gov', name: 'U.S. Department of Health and Human Services' },
  { url: 'https://www.cms.gov', name: 'Centers for Medicare & Medicaid Services' },
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
 * Pick a topic that hasn't been used recently.
 * Falls back to random from pool if all have been used.
 */
async function pickTopic(): Promise<string> {
  // Get slugs of the last 30 posts to avoid repeats
  const recentPosts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: { title: true },
  });
  const recentTitles = recentPosts.map((p) => p.title.toLowerCase());

  // Find a topic whose keywords don't closely match recent titles
  const unused = TOPIC_POOL.filter((topic) => {
    const topicWords = topic.toLowerCase().split(/\s+/);
    return !recentTitles.some((title) => {
      const matchCount = topicWords.filter((w) => w.length > 4 && title.includes(w)).length;
      return matchCount >= 3; // too similar
    });
  });

  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
}

/**
 * Generate a DALL-E image for the blog post
 */
async function generateBlogImage(focusKeyword: string, title: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: `Professional, photorealistic healthcare marketing blog header photo for an article about "${title}". Show real dental/clinical staff or patients in a modern clinic setting, natural lighting, realistic skin tones, authentic medical environment, shallow depth of field, no cartoon style, no illustrations, no text overlays. High-quality editorial style image suitable as a professional blog cover photo.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

/**
 * Main blog generation function
 */
async function generateBlogPost(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const topic = customTopic || (await pickTopic());

  // Pick random internal pages and external sources for linking
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5);
  const internalLinks = shuffledInternal.slice(0, 3);
  const shuffledExternal = [...EXTERNAL_SOURCES].sort(() => Math.random() - 0.5);
  const externalLinks = shuffledExternal.slice(0, 2);

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // ── STEP 1: Generate SEO fields ─────────────────────────────────────
  const { text: seoJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert healthcare SEO specialist. You work for The NextGen Healthcare Marketing, a Texas-based agency specializing in Freestanding ERs, Urgent Care centers, and Wellness clinics. Respond ONLY with valid JSON, no markdown.`,
    prompt: `Generate SEO fields for a healthcare marketing blog post about: "${topic}"

Return this exact JSON structure:
{
  "focusKeyword": "the primary SEO keyword (2-4 words, high search intent)",
  "seoTitle": "SEO-optimized title including the focus keyword (50-60 chars)",
  "metaDescription": "compelling meta description with the focus keyword (150-160 chars)",
  "slug": "url-friendly-slug-with-focus-keyword",
  "blogTitle": "engaging blog post title (may differ slightly from SEO title, include focus keyword)"
}

Requirements:
- The focus keyword must appear in seoTitle, metaDescription, and slug.
- The slug should be lowercase with hyphens, no special characters.
- Make the title compelling and click-worthy for healthcare professionals.`,
    temperature: 0.7,
  });

  let seo: { focusKeyword: string; seoTitle: string; metaDescription: string; slug: string; blogTitle: string };
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

  // ── STEP 2: Generate the blog content ───────────────────────────────
  const { text: htmlContent } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert healthcare marketing content writer for The NextGen Healthcare Marketing (${SITE_URL}), a Texas-based agency that specializes in marketing for Freestanding Emergency Rooms, Urgent Care centers, Dental clinics, and Wellness & Longevity facilities.

Your writing style reference (match this quality):
"Expert Workplace Injury Care & Workers' Comp Support at ER of Lufkin" — authoritative, informative, uses real data and credible sources, includes actionable advice, and provides genuine value to healthcare administrators and marketing professionals.

CRITICAL RULES:
1. Write EXACTLY 900-1000 words of body content.
2. Output clean HTML only. No markdown. No \`\`\` code blocks.
3. Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
4. Do NOT wrap the entire output in any container tag. Start directly with the first <h2> or <p>.
5. The focus keyword is "${seo.focusKeyword}". Use it in:
   - At least TWO headings (H2 or H3)
   - Naturally throughout the body text (aim for 1-1.5% keyword density)
   - The opening paragraph
   - The closing paragraph
6. Include ONE internal link and ONE external link. Place them NATURALLY where the text is most relevant — DO NOT put all links in the first paragraph.
7. Cite real statistics or facts from credible healthcare sources.
8. Write with authority and expertise. Use real-world examples.
9. Include a clear call-to-action in the final section.
10. Structure: Introduction → 3-4 main sections with H2 headings → Conclusion with CTA.`,
    prompt: `Write a complete blog post about: "${seo.blogTitle}"

Focus Keyword: "${seo.focusKeyword}"

INTERNAL LINKS (use exactly 1, place naturally in the body where relevant):
${internalLinks.map((l) => `- <a href="${SITE_URL}${l.url}">${l.label}</a> — use when discussing ${l.label}`).join('\n')}

EXTERNAL LINKS (use exactly 1, place naturally in the body where relevant):
${externalLinks.map((l) => `- <a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a> — cite when referencing data or authority`).join('\n')}

Write 900-1000 words. Output clean HTML only. Start with the first <p> tag (the introduction). Include H2 and H3 headings throughout.`,
    temperature: 0.75,
  });

  // Clean up the content
  let cleanedContent = htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  // ── STEP 3: Generate the cover image ────────────────────────────────
  const imageUrl = await generateBlogImage(seo.focusKeyword, seo.blogTitle);

  // If we have an image, prepend it as a figure at the top of the content
  if (imageUrl) {
    const imageHtml = `<figure style="margin: 0 0 2rem 0;"><img src="${imageUrl}" alt="${seo.focusKeyword} - ${seo.blogTitle}" style="width: 100%; height: auto; border-radius: 12px;" /><figcaption style="text-align: center; font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">${seo.blogTitle}</figcaption></figure>`;
    cleanedContent = imageHtml + cleanedContent;
  }

  // ── STEP 4: Generate excerpt ────────────────────────────────────────
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
    topic,
  };
}

// ── POST: Generate a blog post (manual trigger or cron) ─────────────
export async function POST(request: Request) {
  try {
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
