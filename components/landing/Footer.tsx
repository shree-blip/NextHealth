'use client';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import Logo from '@/components/Logo';

export default function LandingFooter() {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';

  return (
    <footer className={`py-12 mt-12 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Logo showText={false} iconSize={48} darkText={!isDark} />
          <h4 className="font-bold">Services</h4>
          <ul className="space-y-2">
            <li><a href="/services" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>All Services</a></li>
            <li><a href="/services/google-ads" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>Google Ads</a></li>
            <li><a href="/services/seo-local-search" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>Local SEO</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Industries</h4>
          <ul className="space-y-2">
            <li><a href="/industries" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>All Industries</a></li>
            <li><a href="/industries/healthcare" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>Healthcare</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Contact</h4>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>1234 Marketing Ave<br/>Irving, TX</p>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>(214) 555-0123</p>
          <div className="flex gap-3">
            <a href="#" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>Twitter</a>
            <a href="#" className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-emerald-600'}`}>LinkedIn</a>
          </div>
        </div>
      </div>
      <div className={`mt-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        © {new Date().getFullYear()} NexHealth Healthcare Marketing. All rights reserved.
      </div>
    </footer>
  );
}
