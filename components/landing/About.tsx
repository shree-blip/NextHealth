'use client';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold">We Are Architects of Bold Products</h2>
        <p className="mt-4 text-lg">Artists, Strategists, Innovators</p>
        <p className="mt-6 max-w-2xl mx-auto text-slate-300">
          Our mission is to build digital products that solve real problems. We combine design thinking, deep technical expertise,
          HIPAA‑compliant development, and AI innovation to help teams move faster and smarter.
        </p>
        <div className="mt-8">
          <a href="/about" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded hover:bg-emerald-400">Learn More</a>
        </div>
      </div>
    </section>
  );
}
