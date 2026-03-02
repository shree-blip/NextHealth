'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Activity,
  CreditCard,
  Check,
  ArrowUpRight,
  Loader2,
  Shield,
  Rocket,
  Zap,
  ExternalLink,
  X,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  User,
  Camera,
  Save,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ClientAnalyticsView from '@/components/ClientAnalyticsView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import PricingCard from '@/components/PricingCard';

/* ─── Plan Definitions ─── */
const PLANS = [
  {
    id: 'silver',
    name: 'Wellness & Longevity',
    price: '$5,000',
    period: '/ Month',
    icon: Shield,
    features: ['Advanced SEO & Local Search', 'Google My Business Management', 'Targeted Ads (Google & Meta)', 'AI Chatbot & Call Tracking', 'Monthly Reports & Strategy', 'Content & Social Media'],
    variant: 'professional' as const,
    tier: 1,
  },
  {
    id: 'gold',
    name: 'ER & Urgent Care',
    price: '$10,000',
    period: '/ Month',
    icon: Rocket,
    features: ['High-Budget Google Ads', 'Advanced AI Call Handling', 'Insurance Verification Bots', 'Priority Support & Rapid SLA', 'Multi-Location Campaigns', '24/7 Performance Monitoring', 'Dedicated Account Manager'],
    variant: 'professional' as const,
    popular: true,
    tier: 2,
  },
  {
    id: 'platinum',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: Zap,
    features: ['Custom Software Development', 'HIPAA-Compliant Integrations', 'Multi-State Networks', 'Advanced Analytics & BI', 'Custom Automation Workflows', 'White-Glove Onboarding', 'Enterprise SLA & Support'],
    variant: 'premium' as const,
    tier: 3,
  },
];

/* ─── Toast Component ─── */
function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${
        type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
      <span className="font-semibold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/* ─── Dashboard Component ─── */
export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <ClientDashboard />
    </Suspense>
  );
}

