/**
 * Healthcare News Validation & SEO Enforcement Engine
 * Extends the master SEO validation with both standard News and strict YMYL Healthcare requirements:
 * - Source credibility & valid URLs
 * - Publisher and author information
 * - News freshness (recent publication date)
 * - Strict Healthcare Citation density (>= 3)
 * - Medical author credentialing / Reviewer check (E-E-A-T)
 * - Clickbait heuristic detection on headlines
 * - Cryptographic Provenance (C2PA) / JTI Certification
 * - Medical disclaimers
 */

import { runMasterSeoValidation, MasterSeoReport, stripHtml } from './seo-validation';

export interface HealthcareNewsValidationParams {
  // SEO Requirements
  focusKeyword: string;
  isKeywordUniqueToDomain: boolean;
  title: string; // Used as the headline for clickbait checking
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

  // Healthcare/YMYL Specific Requirements
  medicalReviewer?: string; // Optional but recommended if author lacks credentials
  containsMedicalDisclaimer: boolean; // Required for medical content
  hasC2PAManifest?: boolean; // Cryptographic image/video verification
  isJTICertified?: boolean; // Journalism Trust Initiative certified publisher
}

export interface HealthcareNewsValidationReport extends MasterSeoReport {
  // Combined News & Health Metadata
  metadata: {
    hasSource: boolean;
    sourceIsValid: boolean;
    hasPublisher: boolean;
    hasAuthor: boolean;
    hasPublishedDate: boolean;
    isFresh: boolean; // Published within last 30 days
    isOriginalContent: boolean;
    citationsAreAdequate: boolean;
    
    // YMYL Health Specifics
    hasMedicalCredentials: boolean;
    hasDisclaimer: boolean;
    passesClickbaitCheck: boolean;
    integrityVerified: boolean; // C2PA or JTI signals
  };
  newsFailures: string[];
  healthFailures: string[];
  clickbaitFlags: string[];
}

// Combined standard news and medical trusted sources
const TRUSTED_HEALTH_NEWS_SOURCES = new Set([
  'bbc', 'cnn', 'reuters', 'ap news', 'associated press',
  'healthline', 'webmd', 'medical news today', 'medtech',
  'healthcare it news', 'modern healthcare', 'healthcare dive',
  'health affairs', 'jama', 'lancet', 'nejm', 'medpage today',
  'cdc', 'who', 'mayo clinic', 'cleveland clinic', 'nih', 'fda'
]);

const MEDICAL_CREDENTIALS = ['MD', 'DO', 'PhD', 'RN', 'BSN', 'NP', 'PA-C', 'PharmD', 'MPH', 'RD'];

// Clickbait Regex Patterns for Health Headlines
const CLICKBAIT_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  { regex: /^watch/gi, reason: 'Imperative directive commanding user to watch rather than informing.' },
  { regex: /^[0-9]{1,2}/gi, reason: 'Number-prefixed listicle structure implies low-value content.' },
  { regex: /you won\'?t believe/gi, reason: 'Hyperbolic sensationalism.' },
  { regex: /\?$/, reason: 'Betteridge\'s Law: Headlines ending in questions usually lack factual substantiation.' },
  { regex: /^that time/gi, reason: 'Vague temporal reference instead of hard journalistic dateline.' },
  { regex: /miracle (cure|drug)/gi, reason: 'Dangerous medical hyperbole ("miracle cure").' }
];

/**
 * Validate that source URL is legitimate
 */
function isValidSourceUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
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
  return Array.from(TRUSTED_HEALTH_NEWS_SOURCES).some(trusted => lower.includes(trusted));
}

/**
 * Check for medical credentials in name
 */
function hasMedicalAuth(name: string): boolean {
  return MEDICAL_CREDENTIALS.some(cred => name.includes(cred) || name.includes(cred.toLowerCase()));
}

/**
 * Analyze headline for clickbait heuristics
 */
function analyzeClickbait(headline: string): string[] {
  const flags: string[] = [];
  for (const pattern of CLICKBAIT_PATTERNS) {
    if (pattern.regex.test(headline)) {
      flags.push(pattern.reason);
    }
  }
  return flags;
}

/**
 * Validate news and health-specific metadata
 */
