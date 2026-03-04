'use client';

import { motion } from 'framer-motion';
import { MapPin, Mail, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import { useAuth } from '@/components/AuthProvider';
import Logo from '@/components/Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, theme } = useSitePreferences();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        console.error('Subscription error:', data.error);
        alert(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={`border-t pt-20 pb-10 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Logo showText={true} iconSize={96} darkText={!isDark} />
            </div>
            <p className={`max-w-sm mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Premium digital marketing for ERs, MedSpas, and urgent care centers.')}
            </p>
            
            {/* Email Signup */}
            <div className="mb-8">
              <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Get weekly marketing tips')}</h4>
              {subscribed ? (
                <p className="text-emerald-400">{t('Thanks for subscribing!')}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('Enter your email')}
                    required
                    className={`flex-1 px-4 py-2 rounded-lg border outline-none focus:border-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                  />
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50">
                    {loading ? t('...') : t('Join')}
                  </button>
                </form>
              )}
            </div>

            <div className="flex gap-4">
              <Link href="https://instagram.com" aria-label="Instagram" className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}><Instagram className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-700'}`} /></Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}><Linkedin className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-700'}`} /></Link>
              <Link href="https://facebook.com" aria-label="Facebook" className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}><Facebook className={`h-5 w-5 ${isDark ? 'text-white' : 'text-slate-700'}`} /></Link>
            </div>
          </div>

          <div>
            <h4 className={`font-bold mb-6 uppercase text-xs tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('Quick Links')}</h4>
            <ul className="space-y-4">
              <li><Link href="/services" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('Services')}</Link></li>
              <li><Link href="/about" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('About')}</Link></li>
              <li><Link href="/case-studies" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('Case Studies')}</Link></li>
              <li>
                <Link 
                  href={user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client?view=membership') : '/pricing'} 
                  className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                  {t('Pricing')}
                </Link>
              </li>
              <li><Link href="/blog" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('Blog')}</Link></li>
              <li><Link href="/news" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('Healthcare News')}</Link></li>
              <li><Link href="/contact" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>{t('Contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-bold mb-6 uppercase text-xs tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('Contact')}</h4>
            <ul className="space-y-4">
              <li className={`flex items-start gap-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>3001 Skyway Cir N<br />Irving, TX 75038</span>
              </li>

              <li className={`flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>hello@thenextgenhealth.com</span>
              </li>

              <li className={`flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>📞 972-848-1153</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className={isDark ? 'text-slate-500' : 'text-slate-600'}>
            © {new Date().getFullYear()} The NextGen Healthcare Marketing. {t('All rights reserved.')}
          </p>
          <div className={`flex gap-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <Link href="/privacy" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-emerald-600'}`}>{t('Privacy Policy')}</Link>
            <Link href="/terms" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-emerald-600'}`}>{t('Terms of Service')}</Link>
            <Link href="/hipaa" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-emerald-600'}`}>{t('HIPAA Compliance')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
