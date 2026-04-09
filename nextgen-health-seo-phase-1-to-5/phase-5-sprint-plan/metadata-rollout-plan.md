# Metadata Rollout Plan

**Site:** thenextgenhealth.com
**Date:** 8 April 2026

> Page-by-page implementation plan for title tags, meta descriptions, OG tags, and canonical URLs across all 44 indexed pages. Implementation in Next.js App Router `metadata` exports.

---

## Implementation Approach

### Next.js App Router Metadata Pattern

Each page file (`page.tsx`) should export a `metadata` object or `generateMetadata()` function:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Optimised Title]',
  description: '[Optimised Description]',
  alternates: {
    canonical: 'https://thenextgenhealth.com/[path]',
  },
  openGraph: {
    title: '[OG Title]',
    description: '[OG Description]',
    url: 'https://thenextgenhealth.com/[path]',
    siteName: 'NextGen Health',
    images: [{ url: '/images/og/[page]-og.png', width: 1200, height: 630, alt: '[Alt text]' }],
    locale: 'en_GB',
    type: 'website', // or 'article' for blog/news
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Title]',
    description: '[Description]',
    images: ['/images/og/[page]-og.png'],
  },
};
```

### For Dynamic Routes (Blog, News)

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://thenextgenhealth.com/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.featuredImage || '/images/og/blog-default-og.png' }],
    },
  };
}
```

---

## Rollout Phases

| Phase | Pages | Target Date | Owner |
|---|---|---|---|
| Phase A | Home + Top 5 core pages | Day 1 | SEO + Dev |
| Phase B | Remaining 11 core pages | Day 2–3 | SEO + Dev |
| Phase C | 13 service pages | Day 3–4 | SEO + Dev |
| Phase D | 7 blog posts (dynamic) | Day 4–5 | SEO + Dev |
| Phase E | 7 news articles (dynamic) | Day 5 | SEO + Dev |
| Phase F | OG image generation | Day 5–7 | Designer + Dev |

---

## Phase A — Home + Top 5 Core Pages (Day 1)

### 1. Home Page (`/`)

| Field | Value |
|---|---|
| **File** | `app/page.tsx` |
| **Title** | `Healthcare Marketing Agency — SEO, PPC & Web Design | NextGen Health` |
| **Description** | `NextGen Health is a full-service healthcare marketing agency. We help clinics grow with SEO, Google Ads, social media, website design, and HIPAA-compliant automation.` |
| **Canonical** | `https://thenextgenhealth.com/` |
| **OG Type** | `website` |
| **OG Image** | `/images/og/home-og.png` |

### 2. About (`/about`)

| Field | Value |
|---|---|
| **File** | `app/about/page.tsx` |
| **Title** | `About NextGen Health — Healthcare Marketing Experts` |
| **Description** | `Learn about NextGen Health, the healthcare marketing agency trusted by clinics nationwide. Meet our team, our mission, and our approach to growing medical practices.` |
| **Canonical** | `https://thenextgenhealth.com/about` |
| **OG Image** | `/images/og/about-og.png` |

### 3. Contact (`/contact`)

| Field | Value |
|---|---|
| **File** | `app/contact/page.tsx` |
| **Title** | `Contact NextGen Health — Speak to a Healthcare Marketing Expert` |
| **Description** | `Get in touch with NextGen Health. Book a free consultation to discuss SEO, Google Ads, website design, and marketing automation for your healthcare practice.` |
| **Canonical** | `https://thenextgenhealth.com/contact` |
| **OG Image** | `/images/og/contact-og.png` |

### 4. Pricing (`/pricing`)

| Field | Value |
|---|---|
| **File** | `app/pricing/page.tsx` |
| **Title** | `Healthcare Marketing Pricing & Plans | NextGen Health` |
| **Description** | `Transparent pricing for healthcare marketing services. Choose from SEO, Google Ads, social media, and website design packages tailored for clinics and medical practices.` |
| **Canonical** | `https://thenextgenhealth.com/pricing` |
| **OG Image** | `/images/og/pricing-og.png` |

