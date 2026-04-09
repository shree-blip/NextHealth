# Internal Linking Blueprint

**Site:** thenextgenhealth.com
**Blueprint Date:** 8 April 2026

---

## Linking Architecture Overview

### Link Flow Hierarchy

```
                     [HOME]
                    /   |   \
              [Services] [Industries] [Content Hubs]
             /    |    \      |         /       \
        [Service] [Service] [Industry] [Blog]  [News]
            |         |        |         |        |
        [Blog ←→ Service ←→ HIPAA ←→ Industry ←→ Case Study]
```

**Key Principle:** Every page links UP (to parent), ACROSS (to siblings/related), and DOWN (to children). Every page links to at least one conversion page (`/book-a-demo` or `/contact`).

---

## 1. Breadcrumb Implementation

### Component Specification

```tsx
// components/Breadcrumbs.tsx
// Place above H1 on every page

// Visual:   Home > Services > Healthcare SEO
// Schema:   BreadcrumbList JSON-LD (see schema blueprint)
// Styling:  text-sm text-gray-500 separator " > " last item bold
```

### Breadcrumb Paths

| Page Type | Breadcrumb Path |
|---|---|
| Home | (none — no breadcrumb on home) |
| Service | Home > Services > [Service Name] |
| Industry | Home > Industries > [Industry Name] |
| Blog Post | Home > Blog > [Post Title] |
| News Article | Home > News > [Article Title] |
| Automation Template | Home > Automation > [Template Name] |
| Case Study | Home > Case Studies > [Study Title] |
| City Page | Home > Locations > [City Name] |
| Core Page | Home > [Page Name] |

---

## 2. Navigation Links

### Primary Navigation

```
Home | Services ▼ | Industries ▼ | Automation | Blog | News | Pricing | Book a Demo
```

**Services Dropdown:**
- All 13 service pages listed

**Industries Dropdown:**
- All industry pages (as created)

### Footer Links

```
Services:          Industries:       Company:          Legal:
- SEO              - Dental          - About           - Privacy
- Google Ads       - Urgent Care     - Team            - Terms
- Meta Ads         - Medspa          - Case Studies    - HIPAA
- Website Design   - Freestanding ER - Proven Results
- Social Media     - Mental Health   - Pricing
- Content          - Primary Care    - Contact
- Email            [more...]         - Locations
- GBP                                - Blog
- Brand Identity                     - News
- Print Design
- Analytics
- Strategy
- Field Marketing
```

---

## 3. Contextual In-Content Links

### Service Pages — Required Outbound Links (8+ per page)

| Link Target | Anchor Text Pattern | Placement |
|---|---|---|
| 3 related services | "[Service Name]" or "our [service] team" | Within body content |
| 2 supporting blog posts | Descriptive anchor: "learn more in our guide to [topic]" | Within body content |
| `/hipaa` | "HIPAA-compliant" or "our commitment to HIPAA compliance" | Trust statement section |
| `/book-a-demo` | "Book a free demo" or "Schedule your consultation" | CTA section |
| 1 related industry page | "for [industry] practices" | Where industry is mentioned |

### Blog Posts — Required Outbound Links (5+ per post)

| Link Target | Anchor Text Pattern | Placement |
|---|---|---|
| 1–2 service pages | Keyword-rich: "healthcare SEO services" | Within body content |
| 1 related blog post | Descriptive: "as we discussed in [title]" | Within body content |
| 1 core page | Natural: "our proven results show…" | Where relevant |
| `/book-a-demo` | CTA: "ready to get started?" | End of post |

### News Articles — Required Outbound Links (4+ per article)

| Link Target | Anchor Text Pattern | Placement |
|---|---|---|
| 1 service page | Keyword-rich anchor | Within body content |
| 1 blog post or news article | "read our analysis of [topic]" | Within body content |
| 1 core page | Natural contextual reference | Where relevant |
| `/book-a-demo` or `/contact` | CTA anchor | End of article |

### Industry Pages — Required Outbound Links (8+ per page)

