'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Globe, Phone, DollarSign, Users, Loader2, Building2, ChevronDown, ArrowUpRight, Database, MousePointerClick, Target, Eye, BarChart3, Search } from 'lucide-react';
import DashboardLoader from './DashboardLoader';
import SearchConsolePerformanceChart from './SearchConsolePerformanceChart';
import AnalyticsDateFilter, { type DateRange, type FilterPreset } from './AnalyticsDateFilter';

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
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const thisMonday = getMonday(now);
    const start = addDays(thisMonday, -7);
    const end = addDays(start, 6);
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
  });
  const [scSummary, setScSummary] = useState<{ clicks: number; impressions: number; avgPosition: number } | null>(null);
  const [gmbDbData, setGmbDbData] = useState<any[]>([]); // GBP data from database
  const [gmbSummary, setGmbSummary] = useState<{ views: number; phoneCalls: number; websiteClicks: number } | null>(null); // GBP summary

  // GA4 data from database
  const [ga4Data, setGa4Data] = useState<any[]>([]);
  const [ga4Summary, setGa4Summary] = useState<{ totalUsers: number; newUsers: number; totalSessions: number; totalPageViews: number; avgBounceRate: number; avgEngagement: number; totalConversions: number } | null>(null);
  const [trafficSources, setTrafficSources] = useState<{ name: string; value: number }[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; clicks: number; impressions: number; position: number }[]>([]);
  const [topQueries, setTopQueries] = useState<{ query: string; clicks: number; impressions: number; position: number }[]>([]);
  const [scDailyData, setScDailyData] = useState<any[]>([]);

  // Google Ads data from API
  const [googleAdsApiData, setGoogleAdsApiData] = useState<{ date: string; impressions: number; clicks: number; cost: number; conversions: number; ctr: number; avgCpc: number; costPerConversion: number }[]>([]);
  const [googleAdsSummary, setGoogleAdsSummary] = useState<{ totalSpend: number; totalClicks: number; totalImpressions: number; totalConversions: number; avgCpc: number } | null>(null);

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
      case 'year':
        return sortByDate(analytics.filter((w) => w.year === now.getFullYear()));
      case 'custom': {
        // Filter by date range — approximate using year/month
        const startD = new Date(dateRange.startDate + 'T00:00:00');
        const endD = new Date(dateRange.endDate + 'T00:00:00');
        return sortByDate(analytics.filter((w) => {
          // Check if the week falls within the custom range
          const wDate = new Date(w.year, w.month - 1, 1);
          const wEnd = new Date(w.year, w.month, 0);
          return wEnd >= startD && wDate <= endD;
        }));
      }
      case 'last_week':
      default:
        return sortByDate(analytics.filter((w) => w.year === lastWeek.year && w.month === lastWeek.month && w.weekNumber === lastWeek.weekNumber));
    }
  }, [analytics, filterPreset, dateRange]);

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

  // scDateRange is now driven by the AnalyticsDateFilter component
  const scDateRange = dateRange;

  // Callback for AnalyticsDateFilter
  const handleFilterChange = useCallback((range: DateRange, preset: FilterPreset) => {
    setDateRange(range);
    setFilterPreset(preset);
  }, []);

  // Fetch ALL Google data (GA4 + SC + GBP) from database for the selected date range
  useEffect(() => {
    const fetchGoogleData = async () => {
      try {
        const params = new URLSearchParams({
          startDate: scDateRange.startDate,
          endDate: scDateRange.endDate,
        });
        if (selectedClinic && selectedClinic !== 'all') {
          params.set('clinicId', selectedClinic);
        }
        const res = await fetch(`/api/admin/gmb/analytics-data?${params.toString()}`);
        if (!res.ok) { setGmbDbData([]); setGmbSummary(null); setGa4Data([]); setGa4Summary(null); setTrafficSources([]); setTopPages([]); setTopQueries([]); setScDailyData([]); setScSummary(null); return; }
        const json = await res.json();

        // GBP data
        const gmbRows: any[] = json.gmbData || [];
        setGmbDbData(gmbRows);
        if (gmbRows.length === 0) { setGmbSummary(null); }
        else {
          const totalViews = gmbRows.reduce((s: number, d: any) => s + (d.views || 0), 0);
          const totalCalls = gmbRows.reduce((s: number, d: any) => s + (d.phoneCalls || 0), 0);
          const totalClicks = gmbRows.reduce((s: number, d: any) => s + (d.websiteClicks || 0), 0);
          setGmbSummary({ views: totalViews, phoneCalls: totalCalls, websiteClicks: totalClicks });
        }

        // GA4 data
        const ga4Rows: any[] = json.ga4Data || [];
        setGa4Data(ga4Rows);
        if (ga4Rows.length > 0) {
          setGa4Summary({
            totalUsers: ga4Rows.reduce((s: number, d: any) => s + d.activeUsers, 0),
            newUsers: ga4Rows.reduce((s: number, d: any) => s + d.newUsers, 0),
            totalSessions: ga4Rows.reduce((s: number, d: any) => s + d.sessions, 0),
            totalPageViews: ga4Rows.reduce((s: number, d: any) => s + d.pageViews, 0),
            avgBounceRate: +(ga4Rows.reduce((s: number, d: any) => s + d.bounceRate, 0) / ga4Rows.length).toFixed(1),
            avgEngagement: +(ga4Rows.reduce((s: number, d: any) => s + d.engagementRate, 0) / ga4Rows.length).toFixed(1),
            totalConversions: ga4Rows.reduce((s: number, d: any) => s + d.conversions, 0),
          });
          const sources = [
            { name: 'Organic', value: ga4Rows.reduce((s: number, d: any) => s + d.organicSessions, 0) },
            { name: 'Direct', value: ga4Rows.reduce((s: number, d: any) => s + d.directSessions, 0) },
            { name: 'Paid', value: ga4Rows.reduce((s: number, d: any) => s + d.paidSessions, 0) },
            { name: 'Referral', value: ga4Rows.reduce((s: number, d: any) => s + d.referralSessions, 0) },
            { name: 'Social', value: ga4Rows.reduce((s: number, d: any) => s + d.socialSessions, 0) },
          ].filter(s => s.value > 0);
          setTrafficSources(sources);
        } else {
          setGa4Summary(null);
          setTrafficSources([]);
        }

        // Search Console daily + top pages/queries
        const scRows: any[] = json.searchConsoleData || [];
        setScDailyData(scRows);
        // Compute SC summary for cards
        if (scRows.length > 0) {
          const totalClicks = scRows.reduce((s: number, d: any) => s + d.clicks, 0);
          const totalImpressions = scRows.reduce((s: number, d: any) => s + d.impressions, 0);
          const avgPos = scRows.reduce((s: number, d: any) => s + d.avgPosition, 0) / scRows.length;
          setScSummary({ clicks: totalClicks, impressions: totalImpressions, avgPosition: Number(avgPos.toFixed(1)) });
        } else {
          setScSummary(null);
        }
        // Merge top pages
        const pagesMap = new Map<string, { page: string; clicks: number; impressions: number; position: number }>();
        for (const row of scRows) {
          if (Array.isArray(row.topPages)) {
            for (const p of row.topPages) {
              const existing = pagesMap.get(p.page);
              if (existing) { existing.clicks += p.clicks; existing.impressions += p.impressions; }
              else pagesMap.set(p.page, { page: p.page, clicks: p.clicks, impressions: p.impressions, position: p.position });
            }
          }
        }
        setTopPages([...pagesMap.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 10));
        // Merge top queries
        const queriesMap = new Map<string, { query: string; clicks: number; impressions: number; position: number }>();
        for (const row of scRows) {
          if (Array.isArray(row.topQueries)) {
            for (const q of row.topQueries) {
              const existing = queriesMap.get(q.query);
              if (existing) { existing.clicks += q.clicks; existing.impressions += q.impressions; }
              else queriesMap.set(q.query, { query: q.query, clicks: q.clicks, impressions: q.impressions, position: q.position });
            }
          }
        }
        setTopQueries([...queriesMap.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 10));

        // Google Ads API data
        const adsRows: any[] = json.googleAdsData || [];
        setGoogleAdsApiData(adsRows);
        if (adsRows.length > 0) {
          const totalSpend = adsRows.reduce((s: number, d: any) => s + (d.cost || 0), 0);
          const totalClicks = adsRows.reduce((s: number, d: any) => s + (d.clicks || 0), 0);
          const totalImpressions = adsRows.reduce((s: number, d: any) => s + (d.impressions || 0), 0);
          const totalConversions = adsRows.reduce((s: number, d: any) => s + (d.conversions || 0), 0);
          setGoogleAdsSummary({
            totalSpend,
            totalClicks,
            totalImpressions,
            totalConversions,
            avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
          });
        } else {
          setGoogleAdsSummary(null);
        }
      } catch {
        setGmbDbData([]);
        setGmbSummary(null);
        setGa4Data([]);
        setGa4Summary(null);
        setTrafficSources([]);
        setTopPages([]);
        setTopQueries([]);
        setScDailyData([]);
        setScSummary(null);
        setGoogleAdsApiData([]);
        setGoogleAdsSummary(null);
      }
    };
    fetchGoogleData();
  }, [scDateRange, selectedClinic]);

  // Conditional render states
  if (loading && clinics.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <DashboardLoader variant="page" label="Loading analytics..." className="text-emerald-500" />
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
        <AnalyticsDateFilter
          isDark={isDark}
          onChange={handleFilterChange}
          initialPreset={filterPreset}
        />
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

  // Total Ad Spend: Meta (from WeeklyAnalytics) + Google Ads API data
  const googleAdsApiSpend = googleAdsSummary?.totalSpend || 0;
  const totalAdSpend = totals.metaSpend + totals.googleSpend + googleAdsApiSpend;

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
      <AnalyticsDateFilter
        isDark={isDark}
        onChange={handleFilterChange}
        initialPreset="last_week"
      />

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
              Organic Google Traffic
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{scSummary ? scSummary.clicks.toLocaleString() : '—'}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Organic Clicks</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Auto-synced from Organic Google Traffic</p>
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
              Organic Google Traffic
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
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalAdSpend.toFixed(0)}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Ad Spend</p>
          {totalAdSpend > 0 && (
            <div className={`mt-1 text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {totals.metaSpend > 0 && <span>Meta: ${totals.metaSpend.toFixed(0)}</span>}
              {totals.metaSpend > 0 && (totals.googleSpend + googleAdsApiSpend) > 0 && <span> · </span>}
              {(totals.googleSpend + googleAdsApiSpend) > 0 && <span>Google: ${(totals.googleSpend + googleAdsApiSpend).toFixed(0)}</span>}
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══════════════════ GOOGLE ANALYTICS (GA4) ═══════════════════ */}
      {ga4Summary && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Analytics (GA4)</h2>
          </div>

          {/* GA4 Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { label: 'Active Users', value: ga4Summary.totalUsers.toLocaleString(), icon: <Users className="h-5 w-5 text-emerald-400" /> },
              { label: 'New Users', value: ga4Summary.newUsers.toLocaleString(), icon: <Users className="h-5 w-5 text-cyan-400" /> },
              { label: 'Sessions', value: ga4Summary.totalSessions.toLocaleString(), icon: <Globe className="h-5 w-5 text-blue-400" /> },
              { label: 'Page Views', value: ga4Summary.totalPageViews.toLocaleString(), icon: <Eye className="h-5 w-5 text-purple-400" /> },
              { label: 'Bounce Rate', value: `${ga4Summary.avgBounceRate}%`, icon: <TrendingUp className="h-5 w-5 text-red-400" /> },
              { label: 'Engagement', value: `${ga4Summary.avgEngagement}%`, icon: <TrendingUp className="h-5 w-5 text-green-400" /> },
              { label: 'Conversions', value: ga4Summary.totalConversions.toLocaleString(), icon: <MousePointerClick className="h-5 w-5 text-amber-400" /> },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">{card.icon}</div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* GA4 Users / Sessions / Page Views Chart */}
          {ga4Data.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>📈 Website Traffic (Daily)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ga4Data.map((d: any) => ({ date: d.date?.slice?.(5) || d.date, users: d.activeUsers, sessions: d.sessions, pageViews: d.pageViews }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, borderRadius: '12px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Active Users" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Traffic Sources Pie + Table */}
          {trafficSources.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>🎯 Traffic Sources</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                      label={(e) => `${e.name}: ${((e.percent ?? 0) * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {trafficSources.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>📊 Session Breakdown</h3>
                <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className={`text-left py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Source</th>
                      <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sessions</th>
                      <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficSources.map((src, i) => {
                      const total = trafficSources.reduce((s, t) => s + t.value, 0);
                      return (
                        <tr key={src.name} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                          <td className="py-2 px-3 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {src.name}
                          </td>
                          <td className="text-right py-2 px-3">{src.value.toLocaleString()}</td>
                          <td className="text-right py-2 px-3">{total > 0 ? ((src.value / total) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════ TOP PAGES & QUERIES ═══════════════════ */}
      {(topPages.length > 0 || topQueries.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topPages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 border overflow-x-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>📄 Top Visited Pages</h3>
              <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`text-left py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Page</th>
                    <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Clicks</th>
                    <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Impressions</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p, i) => {
                    let path = p.page;
                    try { path = new URL(p.page).pathname; } catch {}
                    return (
                      <tr key={i} className={`border-b ${isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className="py-2 px-3 truncate max-w-[200px]" title={p.page}>{path}</td>
                        <td className="text-right py-2 px-3 font-semibold text-emerald-400">{p.clicks.toLocaleString()}</td>
                        <td className="text-right py-2 px-3">{p.impressions.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
          {topQueries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 border overflow-x-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>🔎 Top Search Queries</h3>
              <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`text-left py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Query</th>
                    <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Clicks</th>
                    <th className={`text-right py-2 px-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((q, i) => (
                    <tr key={i} className={`border-b ${isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className="py-2 px-3">{q.query}</td>
                      <td className="text-right py-2 px-3 font-semibold text-blue-400">{q.clicks.toLocaleString()}</td>
                      <td className="text-right py-2 px-3">{q.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      )}

      {/* Organic Google Traffic Performance */}
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

      {/* ═══════════════════ GOOGLE ADS (API) ═══════════════════ */}
      {googleAdsSummary && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Ads</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>API</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Ad Spend', value: `$${googleAdsSummary.totalSpend.toFixed(2)}`, color: 'text-green-400' },
              { label: 'Clicks', value: googleAdsSummary.totalClicks.toLocaleString(), color: 'text-blue-400' },
              { label: 'Impressions', value: googleAdsSummary.totalImpressions.toLocaleString(), color: 'text-purple-400' },
              { label: 'Conversions', value: googleAdsSummary.totalConversions.toLocaleString(), color: 'text-amber-400' },
              { label: 'Avg CPC', value: `$${googleAdsSummary.avgCpc.toFixed(2)}`, color: 'text-indigo-400' },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
              </div>
            ))}
          </div>
          {googleAdsApiData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Ads — Daily Spend & Clicks</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={googleAdsApiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '12px',
                    }}
                    formatter={(value: any, name: any) => [name === 'Spend' ? `$${Number(value || 0).toFixed(2)}` : Number(value || 0).toLocaleString(), name]}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="cost" name="Spend" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}

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
