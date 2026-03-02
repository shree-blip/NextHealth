'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import PricingCard from '@/components/PricingCard';

const plans = [
  {
    name: 'Wellness & Longevity',
    price: '$5,000',
    period: '/ Month',
    description: 'Perfect for practices just getting started with digital marketing.',
    features: [
      'Advanced SEO & Local Search',
      'Google My Business Management',
      'Targeted Ads (Google & Meta)',
      'AI Chatbot & Call Tracking',
      'Monthly Reports & Strategy',
      'Content & Social Media',
    ],
    cta: 'Get started',
    variant: 'professional' as const,
    popular: false,
  },
  {
    name: 'ER & Urgent Care',
    price: '$10,000',
    period: '/ Month',
    description: 'For practices ready to accelerate their patient acquisition.',
    features: [
      'High-Budget Google Ads',
      'Advanced AI Call Handling',
      'Insurance Verification Bots',
      'Priority Support & Rapid SLA',
      'Multi-Location Campaigns',
      '24/7 Performance Monitoring',
      'Dedicated Account Manager',
    ],
    cta: 'Get started',
    variant: 'professional' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Enterprise solutions for multi-location practices.',
    features: [
      'Custom Software Development',
      'HIPAA-Compliant Integrations',
      'Multi-State Networks',
      'Advanced Analytics & BI',
      'Custom Automation Workflows',
      'White-Glove Onboarding',
      'Enterprise SLA & Support',
    ],
    cta: 'Contact Sales',
    variant: 'premium' as const,
    popular: false,
  },
];

export default function PricingPlans() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('Choose Your Plan')}
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Transparent pricing. No contracts. No fluff.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              ctaHref="/signup"
              popular={plan.popular}
              variant={plan.variant}
              delay={idx * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
