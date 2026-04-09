# Sitewide SEO Gap Analysis

**Site:** thenextgenhealth.com
**Audit Date:** 8 April 2026

---

## Executive Summary

The NextGen Health website has a strong foundational structure built on Next.js 15 with server-side rendering, but it suffers from **critical gaps in technical SEO implementation, content depth, and on-page optimisation**. The site currently indexes approximately 44 pages across 17 core static pages, 13 service detail pages, 7 blog posts, and 7 news articles. The most significant gaps are: (1) zero structured data / schema markup across all pages, (2) missing industry vertical sub-pages, (3) no automation sub-pages, (4) no individual case study pages, (5) no city/location pages, and (6) thin content volume relative to the breadth of services offered.

---

## 1. Technical SEO Gaps

### 1.1 Structured Data / Schema Markup — **CRITICAL**

| Issue | Impact | Current State |
|---|---|---|
| No Organization schema | Google Knowledge Panel eligibility lost | Not present on any page |
| No LocalBusiness schema | Local pack eligibility reduced | Not present |
| No Service schema | Rich results for services lost | Not present on 13 service pages |
| No Article schema | Article rich results lost | Not present on 7 blog + 7 news pages |
| No BreadcrumbList schema | Breadcrumb rich results lost | Not present |
| No FAQ schema | FAQ rich results lost | Not present on pages with FAQ content |
| No Review / AggregateRating schema | Star ratings in SERPs lost | Not present |

**Estimated Impact:** Structured data gaps likely account for 15–25% missed click-through rate opportunity across all pages.

### 1.2 Crawlability & Indexation

| Issue | Impact | Status |
|---|---|---|
| `robots.ts` present | Positive — dynamic robots generation | ✅ Present |
| `sitemap.ts` present | Positive — dynamic sitemap generation | ✅ Present |
| No XML sitemap segmentation | Large sitemaps harder for crawlers | ⚠️ Minor gap |
| Dashboard & auth pages | Must be blocked from indexation | ⚠️ Verify noindex |
| No canonical tags verified | Potential duplicate content risk | ⚠️ Needs audit |
| No hreflang tags | N/A — single-language site | ✅ Not needed |

### 1.3 Core Web Vitals & Performance

| Issue | Impact | Status |
|---|---|---|
| Next.js SSR/SSG | Positive — good for CWV | ✅ Present |
| Image optimisation (next/image) | Positive — automatic optimisation | ⚠️ Verify usage across all pages |
| Font loading strategy | Affects CLS and LCP | ⚠️ Needs audit |
| Third-party script impact | Can degrade CWV | ⚠️ ChatBot, analytics scripts |
| No lazy loading for below-fold images | Affects LCP | ⚠️ Needs verification |

### 1.4 Mobile Optimisation

| Issue | Impact | Status |
|---|---|---|
| Responsive design | Essential for mobile-first indexing | ✅ Tailwind CSS responsive |
| Mobile navigation | User experience | ⚠️ Needs testing |
| Touch targets | Accessibility + UX | ⚠️ Needs testing |

---

## 2. Content Gaps

### 2.1 Missing Page Categories — **CRITICAL**

| Missing Content | Expected Pages | Impact |
|---|---|---|
| Industry vertical sub-pages | 6–10 pages (dental, urgent care, medspa, freestanding ER, mental health, primary care, chiropractic, plastic surgery) | **Very High** — Can't rank for industry-specific queries |
| Automation template sub-pages | 5–8 pages (AI chatbot, patient intake, review collection, appointment reminders, insurance verification, recall campaigns) | **High** — Core differentiator not surfaced |
| Individual case study pages | 3–6 pages | **High** — Critical for conversion |
| City/location pages | 4–6 pages (Dallas, Houston, Austin, San Antonio, Fort Worth) | **High** — Can't rank for "[service] + [city]" queries |
| FAQ page | 1 page | **Medium** — Missing FAQ schema opportunity |
| Glossary/resource hub | 1 page | **Low** — Nice-to-have for topical authority |

**Total Missing Pages:** 20–37 pages

### 2.2 Content Depth Gaps

| Page / Section | Issue | Recommendation |
|---|---|---|
| Blog (7 posts) | Very thin for a marketing agency | Target 30+ posts within 6 months |
| News (7 articles) | 2 articles dated "2023" — appear stale | Update dates, increase cadence to 6–8/month |
| Service pages | Some lack depth (under 800 words) | Expand each to 1,200–1,800 words minimum |
| About page | Lacks E-E-A-T depth | Add founder story, credentials, certifications |
| Team page | Unknown depth | Add individual bios with qualifications |

### 2.3 Content Freshness

| Issue | Pages Affected | Impact |
|---|---|---|
| "2023" in news article titles/slugs | 2 articles | **High** — Signals outdated content to users and search engines |
| No visible "last updated" dates | All pages | **Medium** — Missing freshness signals |
| Low blog publishing cadence | Blog hub | **High** — Competitors publishing 4–8x more |