function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const [myClinics, setMyClinics] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'membership' | 'analytics' | 'profile' | 'settings'>('overview');

  // Subscription state
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Read URL params for upgrade feedback and view
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    const plan = searchParams.get('plan');
    const view = searchParams.get('view');
    
    // Handle view parameter
    if (view === 'profile' || view === 'membership' || view === 'analytics' || view === 'settings') {
      setActiveView(view as 'overview' | 'membership' | 'analytics' | 'profile' | 'settings');
    }
    
    if (upgrade === 'success' && plan) {
      setToast({ type: 'success', message: `Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!` });
      setActiveView('membership');
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/client');
      // Refresh subscription status
      fetchSubscriptionStatus();
    } else if (upgrade === 'cancelled') {
      setToast({ type: 'error', message: 'Upgrade was cancelled.' });
      setActiveView('membership');
      window.history.replaceState({}, '', '/dashboard/client');
    }
  }, [searchParams]);

  const fetchSubscriptionStatus = useCallback(() => {
    setLoadingSub(true);
    fetch('/api/stripe/status')
      .then(res => res.json())
      .then(data => setSubStatus(data))
      .catch(console.error)
      .finally(() => setLoadingSub(false));
  }, []);

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push('/login');
      } else {
        res.json().then(data => {
          if (data.role !== 'client' && data.role !== 'admin') {
            router.push('/login');
          } else {
            setUser(data);
          }
        });
      }
    });

    // Fetch subscription status
    fetchSubscriptionStatus();

    // Connect socket
    const newSocket = io({ path: '/socket.io' });
    socketRef.current = newSocket;

    newSocket.on('initial_state', (data) => {
      fetch('/api/auth/me').then(res => res.json()).then(userData => {
        const myAssignments = data.assignments.filter((a: any) => a.userId === userData.id);
        const clinics = myAssignments.map((a: any) => data.clinics.find((c: any) => c.id === a.clinicId)).filter(Boolean);
        setMyClinics(clinics);
      });
    });

    newSocket.on('assignment_added', (data) => {
      if (user && data.userId === user.id) {
        window.location.reload();
      }
    });

    newSocket.on('clinic_updated', (updatedClinic) => {
      setMyClinics(prev => prev.map(c => c.id === updatedClinic.id ? updatedClinic : c));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [router, fetchSubscriptionStatus]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setToast({ type: 'error', message: 'Failed to start upgrade. Please try again.' });
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      setToast({ type: 'error', message: 'Failed to open billing portal.' });
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  const totalLeads = myClinics.reduce((sum, c) => sum + c.leads, 0);
  const totalAppointments = myClinics.reduce((sum, c) => sum + c.appointments, 0);

  const currentPlanId = subStatus?.planId || null;
  const currentPlanTier = PLANS.find(p => p.id === currentPlanId)?.tier || 0;

  return (
    <>
    <Navbar />
    <div className="dashboard-scope min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex pt-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 hidden lg:flex dark:bg-slate-900/50">
        <nav className="space-y-2 flex-grow mt-4">
          <NavItem icon={BarChart3} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
          <NavItem icon={Users} label="Patient Leads" onClick={() => {}} />
          <NavItem icon={Calendar} label="Appointments" onClick={() => {}} />
          <NavItem icon={MessageSquare} label="AI Conversations" onClick={() => {}} />
          <NavItem icon={TrendingUp} label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
          <NavItem
            icon={CreditCard}
            label="Membership"
            active={activeView === 'membership'}
            onClick={() => setActiveView('membership')}
            badge={!currentPlanId ? 'Free' : undefined}
          />
          <NavItem icon={User} label="Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
          <NavItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-3">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[20px] font-bold mb-1">
              {activeView === 'overview'
                ? 'Clinic Overview'
                : activeView === 'membership'
                  ? 'Membership & Billing'
                  : activeView === 'profile'
                    ? 'My Profile'
                    : activeView === 'settings'
                      ? 'Account Settings'
                      : 'Performance Analytics'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 dark:text-slate-200"
              />
            </div>
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold uppercase">
              {user.name.substring(0, 2)}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'membership' ? (
            <motion.div
              key="membership"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MembershipView
                subStatus={subStatus}
                loadingSub={loadingSub}
                currentPlanId={currentPlanId}
                currentPlanTier={currentPlanTier}
                upgradingPlan={upgradingPlan}
                portalLoading={portalLoading}
                onUpgrade={handleUpgrade}
                onManage={handleManageSubscription}
              />
            </motion.div>
          ) : activeView === 'analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ClientAnalyticsView />
            </motion.div>
          ) : activeView === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfileView user={user} setToast={setToast} />
            </motion.div>
          ) : activeView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SettingsView role="client" setToast={setToast} />
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <OverviewView
                myClinics={myClinics}
                totalLeads={totalLeads}
                totalAppointments={totalAppointments}
                currentPlanId={currentPlanId}
                onUpgradeClick={() => setActiveView('membership')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
    <Footer />
    </>
  );
}

/* ─── Membership View ─── */
function MembershipView({
  subStatus,
  loadingSub,
  currentPlanId,
  currentPlanTier,
  upgradingPlan,
  portalLoading,
  onUpgrade,
  onManage,
}: {
  subStatus: any;
  loadingSub: boolean;
  currentPlanId: string | null;
  currentPlanTier: number;
  upgradingPlan: string | null;
  portalLoading: boolean;
  onUpgrade: (plan: string) => void;
  onManage: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Current Plan Banner */}
      <div className="rounded-3xl p-8 border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-2">Current Plan</div>
            <h2 className="text-3xl font-black mb-1">
              {loadingSub ? (
                <span className="flex items-center gap-2 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</span>
              ) : currentPlanId ? (
                <span className="text-emerald-600">{subStatus?.plan}</span>
              ) : (
                <span className="text-slate-400">No Active Plan</span>
              )}
            </h2>
            {subStatus?.subscriptionStatus && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                subStatus.subscriptionStatus === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : subStatus.subscriptionStatus === 'past_due'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full ${
                  subStatus.subscriptionStatus === 'active' ? 'bg-emerald-500' : subStatus.subscriptionStatus === 'past_due' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {subStatus.subscriptionStatus.charAt(0).toUpperCase() + subStatus.subscriptionStatus.slice(1).replace('_', ' ')}
              </span>
            )}
            {!currentPlanId && !loadingSub && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Choose a plan below to unlock premium features and dedicated support.</p>
            )}
          </div>
          {currentPlanId && (
            <button
              onClick={onManage}
              disabled={portalLoading}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div>
        <h3 className="text-xl font-bold mb-6">{currentPlanId ? 'Change Plan' : 'Choose a Plan'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id;
            const isDowngrade = plan.tier < currentPlanTier;

            return (
              <PricingCard
                key={plan.id}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                icon={plan.icon}
                variant={plan.variant}
                popular={plan.popular}
                isActive={isCurrentPlan}
                disabled={upgradingPlan === plan.id}
                loading={upgradingPlan === plan.id}
                cta={
                  isCurrentPlan 
                    ? 'Your Current Plan' 
                    : plan.id === 'premium' 
                    ? 'Contact Sales' 
                    : isDowngrade 
                    ? 'Downgrade' 
                    : 'Upgrade'
                }
                onCtaClick={() => onUpgrade(plan.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Billing Info */}
      {currentPlanId && (
        <div className="rounded-3xl p-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-4">Billing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Subscription ID</span>
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">{subStatus?.stripeSubscriptionId || '—'}</code>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Status</span>
              <span className="font-bold capitalize">{subStatus?.subscriptionStatus || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Plan</span>
              <span className="font-bold">{subStatus?.plan || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Overview View ─── */
function OverviewView({
  myClinics,
  totalLeads,
  totalAppointments,
  currentPlanId,
  onUpgradeClick,
}: {
  myClinics: any[];
  totalLeads: number;
  totalAppointments: number;
  currentPlanId: string | null;
  onUpgradeClick: () => void;
}) {
  const CLINIC_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Prepare chart data for multi-location comparison
  const clinicChartData = myClinics.map(c => ({
    name: c.name.length > 18 ? c.name.substring(0, 18) + '...' : c.name,
    leads: c.leads,
    appointments: c.appointments,
  }));

  // Pie chart data for leads distribution
  const leadsDistribution = myClinics.map((c, idx) => ({
    name: c.name,
    value: c.leads,
    color: CLINIC_COLORS[idx % CLINIC_COLORS.length],
  })).filter(d => d.value > 0);

  return (
    <>
      {/* Upgrade CTA banner for free users */}
      {!currentPlanId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6" />
            <div>
              <span className="font-bold">Unlock premium features</span>
              <span className="text-black/70 text-sm ml-2">— Choose a plan to get started with full marketing support</span>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-5 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shrink-0"
          >
            View Plans
          </button>
        </motion.div>
      )}

      {myClinics.length === 0 ? (
        <div className="glass rounded-[2.5rem] p-12 border border-slate-200 dark:border-slate-700 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-2xl font-bold mb-4">No Clinics Assigned</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">Please contact your administrator to assign clinics to your dashboard.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Once assigned, you&apos;ll see live leads, appointments, and analytics for each location.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Leads (Live)" value={totalLeads.toString()} change="+12.5%" />
            <StatCard label="Appointments (Live)" value={totalAppointments.toString()} change="+8.2%" />
            <StatCard label="Conversion Rate" value={totalLeads > 0 ? `${Math.round((totalAppointments / totalLeads) * 100)}%` : '0%'} change="+4.1%" />
            <StatCard label="Active Locations" value={myClinics.length.toString()} change="" />
          </div>

          {/* Assigned Clinics Cards */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Your Assigned Facilities</h3>
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                Live Sync Active
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClinics.map((clinic, idx) => (
                <motion.div
                  key={clinic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full" style={{ backgroundColor: `${CLINIC_COLORS[idx % CLINIC_COLORS.length]}15` }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: CLINIC_COLORS[idx % CLINIC_COLORS.length] }}
                    >
                      {clinic.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{clinic.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {clinic.location} &bull; {clinic.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-xs">Live Leads</span>
                      <span className="font-bold text-emerald-500 text-2xl">{clinic.leads}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-xs">Appointments</span>
                      <span className="font-bold text-slate-900 dark:text-white text-2xl">{clinic.appointments}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-xs">Conversion</span>
                      <span className="font-bold text-blue-500 text-2xl">
                        {clinic.leads > 0 ? `${Math.round((clinic.appointments / clinic.leads) * 100)}%` : '—'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Multi-Location Bar Chart */}
            {clinicChartData.length > 0 && (
              <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-6">Leads vs Appointments by Location</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={clinicChartData} layout={clinicChartData.length > 3 ? 'vertical' : 'horizontal'}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    {clinicChartData.length > 3 ? (
                      <>
                        <XAxis type="number" fontSize={12} />
                        <YAxis type="category" dataKey="name" fontSize={11} width={130} />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                      </>
                    )}
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="leads" fill="#10b981" name="Leads" radius={[4, 4, 4, 4]} />
                    <Bar dataKey="appointments" fill="#3b82f6" name="Appointments" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Leads Distribution Pie Chart */}
            {leadsDistribution.length > 0 && (
              <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-6">Leads Distribution by Location</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={leadsDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, value }: { name?: string; value?: number }) => `${(name || '').length > 12 ? (name || '').substring(0, 12) + '...' : name || ''}: ${value ?? 0}`}
                      dataKey="value"
                    >
                      {leadsDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ActivityItem 
                title="New Appointment" 
                desc="John Doe booked for Dental Cleaning" 
                time="2m ago" 
              />
              <ActivityItem 
                title="Insurance Verified" 
                desc="Sarah Smith's BlueCross verified by AI" 
                time="15m ago" 
              />
              <ActivityItem 
                title="Lead Generated" 
                desc="Facebook Ad: Emergency Care" 
                time="1h ago" 
              />
              <ActivityItem 
                title="Review Received" 
                desc="5-star review from Mike R." 
                time="3h ago" 
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─── Helper Components ─── */
function NavItem({ icon: Icon, label, active = false, onClick, badge }: { icon: any; label: string; active?: boolean; onClick?: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        active ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm flex-grow">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ label, value, change, negative = false }: { label: string; value: string; change: string; negative?: boolean }) {
  return (
    <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`text-xs font-bold ${negative ? 'text-red-500' : 'text-emerald-500'}`}>
        {change} <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">vs last month</span>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time }: { title: string; desc: string; time: string }) {
  return (
    <div className="flex gap-4">
      <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{desc}</div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{time}</div>
      </div>
    </div>
  );
}

/* ─── Profile View ─── */
function ProfileView({ user, setToast }: { user: any; setToast: (toast: { type: 'success' | 'error'; message: string }) => void }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    avatar: user.avatar || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'File size must be less than 5MB' });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'File must be an image' });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = formData.avatar;

      // Upload avatar if file selected
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarFile);

        const uploadRes = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        } else {
          throw new Error('Failed to upload avatar');
        }
      }

      // Update profile
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          avatar: avatarUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setToast({ type: 'success', message: 'Profile updated successfully!' });
      
      // Reload page to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Profile update error:', error);
      setToast({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{user.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-500 cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-emerald-100 flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-8 space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Email cannot be changed</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Camera className="inline h-4 w-4 mr-2" />
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Or use the camera icon above to upload an image
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Profile Information</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your profile information is visible to administrators and is used for account management purposes. 
                Image uploads are securely stored and will persist across sessions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SettingsView({ role, setToast }: { role: 'client' | 'admin'; setToast: (toast: { type: 'success' | 'error'; message: string }) => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/password')
      .then((res) => res.json())
      .then((data) => {
        if (data?.currentPassword) setCurrentPassword(data.currentPassword);
      })
      .catch(() => {
        setToast({ type: 'error', message: 'Failed to load current password.' });
      });
  }, [setToast]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update password');
      }

      setToast({ type: 'success', message: 'Password updated and saved successfully.' });
      setCurrentPassword(data.currentPassword || newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setToast({ type: 'error', message: error.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Manage your account password and security preferences.</p>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{role === 'admin' ? 'Admin Settings' : 'Client Settings'}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {role === 'admin'
            ? 'Manage administrative account credentials and secure platform access.'
            : 'Manage your clinic account credentials and keep your login secure.'}
        </p>
      </div>
    </div>
  );
}
