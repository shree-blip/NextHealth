/**
 * SEO Validation & Readability Utilities
 *
 * Provides automated checks that every AI-generated blog/news draft must pass
 * before it is saved to the database. If any check fails, the generator
 * must rewrite the failing section.
 */

// ── Readability helpers ──────────────────────────────────────────────

/** Strip all HTML tags and return plain text */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Count syllables in a word (approximation for Flesch score) */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  let count = 0;
  const vowels = 'aeiouy';
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = vowels.includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  // Silent e
  if (w.endsWith('e') && count > 1) count--;
  // -le ending
  if (w.endsWith('le') && w.length > 2 && !vowels.includes(w[w.length - 3])) count++;
  return Math.max(1, count);
}

/** Split text into sentences (handles abbreviations reasonably well) */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

/** Split text into words */
function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ''))
    .filter((w) => w.length > 0);
}

/**
 * Compute the Flesch Reading Ease score.
 * 206.835 - 1.015*(totalWords/totalSentences) - 84.6*(totalSyllables/totalWords)
 * Target: 50–70
 */
export function fleschReadingEase(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (sentences.length === 0 || words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score =
    206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (totalSyllables / words.length);
  return Math.round(score * 10) / 10;
}

/** Average words per sentence */
export function avgWordsPerSentence(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (sentences.length === 0) return 0;
  return Math.round((words.length / sentences.length) * 10) / 10;
}

/** Word count */
export function wordCount(text: string): number {
  return splitWords(text).length;
}

/**
 * Compute exact-match keyword density as a percentage.
 * Counts how many times the full keyword phrase appears in the text
 * divided by total word count, multiplied by the keyword word count.
 */
export function keywordDensity(text: string, keyword: string): number {
  const lower = text.toLowerCase();
  const kw = keyword.toLowerCase().trim();
  const kwWords = splitWords(kw).length;
  const totalWords = splitWords(lower).length;
  if (totalWords === 0 || kwWords === 0) return 0;

  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(kw, idx)) !== -1) {
    count++;
    idx += kw.length;
  }
  return Math.round(((count * kwWords) / totalWords) * 1000) / 10;
}

/** Check if keyword appears in an H2 heading */
export function keywordInH2(html: string, keyword: string): boolean {
  const h2s = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const kw = keyword.toLowerCase();
  return h2s.some((h) => stripHtml(h).toLowerCase().includes(kw));
}

/** Check if keyword appears in an H1 heading or title */
export function keywordInTitle(title: string, keyword: string): boolean {
  return title.toLowerCase().includes(keyword.toLowerCase());
}

/** Check if keyword appears in the first paragraph */
export function keywordInFirstParagraph(html: string, keyword: string): boolean {
  const firstP = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (!firstP) return false;
  return stripHtml(firstP[1]).toLowerCase().includes(keyword.toLowerCase());
}

// ── Transition words ────────────────────────────────────────────────

const TRANSITION_WORDS = [
  'however', 'also', 'because', 'for example', 'next', 'furthermore',
  'moreover', 'in addition', 'additionally', 'consequently', 'therefore',
  'as a result', 'meanwhile', 'similarly', 'in contrast', 'on the other hand',
  'specifically', 'in particular', 'notably', 'importantly', 'finally',
  'first', 'second', 'third', 'ultimately', 'overall',
];

/** Percentage of sentences that contain at least one transition word */
export function transitionWordPercentage(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const withTransition = sentences.filter((s) => {
    const lower = s.toLowerCase();
    return TRANSITION_WORDS.some((tw) => lower.includes(tw));
  });
  return Math.round((withTransition.length / sentences.length) * 100);
}

// ── Social metadata defaults ────────────────────────────────────────

export interface SocialMeta {
  [key: string]: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogSiteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterUrl: string;
}

export function generateSocialMeta(params: {
  title: string;
  description: string;
  image: string | null;
  slug: string;
  siteUrl: string;
  section: 'blog' | 'news';
}): SocialMeta {
  const { title, description, image, slug, siteUrl, section } = params;
  const url = `${siteUrl}/${section}/${slug}`;
  const imgUrl = image || `${siteUrl}/og-default.png`;

  return {
    ogTitle: title,
    ogDescription: description,
    ogImage: imgUrl,
    ogUrl: url,
    ogSiteName: 'The NextGen Healthcare Marketing',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: imgUrl,
    twitterUrl: url,
  };
}

// ── Full SEO Validation ─────────────────────────────────────────────

export interface SeoCheckResult {
  passed: boolean;
  failures: string[];
  metrics: {
    metaTitleLength: number;
    metaDescLength: number;
    keywordDensity: number;
    fleschScore: number;
    avgSentenceLength: number;
    wordCount: number;
    transitionWordPct: number;
    keywordInMetaTitle: boolean;
    keywordInMetaDesc: boolean;
    keywordInTitle: boolean;
    keywordInH2: boolean;
    keywordInFirstParagraph: boolean;
  };
}

