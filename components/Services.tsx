'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Service {
  title: string;
  description: string;
  icon: string;
  image: string;
  href: string;
}

interface ServicesProps {
  compact?: boolean;
  showImages?: boolean;
}

export default function Services({ compact = false, showImages = true }: ServicesProps) {
  const services: Service[] = [
    {
      title: 'SEO & Local Search',
      description: 'Dominate local search results and drive organic patient traffic.',
      icon: '🔍',
      image: '/1.png',
      href: '/services/seo-local-search',
    },
    {
      title: 'Social Media Marketing',
      description: 'Instagram, TikTok, Facebook, LinkedIn — we own every platform.',
      icon: '📱',
      image: '/2.png',
      href: '/services/social-media-marketing',
    },
    {
      title: 'Google Ads & Paid Search',
      description: 'High-converting PPC campaigns that fill your waiting room.',
      icon: '🎯',
      image: '/3.png',
      href: '/services/google-ads',
    },
    {
      title: 'Meta Ads',
      description: 'Facebook & Instagram ads that convert scrollers into patients.',
      icon: '👥',
      image: '/4.png',
      href: '/services/meta-ads',
    },
    {
      title: 'Email & Drip Campaigns',
      description: 'Nurture leads and keep patients coming back.',
      icon: '✉️',
      image: '/5.png',
      href: '/services/email-drip-campaigns',
    },
    {
      title: 'Strategy & Planning',
      description: 'Custom marketing roadmaps aligned with your growth goals.',
      icon: '📋',
      image: '/6.png',
      href: '/services/strategy-planning',
    },
    {
      title: 'Brand Identity Design',
      description: 'Logos and brands that make patients trust you instantly.',
      icon: '🎨',
      image: '/7.png',
      href: '/services/brand-identity-design',
    },
    {
      title: 'Brochure & Print Design',
      description: 'Premium print materials that elevate your practice.',
      icon: '🖨️',
      image: '/8.png',
      href: '/services/brochure-print-design',
    },
    {
      title: 'Website Design & Dev',
      description: 'Fast, beautiful, conversion-optimized healthcare websites.',
      icon: '💻',
      image: '/9.png',
      href: '/services/website-design-dev',
    },
    {
      title: 'Google Business Profile',
      description: 'Optimize your GBP to be the top choice in your area.',
      icon: '📍',
      image: '/10.png',
      href: '/services/google-business-profile',
    },
    {
      title: 'Analytics & Reporting',
      description: 'Real-time dashboards so you always know what\'s working.',
      icon: '📊',
      image: '/11.png',
      href: '/services/analytics-reporting',
    },
    {
      title: 'Content & Copywriting',
      description: 'Healthcare content that educates, engages, and converts.',
      icon: '✍️',
      image: '/12.png',
      href: '/services/content-copywriting',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (compact) {
    // Compact version for homepage
    return (
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything your healthcare practice needs to own the digital space.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, idx) => (
              <Link key={idx} href={service.href}>
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:from-emerald-50 hover:to-emerald-100 cursor-pointer h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all duration-300" />
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Full page version with images
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-extrabold text-gray-900">Our Services</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Everything your healthcare practice needs to own the digital space.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {services.map((service, idx) => (
            <Link key={idx} href={service.href}>
              <motion.div
                variants={itemVariants}
                className="group overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
              >
                {/* Image */}
                <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-emerald-100 to-gray-200 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Learn more
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
