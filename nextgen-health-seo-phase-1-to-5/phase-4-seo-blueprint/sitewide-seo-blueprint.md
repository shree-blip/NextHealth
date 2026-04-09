# Sitewide SEO Blueprint

**Site:** thenextgenhealth.com
**Blueprint Date:** 8 April 2026

---

## Vision

Transform thenextgenhealth.com from a 44-page brochure-style site into a **120+ page content authority** in the healthcare marketing space. This blueprint provides the architectural, technical, and content framework to achieve first-page Google rankings for 50+ high-value healthcare marketing keywords within 12 months.

---

## 1. Site Architecture Overhaul

### 1.1 Current Architecture

```
/                           ← Home
├── /about
├── /contact
├── /pricing
├── /book-a-demo
├── /team
├── /locations              ← Empty (no sub-pages)
├── /services
│   ├── /seo-local-search
│   ├── /google-ads
│   ├── /meta-ads
│   ├── /website-design-dev
│   ├── /social-media-marketing
│   ├── /content-copywriting
│   ├── /email-drip-campaigns
│   ├── /google-business-profile
│   ├── /brand-identity-design
│   ├── /brochure-print-design
│   ├── /analytics-reporting
│   ├── /strategy-planning
│   └── /on-site-field-marketing
├── /industries             ← Empty (no sub-pages)
├── /automation             ← No sub-pages
├── /case-studies           ← No individual pages
├── /proven-results
├── /blog                   ← 7 posts
├── /news                   ← 7 articles
├── /hipaa
├── /privacy
└── /terms
```

### 1.2 Target Architecture (12-Month)

```
/                           ← Home (optimised)
├── /about                  ← Expanded with E-E-A-T
├── /contact                ← With LocalBusiness schema
├── /pricing                ← With FAQ schema
├── /book-a-demo            ← Conversion-optimised
├── /team                   ← Individual bios with Person schema
│   ├── /team/[member-slug] ← Author pages
├── /locations              ← Hub with city pages
│   ├── /locations/dallas
│   ├── /locations/houston
│   ├── /locations/austin
│   ├── /locations/san-antonio
│   └── /locations/fort-worth
├── /services               ← Hub (optimised)
│   ├── [13 existing service pages — all optimised]
├── /industries             ← Hub with vertical pages
│   ├── /industries/dental
│   ├── /industries/urgent-care
│   ├── /industries/medspa
│   ├── /industries/freestanding-ers
│   ├── /industries/mental-health
│   ├── /industries/primary-care
│   ├── /industries/chiropractic
│   ├── /industries/plastic-surgery
│   ├── /industries/ophthalmology
│   └── /industries/dermatology
├── /automation             ← Hub with template pages
│   ├── /automation/ai-chatbot
│   ├── /automation/patient-intake
│   ├── /automation/review-collection
│   ├── /automation/appointment-reminders
│   ├── /automation/insurance-verification
│   ├── /automation/recall-campaigns
│   ├── /automation/social-media-scheduling
│   └── /automation/reporting-dashboards
├── /case-studies           ← Hub with individual studies
│   ├── /case-studies/[study-slug]  ← 6+ case studies
├── /proven-results         ← With aggregate data
├── /blog                   ← 30+ posts, clustered
│   ├── /blog/[post-slug]
├── /news                   ← 30+ articles, current
│   ├── /news/[article-slug]
├── /hipaa                  ← Trust anchor page
├── /faq                    ← NEW — with FAQ schema
├── /sitemap                ← NEW — HTML sitemap
├── /privacy
└── /terms
```

---

## 2. Technical SEO Blueprint

### 2.1 Schema Markup Implementation

Implement via JSON-LD in Next.js `<head>` using the metadata API or a shared component.

