'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, Globe, Search, RefreshCw, Loader2,
  ArrowUpRight, ArrowDownRight, BarChart3, MousePointerClick,
  Eye, Target, Zap,
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

interface SCRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topQueries?: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages?: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

interface GoogleAnalyticsViewProps {
  clinicId: string;
  isDark?: boolean;
}

export default function GoogleAnalyticsView({ clinicId, isDark = false }: GoogleAnalyticsViewProps) {
  const [ga4Data, setGa4Data] = useState<GA4Row[]>([]);
  const [scData, setScData] = useState<SCRow[]>([]);
  const [ga4PropertyId, setGa4PropertyId] = useState<string | null>(null);
  const [searchConsoleSite, setSearchConsoleSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/gmb/analytics-data?clinicId=${clinicId}&days=30`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setGa4Data(json.ga4Data || []);
      setScData(json.searchConsoleData || []);
      setGa4PropertyId(json.ga4PropertyId);
      setSearchConsoleSite(json.searchConsoleSite);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/gmb/sync-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!ga4PropertyId && !searchConsoleSite) {
    return null; // no analytics sources configured
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-6 border text-center ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
        <p>Error loading analytics: {error}</p>
        <button onClick={fetchData} className="mt-2 underline">Retry</button>
      </div>
    );
  }

  // ─── Compute summary stats ──────────────────────────
  const ga4Totals = ga4Data.reduce(
    (acc, d) => ({
      activeUsers: acc.activeUsers + d.activeUsers,
      sessions: acc.sessions + d.sessions,
      pageViews: acc.pageViews + d.pageViews,
      conversions: acc.conversions + d.conversions,
    }),
    { activeUsers: 0, sessions: 0, pageViews: 0, conversions: 0 },
  );

  const avgBounce = ga4Data.length ? ga4Data.reduce((s, d) => s + d.bounceRate, 0) / ga4Data.length : 0;
  const avgEngagement = ga4Data.length ? ga4Data.reduce((s, d) => s + d.engagementRate, 0) / ga4Data.length : 0;

  const scTotals = scData.reduce(
    (acc, d) => ({
      clicks: acc.clicks + d.clicks,
      impressions: acc.impressions + d.impressions,
    }),
    { clicks: 0, impressions: 0 },
  );
  const avgCtr = scTotals.impressions ? scTotals.clicks / scTotals.impressions : 0;
  const avgPosition = scData.length ? scData.reduce((s, d) => s + d.avgPosition, 0) / scData.length : 0;

  // Traffic source pie data
  const trafficSources = [
    { name: 'Organic', value: ga4Data.reduce((s, d) => s + d.organicSessions, 0) },
    { name: 'Paid', value: ga4Data.reduce((s, d) => s + d.paidSessions, 0) },
    { name: 'Direct', value: ga4Data.reduce((s, d) => s + d.directSessions, 0) },
    { name: 'Referral', value: ga4Data.reduce((s, d) => s + d.referralSessions, 0) },
    { name: 'Social', value: ga4Data.reduce((s, d) => s + d.socialSessions, 0) },
  ].filter(s => s.value > 0);

  // Top queries from the latest SC row that has them
  const latestSCWithQueries = [...scData].reverse().find(d => d.topQueries && d.topQueries.length > 0);
  const topQueries = latestSCWithQueries?.topQueries || [];
  const latestSCWithPages = [...scData].reverse().find(d => d.topPages && d.topPages.length > 0);
  const topPages = latestSCWithPages?.topPages || [];

  // Format date for chart X axis
  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartGA4 = ga4Data.map(d => ({
    ...d,
    label: formatDate(d.date),
    bounceRate: Math.round(d.bounceRate * 100) / 100,
    engagementRate: Math.round(d.engagementRate * 100) / 100,
  }));

  const chartSC = scData.map(d => ({
    ...d,
    label: formatDate(d.date),
    ctrPct: Math.round(d.ctr * 10000) / 100,
  }));

  const cardClass = `rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`;
  const headingClass = `text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    borderRadius: '12px',
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📊 Google Analytics & Search Console
        </h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={<Users className="h-8 w-8 text-emerald-500" />} label="Active Users" value={ga4Totals.activeUsers.toLocaleString()} accent="emerald" isDark={isDark} />
        <KPICard icon={<Eye className="h-8 w-8 text-blue-500" />} label="Page Views" value={ga4Totals.pageViews.toLocaleString()} accent="blue" isDark={isDark} />
        <KPICard icon={<MousePointerClick className="h-8 w-8 text-amber-500" />} label="SC Clicks" value={scTotals.clicks.toLocaleString()} accent="amber" isDark={isDark} />
        <KPICard icon={<Search className="h-8 w-8 text-purple-500" />} label="Avg Position" value={avgPosition.toFixed(1)} accent="purple" isDark={isDark} />
      </div>

      {/* ═══ GA4 Users & Sessions Line Chart ═══ */}
      {ga4Data.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
          <h3 className={headingClass}>
            <TrendingUp className="inline h-5 w-5 mr-2 text-emerald-500" />
            Users & Sessions (GA4)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartGA4}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ═══ Engagement & Bounce Rate ═══ */}
      {ga4Data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
            <h3 className={headingClass}>
              <Zap className="inline h-5 w-5 mr-2 text-amber-500" />
              Engagement Rate
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartGA4}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="engagementRate" name="Engagement" fill="#10b98133" stroke="#10b981" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <p className={`text-center text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Avg: {(avgEngagement * 100).toFixed(1)}%
            </p>
          </motion.div>

          {/* Traffic Sources Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cardClass}>
            <h3 className={headingClass}>
              <Globe className="inline h-5 w-5 mr-2 text-blue-500" />
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
        </div>
      )}

      {/* ═══ Search Console Performance ═══ */}
      {scData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
          <h3 className={headingClass}>
            <Search className="inline h-5 w-5 mr-2 text-purple-500" />
            Search Console Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MiniStat label="Total Clicks" value={scTotals.clicks.toLocaleString()} isDark={isDark} />
            <MiniStat label="Total Impressions" value={scTotals.impressions.toLocaleString()} isDark={isDark} />
            <MiniStat label="Avg CTR" value={`${(avgCtr * 100).toFixed(2)}%`} isDark={isDark} />
            <MiniStat label="Avg Position" value={avgPosition.toFixed(1)} isDark={isDark} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartSC}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
              <YAxis yAxisId="left" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="avgPosition" name="Avg Position" stroke="#ef4444" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ═══ Top Search Queries (AI Ranking Data) ═══ */}
      {topQueries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={cardClass}>
          <h3 className={headingClass}>
            <Target className="inline h-5 w-5 mr-2 text-red-500" />
            Top Search Queries (AI Ranking)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-slate-400 border-b border-slate-700' : 'text-slate-500 border-b border-slate-200'}>
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Query</th>
                  <th className="text-right py-3 px-2">Clicks</th>
                  <th className="text-right py-3 px-2">Impressions</th>
                  <th className="text-right py-3 px-2">CTR</th>
                  <th className="text-right py-3 px-2">Position</th>
                </tr>
              </thead>
              <tbody>
                {topQueries.slice(0, 15).map((q, i) => (
                  <tr key={i} className={`${isDark ? 'border-b border-slate-700/50 hover:bg-slate-700/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition`}>
                    <td className={`py-2 px-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className={`py-2 px-2 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.query}</td>
                    <td className="py-2 px-2 text-right text-emerald-500 font-semibold">{q.clicks}</td>
                    <td className={`py-2 px-2 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{q.impressions.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-blue-500">{(q.ctr * 100).toFixed(1)}%</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        q.position <= 3 ? 'bg-emerald-100 text-emerald-700' :
                        q.position <= 10 ? 'bg-blue-100 text-blue-700' :
                        q.position <= 20 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.position <= 10 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {q.position.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ═══ Top Pages ═══ */}
      {topPages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cardClass}>
          <h3 className={headingClass}>
            <BarChart3 className="inline h-5 w-5 mr-2 text-indigo-500" />
            Top Landing Pages
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-slate-400 border-b border-slate-700' : 'text-slate-500 border-b border-slate-200'}>
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Page</th>
                  <th className="text-right py-3 px-2">Clicks</th>
                  <th className="text-right py-3 px-2">Impressions</th>
                  <th className="text-right py-3 px-2">CTR</th>
                  <th className="text-right py-3 px-2">Position</th>
                </tr>
              </thead>
              <tbody>
                {topPages.slice(0, 10).map((p, i) => {
                  // Show just the path portion
                  let displayUrl = p.page;
                  try { displayUrl = new URL(p.page).pathname; } catch { /* keep full */ }
                  return (
                    <tr key={i} className={`${isDark ? 'border-b border-slate-700/50 hover:bg-slate-700/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition`}>
                      <td className={`py-2 px-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                      <td className={`py-2 px-2 font-medium truncate max-w-xs ${isDark ? 'text-white' : 'text-slate-900'}`} title={p.page}>{displayUrl}</td>
                      <td className="py-2 px-2 text-right text-emerald-500 font-semibold">{p.clicks}</td>
                      <td className={`py-2 px-2 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.impressions.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right text-blue-500">{(p.ctr * 100).toFixed(1)}%</td>
                      <td className={`py-2 px-2 text-right font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.position.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {ga4Data.length === 0 && scData.length === 0 && (
        <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          <p className="text-lg font-semibold mb-2">No analytics data yet</p>
          <p className="text-sm">Click &quot;Sync Now&quot; to fetch the latest data from Google Analytics & Search Console.</p>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────── */

function KPICard({ icon, label, value, accent, isDark }: {
  icon: React.ReactNode; label: string; value: string; accent: string; isDark: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
    >
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          isDark ? `bg-${accent}-900/30 text-${accent}-400` : `bg-${accent}-100 text-${accent}-600`
        }`}>
          30d
        </span>
      </div>
      <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
    </motion.div>
  );
}

function MiniStat({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
