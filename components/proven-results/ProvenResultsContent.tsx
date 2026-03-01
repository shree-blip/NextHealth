'use client';
import { motion } from 'framer-motion';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function ProvenResultsContent() {
  const { t } = useSitePreferences();

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              {t('Proven Results in ')}<span className="text-emerald-400">{t('Healthcare Marketing')}</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              {t('Real data from real healthcare practices. See the measurable impact of our strategies through verified metrics from Google Search Console and Google My Business.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Analytics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t('Real Dashboard Analytics')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('Track exactly what matters: clicks, impressions, phone calls, website traffic, and patient engagement metrics from your Google properties.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Google Search Console */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-100 group-hover:border-emerald-400 transition-all group-hover:shadow-emerald-500/20">
                <div className="relative bg-slate-100 overflow-hidden">
                  <img 
                    src="/Search_console_dahbord.png" 
                    alt="Google Search Console Dashboard" 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{t('Google Search Console')}</h3>
                  <p className="text-slate-600 mb-6">
                    {t('Monitor search visibility and understand how patients find you')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t('Total clicks & impressions')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t('Click-through rate (CTR)')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t('Average search position')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t('Top performing keywords')}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Google My Business */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-100 group-hover:border-blue-400 transition-all group-hover:shadow-blue-500/20">
                <div className="relative bg-slate-100 overflow-hidden">
                  <img 
                    src="/GMB-Dashboard.png" 
                    alt="Google My Business Dashboard" 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{t('Google My Business')}</h3>
                  <p className="text-slate-600 mb-6">
                    {t('Drive local patient actions directly from your business profile')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {t('Phone calls received')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {t('Website clicks')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {t('Direction requests')}
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {t('Reviews & ratings')}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medical Automation Results */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t('Medical Automation Results')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('n8n and custom healthcare workflows that reduce front-desk load, speed response time, and recover missed revenue opportunities.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('Automated Intake & Triage'),
                result: t('-42% manual intake steps'),
                detail: t('Patients complete forms, insurance capture, and routing before staff intervention.')
              },
              {
                title: t('No-Show Recovery Flows'),
                result: t('+31% rebook rate'),
                detail: t('n8n sequences trigger SMS/email reminders and one-click rebooking automations.')
              },
              {
                title: t('Lead-to-Appointment Automation'),
                result: t('< 5 min average first response'),
                detail: t('Custom workflows push inquiries to scheduling and CRM instantly, 24/7.')
              }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <div className="text-3xl font-black text-emerald-500 mb-3">{item.result}</div>
                <p className="text-slate-600">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Metrics Grid */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">{t('Average Client Improvements')}</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t('Based on verified analytics data from our healthcare practice clients')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { metric: '+167%', label: t('Leads Generated'), color: 'emerald' },
              { metric: '+125%', label: t('Revenue Growth'), color: 'blue' },
              { metric: '+100%', label: t('Patient Volume'), color: 'purple' },
              { metric: '+89%', label: t('Search Visibility'), color: 'orange' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br from-${item.color}-600 to-${item.color}-700 rounded-2xl p-8 text-center`}
                style={{
                  background: item.color === 'emerald' ? 'linear-gradient(135deg, #10b981, #059669)' :
                             item.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                             item.color === 'purple' ? 'linear-gradient(135deg, #a855f7, #7e22ce)' :
                             'linear-gradient(135deg, #f97316, #ea580c)'
                }}
              >
                <div className="text-5xl font-black mb-2">{item.metric}</div>
                <div className="text-white/80">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t('Success Stories')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('See how different healthcare practices achieved breakthrough results')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('Emergency Room Network'),
                metric: '312%',
                description: t('Increase in urgent patient inquiries within 90 days'),
                type: 'ER'
              },
              {
                title: t('Urgent Care Clinic'),
                metric: '2.8×',
                description: t('Return on ad spend achieved in first quarter'),
                type: t('Urgent Care')
              },
              {
                title: t('Medical Spa'),
                metric: '$1.2M',
                description: t('Revenue generated from optimized campaigns in 12 months'),
                type: t('Wellness')
              },
            ].map((story, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <span className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {story.type}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{story.title}</h3>
                <div className="text-4xl font-black text-emerald-500 mb-3">{story.metric}</div>
                <p className="text-slate-600">{story.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
