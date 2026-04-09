import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllIndustrySlugs, getIndustryBySlug } from '@/lib/industry-data';
import { getAllAutomationSlugs, getAutomationBySlug } from '@/lib/automation-data';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '@/lib/case-study-data';
import { getAllLocationSlugs, getLocationBySlug } from '@/lib/location-data';

export const metadata: Metadata = {
  title: 'Sitemap — All Pages | NextGen Health',
  description: 'A complete directory of all pages on the NextGen Health website. Browse our services, industries, locations, case studies, and more.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/sitemap-html',
  },
  openGraph: {
    title: 'Sitemap — All Pages | NextGen Health',
    description: 'A complete directory of all pages on the NextGen Health website. Browse our services, industries, locations, case studies, and more.',
    url: 'https://thenextgenhealth.com/sitemap-html',
    siteName: 'NextGen Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sitemap — All Pages | NextGen Health',
    description: 'A complete directory of all pages on the NextGen Health website. Browse our services, industries, locations, case studies, and more.',
  },
};

export default function HTMLSitemapPage() {
  const industrySlugs = getAllIndustrySlugs();
  const automationSlugs = getAllAutomationSlugs();
  const caseStudySlugs = getAllCaseStudySlugs();
  const locationSlugs = getAllLocationSlugs();

  const sections = [
    {
      title: 'Main Pages',
      links: [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About Us' },
        { href: '/services', label: 'Services' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/proven-results', label: 'Proven Results' },
        { href: '/case-studies', label: 'Case Studies' },
        { href: '/industries', label: 'Industries' },
        { href: '/automation', label: 'Automation' },
        { href: '/locations', label: 'Locations' },
        { href: '/blog', label: 'Blog' },
        { href: '/news', label: 'News' },
        { href: '/team', label: 'Team' },
        { href: '/contact', label: 'Contact' },
        { href: '/book-a-demo', label: 'Book a Demo' },
      ],
    },
    {
      title: 'Services',
      links: [
        { href: '/services/seo-local-search', label: 'SEO & Local Search' },
        { href: '/services/google-ads', label: 'Google Ads' },
        { href: '/services/meta-ads', label: 'Meta Ads' },
        { href: '/services/website-design-dev', label: 'Website Design & Dev' },
        { href: '/services/social-media-marketing', label: 'Social Media Marketing' },
        { href: '/services/content-copywriting', label: 'Content & Copywriting' },
        { href: '/services/email-drip-campaigns', label: 'Email & Drip Campaigns' },
        { href: '/services/google-business-profile', label: 'Google Business Profile' },
        { href: '/services/brand-identity-design', label: 'Brand Identity Design' },
        { href: '/services/brochure-print-design', label: 'Brochure & Print Design' },
        { href: '/services/analytics-reporting', label: 'Analytics & Reporting' },
        { href: '/services/strategy-planning', label: 'Strategy & Planning' },
        { href: '/services/on-site-field-marketing', label: 'On-Site & Field Marketing' },
      ],
    },
    {
      title: 'Industries',
      links: industrySlugs.map((slug) => {
        const data = getIndustryBySlug(slug);
        return { href: `/industries/${slug}`, label: data?.h1 || slug };
      }),
    },
    {
      title: 'Automation',
      links: automationSlugs.map((slug) => {
        const data = getAutomationBySlug(slug);
        return { href: `/automation/${slug}`, label: data?.h1 || slug };
      }),
    },
    {
      title: 'Case Studies',
      links: caseStudySlugs.map((slug) => {
        const data = getCaseStudyBySlug(slug);
        return { href: `/case-studies/${slug}`, label: data?.h1 || slug };
      }),
    },
    {
      title: 'Locations',
      links: locationSlugs.map((slug) => {
        const data = getLocationBySlug(slug);
        return { href: `/locations/${slug}`, label: data?.h1 || slug };
      }),
    },
    {
      title: 'Company & Legal',
      links: [
        { href: '/about', label: 'About' },
        { href: '/team', label: 'Team' },
        { href: '/careers', label: 'Careers' },
        { href: '/faq', label: 'FAQ' },
        { href: '/hipaa', label: 'HIPAA Compliance' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/accessibility', label: 'Accessibility' },
        { href: '/glossary', label: 'Healthcare Marketing Glossary' },
        { href: '/services/healthcare-seo-guide', label: 'Healthcare SEO Guide (Pillar)' },
        { href: '/automation/healthcare-automation-guide', label: 'Healthcare Automation Guide (Pillar)' },
        { href: '/resources', label: 'Resources Hub' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sitemap</h1>
          <p className="mt-3 text-lg text-slate-600">A complete directory of all pages on our website.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sections.map((section, si) => (
              <div key={si}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <Link href={link.href} className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
