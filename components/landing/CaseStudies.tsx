'use client';
import { motion } from 'framer-motion';

const studies = [
  { title: 'Recruitment Intromagic', category: 'SAAS', img: '/placeholder-study1.png' },
  { title: 'HealthPortal App', category: 'Healthcare', img: '/placeholder-study2.png' },
  { title: 'E‑Commerce Store', category: 'E‑Commerce', img: '/placeholder-study3.png' },
  { title: 'Learning Platform', category: 'E‑Learning', img: '/placeholder-study4.png' },
];

export default function CaseStudies() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Featured Case Studies</h2>
          <a href="/work" className="text-emerald-500 hover:underline">View All Work</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studies.map((s, idx) => (
            <motion.div
              key={idx}
              className="relative group overflow-hidden rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="relative h-64 bg-gray-200">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-6 bg-white">
                <div className="text-sm text-slate-500 uppercase">{s.category}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{s.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
