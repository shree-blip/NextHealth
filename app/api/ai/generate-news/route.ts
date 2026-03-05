import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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
  { url: '/news', label: 'healthcare marketing news' },
];

// ── Healthcare news topic pool ──────────────────────────────────────
const NEWS_TOPIC_POOL = [
  'CMS Announces New Telehealth Reimbursement Rules for 2026',
  'Google Updates Local Search Algorithm: Impact on Healthcare Providers',
  'AMA Report: Digital Marketing Now Essential for Patient Acquisition',
  'HIPAA Compliance Updates for Healthcare Websites in 2026',
  'Rise of AI-Powered Patient Engagement Tools in Emergency Rooms',
  'New Study Shows 80% of Patients Choose Providers Based on Online Presence',
  'Meta Introduces Healthcare-Specific Ad Targeting Options',
  'Urgent Care Industry Sees Record Growth in Suburban Markets',
  'HHS Releases New Guidelines for Healthcare Digital Advertising',
  'Google Business Profile Adds New Healthcare Features for Clinics',
  'Dental Industry Trends: How Digital Marketing is Transforming Patient Outreach',
  'Emergency Room Marketing Spend Increases 35% Year-Over-Year',
  'FDA Relaxes Social Media Guidelines for Healthcare Providers',
  'Telemedicine Marketing: Best Practices Emerging from Latest Research',
  'Healthcare Cybersecurity Alert: New Threats Targeting Patient Portals',
  'Medicare Advantage Plans Drive New Marketing Opportunities for ERs',
  'Voice Search Optimization Becomes Critical for Healthcare SEO',
  'Healthcare Review Sites See Surge in Patient Reviews Post-Pandemic',
  'New FTC Rules Affect Healthcare Testimonial Marketing',
  'Healthcare Workforce Shortage Creates Marketing Challenges for Clinics',
  'Patient Experience Technology: The New Frontier in Healthcare Marketing',
  'Rural Healthcare Marketing: Strategies for Reaching Underserved Communities',
  'Healthcare Data Analytics: How Clinics Are Using Data to Drive Growth',
  'Insurance Companies Partner with ERs for Direct Marketing Campaigns',
  'Wellness Industry Boom: Marketing Strategies for Longevity Clinics',
  'Healthcare Email Marketing Benchmarks for 2026',
  'Browser Privacy Changes Impact Healthcare Retargeting Campaigns',
  'Medical Practice Acquisitions Drive Need for Rebranding Strategies',
  'Healthcare Influencer Marketing: Ethical Guidelines and Best Practices',
  'New ADA Website Accessibility Requirements for Healthcare Providers',
];

// ── Credible news sources ──────────────────────────────────────────
const NEWS_SOURCES = [
  { url: 'https://www.beckershospitalreview.com', name: "Becker's Hospital Review" },
  { url: 'https://www.fiercehealthcare.com', name: 'Fierce Healthcare' },
  { url: 'https://www.healthcareitnews.com', name: 'Healthcare IT News' },
  { url: 'https://www.modernhealthcare.com', name: 'Modern Healthcare' },
  { url: 'https://www.healthaffairs.org', name: 'Health Affairs' },
  { url: 'https://www.cms.gov', name: 'CMS.gov' },
  { url: 'https://www.hhs.gov', name: 'HHS.gov' },
  { url: 'https://www.ama-assn.org', name: 'American Medical Association' },
  { url: 'https://www.advisory.com', name: 'Advisory Board' },
  { url: 'https://www.healthcarefinancenews.com', name: 'Healthcare Finance News' },
  { url: 'https://searchengineland.com', name: 'Search Engine Land' },
  { url: 'https://www.searchenginejournal.com', name: 'Search Engine Journal' },
  { url: 'https://www.reuters.com/business/healthcare-pharmaceuticals', name: 'Reuters Health' },
  { url: 'https://www.statnews.com', name: 'STAT News' },
  { url: 'https://www.medpagetoday.com', name: 'MedPage Today' },
];

/**
 * Pick a news topic that hasn't been used recently.
 */
