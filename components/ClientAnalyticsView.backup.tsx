'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Globe, Phone, DollarSign, Users, Loader2, Building2, ChevronDown, ArrowUpRight, RefreshCw, Filter, RotateCcw, Clock, ChevronUp, MousePointerClick, Target } from 'lucide-react';
import SearchConsolePerformanceChart from './SearchConsolePerformanceChart';
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
  metaCPC: number;
  metaConversions: number;
  metaCostPerConversion: number;
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

/**
 * Convert year, month, weekNumber to the Monday of that ISO week.
 */
function getWeekMonday(year: number, month: number, weekNumber: number): Date {
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay() || 7; // Mon=1 … Sun=7
  const firstMonday = new Date(year, 0, 1 + (1 - jan1Day + 7) % 7);
  const weekStart = new Date(firstMonday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  return weekStart;
}

function formatStandardWeekLabel(year: number, weekNumber: number): string {
  const weekMonday = getWeekMonday(year, 1, weekNumber);
  const weekSunday = new Date(weekMonday);
  weekSunday.setDate(weekMonday.getDate() + 6);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return `${year} Week ${weekNumber} (${formatDate(weekMonday)}–${formatDate(weekSunday)})`;
}

interface ClientAnalyticsViewProps {
  refreshTrigger?: number;
  isAdmin?: boolean;
  onLoadingStateChange?: (loading: boolean) => void;
}

export default function ClientAnalyticsView({ refreshTrigger, isAdmin = false, onLoadingStateChange }: ClientAnalyticsViewProps) {
  const { theme, language, t } = useSitePreferences();
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();
  const [analytics, setAnalytics] = useState<WeeklyAnalytics[]>([]);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isSearchingDateRange, setIsSearchingDateRange] = useState(false);
  const [hasDateRangeFilter, setHasDateRangeFilter] = useState(false);
  const [scSummary, setScSummary] = useState<{ clicks: number; impressions: number; avgPosition: number } | null>(null);
  const locale = language === 'es' ? 'es-US' : 'en-US';
  const socketRef = useRef<Socket | null>(null);
  const clinicIdRef = useRef<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onLoadingStateChange?.(loading);
  }, [loading, onLoadingStateChange]);

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

  const resetToCurrentYearWeeks = () => {
    setSelectedYear(String(currentYear));
    setSelectedMonth('all');
    setSelectedWeek('all');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
    setHasDateRangeFilter(false);
  };

  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setIsSearchingDateRange(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include end date fully

      // Find weeks that fall within this range
      const matchingWeeks = analytics.filter(entry => {
        const weekMonday = getWeekMonday(entry.year, entry.month, entry.weekNumber);
        return weekMonday >= start && weekMonday < end;
      });

      if (matchingWeeks.length === 0) {
        alert('No data found for the selected date range');
        setIsSearchingDateRange(false);
        return;
      }

      // Keep standard filter defaults while date-range mode is active
      setSelectedYear(String(currentYear));
      setSelectedMonth('all');
      setSelectedWeek('all');
      setDateFilter('');
      setHasDateRangeFilter(true);
      // We'll filter using the hasDateRangeFilter flag
    } finally {
      setIsSearchingDateRange(false);
    }
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Admin mode: fetch all clinics directly
        const res = await fetch('/api/admin/clinics');
        if (res.ok) {
          const data = await res.json();
          setClinics(data.clinics || []);
          // Default to "All Clinics" in admin mode
          setSelectedClinic('all');
        } else {
          console.error('Failed to fetch clinics (admin):', res.status);
          setLoading(false);
        }
        return;
      }

      // Client mode: get user's assigned clinics
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
        if (isAdmin) {
          // Admin mode: use the bulk endpoint for all clinics
          console.log('[Client Analytics] Admin mode: fetching all clinics from /api/analytics/weekly/all');
          const res = await fetch('/api/analytics/weekly/all');
          if (res.ok) {
            const data = await res.json();
            allAnalytics = data.analytics || [];
            console.log('[Client Analytics] Admin: loaded', allAnalytics.length, 'records from all clinics');
          } else {
            console.error('[Client Analytics] Admin: failed to fetch all clinics:', res.status, res.statusText);
          }
        } else {
          // Client mode: loop through assigned clinics
          console.log('[Client Analytics] Client mode: fetching data for', clinics.length, 'assigned clinics');
          const responses = await Promise.all(
            clinics.map(async (clinic) => {
              const res = await fetch(`/api/analytics/weekly?clinicId=${clinic.id}`);
              if (!res.ok) {
                console.error('[Client Analytics] Failed to fetch for clinic', clinic.name, ':', res.status);
                return [] as WeeklyAnalytics[];
              }
              const data = await res.json();
              const clinicData = data.analytics || [];
              console.log('[Client Analytics] Loaded', clinicData.length, 'records for', clinic.name);
              return clinicData as WeeklyAnalytics[];
            })
          );
          allAnalytics = responses.flat();
          console.log('[Client Analytics] Client: total loaded', allAnalytics.length, 'records from', clinics.length, 'clinics');
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

      // Default report scope: current year, all weeks (Mon–Sun week buckets)
      if (!silent && !hasDateRangeFilter) {
        setSelectedYear(String(currentYear));
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

  const availableYears = Array.from(new Set([currentYear, ...analytics.map((entry) => entry.year)])).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(
    analytics
      .filter((entry) => entry.year === Number(selectedYear))
      .map((entry) => entry.month)
  )).sort((a, b) => a - b);
  const availableWeeks = Array.from(new Set(
    analytics
      .filter((entry) => (entry.year === Number(selectedYear)))
      .filter((entry) => (selectedMonth === 'all' || entry.month === Number(selectedMonth)))
      .map((entry) => entry.weekNumber)
  )).sort((a, b) => a - b);

  // Compute Search Console date range from current filter state
  const scClientDateRange = useMemo(() => {
    if (hasDateRangeFilter && startDate && endDate) {
      return { startDate, endDate };
    }
    const yr = Number(selectedYear);
    if (selectedMonth !== 'all') {
      const mo = Number(selectedMonth);
      if (selectedWeek !== 'all') {
        // Specific week: compute monday of that ISO week
        const jan4 = new Date(yr, 0, 4);
        const dayOfWeek = jan4.getDay() || 7;
        const isoWeek1Monday = new Date(jan4);
        isoWeek1Monday.setDate(jan4.getDate() - dayOfWeek + 1);
        const weekMonday = new Date(isoWeek1Monday);
        weekMonday.setDate(isoWeek1Monday.getDate() + (Number(selectedWeek) - 1) * 7);
        const weekSunday = new Date(weekMonday);
        weekSunday.setDate(weekMonday.getDate() + 6);
        return { startDate: weekMonday.toISOString().slice(0, 10), endDate: weekSunday.toISOString().slice(0, 10) };
      }
      // Specific month
      const s = new Date(yr, mo - 1, 1);
      const e = new Date(yr, mo, 0);
      return { startDate: s.toISOString().slice(0, 10), endDate: e.toISOString().slice(0, 10) };
    }
    // Full year
    return { startDate: `${yr}-01-01`, endDate: `${yr}-12-31` };
  }, [selectedYear, selectedMonth, selectedWeek, hasDateRangeFilter, startDate, endDate]);

  // Fetch Search Console summary for the selected date range (auto-synced data)
  useEffect(() => {
    const fetchScSummary = async () => {
      if (!selectedClinic) { setScSummary(null); return; }
      try {
        const params = new URLSearchParams({
          clinicId: selectedClinic,
          startDate: scClientDateRange.startDate,
          endDate: scClientDateRange.endDate,
        });
        const res = await fetch(`/api/client/analytics-data?${params.toString()}`);
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
  }, [scClientDateRange, selectedClinic]);

  const filteredAnalytics = analytics.filter((entry) => {
    // Date range filter takes precedence
    if (hasDateRangeFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      const weekMonday = getWeekMonday(entry.year, entry.month, entry.weekNumber);
      return weekMonday >= start && weekMonday < end;
    }

    const yearMatch = entry.year === Number(selectedYear);
    const monthMatch = selectedMonth === 'all' || entry.month === Number(selectedMonth);
    const weekMatch = selectedWeek === 'all' || entry.weekNumber === Number(selectedWeek);
    const standardWeekLabel = formatStandardWeekLabel(entry.year, entry.weekNumber);
    const dateMatch = dateFilter.trim().length === 0 || standardWeekLabel.toLowerCase().includes(dateFilter.toLowerCase());

    return yearMatch && monthMatch && weekMatch && dateMatch;
  });

  if (filteredAnalytics.length === 0) {
    return (
      <div className="space-y-6">
        {/* Report Header (no-data state) */}
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Filter className="h-4 w-4" /> {t('Edit Report Filters')}
              </h3>
              {lastUpdated && (
                <span className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {t('Last updated:')} {lastUpdated.toLocaleTimeString(locale)}
                </span>
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
                {t('Refresh')}
              </button>
              <button
                onClick={resetToCurrentYearWeeks}
                className="px-4 py-2 rounded-lg bg-slate-500 text-white font-bold hover:bg-slate-400 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t('Reset Filters')}
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
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek('all');
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
            >
              <option value="all">{t('All Months')}</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>{t(MONTH_NAMES[month] || `Month ${month}`)}</option>
              ))}
            </select>
            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
            >
              <option value="all">{t('Current Year Weeks')}</option>
              {availableWeeks.map((week) => (
                <option key={week} value={week}>{formatStandardWeekLabel(Number(selectedYear), week)}</option>
              ))}
            </select>
            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder={t('Filter by date/week label')}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>

          {/* Custom Date Range Section (no-data state) */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              📅 {t('Custom Date Range')}
              {showDateRange ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDateRange && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('Start Date')}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
                      style={isDark ? { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', colorScheme: 'dark' } : {}}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('End Date')}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
                      style={isDark ? { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', colorScheme: 'dark' } : {}}
                    />
                  </div>
                </div>
                <button
                  onClick={handleDateRangeSearch}
                  disabled={isSearchingDateRange || !startDate || !endDate}
                  className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearchingDateRange ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('Searching...')}
                    </>
                  ) : (
                    `🔍 ${t('Search Date Range')}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('No Data For Selected Filters')}</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            {t('Try changing year, month, week, or date label filters to see analytics results.')}
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals with safeguards for null/undefined values
  const totals = filteredAnalytics.reduce((acc, week) => ({
    blogs: acc.blogs + (week.blogsPublished || 0),
    calls: acc.calls + (week.callsRequested || 0),
    metaSpend: acc.metaSpend + (Number(week.metaAdSpend) || 0),
    googleSpend: acc.googleSpend + (Number(week.googleTotalCost) || 0),
    socialViews: acc.socialViews + (week.socialViews || 0),
  }), { blogs: 0, calls: 0, metaSpend: 0, googleSpend: 0, socialViews: 0 });

  console.log('[Client Analytics] Filtered', filteredAnalytics.length, 'weeks, Totals:', totals);

  // Determine period prefix based on active filter level or date range
  const periodPrefix = hasDateRangeFilter
    ? 'Period'
    : selectedWeek !== 'all'
      ? 'Weekly'
      : selectedMonth !== 'all'
        ? 'Monthly'
        : 'Yearly';

  const totalAdSpend = totals.metaSpend + totals.googleSpend;

  // Prepare chart data
  const trafficData = undefined; // Removed — traffic & ranking now sourced from Search Console

  const gmbData = filteredAnalytics.map(w => ({
    week: formatStandardWeekLabel(w.year, w.weekNumber),
    calls: w.callsRequested,
    visits: w.websiteVisits,
    directions: w.directionClicks,
  }));

  const adsData = filteredAnalytics.map(w => ({
    week: formatStandardWeekLabel(w.year, w.weekNumber),
    metaSpend: w.metaAdSpend,
    googleSpend: w.googleTotalCost,
    metaConversions: w.metaConversions,
    googleConversions: w.googleConversions,
  }));

  const socialData = filteredAnalytics.map(w => ({
    week: formatStandardWeekLabel(w.year, w.weekNumber),
    posts: w.socialPosts,
    views: w.socialViews,
    patients: w.patientCount,
  }));

  // Pie chart data - Traffic Sources
  const trafficSourcesData = [
    { name: t('GMB Visits'), value: filteredAnalytics.reduce((sum, w) => sum + w.websiteVisits, 0) },
    { name: t('Directions'), value: filteredAnalytics.reduce((sum, w) => sum + w.directionClicks, 0) },
  ].filter(item => item.value > 0);

  const currentClinic = clinics.find(c => c.id === selectedClinic);
  const isAllLocations = selectedClinic === 'all';

  return (
    <div className="space-y-6">
      {/* Clinic Selector */}
      {(isAdmin || clinics.length > 1) && (
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
            <span>{isAllLocations ? (isAdmin ? t('All Clinics') : t('All Locations')) : currentClinic?.name || t('Select Clinic')}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showDropdown && (
            <div
              className={`absolute top-full mt-2 w-full rounded-xl border shadow-xl z-50 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
              style={isDark ? { backgroundColor: '#0f172a', color: '#f1f5f9' } : {}}
            >
              <button
                onClick={() => {
                  setSelectedClinic('all');
                  setShowDropdown(false);
                }}
                className={`w-full px-6 py-3 text-left first:rounded-t-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 ${
                  isAllLocations ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-400 font-bold' : ''
                }`}
                style={isDark ? { color: isAllLocations ? '#34d399' : '#f1f5f9' } : {}}
              >
                {isAdmin ? t('All Clinics') : t('All Locations')}
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
      )}

      {/* Report Header */}
      <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              {t('Edit Report Filters')}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {lastUpdated && (
              <span className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Clock className="h-3.5 w-3.5" />
                {t('Last updated:')} {lastUpdated.toLocaleTimeString(locale)}
              </span>
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
              {t('Refresh')}
            </button>
            <button
              onClick={resetToCurrentYearWeeks}
              className="px-4 py-2 rounded-lg bg-slate-500 text-white font-bold hover:bg-slate-400 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('Reset Filters')}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Controls */}
        {showFilters && (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth('all');
                setSelectedWeek('all');
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark] [&>option]:bg-slate-900 [&>option]:text-slate-100 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100`}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek('all');
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark] [&>option]:bg-slate-900 [&>option]:text-slate-100 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100`}
            >
              <option value="all">{t('All Months')}</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>{t(MONTH_NAMES[month] || `Month ${month}`)}</option>
              ))}
            </select>

            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setHasDateRangeFilter(false);
              }}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark] [&>option]:bg-slate-900 [&>option]:text-slate-100 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100`}
            >
              <option value="all">{t('Current Year Weeks')}</option>
              {availableWeeks.map((week) => (
                <option key={week} value={week}>{formatStandardWeekLabel(Number(selectedYear), week)}</option>
              ))}
            </select>

            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder={t('Date/Week label (e.g. Nov Week 1)')}
              className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>

          {/* Custom Date Range Section */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              📅 {t('Custom Date Range')}
              {showDateRange ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDateRange && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('Start Date')}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
                      style={isDark ? { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', colorScheme: 'dark' } : {}}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('End Date')}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} dark:[color-scheme:dark]`}
                      style={isDark ? { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', colorScheme: 'dark' } : {}}
                    />
                  </div>
                </div>
                <button
                  onClick={handleDateRangeSearch}
                  disabled={isSearchingDateRange || !startDate || !endDate}
                  className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearchingDateRange ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('Searching...')}
                    </>
                  ) : (
                    `🔍 ${t('Search Date Range')}`
                  )}
                </button>
              </div>
            )}
          </div>
        </>)}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <MousePointerClick className="h-8 w-8 text-blue-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              {t('Search Console')}
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{scSummary ? scSummary.clicks.toLocaleString() : '—'}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('Organic Clicks')}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Auto-synced from Google Search Console')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <Target className="h-8 w-8 text-purple-500" />
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              {t('Search Console')}
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{scSummary ? scSummary.avgPosition : '—'}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('Avg Position')}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Lower is better')}</p>
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
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(periodPrefix)} {t('GMB Calls')}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Calls tracked from your Google Business Profile.')}</p>
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
              {t('Ad Spend')}
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalAdSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(periodPrefix)} {t('Ad Spend')}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Combined Meta and Google spend for selected filters.')}</p>
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
              {t('Content')}
            </span>
          </div>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totals.blogs}</h3>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(periodPrefix)} {t('Blogs Published')}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('Published blog posts in the selected period.')}</p>
        </motion.div>
      </div>

      {/* Search Console Performance */}
      <SearchConsolePerformanceChart
        clinicId={selectedClinic}
        mode="client"
        isDark={isDark}
        startDate={scClientDateRange.startDate}
        endDate={scClientDateRange.endDate}
      />

      {/* GMB Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📍 {t('Google My Business Activity')}
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
            <Bar dataKey="calls" name={t('Calls')} fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="visits" name={t('Website Visits')} fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="directions" name={t('Directions')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
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
            💰 {t('Ad Spend & Conversions')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={adsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="week" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis yAxisId="left" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="metaSpend" name={t('Meta Spend')} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area yAxisId="left" type="monotone" dataKey="googleSpend" name={t('Google Spend')} stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area yAxisId="right" type="monotone" dataKey="metaConversions" name={t('Meta Conversions')} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              <Area yAxisId="right" type="monotone" dataKey="googleConversions" name={t('Google Conversions')} stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
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
            🎯 {t('Traffic Source Distribution')}
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
          📱 {t('Social Media Performance')}
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
            <Area type="monotone" dataKey="views" name={t('Views')} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
