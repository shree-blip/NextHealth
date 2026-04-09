'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { AutomationData } from '@/lib/automation-data';
import CTABanner from './CTABanner';
import Breadcrumbs from './Breadcrumbs';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function AutomationPageTemplate({ data }: { data: AutomationData }) {
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
              See It in Action
            </Link>
            <Link
              href="/automation"
              className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg"
            >
              All Automations
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.impact.map((stat, idx) => (
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

      {/* Problem Statement */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">The Problem</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{data.problemStatement}</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">A simple, automated workflow that runs in the background.</p>
          </motion.div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-emerald-200 hidden md:block" />
            <div className="space-y-8">
              {data.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx}
                  variants={fadeUp}
                  className="flex gap-6 items-start"
                >
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 font-bold text-lg">{idx + 1}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Benefits</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIPAA Compliance */}
      <section className="py-16 bg-emerald-50 border-y border-emerald-200">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">HIPAA Compliance</h3>
              <p className="text-slate-700 leading-relaxed">{data.hipaaNote}</p>
              <Link href="/hipaa" className="inline-block mt-4 text-emerald-700 font-bold hover:text-emerald-800 transition-colors">
                Learn more about our HIPAA compliance →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Integrations</h3>
            <p className="text-slate-600">Connects with the systems your practice already uses.</p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.integrations.map((integration, idx) => (
              <motion.span
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700"
              >
                {integration}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                  {faq.q}
                  <span className="ml-4 text-emerald-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Related Service</h3>
              <Link
                href={`/services/${data.relatedService.slug}`}
                className="block bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{data.relatedService.label}</span>
                  <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Related Automations</h3>
              <div className="space-y-3">
                {data.relatedAutomations.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/automation/${rel.slug}`}
                    className="block bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{rel.label}</span>
                      <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="See This Automation in Action"
        description="Book a free demo and we'll show you exactly how this automation works for your practice. No commitment required."
        primaryCTA={{ label: 'Book a Free Demo', href: '/book-a-demo' }}
        secondaryCTA={{ label: 'Contact Us', href: '/contact' }}
        variant="gradient"
      />
    </div>
  );
}
