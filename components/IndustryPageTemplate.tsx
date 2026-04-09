'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { IndustryData } from '@/lib/industry-data';
import CTABanner from './CTABanner';
import Breadcrumbs from './Breadcrumbs';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function IndustryPageTemplate({ data }: { data: IndustryData }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Breadcrumbs />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-5xl mb-6 block">{data.icon}</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {data.h1}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            {data.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book-a-demo"
              className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors text-lg"
            >
              Book a Free Demo
            </Link>
            <Link
              href="/case-studies"
              className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg"
            >
              View Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Challenges */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Challenges in {data.h1.split('—')[0].trim()} 
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We understand the unique obstacles your practice faces. Here&apos;s how we solve each one.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.challenges.map((challenge, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                  <span className="text-red-500 font-bold text-lg">!</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{challenge.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{challenge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services for This Industry */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Services Tailored for Your Practice
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We select the right marketing channels based on your industry, competition, and growth goals.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
              >
                <Link
                  href={`/services/${svc.slug}`}
                  className="block bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{svc.label}</h3>
                    <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose NextGen Health
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {data.whyUs.map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-xl font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="space-y-6">
            {data.faqs.map((faq, idx) => (
              <motion.details
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                  {faq.q}
                  <span className="ml-4 text-emerald-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Explore Other Industries</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.relatedIndustries.map((rel) => (
              <Link
                key={rel.slug}
                href={`/industries/${rel.slug}`}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                {rel.label}
              </Link>
            ))}
            <Link
              href="/industries"
              className="px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              All Industries →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline={`Ready to Grow Your ${data.h1.split('—')[0].replace('Marketing', '').trim()} Practice?`}
        description="Book a free strategy session tailored to your industry. No commitment — just a clear roadmap to more patients."
        primaryCTA={{ label: 'Book a Free Demo', href: '/book-a-demo' }}
        secondaryCTA={{ label: 'Contact Us', href: '/contact' }}
        variant="gradient"
      />
    </div>
  );
}
