'use client';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <header className="relative overflow-hidden py-24 bg-mesh">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              Your Partner in <span className="text-yellow-300">UX Design</span>, Software &amp; <span className="text-yellow-300">AI</span> Development
            </h1>
            <p className="mt-6 text-lg text-white">
              We power product growth through AI adoption, streamlined development, and design excellence.
            </p>

            <div className="mt-8">
              <a href="#contact" className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-300 to-teal-300 text-black rounded shadow hover:scale-105 transition-transform">
                Book a Free Strategy Call
              </a>
            </div>

            {/* trust logos placeholder row */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-6 opacity-60">
              <img src="/Client_logo/placeholder.png" alt="Trusted healthcare partner logo" className="h-8" />
              <img src="/Client_logo/placeholder.png" alt="Healthcare client partner logo" className="h-8" />
              <img src="/Client_logo/placeholder.png" alt="Medical industry partner logo" className="h-8" />
            </div>
          </motion.div>

          <motion.div
            className="order-first lg:order-last"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-emerald-100 to-white p-8">
              <img src="/Client_logo/placeholder.png" alt="Product mock" className="w-full h-64 object-cover rounded"/>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
