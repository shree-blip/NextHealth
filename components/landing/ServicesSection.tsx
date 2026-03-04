'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const services = [
  {
    title: 'SEO & Local Search',
    description: 'Rank high on Google, and make sure patients find you first.',
    image: '/9.png',
    link: '/services/seo-local-search',
  },
  {
    title: 'Social Media Marketing',
    description: 'We create posts and ad campaigns that build your brand and drive appointments.',
    image: '/10.png',
    link: '/services/social-media-marketing',
  },
  {
    title: 'Google Ads & Paid Search',
    description: 'Convert searches into patients with tightly targeted ad campaigns.',
    image: '/11.png',
    link: '/services/google-ads',
  },
  {
    title: 'Medical Automation (n8n + Custom)',
    description: 'HIPAA-aware workflows for intake, follow-ups, reminders, and no-show recovery.',
    image: '/18.png',
    link: '/automation',
  },
  {
    title: 'Email & Drip Campaigns',
    description: 'Automated email flows that nurture leads and bring past patients back.',
    image: '/12.png',
    link: '/services/email-drip-campaigns',
  },
  {
    title: 'Strategy & Planning',
    description: 'We audit your practice, analyze competitors, and craft a plan to dominate your market.',
    image: '/13.png',
    link: '/services/strategy-planning',
  },
  {
    title: 'Brand Identity Design',
    description: 'From logos to colour palettes, we give your practice a professional look.',
    image: '/14.png',
    link: '/services/brand-identity-design',
  },
  {
    title: 'Brochure & Print Design',
    description: 'High-quality printed materials that support your digital campaigns.',
    image: '/15.png',
    link: '/services/brochure-print-design',
  },
];

export default function ServicesSection() {
  const { t } = useSitePreferences();

  const localizedServices = services.map((service) => ({
    ...service,
    title: t(service.title),
    description: t(service.description),
  }));

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-black text-slate-900 mb-4">{t('Our services')}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('Everything your healthcare practice needs to own the digital space.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedServices.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={service.link}>
                <div className="group relative bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="aspect-video overflow-hidden relative">
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600">{service.description}</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
