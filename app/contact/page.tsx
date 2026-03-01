'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, DollarSign, Target, Activity, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [step, setStep] = useState(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full" />
        </div>
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 mb-8 backdrop-blur-sm">
                <Zap className="h-4 w-4 fill-emerald-500" /> 
                <span className="tracking-wide uppercase text-[10px]">Qualification Process</span>
              </div>
              <h1 className="text-[40px] md:text-[56px] font-black tracking-tight mb-6 leading-[0.9] text-white">
                High Conversion <span className="text-emerald-500">Qualification</span>
              </h1>
              <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
                We partner exclusively with highly vetted, financially viable medical practices ready to scale. 
                Complete the qualification matrix to receive your clinical growth plan.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= i ? 'bg-emerald-500 text-black' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={`h-1 w-12 md:w-24 mx-2 rounded-full transition-colors ${
                      step > i ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Building2 className="text-emerald-500" /> Facility Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Freestanding ER', 'Urgent Care', 'Wellness Clinic', 'Multi-Specialty'].map((type) => (
                      <label key={type} className="flex items-center p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input type="radio" name="facility" className="w-5 h-5 text-emerald-500 bg-slate-50 border-white/20 focus:ring-emerald-500 focus:ring-offset-black" />
                        <span className="ml-4 font-bold text-lg">{type}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Activity className="text-emerald-500" /> Scale Metric</h3>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Number of Current Physical Locations</label>
                    <select className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-6 text-lg focus:outline-none focus:border-emerald-500 transition-colors appearance-none">
                      <option value="1">1 Location</option>
                      <option value="2-5">2 - 5 Locations</option>
                      <option value="6-10">6 - 10 Locations</option>
                      <option value="10+">10+ Locations</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><DollarSign className="text-emerald-500" /> Financial Qualifier</h3>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Current or Projected Monthly Ad Spend</label>
                    <select className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-6 text-lg focus:outline-none focus:border-emerald-500 transition-colors appearance-none">
                      <option value="<5k">Under $5,000</option>
                      <option value="5k-15k">$5,000 - $15,000</option>
                      <option value="15k-50k">$15,000 - $50,000</option>
                      <option value="50k+">$50,000+</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Target className="text-emerald-500" /> Primary Objectives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Increase Call Volume', 
                      'Reduce Front-Desk Load', 
                      'Improve Map Rankings', 
                      'Automate Reviews',
                      'Implement AI Scheduling',
                      'Lower Cost Per Acquisition'
                    ].map((obj) => (
                      <label key={obj} className="flex items-center p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input type="checkbox" className="w-5 h-5 text-emerald-500 bg-slate-50 border-white/20 rounded focus:ring-emerald-500 focus:ring-offset-black" />
                        <span className="ml-4 font-bold">{obj}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <input type="text" placeholder="Full Name" className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors" />
                    <input type="email" placeholder="Work Email" className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between pt-8 border-t border-slate-200">
                {step > 1 ? (
                  <button 
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-8 py-4 rounded-full font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Back
                  </button>
                ) : <div />}
                
                {step < 4 ? (
                  <button 
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-full font-bold hover:bg-emerald-400 transition-all"
                  >
                    Next Step <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-full font-bold hover:bg-emerald-400 transition-all"
                  >
                    Submit Qualification <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