### 5. Book a Demo (`/book-a-demo`)

| Field | Value |
|---|---|
| **File** | `app/book-a-demo/page.tsx` |
| **Title** | `Book a Free Healthcare Marketing Demo | NextGen Health` |
| **Description** | `Schedule a free demo to see how NextGen Health can grow your clinic. We'll show you our SEO, ads, and automation solutions tailored for healthcare.` |
| **Canonical** | `https://thenextgenhealth.com/book-a-demo` |
| **OG Image** | `/images/og/demo-og.png` |

### 6. Services Hub (`/services`)

| Field | Value |
|---|---|
| **File** | `app/services/page.tsx` |
| **Title** | `Healthcare Marketing Services | NextGen Health` |
| **Description** | `Full-service healthcare marketing: SEO, Google Ads, social media, email campaigns, website design, content marketing, and HIPAA-compliant automation for clinics.` |
| **Canonical** | `https://thenextgenhealth.com/services` |
| **OG Image** | `/images/og/services-og.png` |

---

## Phase B — Remaining Core Pages (Day 2–3)

### 7. Team (`/team`)

| Field | Value |
|---|---|
| **File** | `app/team/page.tsx` |
| **Title** | `Our Team — Healthcare Marketing Professionals | NextGen Health` |
| **Description** | `Meet the NextGen Health team. Experienced healthcare marketing professionals specialising in SEO, PPC, content strategy, and medical practice growth.` |
| **Canonical** | `https://thenextgenhealth.com/team` |

### 8. Locations (`/locations`)

| Field | Value |
|---|---|
| **File** | `app/locations/page.tsx` |
| **Title** | `Our Locations — NextGen Health Office Locations` |
| **Description** | `Find NextGen Health office locations. We serve healthcare practices nationwide with local expertise in SEO, Google Ads, and medical marketing.` |
| **Canonical** | `https://thenextgenhealth.com/locations` |

### 9. Case Studies (`/case-studies`)

| Field | Value |
|---|---|
| **File** | `app/case-studies/page.tsx` |
| **Title** | `Healthcare Marketing Case Studies | NextGen Health` |
| **Description** | `See proven results from our healthcare marketing clients. Case studies covering SEO, Google Ads, social media, and website design for clinics.` |
| **Canonical** | `https://thenextgenhealth.com/case-studies` |

### 10. Proven Results (`/proven-results`)

| Field | Value |
|---|---|
| **File** | `app/proven-results/page.tsx` |
| **Title** | `Proven Results — Healthcare Marketing Performance | NextGen Health` |
| **Description** | `Verified results from NextGen Health clients. See real data on traffic growth, lead generation, and ROI from our healthcare marketing campaigns.` |
| **Canonical** | `https://thenextgenhealth.com/proven-results` |

### 11. Industries (`/industries`)

| Field | Value |
|---|---|
| **File** | `app/industries/page.tsx` |
| **Title** | `Industries We Serve — Healthcare Marketing by Speciality | NextGen Health` |
| **Description** | `Specialist healthcare marketing for dental, med spa, chiropractic, mental health, urgent care, and more. Industry-specific strategies that drive patient growth.` |
| **Canonical** | `https://thenextgenhealth.com/industries` |

### 12. Automation (`/automation`)

| Field | Value |
|---|---|
| **File** | `app/automation/page.tsx` |
| **Title** | `Healthcare Marketing Automation | NextGen Health` |
| **Description** | `HIPAA-compliant marketing automation for healthcare. AI chatbots, patient intake, review collection, appointment reminders, and more for clinics.` |
| **Canonical** | `https://thenextgenhealth.com/automation` |

### 13. Blog Hub (`/blog`)

| Field | Value |
|---|---|
| **File** | `app/blog/page.tsx` |
| **Title** | `Healthcare Marketing Blog — Tips & Strategies | NextGen Health` |
| **Description** | `Expert healthcare marketing insights, SEO tips, and digital strategy guides for clinics and medical practices. Read the NextGen Health blog.` |
| **Canonical** | `https://thenextgenhealth.com/blog` |

