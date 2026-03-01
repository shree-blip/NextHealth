'use client';
import { motion } from 'framer-motion';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function DashboardImages() {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';
  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-0"
        >
          <div className="text-center mb-12">
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Real Dashboard Analytics</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>See exactly what data we track and optimize for your practice</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/Search_console_dahbord.png" 
                alt="Google Search Console Dashboard" 
                className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
              />
              <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Search Console</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Track clicks, impressions, CTR, and keyword rankings to optimize SEO performance</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/GMB-Dashboard.png" 
                alt="Google My Business Dashboard" 
                className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
              />
              <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Google My Business</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Monitor calls, website clicks, direction requests, and reviews in real-time</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
