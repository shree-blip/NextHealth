import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Glossary | NextGen Health',
  description:
    'Comprehensive glossary of healthcare marketing terms including SEO, HIPAA compliance, Google Ads, patient acquisition, and medical practice growth terminology.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/glossary',
  },
  openGraph: {
    title: 'Healthcare Marketing Glossary | NextGen Health',
    description: 'Comprehensive glossary of healthcare marketing terms including SEO, HIPAA compliance, Google Ads, patient acquisition, and medical practice growth terminology.',
    url: 'https://thenextgenhealth.com/glossary',
    siteName: 'NextGen Health',
    type: 'website',
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'Healthcare Marketing Glossary',
  description:
    'A comprehensive glossary of healthcare marketing terms, definitions, and concepts used in medical practice growth.',
  url: 'https://thenextgenhealth.com/glossary',
};

interface GlossaryTerm {
  term: string;
  definition: string;
  relatedLink?: { href: string; label: string };
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'AEO (Answer Engine Optimization)',
    definition:
      'The practice of optimizing website content to appear in AI-generated answers from search engines, voice assistants, and large language models like Google Gemini, ChatGPT, and Microsoft Copilot. For healthcare providers, AEO ensures your practice information surfaces when patients ask questions like "best urgent care near me."',
    relatedLink: { href: '/services/seo-local-search', label: 'SEO & Local Search' },
  },
  {
    term: 'BAA (Business Associate Agreement)',
    definition:
      'A legally binding contract required by HIPAA between a healthcare provider (covered entity) and any third-party vendor (business associate) that handles Protected Health Information (PHI). Marketing agencies working with medical practices must sign a BAA to ensure patient data is properly safeguarded.',
    relatedLink: { href: '/hipaa', label: 'HIPAA Compliance' },
  },
  {
    term: 'Bounce Rate',
    definition:
      'The percentage of website visitors who leave after viewing only one page without taking any action. A high bounce rate on a clinic\'s homepage or landing page may indicate poor user experience, slow load times, or mismatched search intent. Healthcare websites should aim for bounce rates below 50%.',
    relatedLink: { href: '/services/analytics-reporting', label: 'Analytics & Reporting' },
  },
  {
    term: 'Call Tracking',
    definition:
      'Technology that assigns unique phone numbers to different marketing channels (Google Ads, SEO, social media) to measure which campaigns generate the most patient calls. HIPAA-compliant call tracking ensures call recordings and caller data are stored securely.',
    relatedLink: { href: '/automation/call-tracking', label: 'Call Tracking Automation' },
  },
  {
    term: 'Citation (Local SEO)',
    definition:
      'Any online mention of your healthcare practice\'s Name, Address, and Phone number (NAP). Citations on directories like Healthgrades, ZocDoc, Yelp, and Google Business Profile help establish local authority and improve your Google Maps rankings.',
    relatedLink: { href: '/services/google-business-profile', label: 'Google Business Profile' },
  },
  {
    term: 'Conversion Rate',
    definition:
      'The percentage of website visitors who complete a desired action — scheduling an appointment, calling the clinic, or filling out an intake form. Average healthcare website conversion rates range from 3-8%, but well-optimized pages can achieve 15%+.',
    relatedLink: { href: '/services/website-design-dev', label: 'Website Design & Development' },
  },
  {
    term: 'Core Web Vitals',
    definition:
      'A set of Google metrics measuring real-world user experience on your website: Largest Contentful Paint (loading speed), Interaction to Next Paint (interactivity responsiveness), and Cumulative Layout Shift (visual stability). These directly impact search rankings.',
    relatedLink: { href: '/services/website-design-dev', label: 'Website Design & Development' },
  },
  {
    term: 'CPA (Cost Per Acquisition)',
    definition:
      'The total marketing cost divided by the number of new patients acquired. This is the most important metric for healthcare marketing ROI. CPA varies significantly by specialty — a Freestanding ER patient acquisition might cost $150-$400, while a dental cleaning lead costs $20-$50.',
    relatedLink: { href: '/services/google-ads', label: 'Google Ads' },
  },
  {
    term: 'CTR (Click-Through Rate)',
    definition:
      'The percentage of people who click on your ad or search listing after seeing it. For Google Ads in healthcare, a good CTR is 4-8%. For organic search results, the top position typically gets 25-35% CTR.',
    relatedLink: { href: '/services/google-ads', label: 'Google Ads' },
  },
  {
    term: 'Drip Campaign',
    definition:
      'An automated sequence of emails sent to patients over time based on triggers — appointment reminders, post-visit follow-ups, seasonal wellness tips, or re-engagement for lapsed patients. HIPAA-compliant drip campaigns never include PHI in email content.',
    relatedLink: { href: '/services/email-drip-campaigns', label: 'Email & Drip Campaigns' },
  },
  {
    term: 'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)',
    definition:
      'Google\'s framework for evaluating content quality, especially critical for YMYL (Your Money or Your Life) topics like healthcare. Medical websites must demonstrate author credentials, cite authoritative sources, and provide accurate, up-to-date health information.',
    relatedLink: { href: '/services/content-copywriting', label: 'Content & Copywriting' },
  },
  {
    term: 'GBP (Google Business Profile)',
    definition:
      'Formerly Google My Business (GMB), this is the free Google listing that appears in Google Maps and local search results. For healthcare practices, an optimized GBP with accurate hours, services, photos, and reviews is the single most important local SEO asset.',
    relatedLink: { href: '/services/google-business-profile', label: 'Google Business Profile' },
  },
  {
    term: 'HIPAA (Health Insurance Portability and Accountability Act)',
    definition:
      'Federal law that establishes standards for protecting sensitive patient health information. In marketing, HIPAA compliance means never using patient data without consent, encrypting all forms that collect health information, using BAA-covered vendors, and avoiding retargeting pixels on pages containing PHI.',
    relatedLink: { href: '/hipaa', label: 'HIPAA Compliance' },
  },
  {
    term: 'Impression',
    definition:
      'A single instance of your ad or search listing being displayed to a user. Impressions measure visibility, not engagement. In healthcare marketing, impression data helps assess the total addressable patient market in your service area.',
  },
  {
    term: 'ISR (Incremental Static Regeneration)',
    definition:
      'A Next.js feature that regenerates static pages in the background at set intervals without requiring a full site rebuild. Our healthcare websites use ISR to keep blog and news content fresh while maintaining ultra-fast page load speeds.',
    relatedLink: { href: '/services/website-design-dev', label: 'Website Design & Development' },
  },
  {
    term: 'Local Pack (Map Pack)',
    definition:
      'The top 3 Google Business Profile listings that appear in Google Maps results for local searches. Ranking in the Local Pack for terms like "urgent care near me" or "ER in [city]" is the highest-value organic real estate for healthcare practices.',
    relatedLink: { href: '/services/seo-local-search', label: 'SEO & Local Search' },
  },
  {
    term: 'Meta Ads (Facebook/Instagram Ads)',
    definition:
      'Paid advertising on Meta platforms (Facebook and Instagram) using demographic, interest, and behavioral targeting. Effective for elective procedures (MedSpa treatments, cosmetic dentistry) and building brand awareness for new clinic locations.',
    relatedLink: { href: '/services/meta-ads', label: 'Meta & Facebook Ads' },
  },
  {
    term: 'NAP Consistency',
    definition:
      'Ensuring your practice\'s Name, Address, and Phone number are identical across every online directory, website, and social profile. Inconsistent NAP data confuses search engines and can significantly harm your local search rankings.',
    relatedLink: { href: '/services/google-business-profile', label: 'Google Business Profile' },
  },
  {
    term: 'Patient Acquisition Cost',
    definition:
      'The total cost to acquire one new patient, including ad spend, agency fees, and operational costs. This metric is essential for evaluating marketing ROI and varies by specialty, geography, and insurance mix.',
    relatedLink: { href: '/services/strategy-planning', label: 'Strategy & Planning' },
  },
  {
    term: 'PPC (Pay-Per-Click)',
    definition:
      'An advertising model where you pay only when someone clicks on your ad. Google Ads is the primary PPC platform for healthcare. Average cost-per-click for medical keywords ranges from $3-$15, with high-acuity terms like "emergency room near me" exceeding $20.',
    relatedLink: { href: '/services/google-ads', label: 'Google Ads' },
  },
  {
    term: 'Quality Score',
    definition:
      'Google Ads\' rating (1-10) of the relevance and quality of your keywords, ad copy, and landing pages. Higher Quality Scores reduce your cost-per-click and improve ad position. Healthcare ads require compliant, accurate landing pages to achieve high scores.',
    relatedLink: { href: '/services/google-ads', label: 'Google Ads' },
  },
  {
    term: 'ROAS (Return on Ad Spend)',
    definition:
      'Revenue generated divided by advertising cost. A ROAS of 4x means every $1 in ad spend generates $4 in revenue. Our Growth Pro clients typically achieve 3-5x ROAS through optimized targeting and AI-driven lead handling.',
    relatedLink: { href: '/services/analytics-reporting', label: 'Analytics & Reporting' },
  },
  {
    term: 'Schema Markup (Structured Data)',
    definition:
      'Code added to your website that helps search engines understand your content. For healthcare, this includes Organization schema, LocalBusiness schema, FAQPage schema, and MedicalOrganization schema. Schema markup enables rich snippets in search results.',
    relatedLink: { href: '/services/seo-local-search', label: 'SEO & Local Search' },
  },
  {
    term: 'SLA (Service Level Agreement)',
    definition:
      'A documented commitment guaranteeing specific response times and service standards. In healthcare marketing, SLAs are critical — a website outage or campaign malfunction directly impacts patient access. We provide sub-4-hour response times for critical issues.',
    relatedLink: { href: '/about', label: 'About Us' },
  },
  {
    term: 'YMYL (Your Money or Your Life)',
    definition:
      'Google\'s classification for web pages that could significantly impact a person\'s health, financial stability, or safety. All healthcare content falls under YMYL, meaning Google applies stricter quality standards. Inaccurate medical content can be penalized or demoted in rankings.',
    relatedLink: { href: '/services/content-copywriting', label: 'Content & Copywriting' },
  },
];

