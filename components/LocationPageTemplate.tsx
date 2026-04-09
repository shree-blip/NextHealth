'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LocationData } from '@/lib/location-data';
import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

export default function LocationPageTemplate({ data }: { data: LocationData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <article className="bg-white">
      <Breadcrumbs />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/locations" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
              &larr; All Locations
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-8 w-8 text-blue-400" />
              <span className="text-blue-300 font-semibold">{data.region}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">{data.h1}</h1>
            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">{data.heroDescription}</p>
          </motion.div>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/book-a-demo" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors">
              Get a Free {data.city} Market Analysis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Local Stats */}
      <section className="bg-blue-600 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {data.localStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-blue-100 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-20 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 block">Market Overview</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The {data.city} Healthcare Market</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{data.overview}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <ul className="space-y-4">
                {data.overviewPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="flex-shrink-0 w-5 h-5 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Services for this City */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 block">Our Services</span>
            <h2 className="text-3xl font-bold text-gray-900">What We Do for {data.city} Practices</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {data.services.map((svc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/services/${svc.slug}`} className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all h-full group">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">{svc.label}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{svc.description}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-emerald-600">
                    Learn More <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighbourhoods We Serve */}
      <section className="py-20 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Areas We Serve in {data.city}</h2>
            <p className="text-lg text-gray-600">We help healthcare practices across all {data.city} neighbourhoods and surrounding suburbs.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {data.neighborhoods.map((n, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
              >
                {n}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{data.city} Healthcare Marketing FAQ</h2>
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

      {/* Related Locations */}
      <section className="py-16 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">We Also Serve</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {data.relatedLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{loc.label}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Grow Your {data.city} Practice?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Let us show you exactly how we can drive more patients to your {data.city} clinic. Book a free market analysis today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-a-demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Book a Free Demo
            </Link>
            <Link href="/case-studies" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              View Case Studies
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
