'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import FAQ from './FAQ';
import { ReactNode } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface ServicePageTemplateProps {
  title: string;
  excerpt: string;
  image: string;
  overview: ReactNode;
  coreFeatures: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  breakdown: Array<{
    title: string;
    items: string[];
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
  benefits: string[];
}

export default function ServicePageTemplate({
  title,
  excerpt,
  image,
  overview,
  coreFeatures,
  breakdown,
  faqs,
  benefits,
}: ServicePageTemplateProps) {
  const { language, t } = useSitePreferences();

  const localizedCoreFeatures = coreFeatures.map((feature) => ({
    ...feature,
    title: t(feature.title),
    description: t(feature.description),
  }));

  const localizedBreakdown = breakdown.map((section) => ({
    ...section,
    title: t(section.title),
    items: section.items.map((item) => t(item)),
  }));

  const localizedBenefits = benefits.map((benefit) => t(benefit));
  const localizedFaqs = faqs.map((faq) => ({ q: t(faq.q), a: t(faq.a) }));

  return (
    <section className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 md:py-32 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        {/* Dark Overlay for Text Visibility */}
        <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-900/40 z-0" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                {title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {excerpt}
              </p>
              <Link href="/contact" className="inline-block px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                {t('Get Started')}
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="py-20 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-3xl dark:prose-invert"
          >
            {overview}
          </motion.div>
        </div>
      </div>

      {/* Core Features */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('Core Features')}</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">{t('What makes this service essential for healthcare practices')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {localizedCoreFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="py-20 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('Service Breakdown')}</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">{t('Everything included in our comprehensive service')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            {localizedBreakdown.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-emerald-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold">{t('Key Benefits')}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {localizedBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <p className="text-lg leading-relaxed">{benefit}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('Frequently Asked Questions')}</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">{t('Everything you need to know about this service')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <FAQ faqs={localizedFaqs} />
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">{t('Ready to Transform Your Healthcare Practice?')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {language === 'es'
                ? `Comienza hoy con ${title} y obtén resultados medibles.`
                : `Get started with ${title} today and see measurable results.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-block px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-center">
                {t('Schedule Consultation')}
              </Link>
              <Link href="/case-studies" className="inline-block px-8 py-4 border-2 border-emerald-500 text-emerald-500 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-center">
                {t('View Case Studies')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
