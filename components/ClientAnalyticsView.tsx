'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Globe, Phone, DollarSign, Users, Loader2, Building2, ChevronDown, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import io, { Socket } from 'socket.io-client';

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

const MONTH_NAMES: Record<number, string> = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April',
  5: 'May', 6: 'June', 7: 'July', 8: 'August',
  9: 'September', 10: 'October', 11: 'November', 12: 'December',
};

export default function ClientAnalyticsView({ refreshTrigger }: { refreshTrigger?: number }) {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';
  const [analytics, setAnalytics] = useState<WeeklyAnalytics[]>([]);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const clinicIdRef = useRef<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    try {
      socketRef.current = io({ 
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Listen for analytics updates broadcast from server
      socketRef.current.on('weekly_analytics_updated', (data: any) => {
        console.log('[Client Analytics] Received analytics update event:', data);
        // Refetch data for the active clinic if it matches the update
        if (clinicIdRef.current && (!data.clinicId || data.clinicId === clinicIdRef.current)) {
          fetchAnalytics(clinicIdRef.current);
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    } catch (err) {
      console.error('[Client Analytics] Socket.io error:', err);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      clinicIdRef.current = selectedClinic;
      fetchAnalytics(selectedClinic);
    }
  }, [selectedClinic, refreshTrigger]);

  // Auto-refresh polling mechanism (every 60 seconds)
  // This replaces Socket.io for Vercel serverless deployment
  useEffect(() => {
    if (!selectedClinic) return;

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling interval (60 seconds)
    pollingIntervalRef.current = setInterval(() => {
      if (clinicIdRef.current) {
        console.log('[Client Analytics] Auto-refreshing data...');
        fetchAnalytics(clinicIdRef.current, true); // Silent refresh
      }
    }, 60000); // 60 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedClinic]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      // Get user's assigned clinics
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        // Fetch user's clinic assignments
        const assignRes = await fetch(`/api/client/clinics?userId=${user.id}`);
        if (assignRes.ok) {
          const data = await assignRes.json();
          setClinics(data.clinics || []);
          // If multiple clinics, default to "All Locations", otherwise select the single clinic
          if (data.clinics && data.clinics.length > 1) {
            setSelectedClinic('all');
          } else if (data.clinics && data.clinics.length === 1) {
            setSelectedClinic(data.clinics[0].id);
          } else {
            setLoading(false);
          }
        } else {
          console.error('Failed to fetch clinic assignments:', assignRes.status);
          setLoading(false);
        }
      } else {
        console.error('Failed to fetch user:', res.status);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
      setLoading(false);
    }
  };

  const fetchAnalytics = async (clinicId: string, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      console.log('[Client Analytics] Fetching analytics for clinic:', clinicId);
      let allAnalytics: WeeklyAnalytics[] = [];

      // If fetching all locations, fetch analytics for all assigned clinics
      if (clinicId === 'all') {
        for (const clinic of clinics) {
          const res = await fetch(`/api/analytics/weekly?clinicId=${clinic.id}`);
          if (res.ok) {
            const data = await res.json();
            allAnalytics = [...allAnalytics, ...(data.analytics || [])];
          }
        }
      } else {
        const res = await fetch(`/api/analytics/weekly?clinicId=${clinicId}`);
        if (res.ok) {
          const data = await res.json();
          allAnalytics = data.analytics || [];
        } else {
          console.error('[Client Analytics] Failed to fetch analytics:', res.status);
        }
      }

      console.log('[Client Analytics] Loaded', allAnalytics.length, 'analytics records');
      setAnalytics(allAnalytics);
      setLastUpdated(new Date());

      // Auto-fill filter with last week's data
      if (allAnalytics.length > 0) {
        // Find the latest week
        const sortedByDate = [...allAnalytics].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          if (a.month !== b.month) return b.month - a.month;
          return b.weekNumber - a.weekNumber;
        });
        
        const latestWeek = sortedByDate[0];
        setSelectedYear(String(latestWeek.year));
        setSelectedMonth(String(latestWeek.month));
        setSelectedWeek(String(latestWeek.weekNumber));
        setDateFilter(latestWeek.weekLabel);
      } else {
        setSelectedYear('all');
        setSelectedMonth('all');
        setSelectedWeek('all');
        setDateFilter('');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && clinics.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <Building2 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Clinics Assigned</h3>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Please contact your admin to assign clinics to your account.
        </p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Analytics Data Yet</h3>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Your admin will add weekly analytics data for your clinic soon.
        </p>
      </div>
    );
  }

  const availableYears = Array.from(new Set(analytics.map((entry) => entry.year))).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(
    analytics
      .filter((entry) => selectedYear === 'all' || entry.year === Number(selectedYear))
      .map((entry) => entry.month)
  )).sort((a, b) => a - b);
  const availableWeeks = Array.from(new Set(
    analytics
      .filter((entry) => (selectedYear === 'all' || entry.year === Number(selectedYear)))
      .filter((entry) => (selectedMonth === 'all' || entry.month === Number(selectedMonth)))
      .map((entry) => entry.weekNumber)
  )).sort((a, b) => a - b);

  const filteredAnalytics = analytics.filter((entry) => {
    const yearMatch = selectedYear === 'all' || entry.year === Number(selectedYear);
    const monthMatch = selectedMonth === 'all' || entry.month === Number(selectedMonth);
    const weekMatch = selectedWeek === 'all' || entry.weekNumber === Number(selectedWeek);
    const dateMatch = dateFilter.trim().length === 0 || entry.weekLabel.toLowerCase().includes(dateFilter.toLowerCase());

    return yearMatch && monthMatch && weekMatch && dateMatch;
  });

  if (filteredAnalytics.length === 0) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth('all');
                setSelectedWeek('all');
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek('all');
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="all">All Months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>{MONTH_NAMES[month] || `Month ${month}`}</option>
              ))}
            </select>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="all">All Weeks</option>
              {availableWeeks.map((week) => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date/week label"
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedWeek('all');
                setDateFilter('');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Data For Selected Filters</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Try changing year, month, week, or date label filters to see analytics results.
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = filteredAnalytics.reduce((acc, week) => ({
    traffic: acc.traffic + week.totalTraffic,
    blogs: acc.blogs + week.blogsPublished,
    calls: acc.calls + week.callsRequested,
    metaSpend: acc.metaSpend + week.metaAdSpend,
    googleSpend: acc.googleSpend + week.googleTotalCost,
    socialViews: acc.socialViews + week.socialViews,
  }), { traffic: 0, blogs: 0, calls: 0, metaSpend: 0, googleSpend: 0, socialViews: 0 });

  // Determine spend label based on filter level
  const getSpendLabel = () => {
    if (selectedWeek !== 'all') {
      return 'Weekly Spend';
    } else if (selectedMonth !== 'all') {
      return 'Monthly Spend';
    } else if (selectedYear !== 'all') {
      return 'Yearly Spend';
    } else {
      return 'Total Spend';
    }
  };

  const spendLabel = getSpendLabel();

  // Prepare chart data
  const trafficData = filteredAnalytics.map(w => ({
    week: w.weekLabel,
    traffic: w.totalTraffic,
    ranking: w.avgRanking,
  }));

  const gmbData = filteredAnalytics.map(w => ({
    week: w.weekLabel,
    calls: w.callsRequested,
    visits: w.websiteVisits,
    directions: w.directionClicks,
  }));

  const adsData = filteredAnalytics.map(w => ({
    week: w.weekLabel,
    metaSpend: w.metaAdSpend,
    googleSpend: w.googleTotalCost,
    metaConversions: w.metaConversions,
    googleConversions: w.googleConversions,
  }));

  const socialData = filteredAnalytics.map(w => ({
    week: w.weekLabel,
    posts: w.socialPosts,
    views: w.socialViews,
    patients: w.patientCount,
  }));

  // Pie chart data - Traffic Sources
  const directTrafficValue = filteredAnalytics.reduce((sum, w) => {
    const directTraffic = w.totalTraffic - w.websiteVisits;
    return sum + (directTraffic > 0 ? directTraffic : 0);
  }, 0);

  const trafficSourcesData = [
    { name: 'GMB Visits', value: filteredAnalytics.reduce((sum, w) => sum + w.websiteVisits, 0) },
    { name: 'Direct Traffic', value: directTrafficValue },
    { name: 'Directions', value: filteredAnalytics.reduce((sum, w) => sum + w.directionClicks, 0) },
  ].filter(item => item.value > 0);

  const currentClinic = clinics.find(c => c.id === selectedClinic);
  const isAllLocations = selectedClinic === 'all';

  return (
    <div className="space-y-6">
      {/* Clinic Selector */}
      {clinics.length > 1 && (
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
            <span>{isAllLocations ? 'All Locations' : currentClinic?.name || 'Select Clinic'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showDropdown && (
            <div className={`absolute top-full mt-2 w-full rounded-xl border shadow-xl z-10 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={() => {
                  setSelectedClinic('all');
                  setShowDropdown(false);
                }}
                className={`w-full px-6 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 first:rounded-t-xl ${
                  isAllLocations ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold' : ''
                }`}
              >
                All Locations
              </button>
              {clinics.map(clinic => (
                <button
                  key={clinic.id}
                  onClick={() => {
                    setSelectedClinic(clinic.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 last:rounded-b-xl ${
                    selectedClinic === clinic.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold' : ''
                  }`}
                >
                  {clinic.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Report Filters */}
      <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Report Filters</h3>
            {lastUpdated && (
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (selectedClinic && !isRefreshing) {
                  setIsRefreshing(true);
                  await fetchAnalytics(selectedClinic);
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedWeek('all');
                setDateFilter('');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400"
            >
              Reset Filters
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth('all');
              setSelectedWeek('all');
            }}
            className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedWeek('all');
            }}
            className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="all">All Months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>{MONTH_NAMES[month] || `Month ${month}`}</option>
            ))}
          </select>

          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="all">All Weeks</option>
            {availableWeeks.map((week) => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>

          <input
            type="text"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Date/Week label (e.g. Nov Week 1)"
            className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Globe className="h-8 w-8 text-blue-500" />
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.traffic.toLocaleString()}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Traffic</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Phone className="h-8 w-8 text-emerald-500" />
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.calls}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>GMB Calls</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="h-8 w-8 text-indigo-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              Ad Spend
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${(totals.metaSpend + totals.googleSpend).toFixed(0)}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{spendLabel}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-8 w-8 text-purple-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              Content
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.blogs}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Blogs Published</p>
        </motion.div>
      </div>

      {/* Traffic & SEO Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📈 SEO Performance Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
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
            <Line type="monotone" dataKey="traffic" name="Traffic" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            <Line type="monotone" dataKey="ranking" name="Avg Ranking" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* GMB Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📍 Google My Business Activity
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
        {/* Ad Spend Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            💰 Ad Spend & Conversions
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
              <Area type="monotone" dataKey="metaSpend" name="Meta Spend" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="googleSpend" name="Google Spend" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
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
            🎯 Traffic Source Distribution
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
          📱 Social Media Performance
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
