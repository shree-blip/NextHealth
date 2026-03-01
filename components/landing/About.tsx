'use client';
import { motion } from 'framer-motion';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function About() {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';
  return (
    <section className={`py-20 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>We Are Architects of Bold Products</h2>
        <p className={`mt-4 text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Artists, Strategists, Innovators</p>
        <p className={`mt-6 max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Our mission is to build digital products that solve real problems. We combine design thinking, deep technical expertise,
          HIPAA‑compliant development, and AI innovation to help teams move faster and smarter.
        </p>
        <div className="mt-8">
          <a href="/about" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded hover:bg-emerald-400">Learn More</a>
        </div>
      </div>
    </section>
  );
}
