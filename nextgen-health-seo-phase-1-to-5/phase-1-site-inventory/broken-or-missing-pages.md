# Broken, Missing & Thin Pages Report

**Audit Date:** 8 April 2026
**Site:** thenextgenhealth.com

---

## 1. Outdated Content Titles

These live pages contain year references that are incorrect, which damages credibility and click-through rates in search results.

| Page | URL | Issue | Severity |
|---|---|---|---|
| Unveiling Healthcare SEO Trends 2023 | `/news/healthcare-seo-trends-2023` | Title says "2023" but published Mar 2026. The slug also contains "2023". | High |
| Effective Telehealth Marketing Strategies 2023 | `/news/telehealth-marketing-strategies-2023` | Title says "2023" but published Mar 2026. The slug also contains "2023". | High |

**Fix:** Update titles, slugs, and content to reference 2026. Implement 301 redirects from old slugs.

---

## 2. Missing Industry Detail Pages

The Industries hub (`/industries`) discusses three verticals in depth but does not link to dedicated sub-pages. This wastes significant keyword opportunity.

| Proposed Page | Slug | Business Justification |
|---|---|---|
| Freestanding ER Marketing | `/industries/freestanding-ers` | Core revenue vertical. Needs dedicated page targeting "freestanding ER marketing", "FSED patient acquisition" |
| Urgent Care Marketing | `/industries/urgent-care` | Core vertical. Needs page targeting "urgent care marketing", "walk-in clinic advertising" |
| MedSpa Marketing | `/industries/medspa` | High-value vertical. Needs page targeting "medspa marketing", "medical spa advertising" |
| Dental Marketing | `/industries/dental` | Referenced in blog content but absent from Industries page and sub-pages |
| Mental Health Marketing | `/industries/mental-health` | Mentioned in case studies but has no supporting page |
| Primary Care Marketing | `/industries/primary-care` | Mentioned in case studies but has no supporting page |

---

## 3. Missing Case Study Detail Pages

All six case studies are on a single page (`/case-studies`). Individual case study pages would:
- Provide dedicated keyword targets
- Enable deeper storytelling
- Improve internal linking
- Generate social proof backlinks

| Proposed Page | Slug |
|---|---|
| ER Network Case Study | `/case-studies/er-network-patient-growth` |
| Urgent Care Case Study | `/case-studies/urgent-care-patient-acquisition` |
| Cosmetic Surgery Case Study | `/case-studies/cosmetic-surgery-lead-growth` |
| Primary Care Case Study | `/case-studies/primary-care-seo-roi` |
| Mental Health Case Study | `/case-studies/mental-health-patient-retention` |
| Dental Practice Case Study | `/case-studies/dental-practice-local-pack` |

---

## 4. Missing Automation Detail Pages

The Automation page lists six downloadable N8N templates but has no dedicated landing pages per template. These would serve as long-tail SEO magnets and lead capture funnels.

| Proposed Page | Slug |
|---|---|
| Patient Intake Automation | `/automation/patient-intake` |
| Appointment Reminder Automation | `/automation/appointment-reminders` |
| Google Review Collection Automation | `/automation/review-collection` |
| Insurance Verification Automation | `/automation/insurance-verification` |
| AI Chatbot Lead Capture | `/automation/ai-chatbot` |
| Social Media Auto-Poster | `/automation/social-media-auto-poster` |

---

## 5. Thin Content Pages

| Page | URL | Issue | Word Count Estimate |
|---|---|---|---|
| Book a Demo | `/book-a-demo` | Almost no indexable text content — just an embedded scheduler widget | < 100 words |
| Login | `/login` | Auth form only, no indexable content (acceptable — should be noindexed) | < 50 words |
| Sign Up | `/signup` | Auth form only (acceptable — should be noindexed) | < 50 words |
| Profile | `/profile` | Auth-gated, no indexable content (acceptable — should be noindexed) | < 50 words |

**Fix for Book a Demo:** Add supporting copy — value proposition, what to expect, trust signals, testimonials — above and below the scheduler widget. This page likely receives direct traffic from CTAs across the site and should convert well with supporting content.

---

## 6. Missing Trust and Supporting Pages

| Proposed Page | Slug | Justification |
|---|---|---|
| Careers / Open Roles | `/careers` | Team page references hiring but links to `/contact`. A dedicated page improves E-E-A-T and attracts talent. |
| FAQ Hub | `/faq` | FAQ sections are scattered across 10+ pages. A consolidated hub improves crawlability and enables FAQ schema at scale. |
| Testimonials / Reviews | `/testimonials` | Social proof is spread across pages. A dedicated page strengthens trust signals and backlink potential. |
| Partner Programme / Referrals | `/partners` | No referral or partner channel page exists. Healthcare networks often drive referrals. |
| Accessibility Statement | `/accessibility` | No accessibility statement found. Required for public-sector healthcare clients and recommended for ADA compliance. |

---

## 7. Internal Linking Issues

| Issue | Pages Affected | Impact |
|---|---|---|
| Case Studies page does not link to relevant service pages | `/case-studies` | Missed authority flow between proof and service pages |
| Service detail pages do not cross-link to related services | All 13 `/services/*` pages | Reduces topical authority clustering |
| Blog posts lack structured internal links to service pages | All 7 `/blog/*` posts | Missed conversion and link equity opportunities |
| News articles do not link to related blog posts or services | All 7 `/news/*` articles | Isolated content silos |
| Automation page does not link to relevant case studies or blog posts | `/automation` | Weakens topical cluster |
| Locations page does not link to industry or service pages | `/locations` | Missed geo-targeting synergy |
| No breadcrumb navigation detected | Sitewide | Weakens crawl hierarchy signals and user navigation |

---

## 8. Schema / Structured Data Gaps

| Gap | Impact |
|---|---|
| No `LocalBusiness` schema detected on homepage or locations page | Missing rich results for local searches |
| No `FAQPage` schema on pages with FAQ sections | Missing FAQ rich results in SERPs |
| No `Service` schema on service detail pages | Missed service rich results |
| No `Article` / `BlogPosting` schema on blog posts | Reduced visibility in Google Discover and news results |
| No `NewsArticle` schema on news articles | Missed news carousel eligibility |
| No `Review` / `AggregateRating` schema on case studies or proven results | Missing star ratings in SERPs |
| No `BreadcrumbList` schema | Weakened navigation signals |
| No `Organization` schema | Reduced Knowledge Panel potential |

---

## Summary

| Category | Count |
|---|---|
| Outdated content titles | 2 |
| Missing industry detail pages | 6 |
| Missing case study detail pages | 6 |
| Missing automation detail pages | 6 |
| Thin content pages | 4 |
| Missing trust/supporting pages | 5 |
| Internal linking issues | 7 |
| Schema/structured data gaps | 8 |
| **Total issues identified** | **44** |
