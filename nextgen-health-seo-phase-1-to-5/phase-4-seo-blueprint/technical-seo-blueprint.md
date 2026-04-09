# Technical SEO Blueprint

**Site:** thenextgenhealth.com
**Blueprint Date:** 8 April 2026

---

## 1. Core Web Vitals Optimisation

### Target Scores

| Metric | Target | Tool |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5 seconds | PageSpeed Insights / Lighthouse |
| Interaction to Next Paint (INP) | < 200 ms | PageSpeed Insights / CrUX |
| Cumulative Layout Shift (CLS) | < 0.1 | PageSpeed Insights / Lighthouse |
| Mobile PageSpeed Score | 90+ | PageSpeed Insights |
| Desktop PageSpeed Score | 95+ | PageSpeed Insights |

### Image Optimisation

| Action | Implementation | Priority |
|---|---|---|
| Use `next/image` for all images | Automatic format (WebP/AVIF) + sizing | P0 |
| Set explicit width + height | Prevents CLS | P0 |
| Lazy load below-fold images | `loading="lazy"` (default in next/image) | P0 |
| Optimise hero/LCP images | `priority` prop on above-fold images | P0 |
| Use responsive `sizes` attribute | Serve appropriate size per viewport | P1 |
| Create OG images (1200×630px) | Per-page or per-section | P1 |

### Font Optimisation

| Action | Implementation | Priority |
|---|---|---|
| Use `next/font` | Automatic font optimisation + self-hosting | P0 |
| Subset fonts | Only load needed character sets | P1 |
| `font-display: swap` | Prevent invisible text during loading | P0 |
| Limit font families | Max 2 families (heading + body) | P1 |

### JavaScript Optimisation

| Action | Implementation | Priority |
|---|---|---|
| Code splitting | Next.js automatic per-route | ✅ Built-in |
| Tree shaking | Ensure no unused imports | P1 |
| Defer non-critical scripts | ChatBot, analytics | P0 |
| Lazy load ChatBot component | `dynamic(() => import('./ChatBot'), { ssr: false })` | P0 |
| Minimise third-party scripts | Audit and remove unused | P1 |

### CSS Optimisation

| Action | Implementation | Priority |
|---|---|---|
| Tailwind CSS purge | PostCSS purge (should be configured) | P0 |
| Critical CSS inlining | Next.js handles automatically | ✅ Built-in |
| Remove unused CSS | Audit globals.css | P1 |

---

## 2. Crawlability & Indexation

### Robots.txt Configuration

```
# robots.ts should generate:
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /login/
Disallow: /signup/
Disallow: /profile/
Disallow: /api/
Disallow: /applet/

Sitemap: https://thenextgenhealth.com/sitemap.xml
```

### Sitemap Configuration

**Current:** Single dynamic sitemap via `sitemap.ts`
**Recommended:** Segmented sitemap index

```xml
<!-- sitemap.xml (index) -->
<sitemapindex>
  <sitemap><loc>https://thenextgenhealth.com/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>https://thenextgenhealth.com/sitemap-blog.xml</loc></sitemap>
  <sitemap><loc>https://thenextgenhealth.com/sitemap-news.xml</loc></sitemap>
  <sitemap><loc>https://thenextgenhealth.com/sitemap-cases.xml</loc></sitemap>
</sitemapindex>
```

Each sitemap should include:
- `<loc>` — Full canonical URL
- `<lastmod>` — Last modified date
- `<changefreq>` — Estimated change frequency
- `<priority>` — Relative priority (0.0–1.0)

### Priority Values

| Page Type | Priority | Change Frequency |
|---|---|---|
| Home | 1.0 | weekly |
| Service pages | 0.9 | monthly |
| Industry pages | 0.8 | monthly |
| Core pages | 0.7 | monthly |
| Blog posts | 0.6 | yearly (unless updated) |
| News articles | 0.6 | yearly |
| Legal pages | 0.3 | yearly |

### Noindex Pages

These pages MUST have `<meta name="robots" content="noindex, nofollow">`:

- `/dashboard/*` — All dashboard pages
- `/login` — Login page
- `/signup` — Signup page
- `/profile/*` — User profile pages
- `/applet/*` — Internal applet pages