### 14. News Hub (`/news`)

| Field | Value |
|---|---|
| **File** | `app/news/page.tsx` |
| **Title** | `Healthcare Marketing News & Industry Updates | NextGen Health` |
| **Description** | `Stay up to date with the latest healthcare marketing news, industry trends, and digital health updates from NextGen Health.` |
| **Canonical** | `https://thenextgenhealth.com/news` |

### 15. HIPAA (`/hipaa`)

| Field | Value |
|---|---|
| **File** | `app/hipaa/page.tsx` |
| **Title** | `HIPAA-Compliant Marketing for Healthcare | NextGen Health` |
| **Description** | `Learn how NextGen Health ensures HIPAA compliance across all marketing activities. Secure, compliant digital marketing for healthcare practices.` |
| **Canonical** | `https://thenextgenhealth.com/hipaa` |

### 16. Privacy (`/privacy`)

| Field | Value |
|---|---|
| **File** | `app/privacy/page.tsx` |
| **Title** | `Privacy Policy | NextGen Health` |
| **Description** | `NextGen Health privacy policy. Learn how we collect, use, and protect your personal information and data.` |
| **Canonical** | `https://thenextgenhealth.com/privacy` |

### 17. Terms (`/terms`)

| Field | Value |
|---|---|
| **File** | `app/terms/page.tsx` |
| **Title** | `Terms of Service | NextGen Health` |
| **Description** | `NextGen Health terms of service. Read our terms and conditions governing the use of our website and marketing services.` |
| **Canonical** | `https://thenextgenhealth.com/terms` |

---

## Phase C — 13 Service Pages (Day 3–4)

All in `app/services/[slug]/page.tsx` (dynamic route) or individual folders.

| # | Service Slug | Title | Description (truncated at ~155 chars) |
|---|---|---|---|
| 1 | `search-engine-optimisation` | `Healthcare SEO Services — Medical Practice SEO | NextGen Health` | `Specialist healthcare SEO services to rank your clinic higher on Google. On-page, technical, and local SEO for medical practices.` |
| 2 | `google-ads` | `Healthcare Google Ads Management — PPC for Clinics | NextGen Health` | `Expert Google Ads management for healthcare. Maximise ROI with targeted PPC campaigns for clinics, dentists, and medical practices.` |
| 3 | `social-media-marketing` | `Healthcare Social Media Marketing | NextGen Health` | `Grow your clinic's social media presence. Strategic social media marketing for healthcare practices across Facebook, Instagram, and LinkedIn.` |
| 4 | `email-drip-campaigns` | `Healthcare Email Marketing & Drip Campaigns | NextGen Health` | `Automated email drip campaigns for healthcare. Nurture leads, reactivate patients, and drive appointments with targeted email sequences.` |
| 5 | `website-design-dev` | `Healthcare Website Design & Development | NextGen Health` | `Custom, mobile-first website design for healthcare practices. Fast, accessible, HIPAA-aware websites that convert visitors to patients.` |
| 6 | `content-marketing` | `Healthcare Content Marketing Services | NextGen Health` | `Strategic content marketing for clinics. Blog posts, guides, and educational content that builds trust and drives organic traffic.` |
| 7 | `reputation-management` | `Healthcare Reputation Management | NextGen Health` | `Protect and grow your clinic's online reputation. Review management, monitoring, and response services for healthcare practices.` |
| 8 | `google-business-profile` | `Google Business Profile Management for Healthcare | NextGen Health` | `Optimise your Google Business Profile for maximum visibility. GBP management for clinics, dentists, and medical practices.` |
| 9 | `analytics-reporting` | `Healthcare Marketing Analytics & Reporting | NextGen Health` | `Data-driven healthcare marketing analytics. Custom dashboards and monthly reports tracking SEO, ads, and conversion performance.` |
| 10 | `branding` | `Healthcare Branding & Identity | NextGen Health` | `Build a trusted healthcare brand. Logo design, brand identity, messaging, and visual guidelines for clinics and medical practices.` |
| 11 | `video-production` | `Healthcare Video Production & Marketing | NextGen Health` | `Professional video production for healthcare. Patient testimonials, procedure videos, and social media content for clinics.` |
| 12 | `graphic-design` | `Healthcare Graphic Design Services | NextGen Health` | `Custom graphic design for medical practices. Marketing materials, social media graphics, infographics, and print design.` |
| 13 | `print-design` | `Healthcare Print Design & Marketing Materials | NextGen Health` | `Professional print design for clinics. Brochures, business cards, patient materials, and signage for healthcare practices.` |

