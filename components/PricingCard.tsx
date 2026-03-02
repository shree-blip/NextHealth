'use client';

import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta?: string;
  ctaHref?: string;
  popular?: boolean;
  icon?: LucideIcon;
  onCtaClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'basic' | 'professional' | 'premium';
  delay?: number;
}

export default function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features,
  cta = 'Get started',
  ctaHref,
  popular = false,
  icon: Icon,
  onCtaClick,
  isActive = false,
  disabled = false,
  loading = false,
  variant = 'basic',
  delay = 0,
}: PricingCardProps) {
  // Define colors based on variant to match the image
  const getCardStyles = () => {
    switch (variant) {
      case 'basic':
        return {
          background: 'bg-white',
          border: 'border-slate-200',
          textPrimary: 'text-slate-900',
          textSecondary: 'text-slate-600',
          textMuted: 'text-slate-500',
          checkColor: 'text-emerald-500',
          buttonBg: 'bg-white',
          buttonText: 'text-slate-900',
          buttonBorder: 'border-slate-300',
          buttonHover: 'hover:bg-slate-50 hover:border-slate-400',
        };
      case 'professional':
        // Gold theme with dark gold shine as requested
        return {
          background: 'bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950',
          border: 'border-amber-700',
          textPrimary: 'text-white',
          textSecondary: 'text-amber-50',
          textMuted: 'text-amber-100',
          checkColor: 'text-amber-300',
          buttonBg: 'bg-white',
          buttonText: 'text-amber-900',
          buttonBorder: 'border-white',
          buttonHover: 'hover:bg-amber-50',
        };
      case 'premium':
        return {
          background: 'bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100',
          border: 'border-purple-200',
          textPrimary: 'text-slate-900',
          textSecondary: 'text-slate-700',
          textMuted: 'text-slate-600',
          checkColor: 'text-purple-500',
          buttonBg: 'bg-white',
          buttonText: 'text-slate-900',
          buttonBorder: 'border-purple-300',
          buttonHover: 'hover:bg-purple-50 hover:border-purple-400',
        };
      default:
        return getCardStyles();
    }
  };

  const styles = getCardStyles();

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
      className={`
        relative rounded-3xl p-8 border-2 transition-all duration-300
        ${styles.background} ${styles.border}
        ${isActive ? 'ring-4 ring-emerald-500 ring-offset-2' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-2xl'}
      `}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            Popular
          </div>
        </div>
      )}

      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
          <Check className="h-3 w-3" /> Current
        </div>
      )}

      {/* Icon if provided */}
      {Icon && (
        <div className={`mb-4 ${styles.textPrimary} opacity-80`}>
          <Icon className="h-10 w-10" />
        </div>
      )}

      {/* Plan Name */}
      <h3 className={`text-2xl font-bold mb-3 ${styles.textPrimary}`}>
        {name}
      </h3>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-black tracking-tight ${styles.textPrimary}`}>
            {price}
          </span>
          {period && price !== 'Free' && price !== 'Custom' && (
            <span className={`text-base font-medium ${styles.textMuted}`}>
              {period}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className={`mb-6 text-sm leading-relaxed ${styles.textSecondary}`}>
          {description}
        </p>
      )}

      {/* CTA Button (appears before features in the image) */}
      {cta && (
        <div className="mb-6">
          {ctaHref ? (
            <a
              href={ctaHref}
              className={`
                block w-full text-center py-3.5 rounded-xl font-semibold text-base
                transition-all duration-200 border-2
                ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}
                ${disabled ? 'cursor-not-allowed' : styles.buttonHover + ' hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : isActive ? (
                'Current Plan'
              ) : (
                cta
              )}
            </a>
          ) : (
            <button
              onClick={onCtaClick}
              disabled={disabled || loading}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-base
                transition-all duration-200 border-2
                ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}
                ${disabled ? 'cursor-not-allowed' : styles.buttonHover + ' hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : isActive ? (
                'Current Plan'
              ) : (
                cta
              )}
            </button>
          )}
        </div>
      )}

      {/* Package includes label */}
      <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${styles.textMuted}`}>
        Package includes:
      </div>

      {/* Features */}
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.checkColor}`} />
            <span className={`text-sm leading-relaxed ${styles.textSecondary}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Not included section if needed */}
      {variant === 'basic' && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${styles.textMuted}`}>
            Not included:
          </div>
          <ul className="space-y-2">
            <li className={`flex items-start gap-3 ${styles.textMuted} text-sm`}>
              <span className="text-red-400">✕</span>
              <span>No Analytics</span>
            </li>
            <li className={`flex items-start gap-3 ${styles.textMuted} text-sm`}>
              <span className="text-red-400">✕</span>
              <span>No networking events</span>
            </li>
            <li className={`flex items-start gap-3 ${styles.textMuted} text-sm`}>
              <span className="text-red-400">✕</span>
              <span>No dedicated support</span>
            </li>
          </ul>
        </div>
      )}

      {variant === 'professional' && (
        <div className="mt-6 pt-6 border-t border-amber-700/30">
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${styles.textMuted}`}>
            Not included:
          </div>
          <ul className="space-y-2">
            <li className={`flex items-start gap-3 ${styles.textMuted} text-sm`}>
              <span className="text-amber-300">✕</span>
              <span>No networking events</span>
            </li>
          </ul>
        </div>
      )}
    </motion.div>
  );

  return cardContent;
}
