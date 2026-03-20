'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Settings, Globe, Sun, Moon, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

interface NavbarProps {
  forceSolid?: boolean;
}

export default function Navbar({ forceSolid = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, theme, setTheme } = useSitePreferences();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const shouldUseSolidNav = forceSolid || pathname?.startsWith('/blog/') || pathname?.startsWith('/news/');

  // Close settings, user menu, and resources dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  const labels = {
    en: {
      services: 'Services',
      caseStudies: 'Case Studies',
      automation: 'Automation',
      contactUs: 'Contact Us',
      industries: 'Industries',
      about: 'About',
      blog: 'Blog',
      pricing: 'Pricing',
      resources: 'Resources',
      healthcareNews: 'Healthcare News',
      login: 'Login',
      bookDemo: 'Book a Demo',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    es: {
      services: 'Servicios',
      caseStudies: 'Casos',
      automation: 'Automatización',
      contactUs: 'Contáctanos',
      industries: 'Industrias',
      about: 'Nosotros',
      blog: 'Blog',
      pricing: 'Precios',
      resources: 'Recursos',
      healthcareNews: 'Noticias de Salud',
      login: 'Iniciar sesión',
      bookDemo: 'Reservar una Demo',
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
    },
  } as const;

  const text = labels[language];

  const navClass = (scrolled || shouldUseSolidNav)
    ? theme === 'dark'
      ? 'bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 shadow-sm'
      : 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm'
    : theme === 'dark'
      ? 'bg-transparent'
      : 'bg-white/70 backdrop-blur-md border-b border-slate-200/50';

  const desktopLinkClass = (scrolled || shouldUseSolidNav)
    ? theme === 'dark'
      ? 'text-slate-200 hover:text-white'
      : 'text-slate-600 hover:text-slate-900'
    : theme === 'dark'
      ? 'text-white/80 hover:text-white'
      : 'text-slate-700 hover:text-slate-900';

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
          {/* Mobile / iPad: logo with text */}
          <div className="md:hidden">
            <Logo showText={true} iconSize={40} darkText={theme === 'light'} compact={true} />
          </div>
          {/* Tablet / Desktop: logo with text */}
          <div className="hidden md:block">
            <Logo showText={true} iconSize={scrolled ? 60 : 72} darkText={theme === 'light'} compact={true} />
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/services" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.services}</Link>
            <Link href="/industries" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.industries}</Link>
            <Link href="/about" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.about}</Link>
            <Link href="/contact" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.contactUs}</Link>
            
            {/* Resources Dropdown */}
            <div className="relative group" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onMouseEnter={() => setResourcesOpen(true)}
                className={`inline-flex items-center gap-1 font-medium transition-colors ${desktopLinkClass}`}
              >
                {text.resources}
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                    onMouseLeave={() => setResourcesOpen(false)}
                    className={`absolute left-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden z-50 ${
                      theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                    }`}
                  >
                    <Link
                      href="/blog"
                      className={`block px-4 py-3 font-medium transition-colors ${
                        theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {text.blog}
                    </Link>
                    <Link
                      href="/case-studies"
                      className={`block px-4 py-3 font-medium transition-colors border-t ${
                        theme === 'dark'
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {text.caseStudies}
                    </Link>
                    <Link
                      href="/news"
                      className={`block px-4 py-3 font-medium transition-colors border-t ${
                        theme === 'dark'
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {text.healthcareNews}
                    </Link>
                    <Link
                      href="/automation"
                      className={`block px-4 py-3 font-medium transition-colors border-t ${
                        theme === 'dark'
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {text.automation}
                    </Link>
                    <Link
                      href={user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client?view=membership') : '/pricing'}
                      className={`block px-4 py-3 font-medium transition-colors border-t ${
                        theme === 'dark'
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {text.pricing}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Menu or Login */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-all transform hover:scale-105 relative ${
                    scrolled
                      ? theme === 'dark'
                        ? 'border border-slate-600 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 bg-slate-800/40 hover:bg-slate-800/80'
                        : 'border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 bg-white/40 hover:bg-white/80'
                      : theme === 'dark'
                        ? 'border border-white/30 text-white/90 hover:text-white hover:border-white/60 bg-white/10 hover:bg-white/20'
                        : 'border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 bg-white/60 hover:bg-white/80'
                  } ${userMenuOpen ? (scrolled ? (theme === 'dark' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-emerald-500 text-emerald-600 bg-emerald-500/10') : theme === 'dark' ? 'border-white/60 text-white bg-white/20' : 'border-emerald-500 text-emerald-600 bg-emerald-500/10') : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all ${
                    scrolled
                      ? theme === 'dark' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 ring-emerald-500/30' : 'bg-gradient-to-br from-emerald-400 to-emerald-500 ring-emerald-400/30'
                      : theme === 'dark'
                        ? 'bg-white/30 ring-white/40'
                        : 'bg-emerald-500 ring-emerald-400/30'
                  } text-white`}>
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
                    ) : (
                      user.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.95 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
                      className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                        theme === 'dark' ? 'bg-gradient-to-b from-slate-800 to-slate-900/95 backdrop-blur-xl border border-slate-700' : 'bg-gradient-to-b from-white to-slate-50/95 backdrop-blur-xl border border-slate-300'
                      }`}
                    >
                      <div className={`px-4 py-4 border-b ${theme === 'dark' ? 'border-slate-700 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent' : 'border-slate-200 bg-gradient-to-r from-emerald-400/10 via-transparent to-transparent'}`}>
                        <div className="flex items-center gap-2 mb-2 min-w-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            theme === 'dark' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                          } text-white shadow-lg`}>
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.name} width={48} height={48} className="rounded-full" />
                            ) : (
                              user.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className={`text-xs font-bold truncate leading-none ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
                            <p className={`text-[8px] truncate leading-none overflow-hidden ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {user.role}
                          </span>
                          {user.plan && user.plan !== 'free' && (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                              user.plan === 'premium' 
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                                : user.plan === 'gold'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {user.plan === 'premium' ? 'Scale Elite' : user.plan === 'gold' ? 'Growth Pro' : 'Starter Care'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="py-2 space-y-1 px-2">
                        <Link
                          href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            theme === 'dark' 
                              ? 'text-slate-200 hover:bg-slate-700/60 hover:text-emerald-400' 
                              : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-600'
                          }`}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href={user.role === 'admin' ? '/dashboard/admin?view=profile' : '/dashboard/client?view=profile'}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            theme === 'dark' 
                              ? 'text-slate-200 hover:bg-slate-700/60 hover:text-blue-400' 
                              : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                          }`}
                        >
                          <User className="h-5 w-5" />
                          <span>My Profile</span>
                        </Link>
                        <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} my-1`} />
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            theme === 'dark' 
                              ? 'text-red-400 hover:bg-red-500/10 hover:border-l-2 hover:border-red-500' 
                              : 'text-red-600 hover:bg-red-50 hover:border-l-2 hover:border-red-500'
                          }`}
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label={text.login}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all transform hover:scale-105 ${
                  scrolled
                    ? theme === 'dark'
                      ? 'border border-slate-600 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 bg-slate-800/40 hover:bg-slate-800/80'
                      : 'border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 bg-white/40 hover:bg-white/80'
                    : theme === 'dark'
                      ? 'border border-white/30 text-white/90 hover:text-white hover:border-white/60 bg-white/10 hover:bg-white/20'
                      : 'border border-slate-300/80 text-slate-700 hover:text-emerald-600 hover:border-emerald-500 bg-white/70 hover:bg-white/90'
                }`}
              >
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                    scrolled
                      ? theme === 'dark'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-emerald-500/15 text-emerald-600'
                      : theme === 'dark'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/15 text-emerald-600'
                  }`}
                >
                  <User className="h-4 w-4" />
                </motion.span>
              </Link>
            )}

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  scrolled
                    ? theme === 'dark'
                      ? 'border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 bg-slate-800/50'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 bg-white/50'
                    : theme === 'dark'
                      ? 'border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/10'
                      : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 bg-white/60'
                } ${settingsOpen ? (scrolled ? (theme === 'dark' ? 'border-emerald-500 text-emerald-400' : 'border-emerald-500 text-emerald-600') : theme === 'dark' ? 'border-white/40 text-white' : 'border-emerald-500 text-emerald-600') : ''}`}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border p-4 shadow-xl backdrop-blur-xl z-50 ${
                      theme === 'dark'
                        ? 'bg-slate-900/95 border-slate-700'
                        : 'bg-white/95 border-slate-200'
                    }`}
                  >
                    {/* Language Section */}
                    <div className="mb-4">
                      <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Globe className="h-3.5 w-3.5" />
                        {text.language}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            language === 'en'
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                              : theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-base">🇺🇸</span> English
                        </button>
                        <button
                          onClick={() => setLanguage('es')}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            language === 'es'
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                              : theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-base">🇪🇸</span> Español
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className={`border-t mb-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />

                    {/* Theme Section */}
                    <div>
                      <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                        {text.theme}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            theme === 'light'
                              ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/25'
                              : theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <Sun className="h-4 w-4" /> {text.light}
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            theme === 'dark'
                              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <Moon className="h-4 w-4" /> {text.dark}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/book-a-demo" className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-black hover:bg-emerald-400 transition-all hover:scale-105">
              {text.bookDemo}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} className={scrolled ? (theme === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900') : theme === 'dark' ? 'text-white hover:text-white/80' : 'text-slate-700 hover:text-slate-900'}>
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
          <Link href="/contact" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.contactUs}</Link>
          <Link href="/blog" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.blog}</Link>
          <Link href="/news" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.healthcareNews}</Link>
          <Link href="/automation" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.automation}</Link>
          <Link 
            href={user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client?view=membership') : '/pricing'} 
            className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}
          >
            {text.pricing}
          </Link>
          
          {/* User Menu or Login for Mobile */}
          {user ? (
            <div className={`border-t pt-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-3 px-3 py-4 rounded-2xl mb-3 bg-gradient-to-r ${
                theme === 'dark' ? 'from-slate-800/60 to-slate-700/40 border border-slate-700' : 'from-slate-50 to-white border border-slate-200'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ring-2 transition-all ${
                  theme === 'dark' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 ring-emerald-500/30' : 'bg-gradient-to-br from-emerald-400 to-emerald-500 ring-emerald-400/30'
                } text-white`}>
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={48} height={48} className="rounded-full" />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                  <p className={`text-[11px] font-bold uppercase tracking-wide mt-1 ${user.role === 'admin' ? 'text-purple-400' : 'text-emerald-400'}`}>{user.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark' ? 'text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={user.role === 'admin' ? '/dashboard/admin?view=profile' : '/dashboard/client?view=profile'}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark' ? 'text-slate-200 hover:bg-blue-500/20 hover:text-blue-300' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark' ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label={text.login}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                theme === 'dark'
                  ? 'border-slate-600 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 bg-slate-800/40 hover:bg-slate-800/80'
                  : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 bg-white/40 hover:bg-white/80'
              }`}
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                  theme === 'dark' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-500/15 text-emerald-600'
                }`}
              >
                <User className="h-4 w-4" />
              </motion.span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Language Toggle */}
            <div>
              <div className={`flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <Globe className="h-3 w-3" /> {text.language}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    language === 'en'
                      ? 'bg-emerald-500 text-white'
                      : theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🇺🇸 EN
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    language === 'es'
                      ? 'bg-emerald-500 text-white'
                      : theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🇪🇸 ES
                </button>
              </div>
            </div>
            {/* Theme Toggle */}
            <div>
              <div className={`flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />} {text.theme}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Sun className="h-3 w-3" /> {text.light}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Moon className="h-3 w-3" /> {text.dark}
                </button>
              </div>
            </div>
          </div>

          <Link href="/book-a-demo" className="block w-full rounded-full bg-emerald-500 py-3 text-center font-bold text-black hover:bg-emerald-400">
            {text.bookDemo}
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
