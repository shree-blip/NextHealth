'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function CtaContactForm() {
  const { t } = useSitePreferences();

  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    email: '',
    phone: '',
    budget: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to API
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-800 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-20">
        <img src="/11.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              {t('Ready to dominate your market?')}
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              {t('We audit your marketing, identify gaps, and show you how to 5× your patient volume.')}
            </p>

            {/* Trust points */}
            <div className="space-y-4">
              {[
                t('Free strategy audit — no strings attached.'),
                t('HIPAA-aware marketing practices.'),
                t('Results within 30 days or we optimize free.'),
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-white">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <div className="bg-white rounded-3xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h3>
                <p className="text-slate-600">{t("We'll be in touch within 24 hours to schedule your free strategy audit.")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('Start growing today')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder={t('Dr. Jane Smith')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Type')}</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    >
                      <option value="">{t('Select your practice type')}</option>
                      <option value="ER">{t('Emergency Room')}</option>
                      <option value="MedSpa">{t('MedSpas')}</option>
                      <option value="UrgentCare">{t('Urgent Care')}</option>
                      <option value="Other">{t('Other Healthcare')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Email Address')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder={t('jane@yourpractice.com')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Phone Number')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder={t('(555) 123-4567')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('Monthly Marketing Budget')}</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    >
                      <option value="">{t('Select your budget')}</option>
                      <option value="under-2500">{t('Under $2,500/month')}</option>
                      <option value="2500-5000">{t('$2,500 - $5,000/month')}</option>
                      <option value="5000-10000">{t('$5,000 - $10,000/month')}</option>
                      <option value="10000+">{t('$10,000+/month')}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('Start growing today')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
