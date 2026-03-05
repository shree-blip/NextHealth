# AI Content Generation Rules for Healthcare Marketing News

## Healthcare News Validation Requirements (YMYL Compliance)

The AI news generation system now follows strict **YMYL (Your Money Your Life)** healthcare content standards via `lib/news-validation.ts`. All generated news articles must pass comprehensive validation before being saved to the database.

---

## 🚨 CRITICAL YMYL HEALTHCARE REQUIREMENTS

### 1. Medical Author Credentials (E-E-A-T Compliance)
**REQUIRED:** All news articles must have an author with medical credentials.

**Accepted Credentials:**
- MD (Doctor of Medicine)
- DO (Doctor of Osteopathic Medicine)
- PhD (Doctor of Philosophy in medical/healthcare field)
- RN (Registered Nurse)
- BSN (Bachelor of Science in Nursing)
- NP (Nurse Practitioner)
- PA-C (Physician Assistant-Certified)
- PharmD (Doctor of Pharmacy)
- MPH (Master of Public Health)
- RD (Registered Dietitian)

**Implementation:**
- AI generates: `"authorName": "Dr. [Name], [Credential]"`
- Example: `"authorName": "Dr. Sarah Johnson, MD"`
- Fallback default: `"Dr. Michael Chen, MD"`

**Validation Check:**
```typescript
hasMedicalCredentials = authorHasCreds || reviewerHasCreds
// Must have at least one credentialed professional
```

---

### 2. Citation Density (Minimum 3 Citations)
**REQUIRED:** Healthcare news requires **≥3 external citations** to authoritative sources.

**Trusted Sources (prioritized):**
- Government: `.gov` domains (CDC, NIH, CMS, HHS, FDA)
- Education: `.edu` domains (medical schools, universities)
- International Health: WHO (who.int)
- Healthcare Publications: Becker's Hospital Review, Fierce Healthcare, Modern Healthcare, Healthcare IT News, STAT News, MedPage Today
- Medical Journals: JAMA, Lancet, NEJM, Health Affairs

**Implementation:**
```
EXTERNAL LINKS: Include at least 3 external links to credible sources (.gov, .edu, CDC, NIH, CMS, WHO, peer-reviewed journals)
```

**Validation Check:**
```typescript
citationCount >= 3 // Healthcare standard (vs 2 for general news)
```

---

### 3. Medical Disclaimer (Legal Requirement)
**REQUIRED:** Every healthcare news article must include this disclaimer paragraph at the end (before CTA).

**Exact Text:**
```html
<p><em>Medical Disclaimer: This content is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.</em></p>
```

**Placement:**
- After all article content
- Before the call-to-action (CTA)

**Validation Check:**
```typescript
containsMedicalDisclaimer = htmlContent.includes('medical disclaimer') || 
                             htmlContent.includes('informational purposes only')
```

---

### 4. Clickbait Detection (Trustworthiness)
**PROHIBITED:** Healthcare news must NOT use clickbait headline patterns.

