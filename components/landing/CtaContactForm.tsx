'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function CtaContactForm() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    email: '',
    phone: '',
    budget: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          businessType: formData.businessType,
          budget: formData.budget,
          source: 'hero-cta-form',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', businessType: '', email: '', phone: '', budget: '' });
      } else {
        console.error('Lead submission error:', data.error);
        alert(data.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className={`py-24 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-800' : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50'}`}>
      {/* Background image */}
      <div className={`absolute inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`}>
        <Image
          src="/11.png"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className={`absolute inset-0 ${isDark ? 'bg-black/40' : 'bg-white/30'}`} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-3xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('Ready to dominate your market?')}
            </h2>
            <p className={`text-xl mb-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{point}</span>
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
              <div className={`rounded-3xl p-8 text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thank you!</h3>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t("We'll be in touch within 24 hours to schedule your free strategy audit.")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={`rounded-3xl p-8 shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Start growing today')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('Name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'}`}
                      placeholder={t('Dr. Jane Smith')}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('Business Type')}</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                      <option value="">{t('Select your practice type')}</option>
                      <option value="ER">{t('Emergency Room')}</option>
                      <option value="MedSpa">{t('MedSpas')}</option>
                      <option value="UrgentCare">{t('Urgent Care')}</option>
                      <option value="Other">{t('Other Healthcare')}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('Email Address')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'}`}
                      placeholder={t('jane@yourpractice.com')}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('Phone Number')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'}`}
                      placeholder={t('(555) 123-4567')}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('Monthly Marketing Budget')}</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
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
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? t('Submitting...') : t('Start growing today')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
