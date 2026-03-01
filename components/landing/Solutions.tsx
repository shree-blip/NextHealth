'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ServiceItem {
  title: string;
  desc: string;
  icon?: React.ReactNode;
}

const groups: Record<string, ServiceItem[]> = {
  Design: [
    { title: 'UX Audit & CRO Optimization', desc: 'Improve conversion with data‑driven UX.' },
    { title: 'Interface Design', desc: 'Clean, modern interfaces that delight users.' },
    { title: 'Prototyping & Testing', desc: 'Validate ideas quickly before build.' },
  ],
  Build: [
    { title: 'Full‑Stack Development', desc: 'Scalable, maintainable codebases.' },
    { title: 'Custom Software & Vibe Coding', desc: 'Tailored HIPAA‑compliant applications built with our signature "vibe" approach.' },
    { title: 'Automation & AI', desc: 'HIPAA‑compliant intake automation and intelligent workflows.' },
  ],
  Scale: [
    { title: 'Performance Optimization', desc: 'Keep apps fast under load.' },
    { title: 'Analytics & Tracking', desc: 'Measure everything that matters.' },
    { title: 'Continuous Delivery', desc: 'Ship updates with confidence.' },
  ],
};

export default function Solutions() {
  const [active, setActive] = useState<'Design'|'Build'|'Scale'>('Design');

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Solutions</h2>
        <p className="text-slate-600 mb-8">
          We’re a transformation partner — blending UX, AI, and Full‑Stack Engineering to deliver real product outcomes.
        </p>
        <div className="flex gap-4 mb-12">
          {Object.keys(groups).map((g) => (
            <button
              key={g}
              onClick={() => setActive(g as any)}
              className={`px-4 py-2 rounded-full transition-colors ${
                active === g ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {groups[active].map((item, idx) => (
            <motion.div
              key={item.title}
              className="p-6 bg-white rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