---

## Phase D — 7 Blog Posts (Day 4–5)

Implemented via `generateMetadata()` in the blog dynamic route. Titles and descriptions pulled from database `Post` table.

**Database updates required:**

| # | Current Slug | Optimised Title | Optimised Description |
|---|---|---|---|
| 1 | *(check database)* | Include primary keyword + emotional hook + `| NextGen Health` | 150–160 chars with keyword + CTA |
| 2–7 | *(check database)* | Same pattern | Same pattern |

**Implementation:** Update the `generateMetadata()` function in `app/blog/[slug]/page.tsx` to ensure it uses the database `title` as-is for the meta title, and creates a description from the `excerpt` or first 155 characters of content.

**OG Type:** Set to `article` with `publishedTime` and `authors`.

---

## Phase E — 7 News Articles (Day 5)

Same approach as blog. Implemented via `generateMetadata()` in the news dynamic route.

**Critical fixes:**
- 2 articles with "2023" in slug: Update slugs + add 301 redirects + update metadata
- All 7 articles: Ensure `article` OG type with `publishedTime`

---

## Phase F — OG Image Generation (Day 5–7)

### Approach

Create reusable OG image templates:

1. **Template A — Generic** (brand colours + page title) — for core pages
2. **Template B — Service** (brand colours + service icon + title) — for service pages
3. **Template C — Article** (featured image overlay + title + author) — for blog/news

### Next.js OG Image Generation (Optional Advanced)

Use `next/og` (ImageResponse API) for dynamic OG images:

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'NextGen Health';
  
  return new ImageResponse(
    (
      <div style={{ /* branded design */ }}>
        <h1>{title}</h1>
        <p>NextGen Health — Healthcare Marketing Agency</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### Static OG Images Needed

| Page Group | Number of Images | Template |
|---|---|---|
| Core pages | 17 | Template A |
| Service pages | 13 | Template B |
| Blog posts | 7 (+ dynamic for future) | Template C |
| News articles | 7 (+ dynamic for future) | Template C |
| **Total** | **44** | |

---

## Validation Checklist

After rollout, validate each page:

- [ ] Title tag renders correctly (check `<title>` in page source)
- [ ] Meta description renders correctly (check `<meta name="description">`)
- [ ] Canonical URL is correct and absolute
- [ ] OG title, description, image, URL are present
- [ ] Twitter card tags are present
- [ ] No duplicate titles across the site
- [ ] No duplicate descriptions across the site
- [ ] All titles are 50–60 characters
- [ ] All descriptions are 150–160 characters
- [ ] All OG images are 1200 × 630 px

### Validation Tools

- Google Rich Results Test: https://search.google.com/test/rich-results
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- SEO Meta in 1 Click (Chrome extension)
- Screaming Frog crawl (post-deployment)

---

## Post-Rollout Monitoring

| Metric | Tool | Check Frequency |
|---|---|---|
| Title/description rendering | GSC (Search Appearance) | Weekly for 4 weeks |
| CTR changes | GSC (Performance) | Weekly for 8 weeks |
| Indexing status | GSC (Pages) | Weekly for 4 weeks |
| Social share preview | Facebook Debugger / Twitter Validator | Once post-deploy |
| Rich results eligibility | GSC (Enhancements) | Weekly for 4 weeks |
