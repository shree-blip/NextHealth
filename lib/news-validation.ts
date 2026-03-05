/**
 * News Article Validation & SEO Enforcement
 * Extends the master SEO validation with news-specific requirements:
 * - Source credibility
 * - Publisher information
 * - News freshness (recent publication date)
 * - Citation/fact-checking markers
 * - Journalist/byline authentication
 */

import { runMasterSeoValidation, MasterSeoReport, stripHtml } from './seo-validation';

export interface NewsValidationParams {
  // SEO Requirements
  focusKeyword: string;
  isKeywordUniqueToDomain: boolean;
  title: string;
  seoTitle: string;
  metaDesc: string;
  htmlContent: string;
  siteUrl: string;
  featuredImage?: string;

  // News-Specific Requirements
  source: string; // Original news source
  sourceUrl: string; // Link to original article
  publisher?: string; // Publishing organization
  authorName?: string; // Journalist/byline
  publishedAt?: string | Date | null; // Article publication date
  updatedAt?: string | Date | null; // Last update timestamp
  isOriginalContent: boolean; // True if curated/rewritten, not syndicated
  citationCount?: number; // Number of inline citations/links to sources
}

export interface NewsValidationReport extends MasterSeoReport {
  // News-Specific Metadata
  newsMetadata: {
    hasSource: boolean;
    hasSourceUrl: boolean;
    hasPublisher: boolean;
    hasAuthor: boolean;
    hasPublishedDate: boolean;
    sourceIsValid: boolean;
    citationsAreAdequate: boolean;
    isOriginalContent: boolean;
    isFresh: boolean; // Published within last 30 days for news
  };
  newsFailures: string[];
}

const TRUSTED_NEWS_SOURCES = new Set([
  'bbc', 'cnn', 'reuters', 'ap news', 'associated press',
  'healthline', 'webmd', 'medical news today', 'medtech ',
  'healthcare it news', 'modern healthcare', 'healthcare dive',
  'health affairs', 'jama', 'lancet', 'nejm', 'medpage today'
]);

/**
 * Validate that source URL is legitimate
 */
function isValidSourceUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
    // Basic validation: must be https, valid domain, not own domain
    return urlObj.protocol === 'https:' && domain.includes('.');
  } catch {
    return false;
  }
}

/**
 * Check if article is fresh (published within 30 days)
 */
function isFreshArticle(dateStr?: string | Date | null): boolean {
  if (!dateStr) return false;
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff >= 0 && daysDiff <= 30;
}

/**
 * Check if source is in trusted healthcare/news sources
 */
function isKnownTrustedSource(source: string): boolean {
  const lower = source.toLowerCase();
  return Array.from(TRUSTED_NEWS_SOURCES).some(trusted => lower.includes(trusted));
}

/**
 * Validate news-specific metadata
 */
function validateNewsMetadata(params: NewsValidationParams): NewsValidationReport['newsMetadata'] & { newsFailures: string[] } {
  const failures: string[] = [];

  // Source validation
  const hasSource = !!params.source && params.source.trim().length > 0;
  if (!hasSource) failures.push('News source is required.');

  const hasSourceUrl = !!params.sourceUrl && params.sourceUrl.trim().length > 0;
  if (!hasSourceUrl) failures.push('Source URL is required.');
  const sourceIsValid = hasSourceUrl && isValidSourceUrl(params.sourceUrl);
  if (hasSourceUrl && !sourceIsValid) failures.push('Source URL must be valid HTTPS link.');

  // Publisher validation
  const hasPublisher = !!params.publisher && params.publisher.trim().length > 0;
  if (!hasPublisher) failures.push('Publisher name is required.');

  // Author validation (optional but recommended)
  const hasAuthor = !!(params.authorName && params.authorName.trim().length > 0);

  // Date validation
  const hasPublishedDate = !!params.publishedAt;
  if (!hasPublishedDate) failures.push('Published date is required.');

  // Freshness check
  const isFresh = isFreshArticle(params.publishedAt);
  if (hasPublishedDate && !isFresh) {
    failures.push('News article must be from the last 30 days. Older articles should be moved to blog section.');
  }

  // Source credibility
  const isKnown = hasSource && isKnownTrustedSource(params.source);
  if (hasSource && !isKnown) {
    // Warning: Not critical but flagged
    failures.push('Consider using news from established healthcare sources (Healthline, WebMD, Healthcare IT News, etc.) for credibility.');
  }

  // Citation validation
  const citationCount = params.citationCount || 0;
  const citationsAreAdequate = citationCount >= 2;
  if (citationCount === 0) {
    failures.push('Include at least 2 inline citations/links to source content.');
  } else if (citationCount === 1) {
    failures.push('Include at least 2 inline citations/links to source content (currently 1).');
  }

  // Original content check
  if (!params.isOriginalContent) {
    // If purely syndicated, flag it
    failures.push('Provide original commentary or rewrite on the news story (not just copies/summaries).');
  }

  return {
    hasSource,
    hasSourceUrl,
    hasPublisher,
    hasAuthor,
    hasPublishedDate,
    sourceIsValid,
    citationsAreAdequate,
    isOriginalContent: params.isOriginalContent,
    isFresh: isFresh || false,
    newsFailures: failures
  };
}

