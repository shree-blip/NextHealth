import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Careers | NextGen Health',
  description: 'Join NextGen Health and reshape healthcare marketing. We are hiring SEO specialists, ad managers, developers, and content writers.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/careers',
  },
  openGraph: {
    title: 'Healthcare Marketing Careers | NextGen Health',
    description: 'Join NextGen Health and reshape healthcare marketing. We are hiring SEO specialists, ad managers, developers, and content writers.',
    url: 'https://thenextgenhealth.com/careers',
    siteName: 'NextGen Health',
    type: 'website',
  },
};

const openings = [
  {
    title: 'SEO Specialist — Healthcare',
    type: 'Full-Time',
    location: 'Remote / Irving, TX',
    description: 'Own local SEO strategy for a portfolio of healthcare clients. You will manage GBP optimisation, technical audits, link building, and schema implementation for clinics across Texas.',
  },
  {
    title: 'Google Ads Manager',
    type: 'Full-Time',
    location: 'Remote / Irving, TX',
    description: 'Manage $500K+ in annual healthcare ad spend across Google Search, Display, and Performance Max. Build, optimise, and scale campaigns that drive measurable patient acquisition.',
  },
  {
    title: 'Content Writer — Medical',
    type: 'Contract / Full-Time',
    location: 'Remote',
    description: 'Create HIPAA-compliant blog posts, landing pages, and patient education content for healthcare practices. Medical writing experience or healthcare background preferred.',
  },
  {
    title: 'Full-Stack Developer',
    type: 'Full-Time',
    location: 'Remote / Irving, TX',
    description: 'Build and maintain our SaaS platform, client dashboards, and automation tools. Tech stack: Next.js, TypeScript, PostgreSQL, Supabase, Vercel. Experience with healthcare compliance is a plus.',
  },
];

const perks = [
  { icon: '🏠', title: 'Remote-First', description: 'Work from anywhere. We are a distributed team.' },
  { icon: '🏥', title: 'Health Impact', description: 'Your work directly helps patients access better healthcare.' },
  { icon: '📈', title: 'Growth Path', description: 'Clear career progression with quarterly reviews.' },
  { icon: '🎓', title: 'Learning Budget', description: 'Annual budget for certifications, courses, and conferences.' },
  { icon: '🌴', title: 'Flexible PTO', description: 'Take the time you need to recharge.' },
  { icon: '💻', title: 'Equipment', description: 'Laptop, monitor, and tools provided.' },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Breadcrumbs />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Join NextGen Health</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            We are building the future of healthcare marketing. If you are passionate about data-driven growth and want your work to have real clinical impact, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Work With Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {perks.map((perk, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-3 block">{perk.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1">{perk.title}</h3>
                <p className="text-sm text-gray-600">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>
          <div className="space-y-6">
            {openings.map((job, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">{job.type}</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{job.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{job.description}</p>
                <Link href={`mailto:hello@thenextgenhealth.com?subject=Application: ${encodeURIComponent(job.title)}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Apply Now &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Don&rsquo;t See Your Role?</h2>
          <p className="text-emerald-100 text-lg mb-8">
            We are always looking for exceptional talent. Send us your resume and tell us how you can help reshape healthcare marketing.
          </p>
          <Link href="mailto:hello@thenextgenhealth.com?subject=General Application" className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
            Send Your Resume
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
