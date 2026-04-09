'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  slug?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'NextGen Health transformed our digital presence. We went from being invisible online to dominating our local market in under six months. The ROI has been extraordinary.',
    name: 'Medical Director',
    title: 'DFW Freestanding ER Network',
    slug: 'er-network-patient-growth',
  },
  {
    quote: "The team didn't just run ads — they built our brand from the ground up. Our clinics are busier than ever and patients actually recognise our name now.",
    name: 'Operations Director',
    title: 'Houston Urgent Care Network',
    slug: 'urgent-care-patient-acquisition',
  },
  {
    quote: 'They completely transformed our brand. We went from competing on price to being the aspirational choice in Austin. Our consultation bookings have never been higher.',
    name: 'Clinic Owner',
    title: 'Austin Aesthetic Clinic',
    slug: 'cosmetic-surgery-lead-growth',
  },
  {
    quote: 'SEO was always something we knew we should do but never had the expertise. NextGen Health made it effortless and the results speak for themselves. Google is now our #1 source of new patients.',
    name: 'Practice Owner, MD',
    title: 'San Antonio Family Medicine',
    slug: 'primary-care-seo-roi',
  },
  {
    quote: "What sets NextGen apart is they understand mental healthcare. They didn't just market our services — they helped us communicate with empathy and keep patients engaged in their care journey.",
    name: 'Clinical Director, LCSW',
    title: 'Dallas Therapy Practice',
    slug: 'mental-health-patient-retention',
  },
  {
    quote: "I wish we had done this years ago. We went from being invisible to being the first result patients see. The phone hasn't stopped ringing since we hit #1.",
    name: 'Practice Owner, DDS',
    title: 'Irving General Dentistry',
    slug: 'dental-practice-local-pack',
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((p) => (p + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-black text-white mb-2">What Our Clients Say</h2>
        <p className="text-slate-400 mb-12">Real feedback from healthcare practices we&apos;ve helped grow.</p>

        <div className="relative min-h-[220px] flex flex-col items-center justify-center">
          {/* Quote */}
          <svg className="w-10 h-10 text-emerald-500 mb-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.3 2.8C6 4.4 2.5 8.5 2.5 13.5c0 3.3 2 5.5 4.5 5.5 2.3 0 4-1.7 4-4s-1.7-4-4-4c-.4 0-.8.1-1.2.2C6.4 8.2 8.5 5.8 11.8 4.5l-.5-1.7zm10 0C16 4.4 12.5 8.5 12.5 13.5c0 3.3 2 5.5 4.5 5.5 2.3 0 4-1.7 4-4s-1.7-4-4-4c-.4 0-.8.1-1.2.2.6-3 2.7-5.5 6-6.7l-.5-1.7z" />
          </svg>

          <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-3xl mb-8 transition-opacity duration-500">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          <div className="mb-2">
            <div className="text-emerald-400 font-bold text-lg">{t.name}</div>
            <div className="text-slate-400">{t.title}</div>
          </div>

          {t.slug && (
            <Link
              href={`/case-studies/${t.slug}`}
              className="text-emerald-400 text-sm underline hover:text-emerald-300 transition-colors"
            >
              Read the full case study &rarr;
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-white transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === active ? 'bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-white transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
