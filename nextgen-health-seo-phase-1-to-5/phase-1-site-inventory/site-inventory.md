# Site Inventory — thenextgenhealth.com

**Audit Date:** 8 April 2026
**Total Live Pages:** 44 (17 static core + 13 service detail + 7 blog posts + 7 news articles)
**CMS:** Next.js 15 + Prisma + Supabase (PostgreSQL)
**Hosting:** Vercel

---

## Core Pages

| # | Page Name | URL | Type | Status |
|---|-----------|-----|------|--------|
| 1 | Home | `/` | Landing / Hub | Live |
| 2 | About | `/about` | Brand / Trust | Live |
| 3 | Services | `/services` | Service Hub | Live |
| 4 | Industries | `/industries` | Industry Hub | Live |
| 5 | Contact | `/contact` | Lead Capture | Live |
| 6 | Automation | `/automation` | Service / Lead Magnet | Live |
| 7 | Blog | `/blog` | Content Hub | Live |
| 8 | Healthcare News | `/news` | Content Hub | Live |
| 9 | Case Studies | `/case-studies` | Social Proof | Live |
| 10 | Pricing | `/pricing` | Commercial | Live |
| 11 | Proven Results | `/proven-results` | Social Proof | Live |
| 12 | Team | `/team` | Brand / Trust | Live |
| 13 | Locations | `/locations` | Geo-Targeting | Live |
| 14 | Book a Demo | `/book-a-demo` | Lead Capture | Live |
| 15 | HIPAA Compliance | `/hipaa` | Legal / Trust | Live |
| 16 | Privacy Policy | `/privacy` | Legal | Live |
| 17 | Terms of Service | `/terms` | Legal | Live |

---

## Service Detail Pages

| # | Page Name | URL | Type | Status |
|---|-----------|-----|------|--------|
| 1 | SEO & Local Search | `/services/seo-local-search` | Service Detail | Live |
| 2 | Google Ads & Paid Search | `/services/google-ads` | Service Detail | Live |
| 3 | Meta Ads for Healthcare | `/services/meta-ads` | Service Detail | Live |
| 4 | Website Design & Development | `/services/website-design-dev` | Service Detail | Live |
| 5 | Social Media Marketing | `/services/social-media-marketing` | Service Detail | Live |
| 6 | Content & Copywriting | `/services/content-copywriting` | Service Detail | Live |
| 7 | Email & Drip Campaigns | `/services/email-drip-campaigns` | Service Detail | Live |
| 8 | Google Business Profile | `/services/google-business-profile` | Service Detail | Live |
| 9 | Brand Identity Design | `/services/brand-identity-design` | Service Detail | Live |
| 10 | Brochure & Print Design | `/services/brochure-print-design` | Service Detail | Live |
| 11 | Analytics & Reporting | `/services/analytics-reporting` | Service Detail | Live |
| 12 | Strategy & Planning | `/services/strategy-planning` | Service Detail | Live |
| 13 | On-Site Field Marketing | `/services/on-site-field-marketing` | Service Detail | Live |

---

## Blog Posts

| # | Title | URL | Date | Category |
|---|-------|-----|------|----------|
| 1 | Medical SEO Strategy: 7 Expert Tips to Boost | `/blog/expert-tips-medical-seo-strategy` | 24 Mar 2026 | Medical SEO |
| 2 | Dental Clinic SEO Strategy: 7 Proven Ways to Boost | `/blog/dental-clinic-seo-strategy` | 24 Mar 2026 | Dental SEO |
| 3 | Healthcare Marketing Automation: 7 Proven Ways to Boost | `/blog/healthcare-marketing-automation` | 21 Mar 2026 | Healthcare Automation |
| 4 | Custom Software Solutions for Healthcare Marketing: 5 Proven Tips to Boost | `/blog/custom-software-solutions-for-healthcare-marketing` | 5 Mar 2026 | Custom Software |
| 5 | Emergency Room Visit Criteria: 7 Key Factors to Consider | `/blog/emergency-room-visit-criteria` | 3 Mar 2026 | Patient Education |
| 6 | Social Media Marketing Tips for Dental Clinics Success | `/blog/social-media-marketing-dental-clinics` | 1 Mar 2026 | Social Media |
| 7 | HIPAA-compliant Healthcare Marketing Tools: 5 Essential Strategies to Boost Success | `/blog/hipaa-compliant-healthcare-marketing-tools` | 1 Feb 2026 | HIPAA / Compliance |

