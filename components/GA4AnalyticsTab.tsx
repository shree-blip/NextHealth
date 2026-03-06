'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, Globe, RefreshCw, Loader2,
  Eye, Zap, BarChart3, Activity,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface GA4Row {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
  conversions: number;
  organicSessions: number;
  paidSessions: number;
  directSessions: number;
  referralSessions: number;
  socialSessions: number;
}

type Period = '7d' | '30d' | '90d' | '365d';
const PERIOD_OPTIONS: { value: Period; label: string; short: string }[] = [
  { value: '7d', label: 'Last 7 days', short: '7D' },
  { value: '30d', label: 'Last 30 days', short: '30D' },
  { value: '90d', label: 'Last 90 days', short: '90D' },
  { value: '365d', label: 'Last year', short: '1Y' },
];

interface GA4AnalyticsTabProps { clinicId: string; isDark?: boolean; }

export default function GA4AnalyticsTab({ clinicId, isDark = false }: GA4AnalyticsTabProps) {
  const [data, setData] = useState<GA4Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30d');
  const [ga4PropertyId, setGa4PropertyId] = useState<string | null>(null);

  const fetchData = useCallback(async (forceSync = false) => {
    try {
      if (forceSync) setSyncing(true); else setLoading(true);
      setError(null);
      const days = parseInt(period);
      const syncParam = forceSync ? '&sync=1' : '';
      const res = await fetch(`/api/client/analytics-data?clinicId=${clinicId}&days=${days}${syncParam}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.ga4Data || []);
      setGa4PropertyId(json.ga4PropertyId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [clinicId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Not connected
  if (!ga4PropertyId && !loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 dark:from-slate-800 dark:via-slate-800 dark:to-amber-950/20 p-14 text-center shadow-sm">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-orange-200/20 to-amber-200/10 blur-3xl" />
        <div className="relative z-10">
          <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 p-[2px] shadow-lg shadow-orange-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-white dark:bg-slate-800">
              <BarChart3 className="h-9 w-9 text-orange-500" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">GA4 Not Connected</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Your administrator hasn&apos;t connected a Google Analytics property for this clinic yet.
          </p>
        </div>
      </motion.div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 blur-xl opacity-20 animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-orange-500" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading GA4 analytics...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10 p-8 text-center">
        <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Failed to load GA4 data</p>
        <p className="text-xs text-red-500/80 dark:text-red-400/60 mb-5">{error}</p>
        <button onClick={() => fetchData()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </motion.div>
    );
  }

  // No data
  if (data.length === 0) {
    return (
      <div className="space-y-5">
        <PeriodSelector period={period} onChange={setPeriod} isDark={isDark} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-14 text-center">
          <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">No GA4 Data Yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No analytics data has been synced for this period. Click <strong>Refresh</strong> or check back soon.
          </p>
        </motion.div>
      </div>
    );
  }

  // Summaries
  const totals = data.reduce(
    (acc, d) => ({ activeUsers: acc.activeUsers + d.activeUsers, newUsers: acc.newUsers + d.newUsers, sessions: acc.sessions + d.sessions, pageViews: acc.pageViews + d.pageViews, conversions: acc.conversions + d.conversions }),
    { activeUsers: 0, newUsers: 0, sessions: 0, pageViews: 0, conversions: 0 },
  );
  const avgBounce = data.reduce((s, d) => s + d.bounceRate, 0) / data.length;
  const avgEngagement = data.reduce((s, d) => s + d.engagementRate, 0) / data.length;
  const avgSessionDuration = data.reduce((s, d) => s + d.avgSessionDuration, 0) / data.length;

  const trafficSources = [
    { name: 'Organic', value: data.reduce((s, d) => s + d.organicSessions, 0) },
    { name: 'Paid', value: data.reduce((s, d) => s + d.paidSessions, 0) },
    { name: 'Direct', value: data.reduce((s, d) => s + d.directSessions, 0) },
    { name: 'Referral', value: data.reduce((s, d) => s + d.referralSessions, 0) },
    { name: 'Social', value: data.reduce((s, d) => s + d.socialSessions, 0) },
  ].filter(s => s.value > 0);

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const chartData = data.map(d => ({ ...d, label: formatDate(d.date), bounceRate: Math.round(d.bounceRate * 100) / 100, engagementRate: Math.round(d.engagementRate * 100) / 100 }));

  const glassCard = `rounded-3xl p-6 border backdrop-blur-sm shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`;
  const headingClass = `text-[15px] font-bold mb-5 flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = { backgroundColor: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '12px 16px' };

  const kpis = [
    { label: 'Active Users', value: totals.activeUsers.toLocaleString(), icon: <Users className="h-5 w-5" />, color: 'emerald' },
    { label: 'Sessions', value: totals.sessions.toLocaleString(), icon: <Activity className="h-5 w-5" />, color: 'blue' },
    { label: 'Page Views', value: totals.pageViews.toLocaleString(), icon: <Eye className="h-5 w-5" />, color: 'amber' },
    { label: 'Engagement', value: `${avgEngagement.toFixed(1)}%`, icon: <Zap className="h-5 w-5" />, color: 'purple' },
    { label: 'Bounce Rate', value: `${avgBounce.toFixed(1)}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'red' },
    { label: 'Conversions', value: totals.conversions.toLocaleString(), icon: <BarChart3 className="h-5 w-5" />, color: 'teal' },
  ];

  const iconColor: Record<string, string> = { emerald: 'text-emerald-500', blue: 'text-blue-500', amber: 'text-amber-500', purple: 'text-purple-500', red: 'text-red-500', teal: 'text-teal-500' };
  const iconBg: Record<string, string> = { emerald: 'bg-emerald-500/10', blue: 'bg-blue-500/10', amber: 'bg-amber-500/10', purple: 'bg-purple-500/10', red: 'bg-red-500/10', teal: 'bg-teal-500/10' };
  const gradBg: Record<string, string> = { emerald: 'from-emerald-500/10 to-emerald-500/5', blue: 'from-blue-500/10 to-blue-500/5', amber: 'from-amber-500/10 to-amber-500/5', purple: 'from-purple-500/10 to-purple-500/5', red: 'from-red-500/10 to-red-500/5', teal: 'from-teal-500/10 to-teal-500/5' };

  const formatDuration = (s: number) => { const m = Math.floor(s / 60); const sec = Math.round(s % 60); return `${m}m ${sec}s`; };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">GA4 Analytics</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{ga4PropertyId ? `Property: ${ga4PropertyId}` : 'Google Analytics performance'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={syncing} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md disabled:opacity-50 active:scale-95">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Refresh'}
          </button>
          <PeriodSelector period={period} onChange={setPeriod} isDark={isDark} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm group hover:shadow-lg transition-all ${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradBg[kpi.color]} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBg[kpi.color]} mb-3`}>
                <span className={iconColor[kpi.color]}>{kpi.icon}</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{kpi.value}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users & Sessions Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={glassCard}>
        <h3 className={headingClass}><div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-emerald-500" /></div>Users & Sessions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
            <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
            <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10b981" strokeWidth={2.5} fill="url(#colorUsers)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorSessions)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bounce & Engagement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={glassCard}>
          <h3 className={headingClass}><div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-amber-500" /></div>Bounce & Engagement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              <Line type="monotone" dataKey="bounceRate" name="Bounce %" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="engagementRate" name="Engagement %" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic Sources */}
        {trafficSources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={glassCard}>
            <h3 className={headingClass}><div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center"><Globe className="h-4 w-4 text-purple-500" /></div>Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={4} strokeWidth={0}>
                  {trafficSources.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Page Views & Avg Session Duration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={glassCard}>
        <h3 className={headingClass}><div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center"><Eye className="h-4 w-4 text-blue-500" /></div>Page Views</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
            <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorPV)" dot={false} activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Footer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${glassCard} !p-5`}>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs">Avg Session</span>
            <p className="font-bold text-slate-900 dark:text-white">{formatDuration(avgSessionDuration)}</p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs">New Users</span>
            <p className="font-bold text-slate-900 dark:text-white">{totals.newUsers.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs">Bounce Rate</span>
            <p className="font-bold text-slate-900 dark:text-white">{avgBounce.toFixed(1)}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* Period Selector */
function PeriodSelector({ period, onChange, isDark }: { period: Period; onChange: (p: Period) => void; isDark: boolean }) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
      {PERIOD_OPTIONS.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            period === opt.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm shadow-black/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}>
          <span className="hidden sm:inline">{opt.label}</span>
          <span className="sm:hidden">{opt.short}</span>
        </button>
      ))}
    </div>
  );
}
