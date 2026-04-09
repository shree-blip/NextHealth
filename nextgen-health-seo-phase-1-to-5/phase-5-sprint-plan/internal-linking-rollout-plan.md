# Internal Linking Rollout Plan

**Site:** thenextgenhealth.com
**Date:** 8 April 2026

> Step-by-step implementation plan for the internal linking architecture defined in the Internal Linking Blueprint. Covers breadcrumbs, navigation modules, contextual links, and link equity distribution.

---

## Rollout Phases

| Phase | Scope | Target Date | Est. Hours |
|---|---|---|---|
| **Phase 1** | Breadcrumb component (sitewide) | Week 5 | 4–6 |
| **Phase 2** | Footer link restructure | Week 5 | 2–3 |
| **Phase 3** | Related Services module | Week 6 | 3–4 |
| **Phase 4** | Related Posts / News module | Week 6 | 3–4 |
| **Phase 5** | Contextual body links (existing pages) | Week 7 | 6–8 |
| **Phase 6** | CTA link modules | Week 7 | 2–3 |
| **Phase 7** | New page internal links (ongoing) | Week 8+ | Ongoing |

---

## Phase 1: Breadcrumb Component (Week 5)

### Implementation

Create a reusable `<Breadcrumbs>` component that:
1. Reads the current route path
2. Generates hierarchical breadcrumb trail
3. Renders both visible UI breadcrumbs and JSON-LD schema

### Component Specification

