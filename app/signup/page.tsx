'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard/client');
    }
  }, [user, router]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Register the user as a client
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'client' }),
      });

      if (!authRes.ok) {
        const data = await authRes.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await authRes.json();
      router.push('/dashboard/client');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4 relative overflow-hidden pt-32">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-black text-slate-900 mb-3">Create Your Account</h1>
            <p className="text-slate-600 text-lg">Join us as a client and get started</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-xl"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || !email || !password}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account? <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-bold">Log in</Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
