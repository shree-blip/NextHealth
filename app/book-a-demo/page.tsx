import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Demo | The NextGen Healthcare Marketing',
  description: 'Book a demo to see how The NextGen Healthcare Marketing drives healthcare patient acquisition with SEO, paid media, analytics, and automation.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/book-a-demo',
  },
};

export default function BookADemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Book a Demo</h1>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Pick a time that works for your team and we&rsquo;ll walk you through our healthcare growth system.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
            {/* Google Calendar Appointment Scheduling begin */}
            <iframe
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3LZ4mnG3SynIotGMFwBP9vGwEg3MUBWLke38kVC6sPe75GfAIEhyRQd_vitpZSwFN2zOqo019G?gv=true"
              title="Book a demo calendar"
              style={{ border: 0 }}
              width="100%"
              height={600}
              frameBorder={0}
              loading="lazy"
            />
            {/* end Google Calendar Appointment Scheduling */}
          </div>

          <p className="mt-4 text-center text-sm text-slate-600">
            Having trouble with the scheduler? <a href="/contact" className="text-emerald-600 underline hover:text-emerald-700">Contact us here</a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
