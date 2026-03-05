/**
 * Blog Post Validation & SEO Enforcement
 * Extends the master SEO validation with blog-specific requirements:
 * - Author information
 * - Publication date
 * - Category/tags
 * - Internal linking strategy
 * - Keyword clustering across blog series
 */

import { runMasterSeoValidation, MasterSeoReport, stripHtml } from './seo-validation';

export interface BlogValidationParams {
  // SEO Requirements
  focusKeyword: string;
  isKeywordUniqueToDomain: boolean;
  title: string;
  seoTitle: string;
  metaDesc: string;
  htmlContent: string;
  siteUrl: string;
  featuredImage?: string;

  // Blog-Specific Requirements
  authorName: string;
  publishedAt?: string | Date | null;
  category?: string;
  tags?: string[];
  relatedPostSlugs?: string[]; // For internal linking validation
}

export interface BlogValidationReport extends MasterSeoReport {
  // Blog-Specific Metadata
  blogMetadata: {
    hasAuthor: boolean;
    hasPublishedDate: boolean;
    hasCategory: boolean;
    hasMinTags: boolean;
    hasRelatedLinks: boolean;
    categoryIsValid: boolean;
    tagsAreRelevant: boolean;
  };
  blogFailures: string[];
}

const VALID_BLOG_CATEGORIES = [
  'healthcare-marketing',
  'digital-strategy',
  'industry-insights',
  'case-studies',
  'practice-management',
  'patient-engagement',
  'compliance',
  'technology',
  'trends',
  'other'
];

const STOP_WORDS_FOR_TAGS = new Set([
  'a', 'an', 'and', 'the', 'or', 'but', 'in', 'of', 'to', 'for', 'is', 'as', 'with', 'by', 'from'
]);

/**
 * Validate blog metadata (author, date, category, tags)
 */
function validateBlogMetadata(params: BlogValidationParams): BlogValidationReport['blogMetadata'] & { blogFailures: string[] } {
  const failures: string[] = [];
  
  // Author validation
  const hasAuthor = !!params.authorName && params.authorName.trim().length > 0;
  if (!hasAuthor) failures.push('Author name is required for blog posts.');
  
  // Published date validation
  const hasPublishedDate = !!params.publishedAt;
  if (!hasPublishedDate) failures.push('Published date is required.');
  
  // Category validation
  const hasCategory = !!params.category;
  const categoryIsValid = hasCategory && VALID_BLOG_CATEGORIES.includes(params.category!.toLowerCase());
  if (!hasCategory) failures.push('Category is required.');
  if (hasCategory && !categoryIsValid) failures.push(`Invalid category. Must be one of: ${VALID_BLOG_CATEGORIES.join(', ')}`);
  
  // Tags validation
  const hasMinTags = params.tags && params.tags.length >= 3;
  if (!params.tags || params.tags.length === 0) failures.push('At least 3 tags are required.');
  if (params.tags && params.tags.length > 0 && params.tags.length < 3) failures.push(`Minimum 3 tags required (currently ${params.tags.length}).`);
  if (params.tags && params.tags.length > 8) failures.push(`Maximum 8 tags allowed (currently ${params.tags.length}).`);
  
  // Tag relevance check (no single words, no common words)
  let tagsAreRelevant = true;
  if (params.tags && params.tags.length > 0) {
    const invalidTags = params.tags.filter(t => 
      t.length < 3 || STOP_WORDS_FOR_TAGS.has(t.toLowerCase())
    );
    if (invalidTags.length > 0) {
      tagsAreRelevant = false;
      failures.push(`Tags must be 3+ chars and not common words. Invalid: ${invalidTags.join(', ')}`);
    }
  }
  
  // Related links validation (internal linking)
  const hasRelatedLinks = params.relatedPostSlugs && params.relatedPostSlugs.length > 0;
  if (!hasRelatedLinks) failures.push('Link to at least 1 related blog post for internal linking strategy.');
  
  return {
    hasAuthor,
    hasPublishedDate,
    hasCategory,
    hasMinTags: hasMinTags || false,
    hasRelatedLinks: hasRelatedLinks || false,
    categoryIsValid: categoryIsValid || false,
    tagsAreRelevant,
    blogFailures: failures
  };
}

/**
 * Run comprehensive blog validation: SEO + blog-specific metadata
 */
export function runBlogValidation(params: BlogValidationParams): BlogValidationReport {
  // First: Run master SEO validation
  const seoReport = runMasterSeoValidation({
    focusKeyword: params.focusKeyword,
    isKeywordUniqueToDomain: params.isKeywordUniqueToDomain,
    title: params.title,
    seoTitle: params.seoTitle,
    metaDesc: params.metaDesc,
    htmlContent: params.htmlContent,
    type: 'blog',
    siteUrl: params.siteUrl,
    authorName: params.authorName,
    featuredImage: params.featuredImage,
  });

  // Second: Validate blog-specific metadata
  const blogValidation = validateBlogMetadata(params);

  // Combine failures
  const allFailures = [
    ...seoReport.failures,
    ...blogValidation.blogFailures
  ];

  return {
    ...seoReport,
    passed: allFailures.length === 0,
    failures: allFailures,
    blogMetadata: {
      hasAuthor: blogValidation.hasAuthor,
      hasPublishedDate: blogValidation.hasPublishedDate,
      hasCategory: blogValidation.hasCategory,
      hasMinTags: blogValidation.hasMinTags,
      hasRelatedLinks: blogValidation.hasRelatedLinks,
      categoryIsValid: blogValidation.categoryIsValid,
      tagsAreRelevant: blogValidation.tagsAreRelevant,
    },
    blogFailures: blogValidation.blogFailures,
  };
}

/**
 * Build fix prompt that includes both SEO + blog metadata guidance
 */
export function buildBlogFixPrompt(report: BlogValidationReport): string {
  if (report.passed && report.totalScore === 100 && report.blogFailures.length === 0) {
    return 'Perfect Blog Post: 100/100 SEO Score. All metadata complete. Ready to publish.';
  }

  const lines: string[] = [];

  if (report.blogFailures.length > 0) {
    lines.push('🚨 BLOG METADATA FAILURES (Must fix):');
    report.blogFailures.forEach(f => lines.push(`- [CRITICAL] ${f}`));
    lines.push('');
  }

  if (report.failures.length > 0) {
    lines.push('🚨 SEO GATEKEEPING FAILURES (Must fix):');
    report.failures.forEach(f => {
      if (!report.blogFailures.includes(f)) {
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

  lines.push('📊 Blog Metrics:');
  lines.push(`  Author: ${report.blogMetadata.hasAuthor ? '✓' : '✗'}`);
  lines.push(`  Published: ${report.blogMetadata.hasPublishedDate ? '✓' : '✗'}`);
  lines.push(`  Category: ${report.blogMetadata.categoryIsValid ? '✓' : '✗'}`);
  lines.push(`  Tags: ${report.blogMetadata.hasMinTags ? '✓' : '✗'} (${(report.blogMetadata.hasMinTags ? 'Valid' : 'Invalid')})`);
  lines.push(`  Related Links: ${report.blogMetadata.hasRelatedLinks ? '✓' : '✗'}`);
  lines.push('');

  lines.push('📊 SEO Metrics:');
  lines.push(`  Word count: ${report.metrics.wordCount}`);
  lines.push(`  Keyword density: ${report.metrics.keywordDensity}%`);
  lines.push(`  Flesch Reading Ease: ${report.metrics.fleschScore}`);
  lines.push(`  Avg sentence length: ${report.metrics.avgSentenceLength} words`);

  return lines.join('\n');
}
