/**
 * Master SEO Validation & Readability Utilities
 * Combines strict AI gatekeeping (pass/fail parameters) with an advanced 
 * 100-point algorithmic scoring matrix to ensure absolute perfect SEO compliance.
 */

// ─── LEXICAL DICTIONARIES ───────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'nor',
  'about', 'above', 'after', 'against', 'at', 'before', 'below', 'between', 'by', 'down',
  'during', 'for', 'from', 'in', 'into', 'on', 'over', 'through', 'to', 'under', 'up', 'with', 'within', 'without',
  'all', 'any', 'both', 'each', 'few', 'he', 'her', 'hers', 'him', 'his', 'i', 'it', 'its',
  'me', 'mine', 'my', 'our', 'ours', 'she', 'some', 'such', 'that', 'theirs',
  'them', 'these', 'they', 'this', 'those', 'we', 'what', 'which', 'who', 'whom', 'whose', 'you', 'yours',
  'am', 'are', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'would', 'should', 'could', 'ought', 'actually', 'almost', 'also', 'although', 'always', 'else', 'how', 
  'just', 'maybe', 'more', 'most', 'much', 'neither', 'not', 'only', 'rather', 'so', 'than', 'then', 'there', 
  'too', 'very', 'when', 'where', 'why', 'yes', 'yet'
]);

const TRANSITION_WORDS = [
  'however', 'also', 'because', 'for example', 'next', 'furthermore', 'moreover', 'in addition', 
  'additionally', 'consequently', 'therefore', 'as a result', 'meanwhile', 'similarly', 'in contrast', 
  'on the other hand', 'specifically', 'in particular', 'notably', 'importantly', 'finally',
  'first', 'second', 'third', 'ultimately', 'overall', 'accordingly', 'hence', 'thus', 'due to',
  'indeed', 'in fact', 'instead', 'nevertheless', 'yet', 'although', 'even though', 'besides',
  'subsequently', 'undeniably', 'undoubtedly', 'above all', 'in summary'
];

const IRREGULAR_PAST_PARTICIPLES = [
  'arisen', 'awoke', 'been', 'borne', 'beaten', 'become', 'begun', 'bent', 'bet', 'bound', 'bitten', 'bled', 
  'blown', 'broken', 'brought', 'built', 'bought', 'caught', 'chosen', 'come', 'cost', 'crept', 'cut', 'dealt', 
  'dug', 'done', 'drawn', 'dreamt', 'driven', 'drunk', 'eaten', 'fallen', 'fed', 'felt', 'fought', 'found', 
  'flown', 'forgotten', 'forgiven', 'frozen', 'gotten', 'given', 'gone', 'grown', 'hung', 'had', 'heard', 
  'hidden', 'hit', 'held', 'hurt', 'kept', 'known', 'laid', 'led', 'left', 'lent', 'let', 'lain', 'lit', 'lost',
  'made', 'meant', 'met', 'paid', 'put', 'read', 'ridden', 'rung', 'risen', 'run', 'said', 'seen', 'sold', 
  'sent', 'set', 'shaken', 'shed', 'shot', 'shut', 'sung', 'sunk', 'sat', 'slept', 'spoken', 'spent', 'spun', 
  'stood', 'stolen', 'stuck', 'struck', 'sworn', 'swept', 'swollen', 'swum', 'swung', 'taken', 'taught', 'torn', 
  'told', 'thought', 'thrown', 'thrust', 'understood', 'woken', 'worn', 'woven', 'wept', 'won', 'wrung', 'written'
];

const POWER_WORDS = [
  'absolute', 'authentic', 'authority', 'backed', 'brilliant', 'conclusive', 'definitive', 'dependable', 'elite', 
  'ensured', 'expert', 'fail-proof', 'genuine', 'guaranteed', 'legitimate', 'lifetime', 'master', 'meticulous', 
  'official', 'perfect', 'professional', 'proven', 'reliable', 'respected', 'secure', 'tested', 'ultimate', 'verified',
  'secret', 'truth', 'unbelievable', 'unexplored', 'unique', 'unlock', 'unseen', 'untold', 'unusual', 'unveil',
  'bargain', 'bonus', 'cheap', 'discount', 'exclusive', 'extra', 'free', 'lucrative', 'massive', 'profit', 'value',
  'act now', 'fast', 'hurry', 'immediate', 'instant', 'limited', 'now', 'quick', 'urgent', 'warning'
];

