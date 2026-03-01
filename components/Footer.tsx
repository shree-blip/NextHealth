'use client';

import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Activity, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useSitePreferences();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to API
    console.log('Subscribed:', email);
    setSubscribed(true);
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Activity className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold tracking-tighter text-white">NEXTGEN</span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              {t('Premium digital marketing for ERs, MedSpas, and urgent care centers.')}
            </p>
            
            {/* Email Signup */}
            <div className="mb-8">
              <h4 className="text-white font-bold mb-3">{t('Get weekly marketing tips')}</h4>
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
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors">
                    {t('Join')}
                  </button>
                </form>
              )}
            </div>

            <div className="flex gap-4">
              <Link href="https://instagram.com" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"><Instagram className="h-5 w-5 text-white" /></Link>
              <Link href="https://linkedin.com" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"><Linkedin className="h-5 w-5 text-white" /></Link>
              <Link href="https://facebook.com" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"><Facebook className="h-5 w-5 text-white" /></Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-500">{t('Quick Links')}</h4>
            <ul className="space-y-4">
              <li><Link href="/services" className="text-slate-400 hover:text-white transition-colors">{t('Services')}</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">{t('About')}</Link></li>
              <li><Link href="/case-studies" className="text-slate-400 hover:text-white transition-colors">{t('Case Studies')}</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">{t('Pricing')}</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">{t('Contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-500">{t('Contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>3001 Skyway Cir N<br />Irving, TX 75038</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>(214) 555-0123</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>hello@nextgenmarketing.agency</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            © {new Date().getFullYear()} NextGen Marketing Agency. {t('All rights reserved.')}
          </p>
          <p className="text-slate-500 text-sm">
            {t('All campaigns comply with healthcare advertising regulations.')}
          </p>
          <div className="flex gap-8 text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('Privacy Policy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('Terms of Service')}</Link>
            <Link href="/hipaa" className="hover:text-white transition-colors">{t('HIPAA Compliance')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
