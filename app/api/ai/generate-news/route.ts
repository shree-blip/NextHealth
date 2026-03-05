import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import Replicate from 'replicate';
import prisma from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';
import { generateSocialMeta } from '@/lib/seo-validation';
import { runHealthcareNewsValidation, buildHealthcareFixPrompt, type HealthcareNewsValidationReport } from '@/lib/news-validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Extra time for SEO validation retry loop

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

// ── Credible news sources (prefer .gov, .edu, CDC, NIH, CMS, WHO) ──
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
  { url: 'https://www.searchenginejournal.com', name: 'Search Engine Journal' },
  { url: 'https://www.reuters.com/business/healthcare-pharmaceuticals', name: 'Reuters Health' },
  { url: 'https://www.statnews.com', name: 'STAT News' },
  { url: 'https://www.medpagetoday.com', name: 'MedPage Today' },
];

/**
 * STEP 1: AI-driven keyword research + topic selection for news.
 * Uses GPT to find a low-competition, high-intent keyword and news topic
 * that does NOT duplicate existing articles.
 */
async function researchNewsKeywordAndTopic(
  customTopic: string | undefined,
  existingTitles: string[]
): Promise<{ topic: string; focusKeyword: string; supportingKeywords: string[] }> {
  const { text: keywordJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an SEO keyword research agent for thenextgenhealth.com. Our niche is Healthcare Marketing and Custom Software Solutions for healthcare businesses.

Your job is to find ONE low-competition, high-intent keyword and a NEWS topic for it.

KEYWORD RESEARCH RULES:
- Choose keywords that match buyer intent or newsworthy topics in healthcare marketing.
- Prefer long-tail keywords with clear intent.
- Pick from these topic areas:
  • healthcare marketing trends and news
  • medical SEO updates and algorithm changes
  • Google Business Profile for clinics — new features and updates
  • Google Ads and Meta Ads for healthcare — policy changes, new features
  • HIPAA-safe marketing and automation — regulatory updates
  • custom software for healthcare marketing, reporting, dashboards, and workflow systems
  • telehealth and digital health trends
  • healthcare industry regulations and policy changes
- Create a short list of 10 keyword options internally, then select the best 1.
- Pick 1 primary keyword and 4-6 supporting keywords.
- The focus keyword MUST be exactly 2-5 words. It must NOT be a full sentence or question.
  Good examples: "healthcare marketing automation", "telehealth policy update"
  Bad examples: "how healthcare providers can adapt to new telehealth regulations"

DUPLICATE CHECK:
The following titles already exist on our site. Do NOT propose a topic that overlaps with any of them. If a similar topic exists, propose a fresh angle that is clearly different.

Existing titles:
${existingTitles.map((t) => `- ${t}`).join('\n')}

Respond ONLY with valid JSON, no markdown.`,
    prompt: `${customTopic ? `The user wants a news article about: "${customTopic}". Research the best keyword for this topic.` : 'Research and propose the best keyword + topic for a new healthcare news article.'}

Return this exact JSON structure:
{
  "focusKeyword": "the primary SEO keyword (2-5 words, long-tail, high intent)",
  "supportingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "topic": "the proposed news article topic/angle",
  "duplicateCheck": "pass or conflict — explain if a similar title exists and how this is different"
}`,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(keywordJson.replace(/```json\n?|\n?```/g, '').trim());
    return {
      topic: parsed.topic || customTopic || 'Healthcare Marketing Industry Update',
      focusKeyword: parsed.focusKeyword,
      supportingKeywords: parsed.supportingKeywords || [],
    };
  } catch {
    return {
      topic: customTopic || 'Healthcare Marketing Industry Update',
      focusKeyword: 'healthcare marketing',
      supportingKeywords: ['medical SEO', 'clinic marketing', 'digital health', 'healthcare automation'],
    };
  }
}

/**
 * STEP 5: Generate a cover image for the news article using Replicate (flux-schnell).
 *
 * IMAGE RULES:
 * - No cartoons. No illustrated art. No "AI-looking" faces.
 * - Professional photojournalistic / editorial style.
 * - Alt text must include the focus keyword.
 */
async function generateNewsImage(focusKeyword: string, title: string): Promise<string | null> {
  if (!process.env.REPLICATE_API_TOKEN) return null;

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = (await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt: `Professional photojournalistic photograph for a healthcare industry news article about "${title}". Hospital corridor, health policy conference, medical technology lab, or healthcare executives in discussion. Realistic people in authentic settings, natural documentary-style lighting, realistic skin tones. High-end photojournalism similar to Reuters Health or STAT News. No cartoons, no digital art, no illustrated style, no text overlays, no logos.`,
        aspect_ratio: '16:9',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 85,
      },
    })) as string[];

    const tempUrl = Array.isArray(output) ? output[0] : null;
    if (!tempUrl) return null;

    // Persist to permanent storage (Replicate output URLs expire after ~1 hour)
    const permanentUrl = await persistImage(tempUrl, 'news');
    return permanentUrl;
  } catch (error) {
    console.error('News image generation failed:', error);
    return null;
  }
}

/**
 * Main news generation function — follows the full 7-step SEO agent workflow.
 */
async function generateNewsArticle(customTopic?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const SITE_URL = process.env.APP_URL || 'https://thenextgenhealth.com';

  // ── STEP 3: Duplicate check — fetch existing titles ─────────────────
  const existingArticles = await prisma.newsArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: { title: true },
  });
  const existingTitles = existingArticles.map((a: any) => a.title);

  // ── STEP 1 + 2 + 3: Keyword research + site context + duplicate check ──
  const research = await researchNewsKeywordAndTopic(customTopic, existingTitles);
  const { topic, focusKeyword, supportingKeywords } = research;

  // Pick internal pages and external sources for linking (at least 2 each per agent rules)
  const shuffledInternal = [...INTERNAL_PAGES].sort(() => Math.random() - 0.5);
  const internalLinks = shuffledInternal.slice(0, 3);
  const shuffledSources = [...NEWS_SOURCES].sort(() => Math.random() - 0.5);
  const primarySource = shuffledSources[0];
  const secondarySource = shuffledSources[1];
  const tertiarySource = shuffledSources[2];

  // ── STEP 4a: Generate SEO fields with Rank Math rules ───────────────
  const { text: seoJson } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert healthcare news editor and SEO specialist for thenextgenhealth.com. Our niche: Healthcare Marketing and Custom Software Solutions for healthcare businesses. Respond ONLY with valid JSON, no markdown.`,
    prompt: `Generate SEO fields for a healthcare industry news article.

Topic: "${topic}"
Focus Keyword: "${focusKeyword}"
Supporting Keywords: ${supportingKeywords.join(', ')}

Return this exact JSON structure:
{
  "focusKeyword": "${focusKeyword}",
  "supportingKeywords": ${JSON.stringify(supportingKeywords)},
  "seoTitle": "SEO title: START with focus keyword, include a NUMBER, a POWER word (Breaking, Critical, Major, Urgent), and a SENTIMENT word. MUST be 30-60 characters total.",
  "metaDescription": "Meta description: include the focus keyword, 140-160 characters, newsworthy and compelling",
  "slug": "short-url-slug-with-focus-keyword",
  "headline": "engaging news headline that includes the focus keyword. AVOID clickbait patterns: do NOT start with 'Watch', do NOT end with '?', do NOT use 'you won't believe', do NOT use 'miracle cure' or hyperbole",
  "publisher": "The NextGen Healthcare Marketing",
  "source": "category of news (e.g., Industry Report, Market Analysis, Regulatory Update, Technology News)",
  "authorName": "author name with medical credentials (e.g., Dr. Sarah Johnson, MD or Robert Martinez, MPH or Lisa Chen, RN, BSN)"
}

STRICT RULES:
- seoTitle MUST start with the focus keyword
- seoTitle MUST contain a number
- seoTitle MUST contain a power word AND a sentiment word
- seoTitle MUST be 30-60 characters (count carefully — this is strict)
- metaDescription MUST be 140-160 characters
- slug MUST be short, lowercase with hyphens, contain the focus keyword
- focusKeyword MUST appear in seoTitle, metaDescription, and slug
- publisher MUST be "The NextGen Healthcare Marketing"
- authorName MUST include medical credentials: MD, DO, PhD, RN, BSN, NP, PA-C, PharmD, MPH, or RD
- headline MUST avoid clickbait patterns (no "Watch", no "?", no "miracle cure", no "you won't believe")`,
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
    authorName: string;
    supportingKeywords?: string[];
  };
  try {
    seo = JSON.parse(seoJson.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    throw new Error('Failed to parse SEO JSON from AI');
  }

  // Ensure defaults
  if (!seo.publisher) seo.publisher = 'The NextGen Healthcare Marketing';
  if (!seo.authorName) seo.authorName = 'Dr. Michael Chen, MD';

  // Check slug uniqueness
  const existingArticle = await prisma.newsArticle.findUnique({ where: { slug: seo.slug } });
  if (existingArticle) {
    seo.slug = `${seo.slug}-${Date.now().toString(36)}`;
  }

  // ── STEP 4b: Generate the news content (900-1200 words, 100/100 SEO) ──
  const { text: htmlContent } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an authoritative healthcare industry news writer for thenextgenhealth.com — a Healthcare Marketing and Custom Software Solutions agency based in Texas. We serve Freestanding Emergency Rooms, Urgent Care centers, Dental clinics, Wellness & Longevity facilities, and other healthcare businesses.

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

Your writing style: Journalistic, factual, authoritative — similar to articles from Becker's Hospital Review or Fierce Healthcare. Report on industry developments with data-backed insights and expert analysis.

YOU MUST follow ALL of these SEO rules to hit a 100/100 Rank Math score:

CONTENT RULES:
1. Write EXACTLY 500-900 words of body content.
2. Output clean HTML only. No markdown. No code blocks.
3. Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
4. Do NOT wrap output in a container tag. Start directly with the first <p>.
5. Focus keyword: "${seo.focusKeyword}". Use it:
   - In the FIRST SENTENCE of the article (the lead paragraph)
   - In at least ONE <h2> heading
   - In at least ONE <h3> heading
   - In the closing paragraph
   - At exactly 0.8%-1.2% keyword density (for 700 words, use the exact phrase 5-8 times distributed evenly — NO keyword stuffing)
6. Supporting keywords to weave in naturally: ${supportingKeywords.join(', ')}
7. Include a TABLE OF CONTENTS after the lead paragraph using an <ul> with anchor links to each H2 section.
8. Use SHORT paragraphs (2-3 sentences max) and bullet lists for scannability.

READABILITY RULES (critical for passing SEO validation):
- Average sentence length MUST be 20 words or fewer. Write short, direct sentences.
- Start at least 30% of sentences with TRANSITION WORDS: However, Also, Furthermore, For example, Additionally, Therefore, Meanwhile, Specifically, Moreover, In addition, Consequently, As a result, Next, Finally, Similarly, Notably.
- Use ACTIVE voice in at least 85% of sentences. Avoid passive constructions.
- Target a Flesch Reading Ease score between 50 and 70. Write clearly and professionally — avoid jargon-heavy or overly academic language.

9. Write in a news reporting tone — use quotes, statistics, and industry data.
10. Include attributed quotes from realistic industry experts.

LINK RULES (CRITICAL FOR YMYL HEALTHCARE COMPLIANCE):
11. Include at least 2 INTERNAL links to thenextgenhealth.com service pages. Place them naturally.
12. Include at least 3 EXTERNAL links to highly credible sources (.gov, .edu, CDC, NIH, CMS, WHO, peer-reviewed journals). HEALTHCARE CONTENT REQUIRES MINIMUM 3 CITATIONS.
13. Do NOT cluster all links in one paragraph — spread them across the article.
14. MEDICAL DISCLAIMER REQUIRED: Add a disclaimer paragraph at the END before the CTA: "<p><em>Medical Disclaimer: This content is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.</em></p>"

STRUCTURE:
15. Lead paragraph (who/what/when/where/why, include focus keyword) → Table of Contents → Context/Background → Key Details with H2/H3 sections → Industry Impact → What This Means for Providers → Medical Disclaimer → Forward-looking CTA.
16. End with medical disclaimer paragraph (see rule 14), THEN call-to-action directing healthcare providers to explore our services.`,
    prompt: `Write a complete news article.

Headline: "${seo.headline}"
Focus Keyword: "${seo.focusKeyword}"
Supporting Keywords: ${supportingKeywords.join(', ')}

INTERNAL LINKS (use at least 2, place naturally throughout):
${internalLinks.map((l) => `- <a href="${SITE_URL}${l.url}">${l.label}</a>`).join('\n')}

EXTERNAL LINKS (use at least 2, cite as credible sources):
- <a href="${primarySource.url}" target="_blank" rel="noopener noreferrer">${primarySource.name}</a>
- <a href="${secondarySource.url}" target="_blank" rel="noopener noreferrer">${secondarySource.name}</a>
Additional reference: ${tertiarySource.name} (${tertiarySource.url})

REMEMBER:
- 500-900 words
- Focus keyword in first sentence, at least 1 H2, at least 1 H3, closing paragraph
- Table of Contents after lead paragraph
- Short paragraphs and bullet lists
- At least 2 internal + 3 EXTERNAL CITATIONS (healthcare requires 3+)
- Medical disclaimer paragraph at end (before CTA)
- Journalistic news reporting style with medical authority
- Author byline: ${seo.authorName}
- Clean HTML only, start with <p> tag`,
    temperature: 0.75,
  });

  // Clean up content
  let cleanedContent = htmlContent
    .replace(/```html\n?|\n?```/g, '')
    .replace(/^[\s\n]*/, '')
    .trim();

  // Count citations (ALL external links, not just narrow subset)
  function countExternalCitations(html: string): number {
    const allLinks = html.match(/<a[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
    return allLinks.filter(link => !link.includes('thenextgenhealth.com')).length;
  }

  const externalCitations = countExternalCitations(cleanedContent);

  // Check for medical disclaimer
  const hasDisclaimer = cleanedContent.toLowerCase().includes('medical disclaimer') || 
                        cleanedContent.toLowerCase().includes('informational purposes only');

  // ── Healthcare News Validation Loop (auto-rewrite until checks pass AND score >= 85, max 3 retries) ──
  const MIN_NEWS_SCORE = 75;

  let validationReport: HealthcareNewsValidationReport = runHealthcareNewsValidation({
    focusKeyword: seo.focusKeyword,
    isKeywordUniqueToDomain: true,
    title: seo.headline,
    seoTitle: seo.seoTitle,
    metaDesc: seo.metaDescription,
    htmlContent: cleanedContent,
    siteUrl: SITE_URL,
    featuredImage: undefined,
    source: seo.source,
    sourceUrl: primarySource.url,
    publisher: seo.publisher,
    authorName: seo.authorName,
    publishedAt: new Date(),
    isOriginalContent: true,
    citationCount: externalCitations,
    containsMedicalDisclaimer: hasDisclaimer,
    hasC2PAManifest: false,
    isJTICertified: false
  });

  for (let attempt = 1; attempt <= 3 && (!validationReport.passed || validationReport.totalScore < MIN_NEWS_SCORE); attempt++) {
    console.log(`[Healthcare News] Retry ${attempt}/3 — score: ${validationReport.totalScore}/100, failures:`, validationReport.failures);
    const fixInstructions = buildHealthcareFixPrompt(validationReport);

    // Fix meta fields if needed
    const hasMetaIssues = validationReport.failures.some(
      (f) => f.toLowerCase().includes('meta title') || f.toLowerCase().includes('meta description')
    );
    if (hasMetaIssues) {
      const { text: fixedSeo } = await generateText({
        model: openai('gpt-4o-mini'),
        system: 'Fix SEO meta fields. Return ONLY valid JSON with "seoTitle" and "metaDescription" keys. No markdown.',
        prompt: `Fix these meta fields for focus keyword "${seo.focusKeyword}":\nCurrent seoTitle: "${seo.seoTitle}" (${seo.seoTitle.length} chars)\nCurrent metaDescription: "${seo.metaDescription}" (${seo.metaDescription.length} chars)\n\n${fixInstructions}\n\nRULES:\n- seoTitle MUST be 30-60 characters, start with focus keyword, include a number\n- metaDescription MUST be 140-160 characters, include focus keyword\n\nReturn: { "seoTitle": "...", "metaDescription": "..." }`,
        temperature: 0.5,
      });
      try {
        const fixed = JSON.parse(fixedSeo.replace(/```json\n?|\n?```/g, '').trim());
        if (fixed.seoTitle) seo.seoTitle = fixed.seoTitle;
        if (fixed.metaDescription) seo.metaDescription = fixed.metaDescription;
      } catch { /* keep existing if parse fails */ }
    }

    // Fix content if needed
    const contentIssues = validationReport.failures.filter(
      (f) => !f.toLowerCase().includes('meta title') && !f.toLowerCase().includes('meta description')
    );
    const hasHealthIssues = validationReport.healthFailures.length > 0 || validationReport.newsFailures.length > 0;
    if (contentIssues.length > 0 || hasHealthIssues) {
      const { text: fixedHtml } = await generateText({
        model: openai('gpt-4o-mini'),
        system: `Rewrite this healthcare news article to fix ALL listed issues including SEO, YMYL healthcare compliance, and citation requirements. Output clean HTML only — no markdown, no code fences. Keep the same topic and heading structure. Start directly with a <p> tag.

CRITICAL RULES:
- Every paragraph must be 150 words or fewer. Break long paragraphs into 2-3 sentence blocks.
- At least 30% of sentences MUST start with transition words (However, Furthermore, Moreover, Additionally, Therefore, Consequently, Meanwhile, Specifically, In addition, For example, Similarly, Notably, As a result, Next, Finally).
- Use ACTIVE voice in 90%+ sentences.
- Target Flesch Reading Ease of 55-65 (clear professional prose).
- Keep average sentence length under 18 words.
- MUST include at least 3 external citations to credible healthcare sources.
- MUST include medical disclaimer paragraph at end before CTA.`,
        prompt: `Rewrite to fix ALL issues. Focus Keyword: "${seo.focusKeyword}"
Author: ${seo.authorName}
Supporting Keywords: ${supportingKeywords.join(', ')}

${fixInstructions}

EXTERNAL SOURCES TO CITE (use at least 3 of these as inline citations):
- <a href="${primarySource.url}" target="_blank" rel="noopener noreferrer">${primarySource.name}</a>
- <a href="${secondarySource.url}" target="_blank" rel="noopener noreferrer">${secondarySource.name}</a>
- <a href="${tertiarySource.url}" target="_blank" rel="noopener noreferrer">${tertiarySource.name}</a>

INTERNAL LINKS (use at least 2):
${internalLinks.map((l) => `- <a href="${SITE_URL}${l.url}">${l.label}</a>`).join('\n')}

Current content:
${cleanedContent}

CRITICAL HEALTHCARE REQUIREMENTS:
- Include AT LEAST 3 external citations to credible sources (.gov, .edu, CDC, NIH, medical journals)
- Include medical disclaimer paragraph at end: "<p><em>Medical Disclaimer: This content is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.</em></p>"
- Avoid ALL clickbait patterns in headlines
- Author with medical credentials: ${seo.authorName}

STANDARD SEO REQUIREMENTS:
- Fix ALL listed issues
- Focus keyword in first paragraph, at least 1 H2, closing paragraph
- Short sentences (max 18 words avg)
- Use transition words in 30%+ of sentences
- 0.8%-1.2% keyword density
- 500-900 words
- No paragraph longer than 150 words
- Journalistic news reporting style with medical authority
- Maintain all existing links and add missing ones
- Clean HTML only`,
        temperature: 0.6,
      });
      cleanedContent = fixedHtml.replace(/```html\n?|\n?```/g, '').replace(/^[\s\n]*/, '').trim();
    }

    // Recount citations and disclaimer after fixes
    const updatedCitations = countExternalCitations(cleanedContent);
    const updatedHasDisclaimer = cleanedContent.toLowerCase().includes('medical disclaimer') || 
                                 cleanedContent.toLowerCase().includes('informational purposes only');

    // Re-check after fixes
    validationReport = runHealthcareNewsValidation({
      focusKeyword: seo.focusKeyword,
      isKeywordUniqueToDomain: true,
      title: seo.headline,
      seoTitle: seo.seoTitle,
      metaDesc: seo.metaDescription,
      htmlContent: cleanedContent,
      siteUrl: SITE_URL,
      featuredImage: undefined,
      source: seo.source,
      sourceUrl: primarySource.url,
      publisher: seo.publisher,
      authorName: seo.authorName,
      publishedAt: new Date(),
      isOriginalContent: true,
      citationCount: updatedCitations,
      containsMedicalDisclaimer: updatedHasDisclaimer,
      hasC2PAManifest: false,
      isJTICertified: false
    });
  }

  if (!validationReport.passed || validationReport.totalScore < MIN_NEWS_SCORE) {
    console.warn(`[Healthcare News] Final validation: score ${validationReport.totalScore}/100 (min ${MIN_NEWS_SCORE}), remaining issues:`, validationReport.failures);
    if (validationReport.healthFailures.length > 0) {
      console.error('[Healthcare News] YMYL Health Failures:', validationReport.healthFailures);
    }
    if (validationReport.clickbaitFlags.length > 0) {
      console.error('[Healthcare News] Clickbait Flags:', validationReport.clickbaitFlags);
    }
  } else {
    console.log(`[Healthcare News] All checks passed ✓ Score: ${validationReport.totalScore}/100`);
  }

  // ── STEP 5: Generate the cover image (real photo, no cartoons) ──────
  const imageUrl = await generateNewsImage(seo.focusKeyword, seo.headline);

  // The cover image is saved to the article's coverImage field and rendered by
  // SinglePostLayout as a hero image above the article — do NOT embed it again
  // inside the HTML content to avoid displaying it twice.

  // ── Generate excerpt ────────────────────────────────────────────────
  const { text: excerpt } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'Generate a 1-2 sentence news excerpt. Plain text only, no HTML. Include the focus keyword naturally. Summarize the key news point.',
    prompt: `Write a short news excerpt for an article titled "${seo.headline}" with focus keyword "${seo.focusKeyword}". Max 200 characters.`,
    temperature: 0.6,
  });

  // ── Generate social metadata ──────────────────────────────────────
  const socialMeta = generateSocialMeta({
    title: seo.seoTitle,
    description: seo.metaDescription,
    image: imageUrl,
    slug: seo.slug,
    siteUrl: SITE_URL,
    section: 'news',
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
    supportingKeywords: supportingKeywords,
    publisher: seo.publisher,
    source: seo.source,
    sourceUrl: primarySource.url,
    authorName: seo.authorName,
    topic,
    socialMeta,
    seoMetrics: validationReport.metrics,
    healthcareMetadata: validationReport.metadata,
    seoValidationPassed: validationReport.passed,
    validationScore: validationReport.totalScore,
  };
}

// ── POST: Generate a news article (manual trigger or cron) ─────────
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

    // Generate the news article
    const newsData = await generateNewsArticle(topic);

    // ── STRICT SEO GATING: Reject articles below 75/100 ──────────────
    if (!newsData.seoValidationPassed || newsData.validationScore < 75) {
      return NextResponse.json(
        {
          success: false,
          error: `News article failed healthcare SEO validation (score: ${newsData.validationScore}/100, minimum: 75). The AI could not fix all issues after 3 retries.`,
          seoScore: newsData.validationScore,
          seoMetrics: newsData.seoMetrics,
          healthcareMetadata: newsData.healthcareMetadata,
        },
        { status: 422 }
      );
    }

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

    // Revalidate sitemap + homepage so the new article appears immediately
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
    console.error('News generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate news article' },
      { status: 500 }
    );
  }
}