---

## 3. On-Page SEO Gaps

### 3.1 Title Tags

| Issue | Pages Affected | Impact |
|---|---|---|
| Missing "healthcare" modifier in service page titles | Most service pages | **High** — Reduces keyword relevance for core terms |
| No geographic modifier in title tags | All pages | **Medium** — Reduces local ranking signals |
| Titles may exceed 60 characters | Unknown — needs audit | **Medium** — Truncation in SERPs |
| Generic titles without value propositions | Some service pages | **Medium** — Lower CTR |

### 3.2 Meta Descriptions

| Issue | Pages Affected | Impact |
|---|---|---|
| Generic or missing meta descriptions | Needs per-page audit | **High** — Google may auto-generate worse descriptions |
| No CTA in meta descriptions | Most pages | **Medium** — Lower CTR |
| No USP differentiation | Most pages | **Medium** — Undifferentiated in SERPs |

### 3.3 Heading Structure

| Issue | Pages Affected | Impact |
|---|---|---|
| H1 tags may not contain primary keyword | Several service pages | **High** — Primary on-page signal weakened |
| Heading hierarchy (H1→H2→H3) | Needs per-page audit | **Medium** — Semantic structure signals |
| Missing keyword-rich H2 subheadings | Blog and news content | **Medium** — Supporting keyword opportunities lost |

### 3.4 Internal Linking — **CRITICAL**

| Issue | Impact | Current State |
|---|---|---|
| No breadcrumb navigation | Reduced crawlability, no breadcrumb rich results | Not present on any page |
| Weak cross-linking between services | Reduced PageRank flow and topical relevance | Minimal |
| No contextual in-content links | Reduced topical authority | Minimal in blog/news content |
| No "related posts" on blog articles | Reduced engagement and crawl depth | Not present |
| No "related services" on service pages | Reduced cross-sell and crawl depth | Minimal |
| Service pages don't link to supporting blog content | Content cluster fragmented | Not present |
| HIPAA page not linked from service pages | Trust signal not distributed | Needs verification |

### 3.5 Image SEO

| Issue | Impact | Status |
|---|---|---|
| Alt text on images | Accessibility + image search | ⚠️ Needs audit |
| Descriptive file names | Image search ranking | ⚠️ Needs audit |
| Image compression | Page speed | ⚠️ next/image handles but verify |

---

## 4. Off-Page & Authority Gaps

### 4.1 E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

| Signal | Status | Gap |
|---|---|---|
| Author attribution on content | Not present | **Critical** — YMYL content needs clear authorship |
| Author bio pages | Not present | **High** — Reduced E-E-A-T signals |
| Credentials / certifications displayed | Minimal | **Medium** — Add healthcare marketing certifications |
| Client testimonials with attribution | Unknown | **Medium** — Add to service and case study pages |
| Published case studies | Hub exists, no individual pages | **High** — Prove expertise with data |
| Industry thought leadership | Minimal blog volume | **High** — Increase content cadence |

### 4.2 Local SEO

| Signal | Status | Gap |
|---|---|---|
| Google Business Profile | Connected (GMBConnection table) | Verify optimisation |
| NAP consistency | Unknown | Audit across web |
| Local citations | Unknown | Build/verify |
| City-specific landing pages | Not present | **Critical** — Create for key TX metros |
| LocalBusiness schema | Not present | **Critical** — Implement |

### 4.3 Backlink Profile

| Signal | Status | Recommendation |
|---|---|---|
| Domain authority/rating | Unknown | Audit with Ahrefs/Moz |
| Referring domains | Unknown | Build through guest posts, PR, partnerships |
| Toxic links | Unknown | Audit and disavow if needed |
| Competitor backlink gap | Unknown | Conduct competitor backlink analysis |

---

## 5. Gap Priority Summary

| Priority | Gap Category | Estimated Impact | Effort |
|---|---|---|---|
| 🔴 Critical | Structured data / schema markup | Very High | Medium |
| 🔴 Critical | Industry vertical sub-pages (0 exist) | Very High | High |
| 🔴 Critical | Internal linking & breadcrumbs | Very High | Medium |
| 🔴 Critical | Author attribution / E-E-A-T | High | Low |
| 🟠 High | Automation template sub-pages | High | High |
| 🟠 High | City/location pages | High | Medium |
| 🟠 High | Case study individual pages | High | Medium |
| 🟠 High | Blog content volume (7 → 30+) | High | High |
| 🟠 High | Stale "2023" news articles | High | Low |
| 🟡 Medium | Title tag optimisation | Medium | Low |
| 🟡 Medium | Meta description optimisation | Medium | Low |
| 🟡 Medium | Service page content depth | Medium | Medium |
| 🟢 Low | FAQ page | Low | Low |
| 🟢 Low | Glossary/resource hub | Low | Low |