| Link Target | Anchor Text Pattern | Placement |
|---|---|---|
| 3–4 relevant service pages | "[Service] for [industry]" | Services section |
| 1–2 blog posts | "read our guide to [topic]" | Content body |
| 1 case study | "see how we helped [result]" | Results section |
| `/hipaa` | "HIPAA-compliant marketing" | Trust section |
| `/book-a-demo` | "Book a free [industry] marketing demo" | CTA section |

---

## 4. Link Modules

### 4.1 Related Services Module

**Placement:** Bottom of each service page
**Content:** 3–5 service cards
**Implementation:**

```tsx
// components/RelatedServices.tsx
interface RelatedServiceProps {
  services: Array<{
    title: string;
    href: string;
    description: string;
    icon: string;
  }>;
}
```

**Service Relationships Map:**

| Service | Related Services |
|---|---|
| SEO | GBP, Analytics, Content |
| Google Ads | Meta Ads, Analytics, Strategy |
| Meta Ads | Google Ads, Social Media, Content |
| Website Design | SEO, Brand Identity, Analytics |
| Social Media | Content, Meta Ads, Brand Identity |
| Content | SEO, Social Media, Email |
| Email | Content, Analytics, Automation |
| GBP | SEO, Analytics |
| Brand Identity | Website Design, Print, Social Media |
| Print | Brand Identity, Field Marketing |
| Analytics | Google Ads, SEO, Strategy |
| Strategy | Analytics, SEO, Content |
| Field Marketing | Print, Brand Identity, Social Media |

### 4.2 Related Posts Module

**Placement:** Bottom of each blog post and news article
**Content:** 3 related content pieces
**Logic:**
1. Same category/tag (primary match)
2. Same content cluster (secondary match)
3. Most recent posts (fallback)

```tsx
// components/RelatedPosts.tsx
// Query: same tags → same category → recent
// Display: thumbnail + title + excerpt + date
```

### 4.3 HIPAA Trust Banner

**Placement:** Bottom of every service page, above footer
**Content:**

```
🔒 All our strategies are HIPAA-compliant.
Learn how we protect your patients' data. [Link to /hipaa]
```

### 4.4 CTA Banner

**Placement:** Bottom of every content page
**Content:**

```
Ready to grow your practice?
Book a free healthcare marketing demo today.
[Button: Book a Free Demo → /book-a-demo]
```

### 4.5 Industry Quick-Links Module

**Placement:** Home page, Services hub
**Content:** Grid of industry cards linking to industry pages

### 4.6 "See the Results" Module

**Placement:** Service pages, Industry pages
**Content:** 1–2 key stat + link to `/proven-results` or relevant case study

---

## 5. Anchor Text Guidelines

### Do's
- Use descriptive, keyword-relevant anchor text
- Vary anchor text for the same target page
- Use natural language that flows in the sentence
- Include the target keyword naturally

### Don'ts
- Never use "click here" or "read more" as anchor text
- Don't use the exact same anchor text for every link to a page
- Avoid over-optimised anchors (don't stuff keywords)
- Don't link the same target page more than once per paragraph

### Example Anchor Text Variations for `/services/seo-local-search`:
- "healthcare SEO services"
- "our SEO and local search team"
- "improve your Google rankings"
- "learn how healthcare SEO works"
- "search engine optimisation for clinics"

---

## 6. Orphan Page Prevention

An orphan page is a page with zero internal links pointing to it. These are invisible to search engines crawling via links.

### Audit Checklist
- Every page must appear in at least one navigation menu (primary, footer, or sidebar)
- Every page must have at least 2 contextual in-content links from other pages
- Run a crawl audit monthly to detect orphan pages
- New pages must be linked from at least 3 existing pages on the day they're published

### Pages Most at Risk of Becoming Orphans
- New blog posts (only linked from blog hub listing)
- New news articles (only linked from news hub listing)
- New industry pages (if not added to nav immediately)
- New automation pages (if not added to hub immediately)

**Solution:** When publishing any new page:
1. Add to relevant navigation/hub
2. Add contextual link from 2–3 related existing pages
3. Include in next sitemap update
