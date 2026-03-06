'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, User, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import LoadingScreen from '@/components/LoadingScreen';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const allowedOrigin = new URL(appUrl).origin;

      // For OAuth messages, use flexible origin validation
      // The callback popup is on the same domain, so we only need to validate it's from our domain or localhost
      const isOAuthMessage = event.data?.type === 'OAUTH_AUTH_SUCCESS' || event.data?.type === 'OAUTH_AUTH_ERROR';
      
      const isValidOrigin = isOAuthMessage 
        ? (origin === allowedOrigin || origin === window.location.origin || origin.includes('localhost') || origin.endsWith('.run.app'))
        : (origin.includes('localhost') || origin.endsWith('.run.app') || origin === allowedOrigin || origin === window.location.origin);

      if (!isValidOrigin) {
        console.warn(`[OAuth] Origin validation failed: ${origin} not in [localhost, .run.app, ${allowedOrigin}, ${window.location.origin}]`);
        return;
      }

      console.log('[Login] Received message:', { type: event.data?.type, origin, isValidOrigin });

      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        console.error('[Login] OAuth error received:', event.data?.error);
        setError(event.data?.error || 'Google login failed');
        setIsLoading(false);
        setIsRedirecting(false);
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const user = event.data.user;
        const token = event.data.token;
        const dashboardPath = user?.role === 'super_admin' ? '/dashboard/admin' : `/dashboard/${user.role}`;

        console.log('[Login] OAuth success received:', { user, dashboardPath });

        // Show loading screen immediately — no blank screen
        setIsRedirecting(true);
        setIsLoading(false);

        try {
          // Set the auth cookie from the main window context.
          // The popup's Set-Cookie may be blocked by browsers that restrict
          // cookies from third-party redirect chains (Safari ITP, Chrome, etc).
          if (token) {
            console.log('[Login] Setting auth token cookie...');
            const tokenRes = await fetch('/api/auth/token-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            
            if (!tokenRes.ok) {
              const errorText = await tokenRes.text().catch(() => 'Unknown error');
              throw new Error(`Token login failed with status ${tokenRes.status}: ${errorText}`);
            }
            console.log('[Login] Auth token cookie set successfully');
          }
          
          // Small delay to ensure cookie is set before navigating
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate with explicit replaceState to prevent back button issues
          console.log('[Login] Navigating to dashboard:', dashboardPath);
          window.location.replace(dashboardPath);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error('[Login] OAuth login failed:', errorMsg);
          setError(`Authentication failed: ${errorMsg}`);
          setIsRedirecting(false);
          setIsLoading(false);
        }
      }
    };
    console.log('[Login] Setting up OAuth message listener');
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Show loading screen immediately — before the API call starts
    setIsRedirecting(true);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Login failed (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const dashboardPath = data?.user?.role === 'super_admin' ? '/dashboard/admin' : `/dashboard/${data.user.role}`;

      // Navigate immediately — loading.tsx keeps animation alive during page load
      router.replace(dashboardPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(message);
      // Dismiss loading screen on error
      setIsRedirecting(false);
      setIsLoading(false);
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get auth URL' }));
        throw new Error(errorData.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        setError('Please allow popups for this site to connect your account.');
        setIsLoading(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OAuth error';
      setError(message);
      console.error('OAuth error:', error);
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  return (
    <>
      {isRedirecting && (
        <LoadingScreen durationMs={3000} />
      )}
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden pt-32">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-[20px] font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-500">Access your clinical growth dashboard</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2.5rem] p-8 border border-slate-200"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-sm font-medium"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Sign In</>  
              )}
            </button>

            <p className="text-xs text-center text-slate-500 mt-4">
              Use the email and password provided by your administrator to sign in.
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 border border-slate-200 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </motion.div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Not a client yet? <Link href="/pricing" className="text-emerald-500 font-bold">View Plans</Link>
        </p>
      </div>
    </main>
    <Footer />
    </>
  );
}
