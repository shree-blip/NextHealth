'use client';
import { motion } from 'framer-motion';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const results = [
  {
    metric: '312%',
    description: 'Increase in Instagram leads in 90 days',
    client: 'MedSpa',
    image: '/21.png',
  },
  {
    metric: '47%',
    description: 'Increase in walk-in patients in six months',
    client: 'Emergency Room',
    image: '/1.png',
  },
  {
    metric: '2.8×',
    description: 'Return on ad spend in the first quarter',
    client: 'Urgent Care',
    image: '/2.png',
  },
  {
    metric: '$1.2M',
    description: 'Revenue generated from Facebook ads in 12 months',
    client: 'MedSpa Network',
    image: '/3.png',
  },
];

export default function RealResults() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const localizedResults = results.map((result) => ({
    ...result,
    description: t(result.description),
    client: t(result.client),
  }));

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Real results')}</h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t("We don't just talk—we deliver measurable outcomes for healthcare practices.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localizedResults.map((result, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className={`rounded-2xl overflow-hidden transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white border border-slate-200 hover:shadow-xl'}`}>
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={result.image} 
                    alt={result.client} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-4xl font-black text-emerald-400 mb-2">{result.metric}</div>
                  <p className={`mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.description}</p>
                  <div className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                    {result.client}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simple chart visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mt-16 rounded-2xl p-8 ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200 shadow-lg'}`}
        >
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Average Client Growth')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-end gap-2 h-40">
                <div className={`w-full rounded-t relative overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} style={{ height: '30%' }}>
                  <div className={`absolute inset-0 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                </div>
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: '80%' }} />
              </div>
              <div className="mt-4 text-center">
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('Leads')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>+167%</div>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-2 h-40">
                <div className={`w-full rounded-t relative overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} style={{ height: '40%' }}>
                  <div className={`absolute inset-0 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                </div>
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: '90%' }} />
              </div>
              <div className="mt-4 text-center">
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('Revenue')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>+125%</div>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-2 h-40">
                <div className={`w-full rounded-t relative overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} style={{ height: '50%' }}>
                  <div className={`absolute inset-0 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                </div>
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: '100%' }} />
              </div>
              <div className="mt-4 text-center">
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('Patient Volume')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>+100%</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('Before NexHealth')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded" />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('After NexHealth')}</span>
            </div>
          </div>
        </motion.div>

        {/* Google Search Console & GMB Dashboard Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Real Dashboard Analytics')}</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('See exactly what data we track and optimize for your practice')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/Search_console_dahbord.png" 
                alt="Google Search Console Dashboard" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
              />
              <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-white border-t border-slate-200'}`}>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Google Search Console')}</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('Track clicks, impressions, CTR, and keyword rankings to optimize SEO performance')}</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/GMB-Dashboard.png" 
                alt="Google My Business Dashboard" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
              />
              <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-white border-t border-slate-200'}`}>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Google My Business')}</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('Monitor calls, website clicks, direction requests, and reviews in real-time')}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
