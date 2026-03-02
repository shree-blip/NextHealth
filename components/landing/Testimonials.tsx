'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const items = [
  { quote: 'This team took our product to the next level.', name: 'Alice Johnson', role: 'CEO, HealthApp', photo: '/team1.jpg' },
  { quote: 'Their AI chatbots cut our intake time in half.', name: 'Bob Lee', role: 'CTO, MedTech', photo: '/team2.jpg' },
  { quote: 'Professional and data-driven from day one.', name: 'Cara Smith', role: 'Product Lead, EduPlatform', photo: '/team3.jpg' },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Testimonials</h2>
        <div className="relative">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="p-8 bg-white rounded-lg shadow"
          >
            <p className="text-lg italic text-slate-700">“{items[index].quote}”</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <img src={items[index].photo} alt={items[index].name} className="h-12 w-12 rounded-full object-cover" />
              <div className="text-left">
                <div className="font-semibold text-slate-900">{items[index].name}</div>
                <div className="text-sm text-slate-500">{items[index].role}</div>
              </div>
            </div>
          </motion.div>
          <button onClick={prev} className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow">
            <ChevronLeft />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow">
            <ChevronRight />
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-emerald-500' : 'bg-slate-300'}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
