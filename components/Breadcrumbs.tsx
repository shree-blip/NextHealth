'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Human-readable labels for every known route segment                */
/* ------------------------------------------------------------------ */
const ROUTE_LABELS: Record<string, string> = {
  about: 'About',
  contact: 'Contact',
  pricing: 'Pricing',
  services: 'Services',
  industries: 'Industries',
  automation: 'Automation',
  blog: 'Blog',
  news: 'Healthcare News',
  'case-studies': 'Case Studies',
  'proven-results': 'Proven Results',
  team: 'Team',
  locations: 'Locations',
  hipaa: 'HIPAA Compliance',
  'book-a-demo': 'Book a Demo',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  // Service slugs
  'seo-local-search': 'SEO & Local Search',
  'google-ads': 'Google Ads',
  'meta-ads': 'Meta Ads',
  'website-design-dev': 'Website Design & Development',
  'social-media-marketing': 'Social Media Marketing',
  'content-copywriting': 'Content & Copywriting',
  'email-drip-campaigns': 'Email Drip Campaigns',
  'google-business-profile': 'Google Business Profile',
  'brand-identity-design': 'Brand Identity Design',
  'brochure-print-design': 'Print Design',
  'analytics-reporting': 'Analytics & Reporting',
  'strategy-planning': 'Strategy & Planning',
  'on-site-field-marketing': 'On-Site Field Marketing',
  'healthcare-seo-guide': 'Healthcare SEO Guide',
  'healthcare-automation-guide': 'Healthcare Automation Guide',
  faq: 'FAQ',
  glossary: 'Glossary',
  resources: 'Resources',
  careers: 'Careers',
  accessibility: 'Accessibility',
  'sitemap-html': 'Sitemap',
  // Industry slugs
  dental: 'Dental',
  medspa: 'MedSpa & Aesthetics',
  chiropractic: 'Chiropractic',
  'mental-health': 'Mental Health',
  'urgent-care': 'Urgent Care',
  'freestanding-ers': 'Freestanding ERs',
  'primary-care': 'Primary Care',
  'plastic-surgery': 'Plastic Surgery',
  ophthalmology: 'Ophthalmology',
  dermatology: 'Dermatology',
  // Location slugs
  dallas: 'Dallas',
  houston: 'Houston',
  austin: 'Austin',
  'san-antonio': 'San Antonio',
  'fort-worth': 'Fort Worth',
  // Case study slugs
  'er-network-patient-growth': 'ER Network Growth',
  'urgent-care-patient-acquisition': 'Urgent Care Acquisition',
  'cosmetic-surgery-lead-growth': 'Cosmetic Surgery Leads',
  'primary-care-seo-roi': 'Primary Care SEO ROI',
  'mental-health-patient-retention': 'Mental Health Retention',
  'dental-practice-local-pack': 'Dental Local Pack',
  // Automation slugs
  'ai-chatbot': 'AI Chatbot',
  'patient-intake': 'Patient Intake',
  'review-collection': 'Review Collection',
  'appointment-reminders': 'Appointment Reminders',
  'insurance-verification': 'Insurance Verification',
  'recall-campaigns': 'Recall Campaigns',
  'social-media-scheduling': 'Social Media Scheduling',
  'reporting-dashboards': 'Reporting Dashboards',
  // Team member slugs
  'shree-gauli': 'Shree Gauli',
  'bikash-neupane': 'Bikash Neupane',
  'sonu-sagar-dongol': 'Sonu Sagar Dongol',
  'bijesh-khadgi': 'Bijesh Khadgi',
  'sumit-sharma': 'Sumit Sharma',
  'rahul-roy': 'Rahul Roy',
  'bidhitsha-khadka': 'Bidhitsha Khadka',
  'sagar-timalsina': 'Sagar Timalsina',
};

function labelForSegment(segment: string): string {
  return (
    ROUTE_LABELS[segment] ||
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/* ------------------------------------------------------------------ */
/*  Breadcrumbs component                                              */
/* ------------------------------------------------------------------ */
export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't render on home page
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const items = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: labelForSegment(seg),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  // BreadcrumbList JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `https://thenextgenhealth.com${item.href === '/' ? '' : item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="fixed top-20 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            {items.map((item, i) => (
              <li key={item.href} className="flex items-center gap-1">
                {i > 0 && (
                  <svg
                    className="h-3.5 w-3.5 text-slate-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {i === items.length - 1 ? (
                  <span
                    className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
