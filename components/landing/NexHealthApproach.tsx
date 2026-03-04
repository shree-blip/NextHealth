'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const steps = [
  {
    number: '01',
    title: 'Discovery & Audit',
    description: 'We dive into your current marketing, identify gaps, and learn about your patients.',
    image: '/16.png',
  },
  {
    number: '02',
    title: 'Custom Strategy',
    description: 'You get a tailored marketing plan based on real data, not guesswork.',
    image: '/17.png',
  },
  {
    number: '03',
    title: 'Launch',
    description: 'We execute campaigns across every channel—search, social and email.',
    image: '/18.png',
  },
  {
    number: '04',
    title: 'Optimize',
    description: 'We run A/B tests, analyze results and refine your campaigns weekly.',
    image: '/19.png',
  },
  {
    number: '05',
    title: 'Scale',
    description: 'When we find what works, we double down to boost your patient volume.',
    image: '/20.png',
  },
];

export default function NexHealthApproach() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  const localizedSteps = steps.map((step) => ({
    ...step,
    title: t(step.title),
    description: t(step.description),
  }));

  return (
    <section className={`py-24 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('The NexHealth Approach')}</h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Our proven process takes you from struggling to scaling.')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className={`hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 ${isDark ? 'bg-slate-700' : 'bg-emerald-200'}`} />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {localizedSteps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  {/* Step number */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/30 relative z-10">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="mb-4 rounded-lg overflow-hidden relative h-32">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 18vw, (min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