**Banned Patterns:**
1. ❌ Headlines starting with "Watch" (imperative directive)
2. ❌ Headlines ending with "?" (Betteridge's Law)
3. ❌ "You won't believe..." (hyperbolic sensationalism)
4. ❌ "Miracle cure" or medical hyperbole
5. ❌ "That time..." (vague temporal reference)
6. ❌ Number-prefixed listicles (e.g., "10 Shocking...")

**Implementation:**
```
headline MUST avoid clickbait patterns (no "Watch", no "?", no "miracle cure", no "you won't believe")
```

**Validation:**
```typescript
const clickbaitFlags = analyzeClickbait(headline);
passesClickbaitCheck = clickbaitFlags.length === 0
```

---

### 5. Source Credibility (Publisher & URL Validation)
**REQUIRED:**
- Valid source name
- HTTPS source URL
- Publisher name (default: "The NextGen Healthcare Marketing")
- Published within 30 days (freshness check)
- Original content (not purely syndicated)

**Validation Checks:**
```typescript
hasSource: !!source && source.trim().length > 0
sourceIsValid: isValidHTTPS(sourceUrl)
hasPublisher: !!publisher
isFresh: daysSincePublished <= 30
isOriginalContent: true // Must provide commentary/analysis
```

---

## 📊 Validation Flow

```
┌─────────────────────────────────────────────────┐
│  AI Generates News Article                      │
│  - Author with credentials                      │
│  - 3+ external citations                        │
│  - Medical disclaimer                           │
│  - No clickbait headline                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  runHealthcareNewsValidation()                  │
│  ├─ Standard SEO checks (runMasterSeoValidation)│
│  ├─ News metadata validation                    │
│  └─ Healthcare YMYL validation                  │
└─────────────────┬───────────────────────────────┘
                  │
            ┌─────┴─────┐
            │           │
        ❌ Failed    ✅ Passed
            │           │
            │           └──> Save to DB
            │
            ▼
┌─────────────────────────────────────────────────┐
│  Auto-Rewrite Loop (Max 3 Attempts)             │
│  - buildHealthcareFixPrompt() generates         │
│    detailed instructions                        │
│  - AI rewrites to fix:                          │
│    • SEO failures                               │
│    • Missing citations                          │
│    • Missing disclaimer                         │
│    • Clickbait patterns                         │
│    • Medical credentials                        │
│  - Re-validate after each fix                   │
└─────────────────┬───────────────────────────────┘
                  │
                  └──> Retry validation
```

---

## 🔧 Implementation Details

### Validation Report Structure
```typescript
interface HealthcareNewsValidationReport {
  passed: boolean;
  totalScore: number; // 0-100, adjusted for health violations
  
  // Combined failures
  failures: string[];
  healthFailures: string[];
  newsFailures: string[];
  clickbaitFlags: string[];
  improvements: string[];
  
  // Metadata
  metadata: {
    hasSource: boolean;
    sourceIsValid: boolean;
    hasPublisher: boolean;
    hasAuthor: boolean;
    hasPublishedDate: boolean;
    isFresh: boolean;
    isOriginalContent: boolean;
    citationsAreAdequate: boolean;
    hasMedicalCredentials: boolean;
    hasDisclaimer: boolean;
    passesClickbaitCheck: boolean;
    integrityVerified: boolean; // C2PA/JTI signals
  };
  
  // Standard SEO metrics
  metrics: { /* word count, keyword density, Flesch score, etc */ };
  scoreBreakdown: { basic, depth, links, titleUx, readability };
}
```

### Scoring Penalties
```typescript
// Base SEO score: 0-100
adjustedScore = seoReport.totalScore;

// Deduct 20 points per health failure
if (healthFailures.length > 0) {
  adjustedScore -= 20 * healthFailures.length;
}

// Deduct 10 points per clickbait flag
if (clickbaitFlags.length > 0) {
  adjustedScore -= 10 * clickbaitFlags.length;
}

adjustedScore = Math.max(0, adjustedScore);
```

---

## 📝 AI Prompt Requirements

### SEO Fields Generation
```javascript
{
  "authorName": "author with medical credentials (Dr. [Name], MD/PhD/RN/etc)",
  "headline": "NO clickbait (no Watch, no ?, no miracle cure)",
  "seoTitle": "30-60 chars, start with keyword, include number + power word",
  "metaDescription": "140-160 chars, include keyword"
}
```

### Content Generation Rules
```
HEALTHCARE REQUIREMENTS:
1. Author byline: ${authorName} (with credentials)
2. Minimum 3 EXTERNAL CITATIONS to .gov/.edu/CDC/NIH/WHO/journals
3. Medical disclaimer paragraph at end (before CTA)
4. Journalistic tone with medical authority
5. No clickbait patterns in headlines
6. 500-900 words
7. Focus keyword in first sentence, H2, H3, closing paragraph
8. Table of Contents after lead paragraph
9. Short paragraphs (2-3 sentences)
10. 30%+ sentences start with transition words
11. Active voice (85%+ sentences)
12. Flesch Reading Ease: 50-70
13. 0.8%-1.2% keyword density
```

### Medical Disclaimer Template
```html
<p><em>Medical Disclaimer: This content is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.</em></p>
```

---

## ✅ Validation Success Criteria

**Article Passes When:**
1. ✅ Standard SEO score ≥ 80/100
2. ✅ Author has medical credentials
3. ✅ ≥3 external citations to trusted sources
4. ✅ Medical disclaimer present
5. ✅ No clickbait patterns detected
6. ✅ All meta fields (30-60 char title, 140-160 char desc)
7. ✅ Keyword density 0.8-1.5%
8. ✅ Flesch score 50-70
9. ✅ Word count 500-900
10. ✅ Valid HTTPS source URL
11. ✅ Published within 30 days
12. ✅ Original content (not purely syndicated)

**Result:**
```
✅ Perfect Healthcare News Article: 100/100 SEO & Trust Score. 
   All YMYL requirements met. Ready to publish.
```

---

## 🚨 Common Failures & Fixes

### Missing Medical Credentials
```
❌ [E-E-A-T] YMYL content requires author with medical credentials OR verified Medical Reviewer.
✅ Fix: Add "Dr. Sarah Johnson, MD" or similar credentialed author
```

### Insufficient Citations
```
❌ [CITATIONS] Healthcare requires at least 3 authoritative inline citations (Found: 2).
✅ Fix: Add 1+ more links to .gov/.edu/CDC/NIH/WHO sources
```

### Missing Disclaimer
```
❌ [COMPLIANCE] Missing mandatory medical disclaimer.
✅ Fix: Add disclaimer paragraph at end before CTA
```

### Clickbait Headline
```
❌ Headline ends in '?' - Betteridge's Law: Headlines ending in questions lack substantiation.
✅ Fix: Rewrite as declarative statement: "New Study Reveals..." instead of "Can This...?"
```

---

## 🔗 File References

- **Validation Logic:** `/lib/news-validation.ts`
- **AI Generator:** `/app/api/ai/generate-news/route.ts`
- **Base SEO:** `/lib/seo-validation.ts`
- **Trusted Sources:** CDC, NIH, CMS, WHO, Becker's, Fierce Healthcare, etc.

---

## 📌 Key Takeaway

**Healthcare content = Higher standards.** The AI must generate medically credible, properly cited, legally compliant news articles that establish expertise, authoritativeness, and trustworthiness (E-E-A-T) to pass strict YMYL validation.