// Group terms by first letter
function groupByLetter(terms: GlossaryTerm[]) {
  const groups: Record<string, GlossaryTerm[]> = {};
  terms.forEach((t) => {
    const letter = t.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(t);
  });
  return groups;
}

export default function GlossaryPage() {
  const grouped = groupByLetter(glossaryTerms);
  const letters = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />
      <Breadcrumbs />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Healthcare Marketing <span className="text-emerald-500">Glossary</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: <time dateTime="2025-01-15">January 15, 2025</time></p>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A comprehensive reference of key terms, acronyms, and concepts used in healthcare
            marketing, SEO, paid media, and medical practice growth strategy.
          </p>
        </div>
      </section>

      {/* Letter Navigation */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 justify-center">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      </section>

      {/* Glossary Terms */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
              <h2 className="text-3xl font-black text-emerald-500 mb-6 border-b border-slate-200 pb-2">
                {letter}
              </h2>
              <dl className="space-y-8">
                {grouped[letter].map((item) => (
                  <div key={item.term}>
                    <dt className="text-xl font-bold text-slate-900 mb-2">{item.term}</dt>
                    <dd className="text-slate-600 text-lg leading-relaxed">
                      {item.definition}
                      {item.relatedLink && (
                        <>
                          {' '}
                          <Link
                            href={item.relatedLink.href}
                            className="text-emerald-600 underline hover:text-emerald-700 font-medium"
                          >
                            Learn more about {item.relatedLink.label} →
                          </Link>
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Put These Strategies to Work?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Our team specializes in every concept listed above — from{' '}
            <Link href="/services/seo-local-search" className="text-emerald-600 underline">
              SEO
            </Link>{' '}
            and{' '}
            <Link href="/services/google-ads" className="text-emerald-600 underline">
              Google Ads
            </Link>{' '}
            to{' '}
            <Link href="/hipaa" className="text-emerald-600 underline">
              HIPAA compliance
            </Link>{' '}
            and{' '}
            <Link href="/automation/ai-chatbots" className="text-emerald-600 underline">
              AI automation
            </Link>
            . Let us build a custom growth system for your practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Schedule a Consultation
            </Link>
            <Link
              href="/services"
              className="inline-block px-8 py-4 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