---

## Healthcare News Articles

| # | Title | URL | Date | Category |
|---|-------|-----|------|----------|
| 1 | Unveiling Healthcare SEO Trends 2023: Strategies for Success | `/news/healthcare-seo-trends-2023` | 7 Mar 2026 | Technology News |
| 2 | Healthcare Grand Opening Event: A Red Carpet Salute to Emergency Care | `/news/healthcare-grand-opening-event` | 5 Mar 2026 | Industry Report |
| 3 | New Innovations in HIPAA-Compliant Marketing Automation Tools | `/news/hipaa-compliant-marketing-automation-tools` | 5 Mar 2026 | Technology News |
| 4 | Effective Telehealth Marketing Strategies 2023 for Engaging Patients | `/news/telehealth-marketing-strategies-2023` | 1 Mar 2026 | Technology News |
| 5 | Exploring Google Business Profile Updates for Healthcare Marketing | `/news/google-business-profile-updates-for-healthcare` | 12 Feb 2026 | Technology News |
| 6 | Key Insights on Google Ads Healthcare Policy Changes | `/news/google-ads-healthcare-policy-changes` | 1 Feb 2026 | Regulatory Update |
| 7 | Healthcare Workforce Shortage Poses Marketing Challenges for Clinics | `/news/healthcare-workforce-shortage` | 1 Jan 2026 | Industry Report |

---

## Dashboard / App Pages (Non-Indexed, Auth-Gated)

| # | Page Name | URL | Type | Status |
|---|-----------|-----|------|--------|
| 1 | Login | `/login` | Authentication | Live |
| 2 | Sign Up | `/signup` | Authentication | Live |
| 3 | Profile | `/profile` | Account | Live |
| 4 | Admin Dashboard | `/dashboard/admin` | Admin | Live |
| 5 | Admin Blog Manager | `/dashboard/admin/blog` | Admin | Live |
| 6 | Admin News Manager | `/dashboard/admin/news` | Admin | Live |
| 7 | Admin AI Creator | `/dashboard/admin/ai-creator` | Admin | Live |
| 8 | Admin Chat Reports | `/dashboard/admin/chat-reports` | Admin | Live |
| 9 | Admin Leads | `/dashboard/admin/leads` | Admin | Live |
| 10 | Admin Subscribers | `/dashboard/admin/subscribers` | Admin | Live |
| 11 | Client Dashboard | `/dashboard/client` | Client Portal | Live |

---

## Template-Based Content Types

| Content Type | Route Pattern | Source | Count |
|---|---|---|---|
| Blog Posts | `/blog/[slug]` | Prisma `Post` model | 7 published |
| News Articles | `/news/[slug]` | Prisma `NewsArticle` model | 7 published |

---

## Missing Pages Not Yet Built (Strongly Implied by Site Structure)

| Page | Why It Is Needed |
|---|---|
| Individual Industry Pages (e.g. `/industries/freestanding-ers`, `/industries/urgent-care`, `/industries/medspa`) | Industries hub references three verticals but has no dedicated sub-pages for SEO targeting |
| Individual Case Study Pages (e.g. `/case-studies/er-network`) | Case studies hub lists six clients but all content is on one page — no individual indexable pages |
| Automation Sub-Pages (e.g. `/automation/patient-intake`, `/automation/review-collection`) | Automation page lists six templates but has no dedicated landing pages per workflow |
| FAQ / Knowledge Base | Frequent FAQ sections across pages but no consolidated FAQ hub |
| Careers / Jobs Page | Team page references open roles but links to `/contact` instead of a dedicated careers page |

---

## Summary Metrics

- **Total indexable public pages:** 44
- **Service detail pages:** 13
- **Blog posts:** 7 (thin volume for SEO authority)
- **News articles:** 7 (some with outdated "2023" in titles despite 2026 dates)
- **Case study detail pages:** 0 (all content on a single page)
- **Industry detail pages:** 0 (all content on a single page)
- **Automation detail pages:** 0 (all content on a single page)
