'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, Loader2, Zap, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plans = [
  {
    id: 'silver',
    name: 'Silver',
    price: '$5,000',
    features: ['Google Ads management', 'Social media management', 'Monthly analytics', 'GBP optimization', 'Email support'],
    bg: 'from-zinc-300 via-zinc-400 to-zinc-500',
    border: 'border-zinc-400',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$10,000',
    features: ['Everything in Silver', 'Multi-channel ads', 'Quarterly strategy sessions', 'Dedicated account manager', 'Email & drip campaigns'],
    bg: 'from-yellow-300 via-yellow-400 to-yellow-500',
    border: 'border-yellow-400',
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 'Custom',
    features: ['Everything in Gold', 'Unlimited revisions', 'Priority support', 'Custom integrations', 'Weekly strategy calls'],
    bg: 'from-blue-200 via-zinc-200 to-blue-400',
    border: 'border-blue-300',
  },
];

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('plan') || '';

  const [step, setStep] = useState<'plan' | 'register'>(preselected ? 'register' : 'plan');
  const [selectedPlan, setSelectedPlan] = useState(preselected || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setStep('register');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Register / login the user
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!authRes.ok) {
        throw new Error('Registration failed');
      }

      // 2. If a plan is selected, initiate Stripe checkout
      if (selectedPlan && selectedPlan !== 'platinum') {
        const checkoutRes = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: selectedPlan }),
        });

        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      // Platinum or no plan → go to dashboard
      if (selectedPlan === 'platinum') {
        router.push('/contact');
      } else {
        router.push('/dashboard/client');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden pt-32">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/15 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img
              src="/Client-review-image/nextgen_footerlogo.png"
              alt="NextGen Marketing Agency"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">
            {step === 'plan' ? 'Choose Your Plan' : 'Create Your Account'}
          </h1>
          <p className="text-slate-400 text-lg">
            {step === 'plan'
              ? 'Select the plan that best fits your practice'
              : `Signing up for the ${plans.find(p => p.id === selectedPlan)?.name || ''} plan`}
          </p>
        </motion.div>

        {step === 'plan' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                onClick={() => handleSelectPlan(plan.id)}
                className={`relative cursor-pointer rounded-3xl p-8 bg-gradient-to-br ${plan.bg} text-black border-2 ${plan.border} transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-emerald-700 hover:text-white hover:border-emerald-500 group`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-4">{plan.price}<span className="text-sm font-normal opacity-70">{plan.price !== 'Custom' ? '/mo' : ''}</span></div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-700 group-hover:text-emerald-200 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-center py-3 rounded-full font-bold bg-white/80 text-emerald-700 group-hover:bg-white group-hover:text-emerald-600 transition-all">
                  Select Plan <ArrowRight className="inline h-4 w-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
          >
            {/* Back to plans */}
            <button
              onClick={() => { setStep('plan'); setError(''); }}
              className="text-emerald-400 text-sm font-bold mb-6 hover:text-emerald-300 transition-colors"
            >
              ← Change plan
            </button>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Dr. John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-full hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {selectedPlan === 'platinum' ? 'Contact Sales' : 'Sign Up & Subscribe'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-emerald-400 font-bold">Log in</Link>
            </p>
          </motion.div>
        )}
      </div>
    </main>
    <Footer />
    </>
  );
}
