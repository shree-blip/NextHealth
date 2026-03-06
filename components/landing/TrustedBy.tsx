'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const logos = [
  { 
    name: 'QuickCare', 
    image: '/4.png',
    quote: "We saw immediate results with their integrated approach to patient acquisition and retention."
  },
  { 
    name: 'PrimeMed', 
    image: '/5.png',
    quote: "Their AI automation cut our intake time in half while improving patient satisfaction scores."
  },
  { 
    name: 'GlowMed', 
    image: '/6.png',
    quote: "NexHealth tripled our leads in three months and improved our Google ranking beyond expectations."
  },
  { 
    name: 'RushER', 
    image: '/7.png',
    quote: "The 47% increase in walk-in patients within six months exceeded all our growth projections."
  },
  { 
    name: 'HealthPlus', 
    image: '/8.png',
    quote: "The ROI from their campaigns has been incredible. They truly understand healthcare marketing."
  },
  { 
    name: 'MedElite', 
    image: '/9.png',
    quote: "Their HIPAA-compliant automation freed up our staff to focus on patient care, not data entry."
  },
  { 
    name: 'CareFirst', 
    image: '/10.png',
    quote: "Best investment we made this year. Their strategy turned competitors into cash registers." 
  },
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
  const [selectedLogo, setSelectedLogo] = useState<number | null>(null);
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const localizedTestimonials = testimonials.map((testimonial) => ({
    ...testimonial,
    quote: t(testimonial.quote),
    title: t(testimonial.title),
  }));

  const localizedLogos = logos.map((logo) => ({
    ...logo,
    quote: t(logo.quote),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLogo(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
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

        {/* Logo Strip - Clickable */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8">
            {localizedLogos.map((logo, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedLogo(idx)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="grayscale hover:grayscale-0 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-2"
                aria-label={`View ${logo.name} testimonial`}
              >
                <Image
                  src={logo.image}
                  alt={logo.name}
                  width={120}
                  height={48}
                  loading="lazy"
                  className="h-12 w-auto object-contain"
                />
              </motion.button>
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
                <Image 
                  src={localizedTestimonials[currentTestimonial].image} 
                  alt={localizedTestimonials[currentTestimonial].author}
                  width={64}
                  height={64}
                  loading="lazy"
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
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentTestimonial ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Zoom Modal */}
        <AnimatePresence>
          {selectedLogo !== null && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLogo(null)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedLogo(null)}
              >
                <div
                  className={`relative rounded-2xl shadow-2xl max-w-lg w-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedLogo(null)}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Logo Image - Zoomed */}
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-50 to-slate-100 p-8 flex items-center justify-center">
                    <Image
                      src={localizedLogos[selectedLogo].image}
                      alt={localizedLogos[selectedLogo].name}
                      width={300}
                      height={200}
                      className="h-32 w-auto object-contain"
                    />
                  </div>

                  {/* Quote Section */}
                  <div className="p-8">
                    <div className={`text-5xl font-serif mb-4 ${isDark ? 'text-slate-600' : 'text-emerald-200'}`}>"</div>
                    <p className={`text-lg md:text-xl font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      {localizedLogos[selectedLogo].quote}
                    </p>
                    <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        — {localizedLogos[selectedLogo].name}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
