'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, Globe, RefreshCw, Loader2,
  Eye, Zap, BarChart3,
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

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last year' },
];

interface GA4AnalyticsTabProps {
  clinicId: string;
  isDark?: boolean;
}

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

  // ─── Empty / Loading / Error states ─────────────────────

  if (!ga4PropertyId && !loading) {
    return (
      <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <BarChart3 className="h-8 w-8 text-orange-400" />
        </div>
        <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>GA4 Not Connected</p>
        <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Your administrator hasn&apos;t connected a Google Analytics property for this clinic yet. Data will appear here automatically once configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading GA4 analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <p className={`text-sm font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Failed to load GA4 data</p>
        <p className={`text-xs mb-4 ${isDark ? 'text-red-400/70' : 'text-red-500'}`}>{error}</p>
        <button onClick={() => fetchData()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold hover:bg-red-200 transition-colors">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <PeriodSelector period={period} onChange={setPeriod} isDark={isDark} />
        <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No GA4 Data Yet</p>
          <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No analytics data has been synced for this period. Data is synced automatically — check back soon.
          </p>
        </div>
      </div>
    );
  }

  // ─── Compute summaries ──────────────────────────────────

  const totals = data.reduce(
    (acc, d) => ({
      activeUsers: acc.activeUsers + d.activeUsers,
      newUsers: acc.newUsers + d.newUsers,
      sessions: acc.sessions + d.sessions,
      pageViews: acc.pageViews + d.pageViews,
      conversions: acc.conversions + d.conversions,
    }),
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

  const chartData = data.map(d => ({
    ...d,
    label: formatDate(d.date),
    bounceRate: Math.round(d.bounceRate * 100) / 100,
    engagementRate: Math.round(d.engagementRate * 100) / 100,
  }));

  const cardClass = `rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`;
  const headingClass = `text-lg font-bold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    borderRadius: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>GA4 Analytics</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Google Analytics data synced from your property
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={syncing}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Refresh'}
          </button>
          <PeriodSelector period={period} onChange={setPeriod} isDark={isDark} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI label="Active Users" value={totals.activeUsers.toLocaleString()} icon={<Users className="h-5 w-5 text-emerald-500" />} isDark={isDark} />
        <KPI label="New Users" value={totals.newUsers.toLocaleString()} icon={<Users className="h-5 w-5 text-blue-500" />} isDark={isDark} />
        <KPI label="Sessions" value={totals.sessions.toLocaleString()} icon={<TrendingUp className="h-5 w-5 text-violet-500" />} isDark={isDark} />
        <KPI label="Page Views" value={totals.pageViews.toLocaleString()} icon={<Eye className="h-5 w-5 text-amber-500" />} isDark={isDark} />
        <KPI label="Avg Bounce" value={`${(avgBounce * 100).toFixed(1)}%`} icon={<Zap className="h-5 w-5 text-red-500" />} isDark={isDark} />
        <KPI label="Avg Engagement" value={`${(avgEngagement * 100).toFixed(1)}%`} icon={<Zap className="h-5 w-5 text-emerald-500" />} isDark={isDark} />
      </div>

      {/* Users & Sessions line chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <h3 className={headingClass}>
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Users & Sessions
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 3 }} />
            <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 3 }} />
            <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Engagement & Traffic Sources side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
          <h3 className={headingClass}>
            <Zap className="h-5 w-5 text-amber-500" />
            Engagement Rate
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="engagementRate" name="Engagement" fill="#10b98133" stroke="#10b981" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <p className={`text-center text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Average: {(avgEngagement * 100).toFixed(1)}% · Avg session: {Math.round(avgSessionDuration)}s
          </p>
        </motion.div>

        {trafficSources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cardClass}>
            <h3 className={headingClass}>
              <Globe className="h-5 w-5 text-blue-500" />
              Traffic Sources
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {trafficSources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Conversions bar */}
      {totals.conversions > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
          <h3 className={headingClass}>
            <TrendingUp className="h-5 w-5 text-violet-500" />
            Conversions
          </h3>
          <p className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.conversions.toLocaleString()}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total conversions in selected period</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function PeriodSelector({ period, onChange, isDark }: { period: Period; onChange: (p: Period) => void; isDark: boolean }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            period === opt.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function KPI({ label, value, icon, isDark }: { label: string; value: string; icon: React.ReactNode; isDark: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
      <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