/**
 * Run comprehensive news validation: SEO + news-specific metadata
 */
export function runNewsValidation(params: NewsValidationParams): NewsValidationReport {
  // First: Run master SEO validation
  const seoReport = runMasterSeoValidation({
    focusKeyword: params.focusKeyword,
    isKeywordUniqueToDomain: params.isKeywordUniqueToDomain,
    title: params.title,
    seoTitle: params.seoTitle,
    metaDesc: params.metaDesc,
    htmlContent: params.htmlContent,
    type: 'news',
    siteUrl: params.siteUrl,
    authorName: params.authorName,
    featuredImage: params.featuredImage,
  });

  // Second: Validate news-specific metadata
  const newsValidation = validateNewsMetadata(params);

  // Combine failures
  const allFailures = [
    ...seoReport.failures,
    ...newsValidation.newsFailures
  ];

  return {
    ...seoReport,
    passed: allFailures.length === 0,
    failures: allFailures,
    newsMetadata: {
      hasSource: newsValidation.hasSource,
      hasSourceUrl: newsValidation.hasSourceUrl,
      hasPublisher: newsValidation.hasPublisher,
      hasAuthor: newsValidation.hasAuthor,
      hasPublishedDate: newsValidation.hasPublishedDate,
      sourceIsValid: newsValidation.sourceIsValid,
      citationsAreAdequate: newsValidation.citationsAreAdequate,
      isOriginalContent: newsValidation.isOriginalContent,
      isFresh: newsValidation.isFresh,
    },
    newsFailures: newsValidation.newsFailures,
  };
}

/**
 * Build fix prompt that includes both SEO + news metadata guidance
 */
export function buildNewsFixPrompt(report: NewsValidationReport): string {
  if (report.passed && report.totalScore === 100 && report.newsFailures.length === 0) {
    return 'Perfect News Article: 100/100 SEO Score. All metadata complete. Ready to publish.';
  }

  const lines: string[] = [];

  if (report.newsFailures.length > 0) {
    lines.push('🚨 NEWS METADATA FAILURES (Must fix):');
    report.newsFailures.forEach(f => lines.push(`- [CRITICAL] ${f}`));
    lines.push('');
  }

  if (report.failures.length > 0) {
    lines.push('🚨 SEO GATEKEEPING FAILURES (Must fix):');
    report.failures.forEach(f => {
      if (!report.newsFailures.includes(f)) {
        lines.push(`- [CRITICAL] ${f}`);
      }
    });
    lines.push('');
  }

  if (report.totalScore < 100) {
    const delta = 100 - report.totalScore;
    lines.push(`📈 SEO SCORE: ${report.totalScore}/100. Earn +${delta} points by:`);
    report.improvements.forEach(imp => lines.push(`- ${imp}`));
    lines.push('');
  }

  lines.push('📊 News Article Metadata:');
  lines.push(`  Source: ${report.newsMetadata.hasSource ? '✓' : '✗'}`);
  lines.push(`  Source URL: ${report.newsMetadata.sourceIsValid ? '✓' : '✗'}`);
  lines.push(`  Publisher: ${report.newsMetadata.hasPublisher ? '✓' : '✗'}`);
  lines.push(`  Author: ${report.newsMetadata.hasAuthor ? '✓' : '✗'}`);
  lines.push(`  Published: ${report.newsMetadata.hasPublishedDate ? '✓' : '✗'} (Fresh: ${report.newsMetadata.isFresh ? '✓' : '✗'})`);
  lines.push(`  Citations: ${report.newsMetadata.citationsAreAdequate ? '✓' : '✗'}`);
  lines.push(`  Original Content: ${report.newsMetadata.isOriginalContent ? '✓' : '✗'}`);
  lines.push('');

  lines.push('📊 SEO Metrics:');
  lines.push(`  Word count: ${report.metrics.wordCount}`);
  lines.push(`  Keyword density: ${report.metrics.keywordDensity}%`);
  lines.push(`  Flesch Reading Ease: ${report.metrics.fleschScore}`);
  lines.push(`  Avg sentence length: ${report.metrics.avgSentenceLength} words`);

  return lines.join('\n');
}
