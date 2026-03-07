'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Globe, MousePointerClick, Search, Target, RefreshCw,
} from 'lucide-react';
import GoogleDataProgressLoader from './GoogleDataProgressLoader';

interface SCRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
}

interface SearchConsolePerformanceChartProps {
  /** Clinic ID — pass 'all' or empty string for all clinics aggregate. */
  clinicId: string;
  /** 'admin' uses /api/admin/gmb/analytics-data, 'client' uses /api/client/analytics-data */
  mode: 'admin' | 'client';
  isDark?: boolean;
  /** Number of days to fetch (default 30). Used when startDate/endDate are not provided. */
  days?: number;
  /** Optional start date (YYYY-MM-DD). Overrides `days`. */
  startDate?: string;
  /** Optional end date (YYYY-MM-DD). Overrides `days`. */
  endDate?: string;
  /** Optional title override */
  title?: string;
}

export default function SearchConsolePerformanceChart({
  clinicId,
  mode,
  isDark = false,
  days = 30,
  startDate,
  endDate,
  title,
}: SearchConsolePerformanceChartProps) {
  const [data, setData] = useState<SCRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // clinicId: for admin mode, 'all' or '' means aggregate all clinics (don't send param)
      if (clinicId && clinicId !== 'all') {
        params.set('clinicId', clinicId);
      }

      // Date range takes precedence over days
      if (startDate && endDate) {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      } else {
        params.set('days', String(days));
      }

      const baseUrl = mode === 'admin'
        ? '/api/admin/gmb/analytics-data'
        : '/api/client/analytics-data';

      // For client mode, clinicId is always required
      if (mode === 'client' && (!clinicId || clinicId === 'all')) {
        setData([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${baseUrl}?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to fetch');

      setData(json.searchConsoleData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId, mode, days, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const glassCard = `rounded-3xl p-6 border backdrop-blur-sm shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`;
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    padding: '12px 16px',
  };

  // Show progress loader when loading
  if (loading) {
    return (
      <div className="space-y-4">
        <GoogleDataProgressLoader isLoading={true} isDark={isDark} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl border p-6 text-center ${isDark ? 'border-red-800/50 bg-red-950/20' : 'border-red-200 bg-red-50'}`}
      >
        <p className={`text-sm font-bold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Failed to load Organic Google Traffic data</p>
        <p className={`text-xs mb-4 ${isDark ? 'text-red-400/60' : 'text-red-500/80'}`}>{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </motion.div>
    );
  }

  // No data
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={glassCard + ' text-center py-10'}
      >
        <Globe className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Organic Google Traffic Data</p>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          No Organic Google Traffic data found for the selected filters. Connect a site or change the date range.
        </p>
      </motion.div>
    );
  }

  // Summaries
  const totals = data.reduce(
    (acc, d) => ({ clicks: acc.clicks + d.clicks, impressions: acc.impressions + d.impressions }),
    { clicks: 0, impressions: 0 },
  );
  const avgCtr = totals.impressions ? totals.clicks / totals.impressions : 0;
  const avgPosition = data.reduce((s, d) => s + d.avgPosition, 0) / data.length;

  const chartData = data.map(d => ({
    ...d,
    label: formatDate(d.date),
    ctrPct: Math.round(d.ctr * 10000) / 100,
  }));

  const kpis = [
    { label: 'Avg Position', value: avgPosition.toFixed(1), sub: 'lower is better', icon: <Target className="h-5 w-5" />, color: 'purple' },
    { label: 'Total Clicks', value: totals.clicks.toLocaleString(), sub: '', icon: <MousePointerClick className="h-5 w-5" />, color: 'emerald' },
    { label: 'Impressions', value: totals.impressions.toLocaleString(), sub: '', icon: <Search className="h-5 w-5" />, color: 'blue' },
  ];

  const iconColor: Record<string, string> = { emerald: 'text-emerald-500', blue: 'text-blue-500', purple: 'text-purple-500' };
  const iconBg: Record<string, string> = { emerald: 'bg-emerald-500/10', blue: 'bg-blue-500/10', purple: 'bg-purple-500/10' };
  const gradBg: Record<string, string> = { emerald: 'from-emerald-500/10 to-emerald-500/5', blue: 'from-blue-500/10 to-blue-500/5', purple: 'from-purple-500/10 to-purple-500/5' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-5"
    >
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Globe className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title || '🔍 Organic Google Traffic Performance'}
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Average Position, Clicks & Impressions from Organic Google Traffic
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm group hover:shadow-lg transition-all ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white/80 border-slate-200/60'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradBg[kpi.color]} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBg[kpi.color]} mb-3`}>
                <span className={iconColor[kpi.color]}>{kpi.icon}</span>
              </div>
              <p className={`text-2xl font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
              <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
              {kpi.sub && (
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.sub}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clicks & Impressions Bar Chart */}
      <div className={glassCard}>
        <h4 className={`text-[15px] font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />
          </div>
          Clicks & Impressions
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
            <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Position Line Chart */}
      <div className={glassCard}>
        <h4 className={`text-[15px] font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Target className="h-3.5 w-3.5 text-amber-500" />
          </div>
          Average Position
          <span className={`text-xs font-normal ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(lower is better)</span>
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
            <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis reversed stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="avgPosition"
              name="Avg Position"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
