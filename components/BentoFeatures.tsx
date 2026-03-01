'use client';

import { motion } from 'framer-motion';
import { Search, MessageSquare, Shield, MousePointer2, BarChart, Users, Zap, Activity, Globe } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const features = [
  {
    title: "Local SEO Dominance",
    description: "We don't just rank; we dominate 'near me' searches for ERs and Urgent Care clinics across Texas.",
    icon: Search,
    className: "md:col-span-2 md:row-span-1 bg-emerald-50 border-emerald-100",
    darkClassName: "md:col-span-2 md:row-span-1 bg-emerald-900/30 border-emerald-800",
    iconColor: "text-emerald-600",
    descColor: "text-slate-500",
    darkDescColor: "text-slate-400",
  },
  {
    title: "AI Intake Agents",
    description: "24/7 automated patient scheduling and insurance verification.",
    icon: MessageSquare,
    className: "md:col-span-1 md:row-span-1 bg-blue-50 border-blue-100",
    darkClassName: "md:col-span-1 md:row-span-1 bg-blue-900/30 border-blue-800",
    iconColor: "text-blue-600",
    descColor: "text-slate-500",
    darkDescColor: "text-slate-400",
  },
  {
    title: "HIPAA Secure Ops",
    description: "Every byte of data is encrypted and handled with clinical precision.",
    icon: Shield,
    className: "md:col-span-1 md:row-span-2 bg-emerald-600 border-emerald-700 text-white",
    darkClassName: "md:col-span-1 md:row-span-2 bg-slate-900 border-slate-800 text-white",
    iconColor: "text-emerald-400",
    descColor: "text-white/80",
    darkDescColor: "text-slate-400",
  },
  {
    title: "Zero-Click Booking",
    description: "Streamlined patient journeys that convert traffic into appointments instantly.",
    icon: MousePointer2,
    className: "md:col-span-1 md:row-span-1 bg-purple-50 border-purple-100",
    darkClassName: "md:col-span-1 md:row-span-1 bg-purple-900/30 border-purple-800",
    iconColor: "text-purple-600",
    descColor: "text-slate-500",
    darkDescColor: "text-slate-400",
  },
  {
    title: "Real-time ROI Tracking",
    description: "Transparent dashboards showing exactly where your ad spend goes and what it returns.",
    icon: BarChart,
    className: "md:col-span-2 md:row-span-1 bg-orange-50 border-orange-100",
    darkClassName: "md:col-span-2 md:row-span-1 bg-orange-900/30 border-orange-800",
    iconColor: "text-orange-600",
    descColor: "text-slate-500",
    darkDescColor: "text-slate-400",
  },
];

export default function BentoFeatures() {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';

  return (
    <section className={`py-32 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className={`h1 mb-6 tracking-tight leading-[0.85] ${isDark ? 'text-white' : ''}`}>
            THE AUTOMATION <br />
            <span className="text-emerald-500">MOAT</span>
          </h2>
          <p className={`max-w-2xl text-xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Traditional agencies stop at the click. We integrate directly into your clinical operations 
            to ensure every lead becomes a patient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`group relative overflow-hidden rounded-[2.5rem] border p-10 transition-all hover:shadow-2xl ${isDark ? feature.darkClassName + ' hover:shadow-slate-900/50' : feature.className + ' hover:shadow-slate-200/50'}`}
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                  <p className={`text-base leading-relaxed ${isDark ? feature.darkDescColor : feature.descColor}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
              {/* Decorative background glow */}
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
