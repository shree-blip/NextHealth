'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const logos = [
  { name: 'QuickCare', image: '/4.png' },
  { name: 'PrimeMed', image: '/5.png' },
  { name: 'GlowMed', image: '/6.png' },
  { name: 'RushER', image: '/7.png' },
  { name: 'HealthPlus', image: '/8.png' },
  { name: 'MedElite', image: '/9.png' },
  { name: 'CareFirst', image: '/10.png' },
];

const testimonials = [
  {
    quote: "NexHealth tripled our leads in three months and improved our Google ranking beyond our expectations.",
    author: "Dr. Sarah Chen",
    title: "Medical Director, GlowMed Spa",
    image: "/Client-review-image/review-1.jpg",
  },
  {
    quote: "We saw a 47% increase in walk-in patients within six months. Their healthcare marketing expertise is unmatched.",
    author: "Dr. Michael Rodriguez",
    title: "CEO, RushER Network",
    image: "/Client-review-image/review-4.jpg",
  },
  {
    quote: "The ROI we've seen from their campaigns has been incredible. They truly understand the healthcare space.",
    author: "Dr. Emily Park",
    title: "Founder, HealthPlus Urgent Care",
    image: "/Client-review-image/tab-team1.jpg",
  },
];

export default function TrustedBy() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const localizedTestimonials = testimonials.map((testimonial) => ({
    ...testimonial,
    quote: t(testimonial.quote),
    title: t(testimonial.title),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Trusted by healthcare leaders')}</h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Join the practices that have transformed their patient acquisition with NexHealth.')}
          </p>
        </motion.div>

        {/* Logo Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {logos.map((logo, idx) => (
              <div key={idx} className="grayscale hover:grayscale-0 transition-all">
                <img
                  src={logo.image}
                  alt={logo.name}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative rounded-3xl p-8 md:p-12 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
        >
          <div className={`absolute top-4 left-8 text-8xl font-serif ${isDark ? 'text-slate-700' : 'text-emerald-200'}`}>"</div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className={`text-2xl md:text-3xl font-medium leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                {localizedTestimonials[currentTestimonial].quote}
              </p>
              <div className="flex items-center justify-center gap-4">
                <img 
                  src={localizedTestimonials[currentTestimonial].image} 
                  alt={localizedTestimonials[currentTestimonial].author}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{localizedTestimonials[currentTestimonial].author}</div>
                  <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>{localizedTestimonials[currentTestimonial].title}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentTestimonial ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
