'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Settings, Globe, Sun, Moon, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, theme, setTheme } = useSitePreferences();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close settings and user menu dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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
      automation: 'Automatización',
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
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="relative"
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
                  filter: 'blur(6px)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Image
                src="/Client-review-image/nextgen_footerlogo.png"
                alt="NextGen"
                width={180}
                height={48}
                className="h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </motion.div>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/services" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.services}</Link>
            <Link href="/case-studies" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.caseStudies}</Link>
            <Link href="/automation" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.automation}</Link>
            <Link href="/industries" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.industries}</Link>
            <Link href="/about" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.about}</Link>
            <Link href="/blog" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.blog}</Link>
            <Link href="/pricing" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.pricing}</Link>
            
            {/* User Menu or Login */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    scrolled
                      ? theme === 'dark'
                        ? 'border border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 bg-slate-800/50'
                        : 'border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 bg-white/50'
                      : 'border border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/10'
                  } ${userMenuOpen ? (scrolled ? (theme === 'dark' ? 'border-emerald-500 text-emerald-400' : 'border-emerald-500 text-emerald-600') : 'border-white/40 text-white') : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    scrolled
                      ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/20 text-emerald-600'
                      : 'bg-white/20 text-white'
                  }`}>
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} width={28} height={28} className="rounded-full" />
                    ) : (
                      user.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                        theme === 'dark' ? 'bg-slate-800/95 backdrop-blur border border-slate-700' : 'bg-white/95 backdrop-blur border border-slate-200'
                      }`}
                    >
                      <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.name}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        <p className={`text-[10px] uppercase font-medium mt-1 ${user.role === 'admin' ? 'text-purple-500' : 'text-emerald-500'}`}>{user.role}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                            theme === 'dark' ? 'text-slate-200 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                            theme === 'dark' ? 'text-slate-200 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                            theme === 'dark' ? 'text-red-400 hover:bg-slate-700/50' : 'text-red-600 hover:bg-slate-50'
                          }`}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className={`font-medium transition-colors ${desktopLinkClass}`}>{text.login}</Link>
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
                    : 'border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/10'
                } ${settingsOpen ? (scrolled ? (theme === 'dark' ? 'border-emerald-500 text-emerald-400' : 'border-emerald-500 text-emerald-600') : 'border-white/40 text-white') : ''}`}
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
          <Link href="/automation" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.automation}</Link>
          <Link href="/industries" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.industries}</Link>
          <Link href="/about" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.about}</Link>
          <Link href="/blog" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.blog}</Link>
          <Link href="/pricing" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.pricing}</Link>
          
          {/* User Menu or Login for Mobile */}
          {user ? (
            <div className={`border-t pt-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-3 px-2 py-3 rounded-xl mb-3 ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/20 text-emerald-600'
                }`}>
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.name}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-200 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-200 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'text-red-400 hover:bg-slate-800/50' : 'text-red-600 hover:bg-slate-50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className={`block font-medium ${theme === 'dark' ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'}`}>{text.login}</Link>
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

          <Link href="/contact" className="block w-full rounded-full bg-emerald-500 py-3 text-center font-bold text-black hover:bg-emerald-400">
            {text.getStarted}
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