export function runSeoChecks(params: {
  focusKeyword: string;
  title: string;
  seoTitle: string;
  metaDesc: string;
  htmlContent: string;
  type: 'blog' | 'news';
}): SeoCheckResult {
  const { focusKeyword, title, seoTitle, metaDesc, htmlContent, type } = params;
  const plainText = stripHtml(htmlContent);
  const failures: string[] = [];

  // 1. Meta title length (30–60 chars)
  const mtLen = seoTitle.length;
  if (mtLen < 30) failures.push(`Meta title too short (${mtLen} chars, need 30-60)`);
  if (mtLen > 60) failures.push(`Meta title too long (${mtLen} chars, need 30-60)`);

  // 2. Meta description length (140–160 chars)
  const mdLen = metaDesc.length;
  if (mdLen < 140) failures.push(`Meta description too short (${mdLen} chars, need 140-160)`);
  if (mdLen > 160) failures.push(`Meta description too long (${mdLen} chars, need 140-160)`);

  // 3. Keyword in meta title
  const kwInMetaTitle = keywordInTitle(seoTitle, focusKeyword);
  if (!kwInMetaTitle) failures.push('Focus keyword missing from meta title');

  // 4. Keyword in meta description
  const kwInMetaDesc = metaDesc.toLowerCase().includes(focusKeyword.toLowerCase());
  if (!kwInMetaDesc) failures.push('Focus keyword missing from meta description');

  // 5. Keyword in H1 / blog title
  const kwInH1 = keywordInTitle(title, focusKeyword);
  if (!kwInH1) failures.push('Focus keyword missing from H1 title');

  // 6. Keyword in at least one H2
  const kwInH2 = keywordInH2(htmlContent, focusKeyword);
  if (!kwInH2) failures.push('Focus keyword missing from all H2 headings');

  // 7. Keyword in first paragraph
  const kwInFirst = keywordInFirstParagraph(htmlContent, focusKeyword);
  if (!kwInFirst) failures.push('Focus keyword missing from first paragraph');

  // 8. Keyword density (0.8%–1.2%)
  const density = keywordDensity(plainText, focusKeyword);
  if (density < 0.8) failures.push(`Keyword density too low (${density}%, need 0.8-1.2%)`);
  if (density > 1.2) failures.push(`Keyword density too high (${density}%, need 0.8-1.2%)`);

  // 9. Flesch Reading Ease (50–70)
  const flesch = fleschReadingEase(plainText);
  if (flesch < 50) failures.push(`Readability too hard (Flesch ${flesch}, need 50-70)`);
  if (flesch > 70) failures.push(`Readability too easy (Flesch ${flesch}, need 50-70)`);

  // 10. Average sentence length (max 20 words)
  const avgSentLen = avgWordsPerSentence(plainText);
  if (avgSentLen > 20) failures.push(`Sentences too long (avg ${avgSentLen} words, max 20)`);

  // 11. Word count
  const wc = wordCount(plainText);
  const minWords = type === 'blog' ? 900 : 500;
  const maxWords = type === 'blog' ? 1500 : 1100;
  if (wc < minWords) failures.push(`Word count too low (${wc} words, need ${minWords}+)`);
  if (wc > maxWords) failures.push(`Word count too high (${wc} words, max ${maxWords})`);

  // 12. Transition word percentage (aim for ≥30%)
  const twPct = transitionWordPercentage(plainText);
  if (twPct < 25) failures.push(`Not enough transition words (${twPct}%, need 25%+)`);

  return {
    passed: failures.length === 0,
    failures,
    metrics: {
      metaTitleLength: mtLen,
      metaDescLength: mdLen,
      keywordDensity: density,
      fleschScore: flesch,
      avgSentenceLength: avgSentLen,
      wordCount: wc,
      transitionWordPct: twPct,
      keywordInMetaTitle: kwInMetaTitle,
      keywordInMetaDesc: kwInMetaDesc,
      keywordInTitle: kwInH1,
      keywordInH2: kwInH2,
      keywordInFirstParagraph: kwInFirst,
    },
  };
}

/**
 * Build a "fix instructions" prompt for the AI to correct specific SEO failures.
 * Only the failing checks are included so the rewrite is targeted.
 */
export function buildFixPrompt(failures: string[], metrics: SeoCheckResult['metrics']): string {
  const lines = ['The following SEO checks FAILED. You must fix them in the rewrite:\n'];

  for (const f of failures) {
    lines.push(`- ${f}`);
  }

  lines.push('\nCurrent metrics:');
  lines.push(`  Meta title length: ${metrics.metaTitleLength} chars`);
  lines.push(`  Meta description length: ${metrics.metaDescLength} chars`);
  lines.push(`  Keyword density: ${metrics.keywordDensity}%`);
  lines.push(`  Flesch Reading Ease: ${metrics.fleschScore}`);
  lines.push(`  Avg sentence length: ${metrics.avgSentenceLength} words`);
  lines.push(`  Word count: ${metrics.wordCount}`);
  lines.push(`  Transition word %: ${metrics.transitionWordPct}%`);
  lines.push(`  Keyword in meta title: ${metrics.keywordInMetaTitle}`);
  lines.push(`  Keyword in meta desc: ${metrics.keywordInMetaDesc}`);
  lines.push(`  Keyword in H1: ${metrics.keywordInTitle}`);
  lines.push(`  Keyword in H2: ${metrics.keywordInH2}`);
  lines.push(`  Keyword in first paragraph: ${metrics.keywordInFirstParagraph}`);

  return lines.join('\n');
}