```typescript
// components/Breadcrumbs.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'services': 'Services',
  'blog': 'Blog',
  'news': 'News',
  'industries': 'Industries',
  'automation': 'Automation',
  'case-studies': 'Case Studies',
  'about': 'About',
  'contact': 'Contact',
  'pricing': 'Pricing',
  'team': 'Team',
  'locations': 'Locations',
  'proven-results': 'Proven Results',
  'hipaa': 'HIPAA Compliance',
  'book-a-demo': 'Book a Demo',
  // Service slugs
  'search-engine-optimisation': 'Search Engine Optimisation',
  'google-ads': 'Google Ads',
  'social-media-marketing': 'Social Media Marketing',
  // ... etc.
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: ROUTE_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `https://thenextgenhealth.com${item.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        {items.map((item, i) => (
          <span key={item.href}>
            {i > 0 && <span className="mx-1">›</span>}
            {i === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:underline">{item.label}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
```

### Placement

Add `<Breadcrumbs />` to the top of every page layout **except** the home page.

**Option A (per-page):** Add to each page's JSX manually.

**Option B (layout-level):** Add to a shared layout wrapper that conditionally renders:
```typescript
// In a shared layout or component
{pathname !== '/' && <Breadcrumbs />}
```

### Validation

- [ ] Breadcrumbs render on all pages except home
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] Links are clickable and navigate correctly
- [ ] Last item is not a link (current page)
- [ ] `aria-label="Breadcrumb"` present for accessibility

---

## Phase 2: Footer Link Restructure (Week 5)

### Current Footer

Likely a simple footer with basic links. Needs restructuring to distribute link equity.

### Target Footer Structure

```
┌─────────────────────────────────────────────────────────────┐
│ SERVICES          │ INDUSTRIES       │ COMPANY      │ LEGAL │
│ ─────────         │ ──────────       │ ─────────    │ ───── │
│ SEO               │ Dental           │ About        │ Privacy│
│ Google Ads        │ Med Spa          │ Team         │ Terms  │
│ Social Media      │ Chiropractic     │ Case Studies │ HIPAA  │
│ Email Campaigns   │ Mental Health    │ Blog         │        │
│ Website Design    │ Urgent Care      │ News         │        │
│ Content Marketing │ Orthopaedics     │ Contact      │        │
│ Reputation Mgmt   │ Paediatrics      │ Pricing      │        │
│ GBP Management    │ Ophthalmology    │ Locations    │        │
│ Analytics         │ Dermatology      │ Careers      │        │
│ Branding          │ Obstetrics       │              │        │
│ All Services →    │ All Industries → │              │        │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

1. Update the footer component (likely in `components/Footer.tsx` or similar)
2. Organise into 4 columns: Services, Industries, Company, Legal
3. Add all service page links
4. Add industry page links (as they are created)
5. Add company links
6. Include a "Book a Demo" CTA button in footer

### Link Equity Benefit

Every page on the site links to every service and industry page via the footer, creating a strong baseline of internal link equity across the site graph.

---

## Phase 3: Related Services Module (Week 6)

### Component Specification

Create a `<RelatedServices>` module that displays 3–4 related services on each service page.

```typescript
// components/RelatedServices.tsx
interface RelatedService {
  title: string;
  href: string;
  description: string;
  icon?: string;
}

interface Props {
  currentSlug: string;
  services: RelatedService[];
}

export function RelatedServices({ currentSlug, services }: Props) {
  const filtered = services.filter(s => !s.href.includes(currentSlug)).slice(0, 4);
  
  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Related Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(service => (
          <Link key={service.href} href={service.href} className="...">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Mapping Table

| Service Page | Related Services (3–4) |
|---|---|
| SEO | Content Marketing, GBP Management, Analytics |
| Google Ads | Analytics, SEO, Social Media |
| Social Media | Content Marketing, Video Production, Reputation Mgmt |
| Email Campaigns | Content Marketing, Analytics, SEO |
| Website Design | SEO, Branding, Graphic Design |
| Content Marketing | SEO, Social Media, Blog Hub |
| Reputation Mgmt | GBP Management, Social Media, SEO |
| GBP Management | SEO, Reputation Mgmt, Analytics |
| Analytics | SEO, Google Ads, GBP Management |
| Branding | Website Design, Graphic Design, Print Design |
| Video Production | Social Media, Content Marketing, Graphic Design |
| Graphic Design | Branding, Print Design, Social Media |
| Print Design | Graphic Design, Branding, Website Design |

### Placement

Add after the main content section and before the CTA on each service page.

---

## Phase 4: Related Posts / News Module (Week 6)

### Blog Related Posts

Create a `<RelatedPosts>` component that shows 3 related posts at the bottom of each blog post page.

**Matching Logic (priority order):**
1. Same category
2. Shared tags
3. Most recent

```typescript
// components/RelatedPosts.tsx
export function RelatedPosts({ currentSlug, category, tags }: Props) {
  // Fetch posts matching category/tags, exclude current
  // Display 3 cards with title, excerpt, featured image, date
}
```

### News Related Articles

Same pattern for news articles. Create a `<RelatedNews>` component.

### Hub Page Modules

On `/blog` and `/news` hub pages, add:
- "Featured Post" hero at top
- Category filter / tabs
- "Most Popular" sidebar widget (if layout permits)

---

## Phase 5: Contextual Body Links (Week 7)

### Approach

Manually add 3–5 contextual internal links within the body content of each existing page.

### Link Mapping — Core Pages

| Page | Add Links To |
|---|---|
| Home | Services (hub), Case Studies, Blog, Book a Demo, About |
| About | Team, Case Studies, Services, Contact |
| Pricing | Services (hub), Book a Demo, Case Studies |
| Contact | About, Locations, Book a Demo |
| Team | About, Services, Blog |
| Locations | Contact, Services, Industries |
| Case Studies | Services (relevant), Book a Demo, Proven Results |
| Proven Results | Case Studies, Services, Book a Demo |
| Industries | All industry sub-pages, Services, Case Studies |
| Automation | All automation sub-pages, Services, HIPAA |
| HIPAA | Services, About, Contact |
| Blog Hub | Service pages (contextual), News |
| News Hub | Blog, Services, Industries |

### Link Mapping — Service Pages

Each service page should contain contextual links to:
1. 2 other service pages (cross-sell)
2. Relevant case study (when available)
3. Book a Demo (CTA)
4. Relevant blog post (supporting content)
5. Industry page (when relevant)

**Example for SEO page:**
> "Our [content marketing](/services/content-marketing) team creates keyword-targeted articles that support your SEO strategy. See how we [grew a dental practice's traffic by 312%](/case-studies/dental-practice-seo-success). We also optimise your [Google Business Profile](/services/google-business-profile) for local search dominance."

### Implementation Process

1. Open each page file
2. Identify natural link insertion points in existing copy
3. Add `<Link>` components with descriptive anchor text
4. Ensure anchor text is varied (avoid over-optimised exact match)
5. Validate all links work

---

## Phase 6: CTA Link Modules (Week 7)

### Standard CTA Module

Create a reusable `<CTABanner>` component used at the bottom of most pages:

```typescript
// components/CTABanner.tsx
interface Props {
  headline?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function CTABanner({
  headline = 'Ready to Grow Your Practice?',
  description = 'Book a free demo and see how NextGen Health can transform your healthcare marketing.',
  primaryCTA = { label: 'Book a Free Demo', href: '/book-a-demo' },
  secondaryCTA = { label: 'View Our Pricing', href: '/pricing' },
}: Props) {
  return (
    <section className="bg-blue-600 text-white py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">{headline}</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">{description}</p>
      <div className="flex gap-4 justify-center">
        <Link href={primaryCTA.href} className="btn-primary">{primaryCTA.label}</Link>
        <Link href={secondaryCTA.href} className="btn-secondary">{secondaryCTA.label}</Link>
      </div>
    </section>
  );
}
```

### Placement

| Page Type | CTA Headline | Primary Link |
|---|---|---|
| Service pages | "Ready to Boost Your [Service]?" | `/book-a-demo` |
| Industry pages | "Marketing for [Industry] Practices" | `/book-a-demo` |
| Case studies | "Want Results Like These?" | `/book-a-demo` |
| Blog posts | "Need Help With [Topic]?" | Relevant service page |
| Core pages | "Ready to Grow Your Practice?" | `/book-a-demo` |

---

## Phase 7: New Page Internal Links (Week 8+, Ongoing)

As new pages are created (industry pages, automation sub-pages, case studies, blog posts, city pages), they must be immediately woven into the internal linking architecture:

### New Page Checklist

For every new page published:

- [ ] Add breadcrumb (automatic via component)
- [ ] Add to footer navigation (if category page)
- [ ] Add to XML sitemap (automatic in Next.js)
- [ ] Add contextual links FROM the new page to 3–5 existing pages
- [ ] Add contextual links TO the new page from 2–3 existing pages
- [ ] Add to relevant Related Services / Related Posts modules
- [ ] Include CTA banner linking to `/book-a-demo`
- [ ] Link from hub page (if sub-page of a hub)

### Quarterly Link Audit

Every 3 months:
1. Run Screaming Frog crawl
2. Identify orphan pages (0 internal links pointing to them)
3. Identify pages with low internal link count (<3 inbound links)
4. Check for broken internal links
5. Review anchor text distribution
6. Update links to reflect new content

---

## Monitoring & Validation

### Tools

| Tool | Purpose | Frequency |
|---|---|---|
| Screaming Frog | Internal link audit, orphan page detection | Monthly |
| Google Search Console | Internal links report | Weekly |
| GA4 | Navigation flow analysis | Monthly |
| Ahrefs Site Audit | Internal linking health score | Monthly |

### KPIs

| Metric | Current (est.) | Month 1 Target | Month 3 Target | Month 6 Target |
|---|---|---|---|---|
| Average internal links per page | <3 | 5+ | 8+ | 10+ |
| Orphan pages | Unknown | 0 | 0 | 0 |
| Pages with breadcrumbs | 0 | 44 (100%) | 70+ (100%) | 110+ (100%) |
| Broken internal links | Unknown | 0 | 0 | 0 |
| Click depth (max clicks from home) | 3+ | ≤3 | ≤3 | ≤3 |

---

## Link Equity Flow Visualisation

```
                          HOME
                       /   |   \
                Services  Blog  Industries
               /  |  \     |     /  |  \
         SEO  Ads  Social Posts Dental MedSpa Chiro
          |    |     |     |      |      |      |
      Case Studies ←→ Automation ←→ News ←→ Locations
                        |
                    Book a Demo ← (all pages)
```

**Key:** Every page should be reachable within 3 clicks from the home page. Hub pages (Services, Blog, Industries, Automation) act as link equity distributors to their child pages.
