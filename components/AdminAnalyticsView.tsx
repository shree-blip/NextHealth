'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Globe, Phone, DollarSign, Users, Loader2, Building2, ChevronDown, ArrowUpRight, Database, MousePointerClick, Target } from 'lucide-react';
import SearchConsolePerformanceChart from './SearchConsolePerformanceChart';

interface WeeklyAnalytics {
  id: string;
  clinicId: string;
  weekLabel: string;
  year: number;
  month: number;
  weekNumber: number;
  blogsPublished: number;
  avgRanking: number;
  totalTraffic: number;
  callsRequested: number;
  websiteVisits: number;
  directionClicks: number;
  metaImpressions: number;
  metaClicks: number;
  metaCTR: number;
  metaConversions: number;
  metaAdSpend: number;
  googleImpressions: number;
  googleClicks: number;
  googleCTR: number;
  googleCPC: number;
  googleConversions: number;
  googleCVR: number;
  googleCostPerConversion: number;
  googleTotalCost: number;
  socialPosts: number;
  socialViews: number;
  patientCount: number;
  digitalConversion: number;
  conversionRate: number;
  dailyPatientAvg: number;
}

interface ClinicInfo {
  id: string;
  name: string;
  type: string;
  location: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type FilterPreset = 'last_week' | 'current_month' | 'last_month' | 'compare_last_week' | 'compare_last_month';

function getMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Sequential week number matching generateWeeksForYear() in analytics.tsx
// Counts from the first Monday of/on Jan 1, same as the DB-stored weekNumber.
function getSequentialWeekNumber(date: Date): number {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const firstMonday = getMonday(jan1);
  const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}

interface AdminAnalyticsViewProps {
  isDark: boolean;
  refreshTrigger?: number;
}

export default function AdminAnalyticsView({ isDark, refreshTrigger }: AdminAnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<WeeklyAnalytics[]>([]);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('last_week');
  const [scSummary, setScSummary] = useState<{ clicks: number; impressions: number; avgPosition: number } | null>(null);
  const [gmbDbData, setGmbDbData] = useState<any[]>([]); // GBP data from database
  const [gmbSummary, setGmbSummary] = useState<{ views: number; phoneCalls: number; websiteClicks: number } | null>(null); // GBP summary

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedClinic);
  }, [selectedClinic, refreshTrigger]);

  const fetchClinics = async () => {
    try {
      const res = await fetch('/api/admin/clinics');
      if (res.ok) {
        const data = await res.json();
        setClinics(data.clinics || []);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
    }
  };

  const fetchAnalytics = async (clinicId: string) => {
    setLoading(true);
    try {
      if (clinicId === 'all') {
        // Fetch all analytics across all clinics
        const res = await fetch('/api/analytics/weekly/all');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics || []);
        }
      } else {
        const res = await fetch(`/api/analytics/weekly?clinicId=${clinicId}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: All hooks must be called unconditionally before any early returns
  const filteredAnalytics = useMemo(() => {
    const now = new Date();
    const thisMonday = getMonday(now);
    const lastWeekStart = addDays(thisMonday, -7);
    const weekBeforeStart = addDays(thisMonday, -14);

    const currentMonthYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthBeforeDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastWeek = {
      year: lastWeekStart.getFullYear(),
      month: lastWeekStart.getMonth() + 1,
      weekNumber: getSequentialWeekNumber(lastWeekStart),
    };

    const weekBefore = {
      year: weekBeforeStart.getFullYear(),
      month: weekBeforeStart.getMonth() + 1,
      weekNumber: getSequentialWeekNumber(weekBeforeStart),
    };

    const sortByDate = (items: WeeklyAnalytics[]) =>
      [...items].sort((a, b) => (a.year - b.year) || (a.month - b.month) || (a.weekNumber - b.weekNumber));

    switch (filterPreset) {
      case 'current_month':
        return sortByDate(analytics.filter((w) => w.year === currentMonthYear && w.month === currentMonth));
      case 'last_month':
        return sortByDate(analytics.filter((w) => w.year === lastMonthDate.getFullYear() && w.month === (lastMonthDate.getMonth() + 1)));
      case 'compare_last_week':
        return sortByDate(analytics.filter((w) =>
          (w.year === lastWeek.year && w.month === lastWeek.month && w.weekNumber === lastWeek.weekNumber) ||
          (w.year === weekBefore.year && w.month === weekBefore.month && w.weekNumber === weekBefore.weekNumber)
        ));
      case 'compare_last_month':
        return sortByDate(analytics.filter((w) =>
          (w.year === lastMonthDate.getFullYear() && w.month === (lastMonthDate.getMonth() + 1)) ||
          (w.year === monthBeforeDate.getFullYear() && w.month === (monthBeforeDate.getMonth() + 1))
        ));
      case 'last_week':
      default:
        return sortByDate(analytics.filter((w) => w.year === lastWeek.year && w.month === lastWeek.month && w.weekNumber === lastWeek.weekNumber));
    }
  }, [analytics, filterPreset]);

  // Aggregate data by week for current filter
  const weeklyAggregated = filteredAnalytics.reduce((acc, week) => {
    const key = `${week.year}-${week.month}-${week.weekNumber}-${week.weekLabel}`;
    if (!acc[key]) {
      acc[key] = {
        weekLabel: week.weekLabel,
        year: week.year,
        month: week.month,
        weekNumber: week.weekNumber,
        blogs: 0,
        calls: 0,
        visits: 0,
        directions: 0,
        metaSpend: 0,
        googleSpend: 0,
        metaConversions: 0,
        googleConversions: 0,
        socialPosts: 0,
        socialViews: 0,
        patients: 0,
        count: 0,
      };
    }

    acc[key].blogs += week.blogsPublished;
    acc[key].calls += week.callsRequested;
    acc[key].visits += week.websiteVisits;
    acc[key].directions += week.directionClicks;
    acc[key].metaSpend += week.metaAdSpend;
    acc[key].googleSpend += week.googleTotalCost;
    acc[key].metaConversions += week.metaConversions;
    acc[key].googleConversions += week.googleConversions;
    acc[key].socialPosts += week.socialPosts;
    acc[key].socialViews += week.socialViews;
    acc[key].patients += week.patientCount;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);

  // Compute date range from filter preset for Search Console chart
  const scDateRange = useMemo(() => {
    const now = new Date();
    const thisMonday = getMonday(now);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    switch (filterPreset) {
      case 'last_week': {
        const start = addDays(thisMonday, -7);
        const end = addDays(start, 6);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'current_month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: fmt(start), endDate: fmt(now) };
      }
      case 'last_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'compare_last_week': {
        const start = addDays(thisMonday, -14);
        const end = addDays(thisMonday, -1);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'compare_last_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      default: {
        const start = addDays(thisMonday, -7);
        const end = addDays(start, 6);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
    }
  }, [filterPreset]);

  // Fetch Search Console summary for the selected date range to populate summary cards
  useEffect(() => {
    const fetchScSummary = async () => {
      try {
        const params = new URLSearchParams({
          startDate: scDateRange.startDate,
          endDate: scDateRange.endDate,
        });
        if (selectedClinic && selectedClinic !== 'all') {
          params.set('clinicId', selectedClinic);
        }
        const res = await fetch(`/api/admin/gmb/analytics-data?${params.toString()}`);
        if (!res.ok) { setScSummary(null); return; }
        const json = await res.json();
        const scData: { clicks: number; impressions: number; avgPosition: number }[] = json.searchConsoleData || [];
        if (scData.length === 0) { setScSummary(null); return; }
        const totalClicks = scData.reduce((s, d) => s + d.clicks, 0);
        const totalImpressions = scData.reduce((s, d) => s + d.impressions, 0);
        const avgPos = scData.reduce((s, d) => s + d.avgPosition, 0) / scData.length;
        setScSummary({ clicks: totalClicks, impressions: totalImpressions, avgPosition: Number(avgPos.toFixed(1)) });
      } catch {
        setScSummary(null);
      }
    };
    fetchScSummary();
  }, [scDateRange, selectedClinic]);

  // Fetch GBP data from database for the selected date range
  useEffect(() => {
    const fetchGmbSummary = async () => {
      try {
        const params = new URLSearchParams({
          startDate: scDateRange.startDate,
          endDate: scDateRange.endDate,
        });
        if (selectedClinic && selectedClinic !== 'all') {
          params.set('clinicId', selectedClinic);
        }
        const res = await fetch(`/api/admin/gmb/analytics-data?${params.toString()}`);
        if (!res.ok) { setGmbDbData([]); setGmbSummary(null); return; }
        const json = await res.json();
        const gmbRows: any[] = json.gmbData || [];
        setGmbDbData(gmbRows);
        
        if (gmbRows.length === 0) { setGmbSummary(null); return; }
        const totalViews = gmbRows.reduce((s, d) => s + (d.views || 0), 0);
        const totalCalls = gmbRows.reduce((s, d) => s + (d.phoneCalls || 0), 0);
        const totalClicks = gmbRows.reduce((s, d) => s + (d.websiteClicks || 0), 0);
        setGmbSummary({ views: totalViews, phoneCalls: totalCalls, websiteClicks: totalClicks });
      } catch {
        setGmbDbData([]);
        setGmbSummary(null);
      }
    };
    fetchGmbSummary();
  }, [scDateRange, selectedClinic]);

  // Conditional render states
  if (loading && clinics.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <Database className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Analytics Data Yet</h3>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Add weekly analytics data for your clinics to see charts and insights here.
        </p>
      </div>
    );
  }

  if (filteredAnalytics.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterPreset('last_week')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            Last Week (Default)
          </button>
          <button
            onClick={() => setFilterPreset('current_month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            Current Month
          </button>
          <button
            onClick={() => setFilterPreset('last_month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            Last Month
          </button>
        </div>
        <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <Database className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Data For Selected Filter</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Try another filter or click Reset Filters to return to the default Last Week view.
          </p>
        </div>
      </div>
    );
  }

  const weeklyData = Object.values(weeklyAggregated)
    .map((w: any) => ({ ...w }))
    .sort((a: any, b: any) => (a.year - b.year) || (a.month - b.month) || (a.weekNumber - b.weekNumber));

  // Calculate totals from filtered dataset
  const totals = filteredAnalytics.reduce((acc, week) => ({
    blogs: acc.blogs + week.blogsPublished,
    calls: acc.calls + week.callsRequested,
    metaSpend: acc.metaSpend + week.metaAdSpend,
    googleSpend: acc.googleSpend + week.googleTotalCost,
  }), {
    blogs: 0,
    calls: 0,
    metaSpend: 0,
    googleSpend: 0,
  });

  // Use GBP data from database if available, otherwise fall back to manual analytics
  const gmbMetrics = gmbSummary || {
    phoneCalls: totals.calls,
    views: 0,
    websiteClicks: 0,
  };

  const trafficData = undefined; // Removed — traffic & ranking now sourced from Search Console

  const gmbData = weeklyData.map((w) => ({
    week: w.weekLabel,
    calls: w.calls,
    visits: w.visits,
    directions: w.directions,
  }));

  const adsData = weeklyData.map((w) => ({
    week: w.weekLabel,
    metaSpend: w.metaSpend,
    googleSpend: w.googleSpend,
    metaConversions: w.metaConversions,
    googleConversions: w.googleConversions,
  }));

  const socialData = weeklyData.map((w) => ({
    week: w.weekLabel,
    posts: w.socialPosts,
    views: w.socialViews,
    patients: w.patients,
  }));

  const trafficSourcesData = [
    { name: 'GMB Visits', value: weeklyData.reduce((sum, w) => sum + w.visits, 0) },
    { name: 'Directions', value: weeklyData.reduce((sum, w) => sum + w.directions, 0) },
  ].filter((item) => item.value > 0);

  const currentClinic = clinics.find(c => c.id === selectedClinic);

  return (
    <div className="space-y-6">
      {/* Clinic Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 border transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 hover:border-emerald-500'
              : 'bg-white border-slate-200 hover:border-emerald-500'
          }`}
        >
          <Building2 className="h-5 w-5 text-emerald-500" />
          <span>{selectedClinic === 'all' ? 'All Clinics' : currentClinic?.name || 'Select Clinic'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showDropdown && (
          <div
            className={`absolute top-full mt-2 w-full rounded-xl border shadow-xl z-10 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}
            style={isDark ? { backgroundColor: '#1e293b', color: '#f1f5f9' } : {}}
          >
            <button
              onClick={() => {
                setSelectedClinic('all');
                setShowDropdown(false);
              }}
              className={`w-full px-6 py-3 text-left first:rounded-t-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 ${
                selectedClinic === 'all' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-400 font-bold' : ''
              }`}
              style={isDark ? { color: selectedClinic === 'all' ? '#34d399' : '#f1f5f9' } : {}}
            >
              All Clinics
            </button>
            {clinics.map(clinic => (
              <button
                key={clinic.id}
                onClick={() => {
                  setSelectedClinic(clinic.id);
                  setShowDropdown(false);
                }}
                className={`w-full px-6 py-3 text-left last:rounded-b-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 ${
                  selectedClinic === clinic.id ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-400 font-bold' : ''
                }`}
                style={isDark ? { color: selectedClinic === clinic.id ? '#34d399' : '#f1f5f9' } : {}}
              >
                {clinic.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => setFilterPreset('last_week')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filterPreset === 'last_week'
                ? 'bg-emerald-500 text-black border-emerald-500'
                : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
            }`}
          >
            Last Week (Default)
          </button>
          <button
            onClick={() => setFilterPreset('current_month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filterPreset === 'current_month'
                ? 'bg-emerald-500 text-black border-emerald-500'
                : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setFilterPreset('last_month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filterPreset === 'last_month'
                ? 'bg-emerald-500 text-black border-emerald-500'
                : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setFilterPreset('compare_last_week')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filterPreset === 'compare_last_week'
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white border-blue-500'
                : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500'
            }`}
          >
            Compare Last Week vs Week Before
          </button>
          <button
            onClick={() => setFilterPreset('compare_last_month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filterPreset === 'compare_last_month'
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white border-blue-500'
                : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500'
            }`}
          >
            Compare Last Month vs Month Before
          </button>
        </div>
        <button
          onClick={() => setFilterPreset('last_week')}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400"
        >
          Reset Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-8 w-8 text-purple-500" />
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.blogs}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Blogs Published</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <MousePointerClick className="h-8 w-8 text-blue-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              Search Console
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{scSummary ? scSummary.clicks.toLocaleString() : '—'}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Organic Clicks</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Auto-synced from Google Search Console</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Target className="h-8 w-8 text-purple-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              Search Console
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{scSummary ? scSummary.avgPosition : '—'}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Avg Position</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Lower is better</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Phone className="h-8 w-8 text-emerald-500" />
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{gmbMetrics.phoneCalls}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>GBP Calls</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{gmbSummary ? 'Auto-synced from Google Business Profile' : 'From manual analytics'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Globe className="h-8 w-8 text-blue-400" />
            <ArrowUpRight className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{gmbMetrics.websiteClicks.toLocaleString()}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>GBP Website Clicks</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{gmbSummary ? 'Auto-synced from Google Business Profile' : 'No data available'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="h-8 w-8 text-indigo-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              Total
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${(totals.metaSpend + totals.googleSpend).toFixed(0)}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Investment</p>
        </motion.div>
      </div>

      {/* Search Console Performance */}
      <SearchConsolePerformanceChart
        clinicId={selectedClinic}
        mode="admin"
        isDark={isDark}
        startDate={scDateRange.startDate}
        endDate={scDateRange.endDate}
      />

      {/* GMB Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📍 GMB Activity - Weekly Calls, Website Visits & Direction Clicks
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gmbData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="week" stroke={isDark ? '#94a3b8' : '#64748b'} />
            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                borderRadius: '12px',
              }}
            />
            <Legend />
            <Bar dataKey="calls" name="Calls" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="visits" name="Website Visits" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="directions" name="Directions" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Ad Performance & Traffic Sources Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta vs Google Ad Spend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            💰 Meta vs Google - Weekly Ad Spend & Conversions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={adsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="week" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="metaSpend" name="Meta Spend ($)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="googleSpend" name="Google Spend ($)" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic Sources Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            🎯 Traffic Source Split - GMB, Direct & Directions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trafficSourcesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => {
                  const percent = entry.percent || 0;
                  return `${entry.name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {trafficSourcesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Social Media Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📱 Social Media Performance - Weekly Views, Patient Count & Posts
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={socialData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="week" stroke={isDark ? '#94a3b8' : '#64748b'} />
            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                borderRadius: '12px',
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="views" name="Views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="patients" name="Patient Count" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
            <Area type="monotone" dataKey="posts" name="Posts" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
