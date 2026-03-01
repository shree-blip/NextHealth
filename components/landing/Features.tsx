'use client';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Website Design & Development',
    desc: 'High-converting, accessible websites tailored to patient journeys.'
  },
  {
    title: 'Targeted Ads',
    desc: 'Google and Meta campaigns that deliver measurable ROI.'
  },
  {
    title: 'Content & SEO',
    desc: 'Authority-building content that ranks and educates patients.'
  },
];

export default function Features() {
  return (
    <div id="services">
      <motion.h2 className="text-3xl font-bold text-slate-900 mb-8"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        What We Do
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div key={f.title}
            className="p-6 bg-white rounded-lg shadow"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
          >
            <h3 className="font-semibold text-lg text-slate-900">{f.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
