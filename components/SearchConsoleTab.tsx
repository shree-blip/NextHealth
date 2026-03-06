'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Search, Globe, RefreshCw, Loader2,
  ArrowUpRight, ArrowDownRight, Target, BarChart3, MousePointerClick,
} from 'lucide-react';

interface SCRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topQueries?: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages?: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

type Period = '7d' | '30d' | '90d' | '365d';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last year' },
];

interface SearchConsoleTabProps {
  clinicId: string;
  isDark?: boolean;
}

export default function SearchConsoleTab({ clinicId, isDark = false }: SearchConsoleTabProps) {
  const [data, setData] = useState<SCRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30d');
  const [searchConsoleSite, setSearchConsoleSite] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const days = parseInt(period);
      const res = await fetch(`/api/client/analytics-data?clinicId=${clinicId}&days=${days}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.searchConsoleData || []);
      setSearchConsoleSite(json.searchConsoleSite);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Empty / Loading / Error states ─────────────────────

  if (!searchConsoleSite && !loading) {
    return (
      <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Globe className="h-8 w-8 text-purple-400" />
        </div>
        <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Search Console Not Connected</p>
        <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Your administrator hasn&apos;t connected a Search Console site for this clinic yet. Data will appear here automatically once configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading Search Console data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <p className={`text-sm font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Failed to load Search Console data</p>
        <p className={`text-xs mb-4 ${isDark ? 'text-red-400/70' : 'text-red-500'}`}>{error}</p>
        <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold hover:bg-red-200 transition-colors">
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
          <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Search Console Data Yet</p>
          <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No Search Console data has been synced for this period. Data is synced automatically — check back soon.
          </p>
        </div>
      </div>
    );
  }

  // ─── Compute summaries ──────────────────────────────────

  const totals = data.reduce(
    (acc, d) => ({
      clicks: acc.clicks + d.clicks,
      impressions: acc.impressions + d.impressions,
    }),
    { clicks: 0, impressions: 0 },
  );

  const avgCtr = totals.impressions ? totals.clicks / totals.impressions : 0;
  const avgPosition = data.reduce((s, d) => s + d.avgPosition, 0) / data.length;

  // Find the latest row that has topQueries/topPages
  const latestWithQueries = [...data].reverse().find(d => d.topQueries && (d.topQueries as any[]).length > 0);
  const topQueries: any[] = (latestWithQueries?.topQueries as any[]) || [];
  const latestWithPages = [...data].reverse().find(d => d.topPages && (d.topPages as any[]).length > 0);
  const topPages: any[] = (latestWithPages?.topPages as any[]) || [];

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data.map(d => ({
    ...d,
    label: formatDate(d.date),
    ctrPct: Math.round(d.ctr * 10000) / 100,
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
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Search Console</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {searchConsoleSite ? `${searchConsoleSite}` : 'Google Search Console performance data'}
          </p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} isDark={isDark} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Clicks" value={totals.clicks.toLocaleString()} icon={<MousePointerClick className="h-5 w-5 text-emerald-500" />} isDark={isDark} />
        <KPI label="Total Impressions" value={totals.impressions.toLocaleString()} icon={<Search className="h-5 w-5 text-blue-500" />} isDark={isDark} />
        <KPI label="Avg CTR" value={`${(avgCtr * 100).toFixed(2)}%`} icon={<Target className="h-5 w-5 text-amber-500" />} isDark={isDark} />
        <KPI label="Avg Position" value={avgPosition.toFixed(1)} icon={<Search className="h-5 w-5 text-purple-500" />} isDark={isDark} />
      </div>

      {/* Clicks & Impressions chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <h3 className={headingClass}>
          <Search className="h-5 w-5 text-purple-500" />
          Clicks & Impressions
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
            <YAxis yAxisId="left" stroke={isDark ? '#94a3b8' : '#64748b'} />
            <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#94a3b8' : '#64748b'} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Avg Position line chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
        <h3 className={headingClass}>
          <Target className="h-5 w-5 text-amber-500" />
          Average Position (lower is better)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="label" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
            <YAxis reversed stroke={isDark ? '#94a3b8' : '#64748b'} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="avgPosition" name="Avg Position" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top queries */}
      {topQueries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
          <h3 className={headingClass}>
            <Target className="h-5 w-5 text-red-500" />
            Top Search Queries
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
                {topQueries.slice(0, 20).map((q: any, i: number) => (
                  <tr key={i} className={`${isDark ? 'border-b border-slate-700/50 hover:bg-slate-700/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition`}>
                    <td className={`py-2 px-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className={`py-2 px-2 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.query}</td>
                    <td className="py-2 px-2 text-right text-emerald-500 font-semibold">{q.clicks}</td>
                    <td className={`py-2 px-2 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{q.impressions?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-blue-500">{((q.ctr || 0) * 100).toFixed(1)}%</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        q.position <= 3 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        q.position <= 10 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        q.position <= 20 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {q.position <= 10 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {(q.position || 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Top pages */}
      {topPages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={cardClass}>
          <h3 className={headingClass}>
            <BarChart3 className="h-5 w-5 text-indigo-500" />
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
                {topPages.slice(0, 15).map((p: any, i: number) => {
                  let displayUrl = p.page;
                  try { displayUrl = new URL(p.page).pathname; } catch { /* keep full */ }
                  return (
                    <tr key={i} className={`${isDark ? 'border-b border-slate-700/50 hover:bg-slate-700/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition`}>
                      <td className={`py-2 px-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                      <td className={`py-2 px-2 font-medium truncate max-w-xs ${isDark ? 'text-white' : 'text-slate-900'}`} title={p.page}>{displayUrl}</td>
                      <td className="py-2 px-2 text-right text-emerald-500 font-semibold">{p.clicks}</td>
                      <td className={`py-2 px-2 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.impressions?.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right text-blue-500">{((p.ctr || 0) * 100).toFixed(1)}%</td>
                      <td className={`py-2 px-2 text-right font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{(p.position || 0).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
