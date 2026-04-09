import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Resources & Guides | NextGen Health',
  description: 'Free healthcare marketing resources: SEO guides, automation playbooks, case studies, glossary, and expert blog posts to grow your medical practice.',
  keywords: 'healthcare marketing resources, medical marketing guides, healthcare SEO guide, marketing automation guide, medical practice growth',
  alternates: {
    canonical: 'https://thenextgenhealth.com/resources',
  },
  openGraph: {
    title: 'Healthcare Marketing Resources & Guides | NextGen Health',
    description: 'Free healthcare marketing resources: SEO guides, automation playbooks, case studies, glossary, and expert blog posts to grow your medical practice.',
    url: 'https://thenextgenhealth.com/resources',
    siteName: 'NextGen Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing Resources & Guides | NextGen Health',
    description: 'Free healthcare marketing resources: SEO guides, automation playbooks, case studies, glossary, and expert blog posts to grow your medical practice.',
  },
};

const resourceCategories = [
  {
    title: 'Pillar Guides',
    description: 'In-depth, comprehensive guides on healthcare marketing topics.',
    icon: '📚',
    links: [
      { href: '/services/healthcare-seo-guide', label: 'The Complete Guide to Healthcare SEO', description: 'Everything you need to know about ranking your medical practice on Google.' },
      { href: '/automation/healthcare-automation-guide', label: 'The Complete Guide to Healthcare Marketing Automation', description: 'Automate patient intake, reviews, scheduling, and more.' },
    ],
  },
  {
    title: 'Blog & Insights',
    description: 'Expert articles on healthcare digital marketing strategies.',
    icon: '✍️',
    links: [
      { href: '/blog', label: 'Healthcare Marketing Blog', description: 'SEO tips, paid ads strategies, content marketing, and more.' },
      { href: '/news', label: 'Healthcare Industry News', description: 'The latest trends and updates impacting healthcare marketing.' },
    ],
  },
  {
    title: 'Case Studies & Results',
    description: 'Real examples of how we drive patient growth for healthcare practices.',
    icon: '📈',
    links: [
      { href: '/case-studies', label: 'Client Case Studies', description: 'Detailed breakdowns of campaigns and measurable outcomes.' },
      { href: '/proven-results', label: 'Proven Results', description: 'Aggregated performance metrics across all client engagements.' },
    ],
  },
  {
    title: 'Service Deep-Dives',
    description: 'Explore each of our 13 healthcare marketing services in detail.',
    icon: '🩺',
    links: [
      { href: '/services/seo-local-search', label: 'SEO & Local Search', description: 'Dominate Google Maps and organic results in your market.' },
      { href: '/services/google-business-profile', label: 'Google Business Profile', description: 'Optimize your GBP for maximum local visibility.' },
      { href: '/services/google-ads', label: 'Google Ads & Paid Search', description: 'High-converting PPC campaigns for healthcare.' },
      { href: '/services/content-copywriting', label: 'Content & Copywriting', description: 'Medical content that ranks and converts.' },
      { href: '/services/website-design-dev', label: 'Website Design & Dev', description: 'HIPAA-compliant, fast healthcare websites.' },
      { href: '/services', label: 'View All 13 Services →', description: 'Our complete healthcare marketing service catalog.' },
    ],
  },
  {
    title: 'Industry Pages',
    description: 'Marketing strategies tailored to your healthcare specialty.',
    icon: '🏥',
    links: [
      { href: '/industries/dental', label: 'Dental Marketing', description: 'Patient acquisition strategies for dental practices.' },
      { href: '/industries/urgent-care', label: 'Urgent Care Marketing', description: 'Drive walk-ins and reduce empty chairs.' },
      { href: '/industries/medspa', label: 'MedSpa Marketing', description: 'Grow your aesthetic and wellness practice.' },
      { href: '/industries', label: 'View All Industries →', description: 'Explore all 10 healthcare verticals we serve.' },
    ],
  },
  {
    title: 'Tools & References',
    description: 'Quick-reference tools for healthcare marketing professionals.',
    icon: '🔧',
    links: [
      { href: '/glossary', label: 'Healthcare Marketing Glossary', description: '25+ terms defined with clear, jargon-free explanations.' },
      { href: '/faq', label: 'Frequently Asked Questions', description: 'Common questions about our services and approach.' },
      { href: '/hipaa', label: 'HIPAA Compliance', description: 'How we ensure every campaign meets HIPAA standards.' },
    ],
  },
  {
    title: 'Automation Playbooks',
    description: 'Step-by-step automation solutions for healthcare workflows.',
    icon: '⚙️',
    links: [
      { href: '/automation/patient-intake', label: 'Patient Intake Automation', description: 'Digitize and streamline new patient onboarding.' },
      { href: '/automation/ai-chatbot', label: 'AI Chatbot for Healthcare', description: '24/7 patient engagement without adding staff.' },
      { href: '/automation/review-collection', label: 'Review Collection Automation', description: 'Automatically gather 5-star reviews from happy patients.' },
      { href: '/automation', label: 'View All Automations →', description: 'Our complete healthcare automation suite.' },
    ],
  },
];

export default function ResourcesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Healthcare Marketing Resources',
    description: 'A comprehensive collection of healthcare marketing resources, guides, tools, and insights.',
    url: 'https://thenextgenhealth.com/resources',
    publisher: {
      '@type': 'Organization',
      name: 'The NextGen Healthcare Marketing',
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-4">
            Healthcare Marketing Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Everything you need to grow your medical practice&mdash;comprehensive guides, expert blog posts,
            real case studies, automation playbooks, and quick-reference tools. All free, all built for healthcare.
          </p>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {resourceCategories.map((category) => (
              <div key={category.title} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-3 mt-4">
                  {category.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mt-0.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                          <span className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors block">{link.label}</span>
                          <span className="text-sm text-gray-500 leading-snug">{link.description}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-500">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Need a Custom Strategy?</h2>
          <p className="text-emerald-100 text-lg mb-8">
            Our resources provide the knowledge&mdash;our team provides the execution. Schedule a free consultation to discuss your practice&rsquo;s growth goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors">
              Schedule Consultation
            </Link>
            <Link href="/book-a-demo" className="inline-block px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
