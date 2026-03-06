'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Loader2, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setError('');
      setEmailError('');
      setIsLoading(false);
      setIsGoogleLoading(false);
    }
  }, [isOpen]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && emailError) {
      validateEmail(value);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      validateEmail(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Name is required');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'signup' && { name, role: 'client' }),
        }),
      });

      const data = await authRes.json();

      if (!authRes.ok) {
        throw new Error(data.error || (mode === 'signup' ? 'Registration failed' : 'Login failed'));
      }

      // Success - trigger the callback
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);
      
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to start Google sign-in' }));
        throw new Error(data.error || 'Failed to start Google sign-in');
      }
      
      const { url } = await response.json();
      
      // Open popup
      const popup = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!popup) {
        // Popup blocked: fall back to same-tab redirect
        window.location.assign(url);
        return;
      }

      // Safari/strict browsers can return a handle while still blocking popup behavior.
      setTimeout(() => {
        try {
          if (popup.closed) {
            window.location.assign(url);
          }
        } catch {
          // ignore
        }
      }, 700);

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const allowedOrigin = new URL(appUrl).origin;
        const origin = event.origin;

        if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== allowedOrigin) {
          return;
        }

        if (event.data?.type === 'OAUTH_AUTH_ERROR') {
          setError(event.data?.error || 'Google sign-in failed. Please try again.');
          setIsGoogleLoading(false);
          window.removeEventListener('message', handleMessage);
          return;
        }

        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          try {
            if (event.data?.token) {
              await fetch('/api/auth/token-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: event.data.token }),
              });
            }
            window.removeEventListener('message', handleMessage);
            onSuccess();
          } catch (err) {
            setError('Signed in, but failed to complete action. Please refresh the page.');
            setIsGoogleLoading(false);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup if popup is closed without completing auth
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          setIsGoogleLoading(false);
        }
      }, 500);

    } catch (err: any) {
      setError(err?.message || 'Failed to open Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {mode === 'signup' 
                  ? 'Sign up to join the conversation' 
                  : 'Log in to continue commenting'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    disabled={isLoading || isGoogleLoading}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    emailError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500'
                  }`}
                  disabled={isLoading || isGoogleLoading}
                  required
                />
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  disabled={isLoading || isGoogleLoading}
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading || !!emailError}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Log In
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-emerald-500 hover:text-emerald-600 font-semibold"
                  disabled={isLoading || isGoogleLoading}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-emerald-500 hover:text-emerald-600 font-semibold"
                  disabled={isLoading || isGoogleLoading}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