async function pickNewsTopic(): Promise<string> {
  const recentArticles = await prisma.newsArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: { title: true },
  });
  const recentTitles = recentArticles.map((a: any) => a.title.toLowerCase());

  const unused = NEWS_TOPIC_POOL.filter((topic) => {
    const topicWords = topic.toLowerCase().split(/\s+/);
    return !recentTitles.some((title: string) => {
      const matchCount = topicWords.filter((w) => w.length > 4 && title.includes(w)).length;
      return matchCount >= 3;
    });
  });

  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return NEWS_TOPIC_POOL[Math.floor(Math.random() * NEWS_TOPIC_POOL.length)];
}

/**
 * Generate a DALL-E image for the news article
 */
async function generateNewsImage(focusKeyword: string, title: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: `Professional, photorealistic news article header photo for a healthcare industry news story about "${title}". Show a real modern healthcare environment — hospital corridor, medical technology, clinical professionals in discussion, or health policy setting. Natural lighting, realistic, editorial photography style, no cartoon style, no illustrations, no text overlays. High-quality journalistic style image.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('News image generation failed:', error);
    return null;
  }
}

/**
 * Main news generation function
 */
async function generateNewsArticle(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const topic = customTopic || (await pickNewsTopic());

  // Pick random internal pages and a source for linking
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5);
  const internalLinks = shuffledInternal.slice(0, 2);
  const shuffledSources = [...NEWS_SOURCES].sort(() => Math.random() - 0.5);
  const primarySource = shuffledSources[0];
  const secondarySource = shuffledSources[1];

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // ── STEP 1: Generate SEO fields ─────────────────────────────────────
  const { text: seoJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert healthcare news editor and SEO specialist. You work for The NextGen Healthcare Marketing, a Texas-based agency. Respond ONLY with valid JSON, no markdown.`,
    prompt: `Generate SEO fields for a healthcare industry news article about: "${topic}"

Return this exact JSON structure:
{
  "focusKeyword": "the primary SEO keyword (2-4 words, news-oriented)",
  "seoTitle": "SEO-optimized headline including the focus keyword (50-60 chars)",
  "metaDescription": "compelling meta description with the focus keyword (150-160 chars)",
  "slug": "url-friendly-slug-with-focus-keyword",
  "headline": "engaging news headline (may differ slightly from SEO title)",
  "publisher": "name of the simulated credible source publication",
  "source": "category of the news source (e.g., Industry Report, Government Agency, Research Study)"
}

Requirements:
- The focus keyword must appear in seoTitle, metaDescription, and slug.
- The slug should be lowercase with hyphens, no special characters.
- publisher should be "The NextGen Healthcare Marketing".
- source should describe the type of news (e.g., "Industry Report", "Market Analysis", "Regulatory Update", "Technology News").
- Make the headline authoritative and newsworthy.`,
    temperature: 0.7,
  });

  let seo: {
    focusKeyword: string;
    seoTitle: string;
    metaDescription: string;
    slug: string;
    headline: string;
    publisher: string;
    source: string;
  };
  try {
    seo = JSON.parse(seoJson.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    throw new Error('Failed to parse SEO JSON from AI');
  }

  // Ensure publisher default
  if (!seo.publisher) seo.publisher = 'The NextGen Healthcare Marketing';

  // Check slug uniqueness
  const existingArticle = await prisma.newsArticle.findUnique({ where: { slug: seo.slug } });
  if (existingArticle) {
    seo.slug = `${seo.slug}-${Date.now().toString(36)}`;
  }

  // ── STEP 2: Generate the news article content ───────────────────────
  const { text: htmlContent } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an authoritative healthcare industry news writer for The NextGen Healthcare Marketing (${SITE_URL}), a Texas-based agency specializing in marketing for Freestanding Emergency Rooms, Urgent Care centers, Dental clinics, and Wellness & Longevity facilities.

Your writing style: Journalistic, factual, authoritative — similar to articles from Becker's Hospital Review or Fierce Healthcare. Report on industry developments with data-backed insights and expert analysis.

CRITICAL RULES:
1. Write EXACTLY 600-800 words of body content (news articles are shorter than blog posts).
2. Output clean HTML only. No markdown. No \`\`\` code blocks.
3. Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
4. Do NOT wrap the entire output in any container tag. Start directly with the first <p>.
5. The focus keyword is "${seo.focusKeyword}". Use it in:
   - At least ONE heading (H2 or H3)
   - Naturally throughout the body text
   - The opening paragraph
6. Include ONE internal link and ONE external link. Place them NATURALLY.
7. Write in a news reporting tone — use quotes, statistics, and industry data.
8. Include attributed quotes from fictional but realistic industry experts.
9. Structure: Lead paragraph (who/what/when/where/why) → Context/Background → Key Details → Industry Impact → What This Means for Providers.
10. End with a forward-looking statement or call-to-action for healthcare providers.`,
    prompt: `Write a complete news article about: "${seo.headline}"

Focus Keyword: "${seo.focusKeyword}"

INTERNAL LINKS (use exactly 1, place naturally):
${internalLinks.map((l) => `- <a href="${SITE_URL}${l.url}">${l.label}</a>`).join('\n')}

EXTERNAL LINKS (use exactly 1, cite as a source):
- <a href="${primarySource.url}" target="_blank" rel="noopener noreferrer">${primarySource.name}</a>

Additional reference: ${secondarySource.name} (${secondarySource.url})

Write 600-800 words. Output clean HTML only. Start with the lead paragraph <p> tag. Use a journalistic news reporting style.`,
    temperature: 0.75,
  });

  // Clean up content
  let cleanedContent = htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  // ── STEP 3: Generate the cover image ────────────────────────────────
  const imageUrl = await generateNewsImage(seo.focusKeyword, seo.headline);

  // If we have an image, prepend it
  if (imageUrl) {
    const imageHtml = `<figure style="margin: 0 0 2rem 0;"><img src="${imageUrl}" alt="${seo.focusKeyword} - ${seo.headline}" style="width: 100%; height: auto; border-radius: 12px;" /><figcaption style="text-align: center; font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">${seo.headline}</figcaption></figure>`;
    cleanedContent = imageHtml + cleanedContent;
  }

  // ── STEP 4: Generate excerpt ────────────────────────────────────────
  const { text: excerpt } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'Generate a 1-2 sentence news excerpt. Plain text only, no HTML. Summarize the key news point.',
    prompt: `Write a short news excerpt for an article titled "${seo.headline}" with focus keyword "${seo.focusKeyword}". Max 200 characters.`,
    temperature: 0.6,
  });

  return {
    title: seo.headline,
    slug: seo.slug,
    excerpt: excerpt.trim().substring(0, 250),
    content: cleanedContent,
    coverImage: imageUrl,
    coverImageAlt: `${seo.focusKeyword} - ${seo.headline}`,
    seoTitle: seo.seoTitle,
    metaDesc: seo.metaDescription,
    focusKeyword: seo.focusKeyword,
    publisher: seo.publisher,
    source: seo.source,
    sourceUrl: primarySource.url,
    topic,
  };
}

// ── POST: Generate a news article (manual trigger or cron) ─────────
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, autoPublish = false } = body as { topic?: string; autoPublish?: boolean };

    // Generate the news article
    const newsData = await generateNewsArticle(topic);

    // Save to database
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

    // Save generation metadata to AiHistory
    try {
      await (prisma as any).aiHistory.create({
        data: {
          userId: 'auto-news-system',
          generatorType: 'news',
          prompt: newsData.topic,
          settings: {
            focusKeyword: newsData.focusKeyword,
            seoTitle: newsData.seoTitle,
            metaDesc: newsData.metaDesc,
            publisher: newsData.publisher,
            source: newsData.source,
            autoPublish,
          },
          output: `Article ID: ${article.id} | Slug: ${article.slug}`,
        },
      });
    } catch (historyError) {
      console.error('Failed to save AI history (non-critical):', historyError);
    }

    return NextResponse.json({
      success: true,
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
      },
    });
  } catch (error) {
    console.error('News generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate news article' },
      { status: 500 }
    );
  }
}