| Schema Type | Pages | Priority |
|---|---|---|
| Organization | Sitewide (home) | P0 |
| LocalBusiness | Home, Contact, Location pages | P0 |
| BreadcrumbList | Every page | P0 |
| Service | 13 service pages | P0 |
| Article | All blog posts | P0 |
| NewsArticle | All news articles | P0 |
| Person | Team member / author pages | P1 |
| FAQ | Pricing, service pages, FAQ page | P1 |
| HowTo | Automation template pages | P1 |
| AggregateRating / Review | Proven results, case studies | P2 |
| SoftwareApplication | Automation templates | P2 |

### 2.2 Breadcrumb Component

Create a shared `<Breadcrumbs />` component:

```tsx
// components/Breadcrumbs.tsx
interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  // Render visual breadcrumbs + BreadcrumbList JSON-LD
}
```

Place on every page above the H1.

### 2.3 Metadata Framework

Create a centralised metadata utility:

```tsx
// lib/seo.ts
export function generateMetadata(page: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    title: `${page.title} | NextGen Health`,
    description: page.description,
    openGraph: { ... },
    twitter: { ... },
    alternates: { canonical: `https://thenextgenhealth.com${page.path}` },
  };
}
```

### 2.4 Performance Targets

| Metric | Target | Current (Est.) |
|---|---|---|
| LCP | < 2.5s | Unknown — audit needed |
| FID/INP | < 200ms | Unknown |
| CLS | < 0.1 | Unknown |
| TTI | < 3.5s | Unknown |
| PageSpeed (mobile) | 90+ | Unknown |
| PageSpeed (desktop) | 95+ | Unknown |

### 2.5 Sitemap Segmentation

Split the dynamic sitemap into logical segments:

```
/sitemap.xml (index)
├── /sitemap-pages.xml   (core + service + industry + location + automation)
├── /sitemap-blog.xml    (blog posts)
├── /sitemap-news.xml    (news articles)
└── /sitemap-cases.xml   (case studies)
```

---

## 3. On-Page SEO Standards

### 3.1 Title Tag Formula

**Core pages:** `[Primary Keyword] — [USP/Modifier] | NextGen Health`
**Service pages:** `Healthcare [Service] Services | NextGen Health`
**Industry pages:** `[Industry] Marketing Agency | NextGen Health`
**Blog posts:** `[Title] — Healthcare Marketing Guide | NextGen Health`
**News articles:** `[Title] | Healthcare Marketing News`
**City pages:** `Healthcare Marketing in [City], Texas | NextGen Health`

**Max length:** 60 characters (including brand)

### 3.2 Meta Description Formula

**Structure:** `[Value proposition]. [Specific benefit]. [CTA].`
**Max length:** 155 characters
**Must include:** Primary keyword, CTA verb (Book, Learn, Discover, etc.)

### 3.3 H1 Tag Rules

- One H1 per page — always
- Must contain primary keyword
- Must differ from title tag (slight variation)
- Max 70 characters

### 3.4 Heading Hierarchy

```
H1: Primary keyword + page topic
  H2: Major section headings (contain secondary keywords)
    H3: Sub-section headings (contain long-tail terms)
      H4: Minor detail headings (as needed)