function validateHealthcareMetadata(params: HealthcareNewsValidationParams) {
  const newsFailures: string[] = [];
  const healthFailures: string[] = [];
  const warnings: string[] = [];

  // --- 1. Standard News Validation ---
  const hasSource = !!params.source && params.source.trim().length > 0;
  if (!hasSource) newsFailures.push('News source is required.');

  const hasSourceUrl = !!params.sourceUrl && params.sourceUrl.trim().length > 0;
  if (!hasSourceUrl) newsFailures.push('Source URL is required.');
  const sourceIsValid = hasSourceUrl && isValidSourceUrl(params.sourceUrl);
  if (hasSourceUrl && !sourceIsValid) newsFailures.push('Source URL must be a valid HTTPS link.');

  const hasPublisher = !!params.publisher && params.publisher.trim().length > 0;
  if (!hasPublisher) newsFailures.push('Publisher name is required.');

  const hasAuthor = !!(params.authorName && params.authorName.trim().length > 0);
  if (!hasAuthor) newsFailures.push('Author/Byline is required for news articles.');

  const hasPublishedDate = !!params.publishedAt;
  if (!hasPublishedDate) newsFailures.push('Published date is required.');

  const isFresh = isFreshArticle(params.publishedAt);
  if (hasPublishedDate && !isFresh) {
    newsFailures.push('News article must be from the last 30 days. Older articles should be reclassified as evergreen/blog.');
  }

  const isKnown = hasSource && isKnownTrustedSource(params.source);
  if (hasSource && !isKnown) {
    warnings.push('Consider citing globally recognized medical/news authorities (WHO, CDC, Reuters) to boost domain authority.');
  }

  if (!params.isOriginalContent) {
    newsFailures.push('Provide original commentary or rewrite on the news story (purely syndicated content is penalized).');
  }

  // --- 2. YMYL Healthcare Validation ---
  
  // Health requires stricter citation limits (>= 3 instead of standard 2)
  const citationCount = params.citationCount || 0;
  const citationsAreAdequate = citationCount >= 3;
  if (!citationsAreAdequate) {
    healthFailures.push(`[CITATIONS] Healthcare reporting requires at least 3 authoritative inline citations (Found: ${citationCount}).`);
  }

  // E-E-A-T Medical Credentials
  const authorHasCreds = params.authorName ? hasMedicalAuth(params.authorName) : false;
  const reviewerHasCreds = params.medicalReviewer ? hasMedicalAuth(params.medicalReviewer) : false;
  const hasMedicalCredentials = authorHasCreds || reviewerHasCreds;
  
  if (!hasMedicalCredentials) {
    healthFailures.push('[E-E-A-T] YMYL content requires an author with medical credentials (MD, PhD, RN, etc.) OR a verified Medical Reviewer.');
  }

  // Legal / Medical Disclaimer
  if (!params.containsMedicalDisclaimer) {
    healthFailures.push('[COMPLIANCE] Missing mandatory medical disclaimer ("This content is for informational purposes only...").');
  }

  // Clickbait Detection
  const clickbaitFlags = analyzeClickbait(params.title);

  // Integrity & Provenance
  const integrityVerified = !!(params.hasC2PAManifest || params.isJTICertified);
  if (!integrityVerified) {
    warnings.push('Recommended: Embed C2PA cryptographic manifests for media or obtain JTI certification to boost algorithmic discoverability.');
  }

  return {
    metadata: {
      hasSource,
      sourceIsValid,
      hasPublisher,
      hasAuthor,
      hasPublishedDate,
      isFresh: isFresh || false,
      isOriginalContent: params.isOriginalContent,
      citationsAreAdequate,
      hasMedicalCredentials,
      hasDisclaimer: params.containsMedicalDisclaimer,
      passesClickbaitCheck: clickbaitFlags.length === 0,
      integrityVerified
    },
    newsFailures,
    healthFailures,
    clickbaitFlags,
    warnings
  };
}

/**
 * Run comprehensive validation: SEO + News + Healthcare YMYL
 */
export function runHealthcareNewsValidation(params: HealthcareNewsValidationParams): HealthcareNewsValidationReport {
  // First: Run master SEO validation
  const seoReport = runMasterSeoValidation({
    focusKeyword: params.focusKeyword,
    isKeywordUniqueToDomain: params.isKeywordUniqueToDomain,
    title: params.title,
    seoTitle: params.seoTitle,
    metaDesc: params.metaDesc,
    htmlContent: params.htmlContent,
    type: 'news', // Using 'news' type for standard SEO checks
    siteUrl: params.siteUrl,
    authorName: params.authorName,
    featuredImage: params.featuredImage,
  });

  // Second: Validate unified News + Healthcare metadata
  const domainValidation = validateHealthcareMetadata(params);

  // Combine all failures
  const allFailures = [
    ...seoReport.failures,
    ...domainValidation.newsFailures,
    ...domainValidation.healthFailures
  ];

  const allImprovements = [
    ...seoReport.improvements,
    ...domainValidation.warnings
  ];

  // Adjust score based on severe health/clickbait violations
  // Each health failure deducts 10 points (they're already gatekeeping via `passed`)
  // Each clickbait flag deducts 5 points
  let adjustedScore = seoReport.totalScore;
  if (domainValidation.healthFailures.length > 0) adjustedScore -= 10 * domainValidation.healthFailures.length;
  if (domainValidation.clickbaitFlags.length > 0) adjustedScore -= 5 * domainValidation.clickbaitFlags.length;
  adjustedScore = Math.max(0, adjustedScore);

  const passed = allFailures.length === 0 && domainValidation.clickbaitFlags.length === 0;

  return {
    ...seoReport,
    passed,
    totalScore: adjustedScore,
    failures: allFailures,
    improvements: allImprovements,
    metadata: domainValidation.metadata,
    newsFailures: domainValidation.newsFailures,
    healthFailures: domainValidation.healthFailures,
    clickbaitFlags: domainValidation.clickbaitFlags
  };
}

