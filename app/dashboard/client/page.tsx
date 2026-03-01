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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ClientAnalyticsView from '@/components/ClientAnalyticsView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ─── Plan Definitions ─── */
const PLANS = [
  {
    id: 'silver',
    name: 'Silver',
    price: '$5,000',
    icon: Shield,
    features: ['Google Ads management', 'Social media management', 'Monthly analytics', 'GBP optimization', 'Email support'],
    bg: 'from-zinc-200 via-zinc-300 to-zinc-400',
    activeBg: 'from-zinc-300 via-zinc-400 to-zinc-500',
    border: 'border-zinc-400',
    tier: 1,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$10,000',
    icon: Rocket,
    features: ['Everything in Silver', 'Multi-channel ads', 'Quarterly strategy sessions', 'Dedicated account manager', 'Email & drip campaigns'],
    bg: 'from-yellow-200 via-yellow-300 to-yellow-400',
    activeBg: 'from-yellow-300 via-yellow-400 to-yellow-500',
    border: 'border-yellow-400',
    popular: true,
    tier: 2,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 'Custom',
    icon: Zap,
    features: ['Everything in Gold', 'Unlimited revisions', 'Priority support', 'Custom integrations', 'Weekly strategy calls'],
    bg: 'from-blue-100 via-zinc-200 to-blue-300',
    activeBg: 'from-blue-200 via-zinc-300 to-blue-400',
    border: 'border-blue-300',
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
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
  const [activeView, setActiveView] = useState<'overview' | 'membership' | 'analytics'>('overview');

  // Subscription state
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Read URL params for upgrade feedback
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    const plan = searchParams.get('plan');
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

  if (!user) return <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  const totalLeads = myClinics.reduce((sum, c) => sum + c.leads, 0);
  const totalAppointments = myClinics.reduce((sum, c) => sum + c.appointments, 0);

  const currentPlanId = subStatus?.planId || null;
  const currentPlanTier = PLANS.find(p => p.id === currentPlanId)?.tier || 0;

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-slate-50 text-slate-900 flex pt-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-100 flex flex-col p-6 hidden lg:flex">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <img
            src="/Client-review-image/nextgen_footerlogo.png"
            alt="NextGen Marketing Agency"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="space-y-2 flex-grow">
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
          <NavItem icon={Settings} label="Settings" onClick={() => {}} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors p-3">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[20px] font-bold mb-1">
              {activeView === 'overview' ? 'Clinic Overview' : activeView === 'membership' ? 'Membership & Billing' : 'Performance Analytics'}
            </h1>
            <p className="text-slate-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="bg-slate-100 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 relative">
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
      <div className="rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Current Plan</div>
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
              <p className="text-sm text-slate-500 mt-2">Choose a plan below to unlock premium features and dedicated support.</p>
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
            const PlanIcon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: isCurrentPlan ? 1 : 1.03 }}
                className={`relative rounded-3xl p-8 border-2 transition-all duration-300 ${
                  isCurrentPlan
                    ? `bg-gradient-to-br ${plan.activeBg} ${plan.border} ring-2 ring-emerald-500 ring-offset-2`
                    : `bg-gradient-to-br ${plan.bg} ${plan.border} hover:shadow-xl cursor-pointer`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check className="h-3 w-3" /> Current
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/50 flex items-center justify-center">
                    <PlanIcon className="h-6 w-6 text-slate-800" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-black">{plan.name}</h4>
                    <div className="text-2xl font-black text-black">
                      {plan.price}
                      {plan.price !== 'Custom' && <span className="text-sm font-normal opacity-60">/mo</span>}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-black/80">
                      <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="text-center py-3 rounded-full font-bold bg-emerald-500 text-black text-sm">
                    Your Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => onUpgrade(plan.id)}
                    disabled={upgradingPlan === plan.id}
                    className={`w-full py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isDowngrade
                        ? 'bg-white/60 text-black/60 hover:bg-white/80'
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105'
                    } disabled:opacity-50`}
                  >
                    {upgradingPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {plan.id === 'platinum' ? 'Contact Sales' : isDowngrade ? 'Downgrade' : 'Upgrade'}
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Billing Info */}
      {currentPlanId && (
        <div className="rounded-3xl p-8 border border-slate-200 bg-white">
          <h3 className="text-lg font-bold mb-4">Billing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Subscription ID</span>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{subStatus?.stripeSubscriptionId || '—'}</code>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Status</span>
              <span className="font-bold capitalize">{subStatus?.subscriptionStatus || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Plan</span>
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
        <div className="glass rounded-[2.5rem] p-12 border border-slate-200 text-center">
          <h2 className="text-2xl font-bold mb-4">No Clinics Assigned</h2>
          <p className="text-slate-600">Please contact your administrator to assign clinics to your dashboard.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Leads (Live)" value={totalLeads.toString()} change="+12.5%" />
            <StatCard label="Appointments (Live)" value={totalAppointments.toString()} change="+8.2%" />
            <StatCard label="Conversion Rate" value={totalLeads > 0 ? `${Math.round((totalAppointments / totalLeads) * 100)}%` : '0%'} change="+4.1%" />
            <StatCard label="Active Clinics" value={myClinics.length.toString()} change="0%" />
          </div>

          {/* Assigned Clinics List */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 mb-12">
            <h3 className="text-xl font-bold mb-6">Your Assigned Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClinics.map(clinic => (
                <div key={clinic.id} className="bg-slate-100 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                  <h4 className="font-bold text-lg mb-1">{clinic.name}</h4>
                  <p className="text-sm text-slate-600 mb-4">{clinic.location} • {clinic.type}</p>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-slate-500 block">Live Leads</span>
                      <span className="font-bold text-emerald-500 text-xl">{clinic.leads}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Appointments</span>
                      <span className="font-bold text-slate-900 text-xl">{clinic.appointments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts / Main View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Patient Acquisition Trend</h3>
                <select className="bg-transparent border-none text-sm text-slate-500 focus:ring-0">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="h-64 w-full bg-slate-100 rounded-2xl flex items-end justify-between p-6 gap-2">
                {[40, 70, 45, 90, 65, 80, 50, 95, 75, 60, 85, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className="w-full bg-emerald-500/20 rounded-t-lg relative group"
                  >
                    <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 border border-slate-200">
              <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
              <div className="space-y-6">
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
        active ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm flex-grow">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ label, value, change, negative = false }: { label: string; value: string; change: string; negative?: boolean }) {
  return (
    <div className="glass rounded-3xl p-6 border border-slate-200">
      <div className="text-sm text-slate-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`text-xs font-bold ${negative ? 'text-red-500' : 'text-emerald-500'}`}>
        {change} <span className="text-slate-500 font-normal ml-1">vs last month</span>
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
        <div className="text-xs text-slate-500 mb-1">{desc}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{time}</div>
      </div>
    </div>
  );
}
