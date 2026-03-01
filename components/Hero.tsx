'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Zap, BarChart3, Activity, Search } from 'lucide-react';

interface CTA {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface HeroProps {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  /** background image for hero (rendered with CSS) */
  bgImageSrc?: string;
  /** alt text for the background image (unused but provided for accessibility reference) */
  imageAlt?: string;
}

export default function Hero({
  heading,
  subheading,
  primaryCTA,
  secondaryCTA
}: HeroProps) {
  // default landing page copy
  const defaultHeading = (
    <>ENGINEERING <br /><span className="text-emerald-500">DOMINANCE</span></>
  );
  const defaultSub = (
    <>We don&apos;t just run ads. We build integrated patient acquisition engines using{' '}
      <span className="text-emerald-400 font-bold">Advanced Paid Media</span>,{' '}
      <span className="text-emerald-400 font-bold">Local SEO</span>, and{' '}
      <span className="text-emerald-400 font-bold">AI-Driven Intake Automation</span>.
    </>
  );

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 mb-8 backdrop-blur-sm">
              <Zap className="h-4 w-4 fill-emerald-500" /> 
              <span className="tracking-wide uppercase text-[10px]">The Clinical Growth Operating System</span>
            </div>

            <h1 className="text-[50px] md:text-[62px] lg:text-[86px] font-black tracking-tight mb-8 leading-[0.85] text-white">
              {heading || defaultHeading}
            </h1>

            <p className="mx-auto max-w-3xl text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed font-medium">
              {subheading || defaultSub}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {primaryCTA && (
              <a
                href={primaryCTA.href || '#'}
                onClick={primaryCTA.onClick}
                className="group relative flex items-center gap-3 rounded-full bg-emerald-500 px-10 py-5 text-lg font-bold text-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95"
              >
                {primaryCTA.label}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTA.href || '#'}
                onClick={secondaryCTA.onClick}
                className="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-10 py-5 text-lg font-bold text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <Play className="h-5 w-5 fill-white" /> {secondaryCTA.label}
              </a>
            )}
          </motion.div>
        </div>


        {/* Visual Feature Grid (only show default on landing) */}
        {!heading && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
            >
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                  <Search className="h-6 w-6 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Local SEO Mastery</h3>
                <p className="text-slate-400 leading-relaxed">Dominate &apos;near me&apos; searches in your Texas municipality with clinical precision.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                  <Activity className="h-6 w-6 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Intake Automation</h3>
                <p className="text-slate-400 leading-relaxed">24/7 AI agents that verify insurance and schedule patients directly into your EHR.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                  <BarChart3 className="h-6 w-6 text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Predictable ROI</h3>
                <p className="text-slate-400 leading-relaxed">Transparent dashboards showing exactly how your ad spend converts to revenue.</p>
              </div>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-24 pt-12 border-t border-white/10 flex flex-wrap justify-center items-center gap-12 text-white/40"
            >
              <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                <ShieldCheck className="h-6 w-6 text-emerald-500/50" /> HIPAA COMPLIANT
              </div>
              <div className="font-black text-2xl tracking-tighter">TEXAS MEDICAL ASSOC</div>
              <div className="font-black text-2xl tracking-tighter">GOOGLE PARTNER</div>
              <div className="font-black text-2xl tracking-tighter">FORBES HEALTH</div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
