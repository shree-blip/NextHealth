# Schema Markup Blueprint

**Site:** thenextgenhealth.com
**Blueprint Date:** 8 April 2026

---

## Schema Priority Matrix

| Schema Type | Pages | Priority | Impact |
|---|---|---|---|
| Organization | Home (sitewide) | P0 | Knowledge Panel eligibility |
| LocalBusiness | Home, Contact, City pages | P0 | Local pack eligibility |
| BreadcrumbList | Every page | P0 | Breadcrumb rich results |
| Service | 13 service pages | P0 | Service rich results |
| Article | All blog posts | P0 | Article rich results |
| NewsArticle | All news articles | P0 | News rich results |
| FAQ | Service pages, Pricing, HIPAA, FAQ page | P1 | FAQ rich results |
| Person | Team/author pages | P1 | E-E-A-T, author rich results |
| HowTo | Automation template pages | P1 | How-to rich results |
| AggregateRating | Proven Results (if reviews collected) | P2 | Star ratings in SERPs |
| SoftwareApplication | Automation templates | P2 | Software rich results |

---

## Schema Implementations

### 1. Organization Schema (Home Page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NextGen Health",
  "alternateName": "The NextGen Health",
  "url": "https://thenextgenhealth.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://thenextgenhealth.com/logo.png",
    "width": 600,
    "height": 60
  },
  "description": "Full-service healthcare marketing agency in Texas specialising in SEO, Google Ads, social media, automation, and HIPAA-compliant marketing for clinics.",
  "foundingDate": "YYYY",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "[City]",
    "addressRegion": "TX",
    "postalCode": "[ZIP]",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-XXX-XXX-XXXX",
    "contactType": "sales",
    "email": "info@thenextgenhealth.com",
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://www.facebook.com/thenextgenhealth",
    "https://www.linkedin.com/company/thenextgenhealth",
    "https://www.instagram.com/thenextgenhealth"
  ],
  "knowsAbout": [
    "Healthcare Marketing",
    "Healthcare SEO",
    "Medical Practice Marketing",
    "Healthcare Automation",
    "HIPAA Compliance"
  ]
}
```

### 2. LocalBusiness Schema (Home + Contact + City Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://thenextgenhealth.com/#localbusiness",
  "name": "NextGen Health",
  "image": "https://thenextgenhealth.com/logo.png",
  "url": "https://thenextgenhealth.com",
  "telephone": "+1-XXX-XXX-XXXX",
  "email": "info@thenextgenhealth.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street]",
    "addressLocality": "[City]",
    "addressRegion": "TX",
    "postalCode": "[ZIP]",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "XX.XXXXX",
    "longitude": "-XX.XXXXX"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  },
  "priceRange": "$$",
  "areaServed": {
    "@type": "State",
    "name": "Texas"
  }
}
```

### 3. BreadcrumbList Schema (Every Page)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://thenextgenhealth.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://thenextgenhealth.com/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Healthcare SEO & Local Search",
      "item": "https://thenextgenhealth.com/services/seo-local-search"
    }
  ]
}
```

### 4. Service Schema (Service Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Healthcare SEO & Local Search",
  "description": "Comprehensive SEO and local search optimisation for healthcare practices. Improve Google rankings, increase local visibility, and drive more patients.",
  "provider": {
    "@type": "Organization",
    "name": "NextGen Health",
    "url": "https://thenextgenhealth.com"
  },
  "serviceType": "Healthcare SEO",
  "areaServed": {
    "@type": "State",
    "name": "Texas"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Healthcare SEO Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "On-Page SEO Optimisation"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Local Search Optimisation"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Technical SEO Audit"
        }
      }
    ]
  }
}
```

### 5. Article Schema (Blog Posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Expert Tips for a Winning Medical SEO Strategy in 2026",
  "description": "Proven medical SEO tips to boost your practice's Google rankings.",
  "image": "https://thenextgenhealth.com/blog/medical-seo-strategy-hero.jpg",
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "https://thenextgenhealth.com/team/[author-slug]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "NextGen Health",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thenextgenhealth.com/logo.png"
    }
  },
  "datePublished": "2026-01-15",
  "dateModified": "2026-04-08",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://thenextgenhealth.com/blog/expert-tips-medical-seo-strategy"
  },
  "wordCount": 2000,
  "articleSection": "Healthcare SEO"
}
```

### 6. NewsArticle Schema (News Articles)

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Healthcare SEO Trends 2026: What You Need to Know",
  "description": "The latest healthcare SEO trends for 2026.",
  "image": "https://thenextgenhealth.com/news/seo-trends-2026-hero.jpg",
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "https://thenextgenhealth.com/team/[author-slug]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "NextGen Health",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thenextgenhealth.com/logo.png"
    }
  },
  "datePublished": "2026-04-01",
  "dateModified": "2026-04-08"
}
```

### 7. FAQ Schema (Service Pages, Pricing, HIPAA)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does healthcare SEO take to show results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most healthcare practices begin seeing measurable improvements in organic rankings within 3–6 months of consistent SEO work. Competitive keywords may take 6–12 months to reach the first page."
      }
    },
    {
      "@type": "Question",
      "name": "How much does healthcare SEO cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Healthcare SEO pricing typically ranges from $1,500 to $5,000+ per month depending on the scope, competition, and number of locations. Contact us for a custom quote."
      }
    }
  ]
}
```

### 8. Person Schema (Team/Author Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "[Full Name]",
  "jobTitle": "[Role]",
  "worksFor": {
    "@type": "Organization",
    "name": "NextGen Health"
  },
  "url": "https://thenextgenhealth.com/team/[slug]",
  "image": "https://thenextgenhealth.com/team/[slug]-headshot.jpg",
  "description": "[Brief bio]",
  "knowsAbout": ["Healthcare Marketing", "SEO", "..."]
}
```

### 9. HowTo Schema (Automation Template Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Automate Patient Intake with N8N",
  "description": "Step-by-step guide to setting up automated patient intake workflows using N8N.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Connect Your Patient Form",
      "text": "Link your online patient intake form to the N8N workflow trigger."
    },
    {
      "@type": "HowToStep",
      "name": "Map Data to Your EHR",
      "text": "Configure N8N to automatically push patient data to your EHR system."
    },
    {
      "@type": "HowToStep",
      "name": "Set Up Confirmation Messages",
      "text": "Configure automatic email/SMS confirmation to the patient."
    }
  ],
  "totalTime": "PT30M"
}
```

---

## Implementation Approach

### Shared Schema Component

Create `components/SchemaMarkup.tsx`:

```tsx
interface SchemaMarkupProps {
  data: Record<string, unknown>;
}

export function SchemaMarkup({ data }: SchemaMarkupProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Schema Helper Functions

Create `lib/schema.ts` with helpers:

```tsx
export function organizationSchema() { ... }
export function localBusinessSchema() { ... }
export function breadcrumbSchema(items: BreadcrumbItem[]) { ... }
export function serviceSchema(service: ServiceData) { ... }
export function articleSchema(post: PostData) { ... }
export function newsArticleSchema(article: ArticleData) { ... }
export function faqSchema(faqs: FAQ[]) { ... }
export function personSchema(person: PersonData) { ... }
```

### Validation
- Test all schema with Google's Rich Results Test: https://search.google.com/test/rich-results
- Monitor in Google Search Console → Enhancements
- Fix any errors or warnings promptly
