import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book a Free Healthcare Marketing Demo | NextGen Health',
  description: 'Schedule a free demo to see how NextGen Health can grow your clinic. We\'ll show you our SEO, ads, and automation solutions tailored for healthcare.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/book-a-demo',
  },
  openGraph: {
    title: 'Book a Free Healthcare Marketing Demo | NextGen Health',
    description: 'Schedule a free demo to see how NextGen Health can grow your clinic. We\'ll show you our SEO, ads, and automation solutions tailored for healthcare.',
    url: 'https://thenextgenhealth.com/book-a-demo',
    siteName: 'NextGen Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Healthcare Marketing Demo | NextGen Health',
    description: 'Schedule a free demo to see how NextGen Health can grow your clinic. We\'ll show you our SEO, ads, and automation solutions tailored for healthcare.',
  },
};

export default function BookADemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Breadcrumbs />

      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Book a Free Demo</h1>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Pick a time that works for your team and we&rsquo;ll walk you through our healthcare growth system — tailored to your speciality, location, and budget.
            </p>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            <div className="text-center p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl font-extrabold text-emerald-600">100%</div>
              <p className="text-xs text-slate-500 mt-1">Free — No obligation</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl font-extrabold text-emerald-600">30 min</div>
              <p className="text-xs text-slate-500 mt-1">Quick & focused</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl font-extrabold text-emerald-600">HIPAA</div>
              <p className="text-xs text-slate-500 mt-1">Compliant processes</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-2xl font-extrabold text-emerald-600">50+</div>
              <p className="text-xs text-slate-500 mt-1">Clinics trust us</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
              {/* Google Calendar Appointment Scheduling begin */}
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3LZ4mnG3SynIotGMFwBP9vGwEg3MUBWLke38kVC6sPe75GfAIEhyRQd_vitpZSwFN2zOqo019G?gv=true"
                title="Book a demo calendar"
                style={{ border: 0 }}
                width="100%"
                height={600}
                frameBorder={0}
                loading="eager"
              />
              {/* end Google Calendar Appointment Scheduling */}
            </div>

            {/* What to Expect Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">What to Expect</h2>
                <ol className="space-y-4 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">1</span>
                    <div><strong className="text-slate-900">Discovery</strong> — We learn about your practice, goals, and current marketing.</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">2</span>
                    <div><strong className="text-slate-900">Live Audit</strong> — We show you exactly where you&rsquo;re losing patients online.</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">3</span>
                    <div><strong className="text-slate-900">Custom Plan</strong> — You get a tailored growth roadmap, whether you work with us or not.</div>
                  </li>
                </ol>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-sm font-semibold text-emerald-800 mb-2">🔒 HIPAA Compliant</p>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  All discussions and data shared during the demo are handled in full compliance with HIPAA regulations. <Link href="/hipaa" className="underline hover:text-emerald-900">Learn more</Link>.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-medium text-slate-700 italic">
                  &ldquo;The demo alone gave us actionable insights we implemented the next day. Best 30 minutes we spent all quarter.&rdquo;
                </p>
                <p className="text-xs text-slate-500 mt-2">— Practice Manager, Dallas ER Network</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-slate-600">
            Having trouble with the scheduler? <a href="/contact" className="text-emerald-600 underline hover:text-emerald-700">Contact us here</a>.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Not ready to book? Explore first.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/case-studies" className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors">Case Studies</Link>
            <Link href="/services" className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors">Our Services</Link>
            <Link href="/pricing" className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors">Pricing</Link>
            <Link href="/proven-results" className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors">Proven Results</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
