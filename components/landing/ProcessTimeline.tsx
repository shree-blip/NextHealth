'use client';
import { motion } from 'framer-motion';

const steps = [
  { title: 'Ideate', desc: 'Brainstorm and validate concepts based on user needs.' },
  { title: 'Design the solution', desc: 'Create interfaces and prototypes that solve problems.' },
  { title: 'Develop & Engineer', desc: 'Build robust, scalable applications with modern tech.' },
  { title: 'Launch & Grow', desc: 'Deploy, analyze, and iterate to scale your product.' },
];

export default function ProcessTimeline() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How We Deliver Solutions</h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px bg-slate-300 h-full" />
          <div className="space-y-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="relative flex items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 mt-2">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