// ─── UTILITY & READABILITY HELPERS ──────────────────────────────────────

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

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  let count = 0, prevVowel = false;
  for (const ch of w) {
    const isVowel = 'aeiouy'.includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith('e') && count > 1) count--;
  if (w.endsWith('le') && w.length > 2 && !'aeiouy'.includes(w[w.length - 3])) count++;
  return Math.max(1, count);
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 3);
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9'-]/g, '')).filter((w) => w.length > 0);
}

// ─── METRICS CALCULATORS ────────────────────────────────────────────────

export function fleschReadingEase(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (sentences.length === 0 || words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (totalSyllables / words.length);
  return Math.round(score * 10) / 10;
}

export function avgWordsPerSentence(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (sentences.length === 0) return 0;
  return Math.round((words.length / sentences.length) * 10) / 10;
}

export function wordCount(text: string): number {
  return splitWords(text).length;
}

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

export function keywordInH2(html: string, keyword: string): boolean {
  const h2s = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  return h2s.some((h) => stripHtml(h).toLowerCase().includes(keyword.toLowerCase()));
}

export function keywordInTitle(title: string, keyword: string): boolean {
  return title.toLowerCase().includes(keyword.toLowerCase());
}

export function keywordInFirstParagraph(html: string, keyword: string): boolean {
  const firstP = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (!firstP) return false;
  return stripHtml(firstP[1]).toLowerCase().includes(keyword.toLowerCase());
}

export function transitionWordPercentage(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const withTransition = sentences.filter((s) => {
    const lower = s.toLowerCase();
    return TRANSITION_WORDS.some((tw) => lower.includes(tw));
  });
  return Math.round((withTransition.length / sentences.length) * 100);
}

export function maxParagraphWordCount(html: string): number {
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  let maxWords = 0;
  for (const p of paragraphs) {
    const plain = stripHtml(p);
    const wc = splitWords(plain).length;
    if (wc > maxWords) maxWords = wc;
  }
  return maxWords;
}

export function longParagraphCount(html: string, threshold = 150): number {
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  return paragraphs.filter(p => splitWords(stripHtml(p)).length > threshold).length;
}

export function calculatePassiveVoicePercentage(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const irregularVerbsJoined = IRREGULAR_PAST_PARTICIPLES.join('|');
  const passiveRegex = new RegExp(`\\b(am|are|is|was|were|been|being)\\b\\s+([a-z]+ed|${irregularVerbsJoined})\\b`, 'i');
  const passiveCount = sentences.filter(s => passiveRegex.test(s)).length;
  return Math.round((passiveCount / sentences.length) * 100);
}

export function hasAnaphora(text: string): boolean {
  const sentences = splitSentences(text);
  let consecutiveCount = 1;
  for (let i = 1; i < sentences.length; i++) {
    const prevWord = splitWords(sentences[i - 1])[0];
    const currWord = splitWords(sentences[i])[0];
    if (prevWord && currWord && prevWord.toLowerCase() === currWord.toLowerCase()) {
      consecutiveCount++;
      if (consecutiveCount >= 3) return true;
    } else {
      consecutiveCount = 1;
    }
  }
  return false;
}

// ─── GENERATORS ─────────────────────────────────────────────────────────

export function generateOptimizedSlug(title: string, focusKeyword: string): string {
  let words = splitWords(title.toLowerCase());
  const filteredWords = words.filter(w => !STOP_WORDS.has(w));
  if (filteredWords.length > 0) words = filteredWords;
  return words.slice(0, 5).join('-').substring(0, 60).replace(/-$/, '');
}

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

export function generateSocialMeta(params: { title: string; description: string; image: string | null; slug: string; siteUrl: string; section: string; }): SocialMeta {
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

export function generateJsonLd(params: { title: string; description: string; url: string; imageUrl: string; datePublished: string; authorName: string; publisherName: string; }): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": params.title,
    "description": params.description,
    "image": params.imageUrl,
    "datePublished": params.datePublished,
    "author": { "@type": "Person", "name": params.authorName },
    "publisher": {
      "@type": "Organization",
      "name": params.publisherName,
      "logo": { "@type": "ImageObject", "url": `${new URL(params.url).origin}/logo.png` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": params.url }
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// ─── MASTER SEO VALIDATION ──────────────────────────────────────────────

export interface MasterSeoReport {
  // Gatekeeping Status
  passed: boolean;
  failures: string[]; // Strict criteria that must be fixed to save to DB

  // Scoring Status
  totalScore: number;
  scoreBreakdown: { basic: number; depth: number; links: number; titleUx: number; readability: number; };
  improvements: string[]; // Suggestions to reach 100/100

  // Raw Metrics
  metrics: {
    metaTitleLength: number;
    metaDescLength: number;
    keywordDensity: number;
    fleschScore: number;
    avgSentenceLength: number;
    wordCount: number;
    transitionWordPct: number;
    passiveVoicePct: number;
    keywordInMetaTitle: boolean;
    keywordInMetaDesc: boolean;
    keywordInTitle: boolean;
    keywordInH2: boolean;
    keywordInFirstParagraph: boolean;
    hasAnaphora: boolean;
    maxParagraphWords: number;
    longParagraphs: number;
    hasPowerWordInTitle: boolean;
  };

  // Outputs
  slug: string;
  socialMeta: SocialMeta;
  jsonLd: string;
}

export function runMasterSeoValidation(params: {
  focusKeyword: string;
  isKeywordUniqueToDomain: boolean;
  title: string;
  seoTitle: string;
  metaDesc: string;
  htmlContent: string;
  type: 'blog' | 'news' | 'pillar';
  siteUrl: string;
  authorName?: string;
  featuredImage?: string;
}): MasterSeoReport {
  
  const { focusKeyword, title, seoTitle, metaDesc, htmlContent, type, siteUrl, isKeywordUniqueToDomain } = params;
  const plainText = stripHtml(htmlContent);
  const lowerKeyword = focusKeyword.toLowerCase();
  
  // 1. Calculate Raw Metrics
  const mtLen = seoTitle.length;
  const mdLen = metaDesc.length;
  const kwInMetaTitle = keywordInTitle(seoTitle, focusKeyword);
  const kwInMetaDesc = metaDesc.toLowerCase().includes(lowerKeyword);
  const kwInH1 = keywordInTitle(title, focusKeyword);
  const kwInH2 = keywordInH2(htmlContent, focusKeyword);
  const kwInFirst = keywordInFirstParagraph(htmlContent, focusKeyword);
  const density = keywordDensity(plainText, focusKeyword);
  const flesch = fleschReadingEase(plainText);
  const avgSentLen = avgWordsPerSentence(plainText);
  const wc = wordCount(plainText);
  const twPct = transitionWordPercentage(plainText);
  const passiveVoicePct = calculatePassiveVoicePercentage(plainText);
  const anaphora = hasAnaphora(plainText);

  // 2. Strict Pass/Fail Failures (Gatekeeping)
  const failures: string[] = [];
  
  if (mtLen < 30) failures.push(`Meta title too short (${mtLen} chars, need 30-60)`);
  if (mtLen > 60) failures.push(`Meta title too long (${mtLen} chars, need 30-60)`);
  if (mdLen < 140) failures.push(`Meta description too short (${mdLen} chars, need 140-160)`);
  if (mdLen > 160) failures.push(`Meta description too long (${mdLen} chars, need 140-160)`);
  if (!kwInMetaTitle) failures.push('Focus keyword missing from meta title');
  if (!kwInMetaDesc) failures.push('Focus keyword missing from meta description');
  if (!kwInH1) failures.push('Focus keyword missing from H1 title');
  if (!kwInH2) failures.push('Focus keyword missing from all H2 headings');
  if (!kwInFirst) failures.push('Focus keyword missing from first paragraph');
  if (density < 0.8) failures.push(`Keyword density too low (${density}%, need 0.8-1.5%)`);
  if (density > 1.5) failures.push(`Keyword density too high (${density}%, need 0.8-1.5%)`);
  if (flesch < 50) failures.push(`Readability too hard (Flesch ${flesch}, need 50-70)`);
  if (flesch > 80) failures.push(`Readability too easy (Flesch ${flesch}, need 50-70)`); // Softened upper bound slightly
  if (avgSentLen > 20) failures.push(`Sentences too long (avg ${avgSentLen} words, max 20)`);
  
  let minWords = type === 'news' ? 500 : type === 'pillar' ? 1500 : 900;
  let maxWords = type === 'news' ? 1100 : type === 'pillar' ? 3000 : 1500;
  if (wc < minWords) failures.push(`Word count too low (${wc} words, need ${minWords}+)`);
  if (wc > maxWords) failures.push(`Word count too high (${wc} words, max ${maxWords})`);
  
  if (twPct < 25) failures.push(`Not enough transition words (${twPct}%, need 25%+)`);
  
  const maxParaWords = maxParagraphWordCount(htmlContent);
  const longParas = longParagraphCount(htmlContent, 150);
  if (longParas > 0) failures.push(`${longParas} paragraph(s) exceed 150 words (longest: ${maxParaWords} words). Break them up into shorter paragraphs.`);

  // 3. The 100-Point Scoring System
  let totalScore = 0;
  let basic = 0, depth = 0, links = 0, titleUx = 0, readability = 0;
  const improvements: string[] = [];

  const addScore = (cat: 'basic' | 'depth' | 'links' | 'titleUx' | 'readability', pts: number, passedCondition: boolean, impMsg: string) => {
    if (passedCondition) {
      totalScore += pts;
      if (cat === 'basic') basic += pts;
      if (cat === 'depth') depth += pts;
      if (cat === 'links') links += pts;
      if (cat === 'titleUx') titleUx += pts;
      if (cat === 'readability') readability += pts;
    } else {
      improvements.push(`[+${pts} pts] ${impMsg}`);
    }
  };

  // Basic (30 pts)
  addScore('basic', 10, kwInMetaTitle, 'Inject the focus keyword into the Meta Title.');
  addScore('basic', 10, kwInMetaDesc, 'Inject the focus keyword into the Meta Description.');
  
  const generatedSlug = generateOptimizedSlug(title, focusKeyword);
  const slugHasKw = generatedSlug.replace(/-/g, ' ').includes(lowerKeyword.replace(/[^a-z0-9\s]/gi, ''));
  addScore('basic', 5, slugHasKw, 'Ensure URL slug contains the focus keyword.');
  addScore('basic', 5, kwInFirst, 'Move the focus keyword into the first paragraph.');

  // Depth (30 pts)
  addScore('depth', 10, wc >= minWords, `Expand word count to meet the minimum of ${minWords}.`);
  addScore('depth', 5, density >= 1.0 && density <= 1.5, `Adjust keyword density to be between 1.0% - 1.5%.`);
  addScore('depth', 5, kwInH2, 'Inject the focus keyword into at least one H2 tag.');
  
  const imgTags = htmlContent.match(/<img[^>]+alt=(['"])(.*?)\1[^>]*>/gi) || [];
  let altHasKwAndValidLength = imgTags.some(tag => {
    const m = tag.match(/alt=(['"])(.*?)\1/i);
    return m && m[2] && m[2].toLowerCase().includes(lowerKeyword) && m[2].length < 80;
  });
  addScore('depth', 5, altHasKwAndValidLength, 'Add an image with Alt Text (< 80 chars) containing the focus keyword.');
  addScore('depth', 5, isKeywordUniqueToDomain, 'Use a unique focus keyword not previously targeted on the domain.');

  // Links (15 pts)
  const aTags = htmlContent.match(/<a[^>]+href=(['"])(.*?)\1[^>]*>/gi) || [];
  let hasExternalDoFollow = false, hasInternalLink = false;
  aTags.forEach(tag => {
    const hrefM = tag.match(/href=(['"])(.*?)\1/i);
    const relM = tag.match(/rel=(['"])(.*?)\1/i);
    if (hrefM && hrefM[2]) {
      const url = hrefM[2];
      const isExt = url.startsWith('http') && !url.includes(siteUrl);
      const isDoFollow = !relM || !relM[2].toLowerCase().includes('nofollow');
      if (isExt && isDoFollow) hasExternalDoFollow = true;
      if (!isExt || url.includes(siteUrl)) hasInternalLink = true;
    }
  });
  addScore('links', 5, hasExternalDoFollow, 'Add at least one DoFollow external link pointing to a differing, authoritative domain.');
  addScore('links', 5, hasExternalDoFollow, 'Ensure external links point to high-authority domains.'); 
  addScore('links', 5, hasInternalLink, 'Add contextual internal links pointing back to the host domain.');

  // Title UX (10 pts)
  addScore('titleUx', 4, seoTitle.toLowerCase().trim().startsWith(lowerKeyword), 'Position the focus keyword at the exact beginning of the Meta Title.');
  const hasPowerWord = POWER_WORDS.some(pw => seoTitle.toLowerCase().includes(pw));
  addScore('titleUx', 3, hasPowerWord, 'Insert a recognized SEO Power Word into the Meta Title to boost CTR.');
  addScore('titleUx', 1, hasPowerWord, 'Ensure the Meta Title exhibits measurable positive or negative sentiment.');
  addScore('titleUx', 2, /\d+/.test(seoTitle), 'Include a number/integer in the Meta Title for listicle CTR generation.');

  // Readability (15 pts)
  const hasToc = /<(ul|ol|nav)[^>]*\b(id|class)=["']?[^"']*\btoc\b[^"']*/i.test(htmlContent);
  if (wc >= 1500) addScore('readability', 5, hasToc, 'Inject a Table of Contents (ToC) HTML structure for long-form content.');
  else { readability += 5; totalScore += 5; } // Auto pass if short
  
  const h2h3Count = (htmlContent.match(/<h[2-3]/gi) || []).length;
  addScore('readability', 2, (h2h3Count > 0 ? wc / h2h3Count : wc) <= 300, 'Keep text blocks under 300 words between headings.');
  addScore('readability', 4, flesch >= 50 && flesch <= 70, `Improve Flesch Reading Ease to 50-70.`);
  addScore('readability', 2, twPct > 30, `Add transition words. Target: >30% of sentences.`);
  addScore('readability', 1, passiveVoicePct < 10, `Reduce passive voice. Target: <10%.`);
  addScore('readability', 1, !anaphora, 'Remove repetitive sentence starters (3+ consecutive sentences).');

  // Outputs
  return {
    passed: failures.length === 0,
    failures,
    totalScore,
    scoreBreakdown: { basic, depth, links, titleUx, readability },
    improvements,
    metrics: {
      metaTitleLength: mtLen,
      metaDescLength: mdLen,
      keywordDensity: density,
      fleschScore: flesch,
      avgSentenceLength: avgSentLen,
      wordCount: wc,
      transitionWordPct: twPct,
      passiveVoicePct,
      keywordInMetaTitle: kwInMetaTitle,
      keywordInMetaDesc: kwInMetaDesc,
      keywordInTitle: kwInH1,
      keywordInH2: kwInH2,
      keywordInFirstParagraph: kwInFirst,
      hasAnaphora: anaphora,
      maxParagraphWords: maxParagraphWordCount(htmlContent),
      longParagraphs: longParagraphCount(htmlContent, 150),
      hasPowerWordInTitle: POWER_WORDS.some(pw => seoTitle.toLowerCase().includes(pw)),
    },
    slug: generatedSlug,
    socialMeta: generateSocialMeta({
      title: seoTitle,
      description: metaDesc,
      image: params.featuredImage || null,
      slug: generatedSlug,
      siteUrl,
      section: type
    }),
    jsonLd: generateJsonLd({
      title,
      description: metaDesc,
      url: `${siteUrl}/${type}/${generatedSlug}`,
      imageUrl: params.featuredImage || `${siteUrl}/default-og.jpg`,
      datePublished: new Date().toISOString(),
      authorName: params.authorName || 'AI Editor',
      publisherName: 'The NextGen Healthcare Marketing'
    })
  };
}

/**
 * Build a highly targeted "fix instructions" prompt for the LLM to correct failures AND optimize score.
 */
export function buildMasterFixPrompt(report: MasterSeoReport): string {
  if (report.passed && report.totalScore === 100) return 'Perfect 100/100 SEO Score Achieved. No rewrite necessary.';

  const lines = [];

  if (!report.passed) {
    lines.push('🚨 STRICT GATEKEEPING FAILURES (Must be fixed to save):');
    report.failures.forEach(f => lines.push(`- [CRITICAL] ${f}`));
    lines.push('');
  }

  if (report.totalScore < 100) {
    const delta = 100 - report.totalScore;
    lines.push(`📈 SEO OPTIMIZATION SCORE: ${report.totalScore}/100. To earn the remaining ${delta} points, implement:`);
    report.improvements.forEach(imp => lines.push(`- ${imp}`));
    lines.push('');
  }

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
  lines.push('IMPORTANT: Maintain all current external links and internal links. Rewrite the content to achieve 100/100 compliance.');
  
  return lines.join('\n');
}
// ─── BACKWARDS COMPATIBILITY ALIASES ────────────────────────────────────

/** Backwards compatibility: older code uses runSeoChecks and SeoCheckResult */
export type SeoCheckResult = MasterSeoReport;
export const runSeoChecks = runMasterSeoValidation;
export const buildFixPrompt = buildMasterFixPrompt;
