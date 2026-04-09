'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CaseStudyData } from '@/lib/case-study-data';
import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';

export default function CaseStudyPageTemplate({ data }: { data: CaseStudyData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <article className="bg-white">
      <Breadcrumbs />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/case-studies" className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors">
              &larr; All Case Studies
            </Link>
            <span className="text-slate-500">|</span>
            <Link href={`/industries/${data.industrySlug}`} className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors">
              {data.industry}
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-6xl mb-6 block">{data.icon}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">{data.h1}</h1>
            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">{data.heroDescription}</p>
          </motion.div>
          <div className="flex flex-wrap gap-3 mt-8">
            {data.services.map((svc) => (
              <Link key={svc.slug} href={`/services/${svc.slug}`} className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-colors">
                {svc.label}
              </Link>
            ))}
            <span className="px-4 py-2 bg-emerald-500/20 rounded-full text-sm font-medium text-emerald-200">
              Timeline: {data.timeline}
            </span>
          </div>
        </div>
      </section>

      {/* Results Bar */}
      <section className="bg-emerald-600 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {data.results.map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-white">{result.value}</div>
                <div className="text-sm text-emerald-100 mt-1">{result.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-20 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 block">The Challenge</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Was Going Wrong</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{data.challenge}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <ul className="space-y-4">
                {data.challengePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Strategy */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 block">Our Strategy</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Plan</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{data.strategy}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <ul className="space-y-4">
                {data.strategyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="flex-shrink-0 w-5 h-5 text-emerald-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Execution Timeline */}
      <section className="py-20 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 block">Execution</span>
            <h2 className="text-3xl font-bold text-gray-900">How We Did It</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.execution.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl font-black text-emerald-100 mb-2">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{phase.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {data.testimonial && (
        <section className="py-20 bg-slate-900 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <svg className="w-12 h-12 text-emerald-500 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl font-medium leading-relaxed mb-8 italic">
                &ldquo;{data.testimonial.quote}&rdquo;
              </blockquote>
              <cite className="not-italic">
                <div className="text-emerald-400 font-bold">{data.testimonial.name}</div>
                <div className="text-slate-400 text-sm">{data.testimonial.title}</div>
              </cite>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Case Studies */}
      <section className="py-16 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">More Case Studies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {data.relatedCaseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/case-studies/${cs.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <span className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">{cs.label}</span>
                <svg className="h-4 w-4 ml-auto text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Want Results Like These?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Every strategy is custom-built for your practice. Book a free consultation and we&#39;ll show you how we can deliver similar growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-a-demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
              Book a Free Demo
            </Link>
            <Link href="/case-studies" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              View All Case Studies
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
