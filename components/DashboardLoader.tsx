'use client';

import { motion } from 'framer-motion';

/**
 * Modern dashboard loader — three pulsing dots with a smooth wave effect.
 * Zero dependencies beyond Framer Motion. Works in light & dark theme
 * by inheriting `currentColor`.
 *
 * Variants:
 *  - `inline`  — small dots for buttons / table rows (default)
 *  - `card`    — medium dots centered in a card / empty state
 *  - `page`    — large dots with label, centered in a full section
 */

type LoaderVariant = 'inline' | 'card' | 'page';

interface DashboardLoaderProps {
  /** Visual size variant */
  variant?: LoaderVariant;
  /** Optional label shown below the dots (card & page variants) */
  label?: string;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
}

const sizeMap: Record<LoaderVariant, { dot: number; gap: string; wrapper: string }> = {
  inline: { dot: 6, gap: 'gap-1', wrapper: '' },
  card: { dot: 8, gap: 'gap-1.5', wrapper: 'py-12' },
  page: { dot: 10, gap: 'gap-2', wrapper: 'py-24' },
};

export default function DashboardLoader({
  variant = 'inline',
  label,
  className = '',
}: DashboardLoaderProps) {
  const { dot, gap, wrapper } = sizeMap[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center ${wrapper} ${className}`}
      role="status"
      aria-label={label || 'Loading'}
    >
      <div className={`flex items-center ${gap}`}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="rounded-full bg-current opacity-60"
            style={{ width: dot, height: dot }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {label && (variant === 'card' || variant === 'page') && (
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
}
