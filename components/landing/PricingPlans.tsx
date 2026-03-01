'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const plans = [
  {
    name: 'Silver',
    price: '$5,000',
    period: '/month',
    description: 'Perfect for practices just getting started with digital marketing.',
    features: [
      'Google Ads management',
      'Basic social media management',
      'Monthly analytics report',
      'Google Business Profile optimization',
      'Email support',
    ],
    cta: 'Book a free audit',
    color: 'silver',
    popular: false,
  },
  {
    name: 'Gold',
    price: '$10,000',
    period: '/month',
    description: 'For practices ready to accelerate their patient acquisition.',
    features: [
      'Everything in Silver',
      'Advanced social campaigns',
      'Multi-channel ads (Google + Meta)',
      'Quarterly strategy sessions',
      'Dedicated account manager',
      'Email & drip campaigns',
    ],
    cta: 'Book a free audit',
    color: 'gold',
    popular: true,
  },
  {
    name: 'Platinum',
    price: 'Custom',
    period: '',
    description: 'Enterprise solutions for multi-location practices.',
    features: [
      'Everything in Gold',
      'Dedicated account manager',
      'Unlimited revisions',
      'Priority support',
      'Custom integrations',
      'Weekly strategy calls',
      'Advanced analytics & reporting',
    ],
    cta: 'Contact us',
    color: 'platinum',
    popular: false,
  },
];

export default function PricingPlans() {
  const [isQuarterly, setIsQuarterly] = useState(false);
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const localizedPlans = plans.map((plan) => ({
    ...plan,
    isCustom: plan.price === 'Custom',
    name: t(plan.name),
    price: t(plan.price),
    period: t(plan.period),
    description: t(plan.description),
    features: plan.features.map((feature) => t(feature)),
  }));

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Invest in growth')}</h2>
          <p className={`text-xl max-w-2xl mx-auto mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Transparent pricing. No contracts. No fluff.')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isQuarterly ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold' : isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Monthly')}</span>
            <button
              onClick={() => setIsQuarterly(!isQuarterly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isQuarterly ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isQuarterly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isQuarterly ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold' : isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {t('Quarterly')} <span className="text-emerald-500">{t('(Save 10%)')}</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {localizedPlans.map((plan, idx) => {
            let baseBg = '';
            let hoverBg = 'hover:bg-gradient-to-br hover:from-emerald-500 hover:to-emerald-700 hover:text-white';
            let textColor = 'text-white';
            let borderColor = '';
            if (plan.color === 'silver') {
              baseBg = isDark ? 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800' : 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500';
              borderColor = isDark ? 'border-slate-600' : 'border-zinc-400';
            } else if (plan.color === 'gold') {
              baseBg = isDark ? 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800' : 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500';
              borderColor = isDark ? 'border-slate-600' : 'border-yellow-400';
            } else if (plan.color === 'platinum') {
              baseBg = isDark ? 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800' : 'bg-gradient-to-br from-blue-200 via-zinc-200 to-blue-400';
              borderColor = isDark ? 'border-slate-600' : 'border-blue-300';
            }
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-3xl p-8 shadow-lg border-2 ${baseBg} ${textColor} ${borderColor} transition-all duration-300 hover:scale-105 ${hoverBg}`}
              >
                {plan.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-black'}`}>
                    {t('Most Popular')}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">
                    {isQuarterly && !plan.isCustom 
                      ? `$${Math.round(parseInt(plan.price.replace(/\D/g, '')) * 0.9 * 3).toLocaleString()}`
                      : plan.price}
                  </span>
                  <span className="text-white/70">
                    {!plan.isCustom ? (isQuarterly ? t('/quarter') : plan.period) : ''}
                  </span>
                </div>
                <p className="mb-6 text-white/80">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 text-emerald-200" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full text-center py-4 rounded-full font-bold transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-white text-emerald-600 hover:bg-emerald-500 hover:text-white' 
                      : 'bg-white text-emerald-600 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {t('Sign Up')}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