```

### 3.5 Content Length Standards

| Page Type | Minimum Words | Target Words |
|---|---|---|
| Core pages | 800 | 1,200–1,500 |
| Service pages | 1,200 | 1,500–2,000 |
| Industry pages | 1,500 | 2,000–2,500 |
| Blog pillar posts | 2,000 | 2,500–3,500 |
| Blog standard posts | 800 | 1,200–1,500 |
| News articles (short) | 400 | 600–800 |
| News articles (in-depth) | 800 | 1,200–1,500 |
| Case studies | 1,000 | 1,200–1,500 |
| Automation templates | 600 | 800–1,200 |
| City pages | 600 | 800–1,200 |

---

## 4. Internal Linking Standards

### 4.1 Minimum Links Per Page

| Page Type | Min. Outbound Internal Links | Sources |
|---|---|---|
| Service pages | 8 | 3 related services + 2 blog posts + HIPAA + CTA + related industry |
| Blog posts | 5 | 2 service pages + 1 previous post + 1 related post + CTA |
| News articles | 4 | 1 service page + 1 blog post + 1 news article + CTA |
| Industry pages | 8 | 3 services + 2 blog posts + 1 case study + HIPAA + CTA |
| City pages | 6 | 2 services + 1 case study + contact + book demo + HIPAA |
| Automation pages | 6 | 2 services + HIPAA + blog + automation hub + CTA |

### 4.2 Anchor Text Guidelines

- Use keyword-rich anchor text (not "click here")
- Vary anchor text — don't use identical anchors for same target
- Prefer natural in-content links over sidebar/footer links
- Link from high-authority pages to important target pages

---

## 5. Content Production Framework

### 5.1 Blog Content Brief Template

Each blog post should follow:

```
Title: [Keyword-rich, 50–60 chars]
Meta Description: [155 chars with CTA]
Target Keyword: [primary]
Secondary Keywords: [2–3]
Word Count: [target]
Content Type: Pillar / Standard / List / How-To / Comparison
Outline:
  - Introduction (hook + keyword)
  - [H2 sections with secondary keywords]
  - Key takeaways / summary
  - CTA (book demo / contact / related service)
Internal Links:
  - Link 1: [page] with anchor [text]
  - Link 2: [page] with anchor [text]
  - Link 3: [page] with anchor [text]
Schema: Article
Author: [team member]
```

### 5.2 Industry Page Template

```
H1: [Industry] Marketing — Grow Your [Practice Type]
Section 1: Industry Challenges (3–5 bullet points)
Section 2: Our Tailored Services (link to relevant service pages)
Section 3: Results / Mini Case Study
Section 4: Why Choose NextGen Health
Section 5: FAQ (3–5 questions with FAQ schema)
Section 6: CTA — Book a Demo
```

### 5.3 Case Study Page Template

```
H1: [Client Type] Case Study — [Result Headline]
Section 1: The Challenge
Section 2: Our Strategy
Section 3: Execution / What We Did
Section 4: Results (with data — charts, percentages, numbers)
Section 5: Client Testimonial
Section 6: Related Services
Section 7: CTA — Get Similar Results
```

---

## 6. Off-Page & Authority Building

### 6.1 Backlink Strategy

| Tactic | Priority | Expected Links/Month |
|---|---|---|
| Guest posts on healthcare industry blogs | P0 | 2–4 |
| Healthcare directory listings | P0 | 5–10 (one-time) |
| Press releases for milestones | P1 | 1–2 |
| Partner cross-linking (tech partners, agencies) | P1 | 1–2 |
| Local business directories (Texas) | P0 | 10–20 (one-time) |
| HARO / Connectively responses | P1 | 1–2 |
| Industry award submissions | P2 | Seasonal |

### 6.2 Google Business Profile Optimisation

- Ensure NAP consistency across all citations
- Post weekly GBP updates
- Respond to all reviews within 24 hours
- Add services and products to GBP
- Add Q&A with keyword-rich answers
- Upload new photos monthly

### 6.3 Local Citation Building

Target top local directories:
- Yelp, BBB, Clutch, UpCity, Agency Spotter
- Healthcare-specific: HCMA, SHSMD
- Texas-specific: Texas Chamber of Commerce, local chambers

---

## 7. Measurement & KPIs

### 7.1 Monthly Tracking

| KPI | Baseline Target | 6-Month Target | 12-Month Target |
|---|---|---|---|
| Organic Sessions | Current level | +50% | +150% |
| Keyword Rankings (top 10) | Estimate 5–10 | 25+ | 50+ |
| Indexable Pages | 44 | 103 | 130–150 |
| Blog Posts Published | 7 total | 31+ | 55+ |
| Domain Authority / Rating | Current | +5 points | +10 points |
| Core Web Vitals (all green) | Unknown | All green | All green |
| Organic Leads (form fills) | Current level | +40% | +100% |
| Average Session Duration | Current | +20% | +40% |
| Pages Per Session | Current | +30% | +50% |