### Canonical Tags

| Rule | Implementation |
|---|---|
| Self-referencing canonical on every indexable page | ✅ Required |
| No trailing slash inconsistencies | Pick one format and enforce |
| HTTPS always | ✅ Vercel handles |
| No query string in canonical | Strip UTM params from canonical |
| Redirected pages don't appear in sitemap | ✅ Required |

---

## 3. URL Structure

### Current URL Patterns (Good)

```
/services/[slug]          → Clean, descriptive
/blog/[slug]              → Clean, descriptive
/news/[slug]              → Clean, descriptive
```

### Planned URL Additions

```
/industries/[slug]        → Industry vertical pages
/automation/[slug]        → Automation template pages
/locations/[slug]         → City pages
/case-studies/[slug]      → Individual case studies
/team/[slug]              → Author/team member pages
/faq                      → FAQ page
/sitemap                  → HTML sitemap
```

### URL Rules
- Lowercase only
- Hyphens between words (never underscores)
- No stop words unless needed for clarity
- Max 3 directory levels deep
- Descriptive and keyword-rich
- No dates in URLs (except annual roundups)
- No IDs or database keys in URLs

---

## 4. Redirect Strategy

### Required 301 Redirects

| From | To | Reason |
|---|---|---|
| `/news/healthcare-seo-trends-2023` | `/news/healthcare-seo-trends-2026` | Updated slug |
| `/news/telehealth-marketing-strategies-2023` | `/news/telehealth-marketing-strategies-2026` | Updated slug |

### Redirect Implementation

In `next.config.ts`:

```typescript
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/news/healthcare-seo-trends-2023',
        destination: '/news/healthcare-seo-trends-2026',
        permanent: true, // 301
      },
      {
        source: '/news/telehealth-marketing-strategies-2023',
        destination: '/news/telehealth-marketing-strategies-2026',
        permanent: true,
      },
    ];
  },
};
```

### Redirect Rules
- Always use 301 (permanent) for content moves
- Never redirect to a page that itself redirects (no chains)
- Monitor redirects in Search Console for errors
- Remove old URLs from sitemap after redirect

---

## 5. Security & HTTPS

| Check | Status | Action |
|---|---|---|
| HTTPS everywhere | ✅ Vercel enforces | None |
| HSTS header | ✅ Vercel default | Verify |
| HTTP → HTTPS redirect | ✅ Vercel default | Verify |
| Mixed content | Unknown | Audit for HTTP resources |
| Content Security Policy | Unknown | Consider implementing |

---

## 6. Internationalisation (Not Needed Currently)

- Site is English-only (British English)
- No hreflang tags needed
- If expanding to other languages in future, implement hreflang with `x-default`

---

## 7. Structured Data Testing

| Tool | URL | Frequency |
|---|---|---|
| Google Rich Results Test | https://search.google.com/test/rich-results | After each schema change |
| Schema.org Validator | https://validator.schema.org/ | Weekly during implementation |
| Google Search Console | Enhancements tab | Weekly monitoring |

---

## 8. Monitoring & Maintenance

### Weekly Checks
- Google Search Console: Coverage, Enhancements, Core Web Vitals
- Check for new crawl errors
- Verify new pages are indexed

### Monthly Checks
- Full site crawl (Screaming Frog or similar)
- Core Web Vitals audit via PageSpeed Insights
- Check for orphan pages
- Verify all redirects are working
- Schema validation audit

### Quarterly Checks
- Full technical SEO audit
- Competitor technical comparison
- Performance benchmark vs. previous quarter
- URL structure review for new content

---

## 9. Implementation Priority

| Phase | Actions | Timeframe |
|---|---|---|
| P0 (Immediate) | robots.txt review, canonical audit, noindex auth pages, hero image optimisation, chatbot lazy loading | Week 1 |
| P1 (Month 1) | Schema implementation (Organization, BreadcrumbList, Service, Article), image optimisation pass, font optimisation | Month 1 |
| P2 (Month 2) | Sitemap segmentation, 301 redirects for "2023" articles, FAQ schema, Person schema | Month 2 |
| P3 (Ongoing) | CWV monitoring, new page schema, crawl audits, redirect management | Ongoing |