/**
 * Build fix prompt that includes SEO + News + Health/YMYL metadata guidance
 */
export function buildHealthcareFixPrompt(report: HealthcareNewsValidationReport): string {
  if (report.passed && report.totalScore === 100) {
    return '✅ Perfect Healthcare News Article: 100/100 SEO & Trust Score. All YMYL requirements met. Ready to publish.';
  }

  const lines: string[] = [];

  if (report.healthFailures.length > 0) {
    lines.push('🚨 HEALTHCARE YMYL FAILURES (Critical):');
    report.healthFailures.forEach(f => lines.push(`- ❌ ${f}`));
    lines.push('');
  }

  if (report.newsFailures.length > 0) {
    lines.push('📰 NEWS METADATA FAILURES (Must fix):');
    report.newsFailures.forEach(f => lines.push(`- ❌ ${f}`));
    lines.push('');
  }

  if (report.clickbaitFlags.length > 0) {
    lines.push('🎣 CLICKBAIT HEURISTICS DETECTED (Must fix):');
    report.clickbaitFlags.forEach(f => lines.push(`- ⚠️ ${f}`));
    lines.push('');
  }

  // Filter out the combined failures to just show remaining base SEO failures
  const standardSeoFailures = report.failures.filter(f => 
    !report.newsFailures.includes(f) && !report.healthFailures.includes(f)
  );

  if (standardSeoFailures.length > 0) {
    lines.push('🔍 SEO GATEKEEPING FAILURES:');
    standardSeoFailures.forEach(f => lines.push(`- ❌ ${f}`));
    lines.push('');
  }

  if (report.totalScore < 100) {
    const delta = 100 - report.totalScore;
    lines.push(`📈 SEO & TRUST SCORE: ${report.totalScore}/100. Earn +${delta} points by:`);
    report.improvements.forEach(imp => lines.push(`- 💡 ${imp}`));
    lines.push('');
  }

  lines.push('📊 Unified Metadata Audit:');
  lines.push(`  [News] Publisher/Source: ${report.metadata.hasPublisher && report.metadata.hasSource ? '✓' : '✗'}`);
  lines.push(`  [News] Fresh (<30 days): ${report.metadata.isFresh ? '✓' : '✗'}`);
  lines.push(`  [News] Original Content: ${report.metadata.isOriginalContent ? '✓' : '✗'}`);
  lines.push(`  [Health] Citation Density (>=3): ${report.metadata.citationsAreAdequate ? '✓' : '✗'}`);
  lines.push(`  [Health] Medical E-E-A-T Creds: ${report.metadata.hasMedicalCredentials ? '✓' : '✗'}`);
  lines.push(`  [Health] Medical Disclaimer: ${report.metadata.hasDisclaimer ? '✓' : '✗'}`);
  lines.push(`  [Health] C2PA/JTI Provenance: ${report.metadata.integrityVerified ? '✓' : '✗'}`);
  lines.push('');

  lines.push('📊 Current Lexical Metrics:');
  lines.push(`  Word count: ${report.metrics.wordCount}`);
  lines.push(`  Keyword density: ${report.metrics.keywordDensity}%`);
  lines.push(`  Flesch Reading Ease: ${report.metrics.fleschScore}`);
  lines.push(`  Avg sentence length: ${report.metrics.avgSentenceLength} words`);
  lines.push(`  Transition word %: ${report.metrics.transitionWordPct}%`);
  lines.push(`  Passive voice %: ${report.metrics.passiveVoicePct}%`);
  lines.push(`  Longest paragraph: ${report.metrics.maxParagraphWords} words`);
  lines.push(`  Long paragraphs (>150 words): ${report.metrics.longParagraphs}`);
  lines.push(`  Power word in title: ${report.metrics.hasPowerWordInTitle ? 'Yes' : 'No'}`);
  lines.push('');
  lines.push('IMPORTANT: Maintain all current external links and internal links. Add any missing citations. Rewrite the content to achieve 100/100 compliance.');

  return lines.join('\n');
}