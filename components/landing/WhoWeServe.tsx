'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface AudienceCard {
  title: string;
  pain: string;
  image: string;
  icon: string;
}

function FlipCard({ audience, index }: { audience: AudienceCard, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="perspective-1000 h-80"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img src={audience.image} alt={audience.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="text-4xl mb-2">{audience.icon}</div>
            <h3 className="text-2xl font-bold text-white">{audience.title}</h3>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-emerald-600 p-6 flex flex-col justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl mb-4">{audience.icon}</div>
          <h3 className="text-2xl font-bold text-white mb-4">{audience.title}</h3>
          <p className="text-white/90 text-lg leading-relaxed">{audience.pain}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function WhoWeServe() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const audiences = [
    {
      title: t('Emergency Rooms'),
      pain: t("Struggling with low patient volume and poor online visibility? We'll fill your beds."),
      image: '/Facility-image/Emergency Room.png',
      icon: '🏥',
    },
    {
      title: t('MedSpas'),
      pain: t('Tired of inconsistent bookings? Our campaigns keep your calendar filled.'),
      image: '/Facility-image/Med Spa.png',
      icon: '✨',
    },
    {
      title: t('Urgent Care Centers'),
      pain: t('When patient flow slows down, so does revenue. We bring a steady stream through your doors.'),
      image: '/Facility-image/Urgent care.png',
      icon: '⚕️',
    },
  ];

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Who we serve')}</h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('We exclusively serve healthcare practices that want to dominate their market.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, idx) => (
            <FlipCard key={audience.title} audience={audience} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
