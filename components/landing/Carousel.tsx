'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';

const slides = [
  { title: 'Case Study: Clinic A', excerpt: '60% lift in qualified leads in 3 months.' },
  { title: 'Case Study: Clinic B', excerpt: 'Improved bookings by 42% with a new site.' },
  { title: 'Case Study: Clinic C', excerpt: 'Lowered acquisition cost by 37%.' },
];

export default function Carousel() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Results & Case Studies</h2>
      <div ref={containerRef} className="overflow-x-auto snap-x snap-mandatory flex gap-4 pb-4">
        {slides.map((s, i) => (
          <motion.div key={i}
            className="min-w-[320px] bg-emerald-50 snap-center rounded-lg p-6 shadow"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{s.excerpt}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-slate-500 mt-4">Use horizontal scroll or swipe to view more case studies.</p>
    </div>
  );
}
