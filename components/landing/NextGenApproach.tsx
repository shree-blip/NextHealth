'use client';
import { motion } from 'framer-motion';
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

export default function NextGenApproach() {
  const { t } = useSitePreferences();

  const localizedSteps = steps.map((step) => ({
    ...step,
    title: t(step.title),
    description: t(step.description),
  }));

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">{t('The NextGen Approach')}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('Our proven process takes you from struggling to scaling.')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-emerald-200 -translate-y-1/2" />
          
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
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Step number */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/30 relative z-10">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={step.image} alt={step.title} className="w-full h-32 object-cover" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">{step.title}</h3>
                  <p className="text-slate-600 text-sm text-center">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
