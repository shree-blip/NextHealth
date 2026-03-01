'use client';
import { useState } from 'react';

const categories: Record<string, { title: string; desc: string }[]> = {
  Startups: [
    { title: 'SaaS', desc: 'Early‑stage platforms looking to scale quickly.' },
    { title: 'Healthcare', desc: 'Innovative health tech solutions.' },
    { title: 'E‑Learning', desc: 'Education platforms and tools.' },
  ],
  SMBs: [
    { title: 'E‑Commerce', desc: 'Web stores needing conversion boosts.' },
    { title: 'Healthcare', desc: 'Local clinics and practices.' },
    { title: 'SaaS', desc: 'Growth for small SaaS vendors.' },
  ],
  'Innovation Teams': [
    { title: 'AI & ML', desc: 'Internal teams experimenting with AI.' },
    { title: 'Healthcare', desc: 'Enterprise digital transformation.' },
    { title: 'E‑Learning', desc: 'Corporate training initiatives.' },
  ],
};

export default function Industries() {
  const [active, setActive] = useState<'Startups'|'SMBs'|'Innovation Teams'>('Startups');
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Who We Work With</h2>
        <div className="flex gap-4 mb-8">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat as any)}
              className={`px-4 py-2 rounded-full transition-colors ${
                active === cat ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories[active].map((item, idx) => (
            <div key={idx} className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
