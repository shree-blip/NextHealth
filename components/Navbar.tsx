'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, theme, setTheme } = useSitePreferences();

  const labels = {
    en: {
      services: 'Services',
      caseStudies: 'Case Studies',
      industries: 'Industries',
      about: 'About',
      blog: 'Blog',
      pricing: 'Pricing',
      login: 'Login',
      getStarted: 'Get Started',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    es: {
      services: 'Servicios',
      caseStudies: 'Casos',
      industries: 'Industrias',
      about: 'Nosotros',
      blog: 'Blog',
      pricing: 'Precios',
      login: 'Iniciar sesión',
      getStarted: 'Comenzar',
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
    },
  } as const;

  const text = labels[language];

  const navClass = scrolled
    ? theme === 'dark'
      ? 'bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 shadow-sm'
      : 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm'
    : 'bg-transparent';

  const logoTextClass = scrolled
    ? theme === 'dark'
      ? 'text-white'
      : 'text-slate-900'
    : 'text-white';

  const desktopLinkClass = scrolled
    ? theme === 'dark'
      ? 'text-slate-200 hover:text-white'
      : 'text-slate-600 hover:text-slate-900'
    : 'text-white/80 hover:text-white';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className={`h-8 w-8 ${scrolled ? 'text-emerald-500' : 'text-emerald-400'}`} />
            <span className={`text-xl font-bold tracking-tighter ${logoTextClass}`}>NEXTGEN</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/services" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.services}</Link>
            <Link href="/case-studies" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.caseStudies}</Link>
            <Link href="/industries" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.industries}</Link>
            <Link href="/about" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.about}</Link>
            <Link href="/blog" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.blog}</Link>
            <Link href="/pricing" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.pricing}</Link>
            <Link href="/login" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.login}</Link>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}
              className={`rounded-lg border px-2 py-1 text-sm transition-colors ${
                scrolled
                  ? theme === 'dark'
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-700'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
              aria-label={text.language}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>

            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
              className={`rounded-lg border px-2 py-1 text-sm transition-colors ${
                scrolled
                  ? theme === 'dark'
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-700'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
              aria-label={text.theme}
            >
              <option value="light">{text.light}</option>
              <option value="dark">{text.dark}</option>
            </select>

            <Link href="/contact" className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-black hover:bg-emerald-400 transition-all hover:scale-105">
              {text.getStarted}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={scrolled ? (theme === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900') : 'text-white hover:text-white/80'}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`md:hidden border-b px-4 py-6 space-y-4 shadow-lg ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200'
          }`}
        >
          <Link href="/services" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.services}</Link>
          <Link href="/case-studies" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.caseStudies}</Link>
          <Link href="/industries" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.industries}</Link>
          <Link href="/about" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.about}</Link>
          <Link href="/blog" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.blog}</Link>
          <Link href="/pricing" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.pricing}</Link>
          <Link href="/login" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.login}</Link>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}
              className={`rounded-lg border px-2 py-2 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-700'}`}
              aria-label={text.language}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
              className={`rounded-lg border px-2 py-2 text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-700'}`}
              aria-label={text.theme}
            >
              <option value="light">{text.light}</option>
              <option value="dark">{text.dark}</option>
            </select>
          </div>

          <Link href="/contact" className="block w-full rounded-full bg-emerald-500 py-3 text-center font-bold text-black hover:bg-emerald-400">
            {text.getStarted}
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
