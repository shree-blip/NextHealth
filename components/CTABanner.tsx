'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface CTABannerProps {
  headline?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  variant?: 'default' | 'dark' | 'gradient';
}

export default function CTABanner({
  headline = 'Ready to Grow Your Practice?',
  description = 'Book a free strategy session with our healthcare marketing experts. No commitment — just a clear roadmap to more patients.',
  primaryCTA = { label: 'Book a Free Demo', href: '/book-a-demo' },
  secondaryCTA = { label: 'View Pricing', href: '/pricing' },
  variant = 'default',
}: CTABannerProps) {
  const bg =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
      : variant === 'dark'
        ? 'bg-slate-900'
        : 'bg-emerald-50 dark:bg-slate-800/60';

  const headlineColor =
    variant === 'default' ? 'text-slate-900 dark:text-white' : 'text-white';

  const descColor =
    variant === 'default'
      ? 'text-slate-600 dark:text-slate-300'
      : 'text-white/90';

  const primaryBtnClass =
    variant === 'default'
      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
      : 'bg-white text-emerald-700 hover:bg-emerald-50';

  const secondaryBtnClass =
    variant === 'default'
      ? 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-black'
      : 'border-2 border-white/40 text-white hover:bg-white/10';

  return (
    <section className={`relative overflow-hidden ${bg}`}>
      {/* Subtle pattern */}
      {variant !== 'default' && (
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      )}

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-3xl md:text-4xl font-bold mb-4 ${headlineColor}`}
        >
          {headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${descColor}`}
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={primaryCTA.href}
            className={`px-8 py-3.5 rounded-lg font-bold text-base transition-colors ${primaryBtnClass}`}
          >
            {primaryCTA.label}
          </Link>
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className={`px-8 py-3.5 rounded-lg font-bold text-base transition-colors ${secondaryBtnClass}`}
            >
              {secondaryCTA.label}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
