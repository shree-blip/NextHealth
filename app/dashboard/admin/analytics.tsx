'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Check, AlertCircle, Edit2, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface WeekOption {
  key: string;
  year: number;
  month: number;
  weekNumber: number;
  weekLabel: string;
  start: Date;
  end: Date;
}

interface EditingRecord {
  id: string;
  year: number;
  month: number;
  weekNumber: number;
  weekLabel: string;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const METRIC_FIELDS = [
  'blogsPublished',
  'avgRanking',
  'totalTraffic',
  'callsRequested',
  'websiteVisits',
  'directionClicks',
  'metaImpressions',
  'metaClicks',
  'metaCTR',
  'metaConversions',
  'metaAdSpend',
  'googleImpressions',
  'googleClicks',
  'googleCTR',
  'googleCPC',
  'googleConversions',
  'googleCVR',
  'googleCostPerConversion',
  'googleTotalCost',
  'socialPosts',
  'socialViews',
  'patientCount',
  'digitalConversion',
  'conversionRate',
  'dailyPatientAvg',
] as const;

type MetricField = typeof METRIC_FIELDS[number];
type FormMetrics = Record<MetricField, string>;

function emptyMetrics(): FormMetrics {
  return METRIC_FIELDS.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as FormMetrics);
}

function startOfWeekMonday(date: Date): Date {
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

function formatShortDate(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function generateWeeksForYear(year: number): WeekOption[] {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const weeks: WeekOption[] = [];

  let cursor = startOfWeekMonday(jan1);
  let weekNumber = 1;

  while (cursor <= dec31) {
    const start = new Date(cursor);
    const end = addDays(start, 6);

    weeks.push({
      key: `${year}-${weekNumber}`,
      year,
      month: start.getMonth() + 1,
      weekNumber,
      weekLabel: `${year} Week ${weekNumber} (${formatShortDate(start)}–${formatShortDate(end)})`,
      start,
      end,
    });

    cursor = addDays(cursor, 7);
    weekNumber += 1;
  }

  return weeks;
}

function getDefaultTargetDate(today: Date): Date {
  const target = new Date(today);
  target.setHours(0, 0, 0, 0);
  if (target.getDay() === 1) {
    target.setDate(target.getDate() - 7);
  }
  return target;
}

function analyticsToFormMetrics(record: any): FormMetrics {
  const next = emptyMetrics();
  for (const field of METRIC_FIELDS) {
    const value = record?.[field];
    next[field] = value === null || value === undefined ? '' : String(value);
  }
  return next;
}

function MetricsInputGrid({ metrics, onChange }: { metrics: FormMetrics; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-bold mb-2">Blogs Published</label><input type="number" name="blogsPublished" value={metrics.blogsPublished} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Avg Ranking</label><input type="number" name="avgRanking" value={metrics.avgRanking} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Total Traffic</label><input type="number" name="totalTraffic" value={metrics.totalTraffic} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Calls Requested</label><input type="number" name="callsRequested" value={metrics.callsRequested} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Website Visits</label><input type="number" name="websiteVisits" value={metrics.websiteVisits} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Direction Clicks</label><input type="number" name="directionClicks" value={metrics.directionClicks} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Meta Impressions</label><input type="number" name="metaImpressions" value={metrics.metaImpressions} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Meta Clicks</label><input type="number" name="metaClicks" value={metrics.metaClicks} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Meta CTR %</label><input type="number" name="metaCTR" value={metrics.metaCTR} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Meta Conversions</label><input type="number" name="metaConversions" value={metrics.metaConversions} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Meta Ad Spend ($)</label><input type="number" name="metaAdSpend" value={metrics.metaAdSpend} onChange={onChange} min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google Impressions</label><input type="number" name="googleImpressions" value={metrics.googleImpressions} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google Clicks</label><input type="number" name="googleClicks" value={metrics.googleClicks} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google CTR %</label><input type="number" name="googleCTR" value={metrics.googleCTR} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google CPC ($)</label><input type="number" name="googleCPC" value={metrics.googleCPC} onChange={onChange} min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google Conversions</label><input type="number" name="googleConversions" value={metrics.googleConversions} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google CVR %</label><input type="number" name="googleCVR" value={metrics.googleCVR} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google Cost Per Conv ($)</label><input type="number" name="googleCostPerConversion" value={metrics.googleCostPerConversion} onChange={onChange} min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Google Total Cost ($)</label><input type="number" name="googleTotalCost" value={metrics.googleTotalCost} onChange={onChange} min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Social Posts</label><input type="number" name="socialPosts" value={metrics.socialPosts} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Social Views</label><input type="number" name="socialViews" value={metrics.socialViews} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Patient Count</label><input type="number" name="patientCount" value={metrics.patientCount} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Digital Conversion</label><input type="number" name="digitalConversion" value={metrics.digitalConversion} onChange={onChange} min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Conversion Rate %</label><input type="number" name="conversionRate" value={metrics.conversionRate} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
      <div><label className="block text-sm font-bold mb-2">Daily Patient Avg</label><input type="number" name="dailyPatientAvg" value={metrics.dailyPatientAvg} onChange={onChange} min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200" /></div>
    </div>
  );
}

export default function AnalyticsForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [existingData, setExistingData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<FormMetrics>(emptyMetrics());
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EditingRecord | null>(null);
  const [editMetrics, setEditMetrics] = useState<FormMetrics>(emptyMetrics());
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const defaultTargetDate = useMemo(() => getDefaultTargetDate(new Date()), []);
  const [selectedYear, setSelectedYear] = useState<number>(defaultTargetDate.getFullYear());
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('');
  const [isLoadingWeekData, setIsLoadingWeekData] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const yearOptions = useMemo(() => {
    const nowYear = new Date().getFullYear();
    return [nowYear - 1, nowYear, nowYear + 1, nowYear + 2];
  }, []);

  const weeks = useMemo(() => generateWeeksForYear(selectedYear), [selectedYear]);
  const selectedWeek = useMemo(() => weeks.find((w) => w.key === selectedWeekKey) || null, [weeks, selectedWeekKey]);

  useEffect(() => {
    socketRef.current = io({ path: '/socket.io' });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch('/api/admin/clinics')
      .then((res) => res.json())
      .then((result) => {
        const loaded = result.clinics || [];
        setClinics(loaded);
        if (loaded.length > 0) {
          setSelectedClinicId((prev) => prev || loaded[0].id);
        }
      })
      .catch((err) => console.error('Failed to load clinics:', err));
  }, []);

  useEffect(() => {
    if (selectedWeekKey && weeks.some((w) => w.key === selectedWeekKey)) return;

    const target = defaultTargetDate;
    const targetWeek = weeks.find((week) => target >= week.start && target <= week.end);
    setSelectedWeekKey(targetWeek?.key || weeks[0]?.key || '');
  }, [weeks, selectedWeekKey, defaultTargetDate]);

  useEffect(() => {
    if (!selectedClinicId) {
      setExistingData([]);
      return;
    }

    fetch(`/api/analytics/weekly?clinicId=${selectedClinicId}`)
      .then((res) => res.json())
      .then((result) => setExistingData(result.analytics || []))
      .catch((err) => console.error('Failed to load analytics list:', err));
  }, [selectedClinicId]);

  useEffect(() => {
    if (!selectedClinicId || !selectedWeek) {
      setMetrics(emptyMetrics());
      return;
    }

    const controller = new AbortController();

    const loadWeek = async () => {
      setError('');
      setIsLoadingWeekData(true);
      try {
        const query = new URLSearchParams({
          clinicId: selectedClinicId,
          year: String(selectedWeek.year),
          month: String(selectedWeek.month),
          weekNumber: String(selectedWeek.weekNumber),
        }).toString();

        const res = await fetch(`/api/analytics/weekly?${query}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error('Failed to load weekly analytics data');
        }
        const payload = await res.json();
        const existing = payload.analytics?.[0] || null;
        setMetrics(existing ? analyticsToFormMetrics(existing) : emptyMetrics());
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Failed to load selected week analytics:', err);
          setError('Unable to load saved data for selected clinic/week');
        }
      } finally {
        setIsLoadingWeekData(false);
      }
    };

    loadWeek();

    return () => {
      controller.abort();
    };
  }, [selectedClinicId, selectedWeek]);

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as MetricField;
    setMetrics((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as MetricField;
    setEditMetrics((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    if (!selectedClinicId || !selectedWeek) {
      setError('Please select a clinic and a week');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        clinicId: selectedClinicId,
        year: selectedWeek.year,
        month: selectedWeek.month,
        weekNumber: selectedWeek.weekNumber,
        weekLabel: selectedWeek.weekLabel,
      };

      for (const field of METRIC_FIELDS) {
        const raw = metrics[field].trim();
        if (raw === '') continue;
        const numeric = Number(raw);
        if (!Number.isNaN(numeric)) {
          payload[field] = numeric;
        }
      }

      const res = await fetch('/api/analytics/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save analytics');
      }

      const result = await res.json();
      const saved = result.analytics;

      if (saved) {
        setMetrics(analyticsToFormMetrics(saved));
      }

      setSubmitted(true);

      const refreshRes = await fetch(`/api/analytics/weekly?clinicId=${selectedClinicId}`);
      const refreshData = await refreshRes.json();
      setExistingData(refreshData.analytics || []);

      socketRef.current?.emit('weekly_analytics_saved', {
        clinicId: selectedClinicId,
        year: selectedWeek.year,
        month: selectedWeek.month,
        weekNumber: selectedWeek.weekNumber,
      });

      setTimeout(() => setSubmitted(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Error saving analytics');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: any) => {
    setEditingRecord({
      id: item.id,
      year: item.year,
      month: item.month,
      weekNumber: item.weekNumber,
      weekLabel: item.weekLabel,
    });
    setEditMetrics(analyticsToFormMetrics(item));
    setEditError('');
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !selectedClinicId) return;

    setEditError('');
    setEditSuccess(false);
    setEditLoading(true);

    try {
      const payload: Record<string, any> = {
        clinicId: selectedClinicId,
        year: editingRecord.year,
        month: editingRecord.month,
        weekNumber: editingRecord.weekNumber,
        weekLabel: editingRecord.weekLabel,
      };

      for (const field of METRIC_FIELDS) {
        const raw = editMetrics[field].trim();
        if (raw === '') continue;
        const numeric = Number(raw);
        if (!Number.isNaN(numeric)) {
          payload[field] = numeric;
        }
      }

      const res = await fetch('/api/analytics/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save analytics');
      }

      setEditSuccess(true);

      const refreshRes = await fetch(`/api/analytics/weekly?clinicId=${selectedClinicId}`);
      const refreshData = await refreshRes.json();
      setExistingData(refreshData.analytics || []);

      socketRef.current?.emit('weekly_analytics_saved', {
        clinicId: selectedClinicId,
        year: editingRecord.year,
        month: editingRecord.month,
        weekNumber: editingRecord.weekNumber,
      });

      setTimeout(() => {
        setShowEditModal(false);
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || 'Error saving analytics');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Clean Single Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-3">Weekly Analytics Entry</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Select a clinic and a week (Monday to Sunday). The form will load saved data. You can save partial updates. Click Edit on any saved week to modify it.
        </p>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !editLoading && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingRecord.weekLabel}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {editError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl mb-4 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-semibold text-sm">{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-4 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-5 w-5 shrink-0" />
                  <span className="font-semibold text-sm">Saved successfully! Closes now...</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <MetricsInputGrid metrics={editMetrics} onChange={handleEditMetricChange} />

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={editLoading}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-bold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HISTORY SECTION - FIRST */}
      {existingData.length > 0 && selectedClinicId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 p-6"
        >
          <h2 className="text-2xl font-bold mb-4">📅 Week History</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click "Edit" to update any week. Changes sync instantly to client dashboards.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-3 font-bold">Week</th>
                  <th className="text-left py-3 px-3 font-bold">Traffic</th>
                  <th className="text-left py-3 px-3 font-bold">Blogs</th>
                  <th className="text-left py-3 px-3 font-bold">Calls</th>
                  <th className="text-left py-3 px-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {existingData.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <td className="py-3 px-3 font-semibold">{item.weekLabel}</td>
                    <td className="py-3 px-3">{item.totalTraffic || '–'}</td>
                    <td className="py-3 px-3">{item.blogsPublished || '–'}</td>
                    <td className="py-3 px-3">{item.callsRequested || '–'}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-md hover:bg-blue-400 transition-all inline-flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ENTRY FORM - SECOND */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300">
            <Check className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Analytics saved and synced to client dashboards.</span>
          </div>
        )}

        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <h3 className="text-lg font-bold mb-4">📍 Clinic & Week Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Clinic *</label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select Clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedWeekKey('');
                }}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Week (Mon–Sun)</label>
              <select
                value={selectedWeekKey}
                onChange={(e) => setSelectedWeekKey(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {weeks.map((week) => (
                  <option key={week.key} value={week.key}>{week.weekLabel}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            On Mondays, this selector defaults to last week so you can enter last week&apos;s numbers quickly.
          </p>
        </div>

        {isLoadingWeekData && (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading saved week data...
          </div>
        )}

        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <h3 className="text-lg font-bold mb-4">📝 Metrics</h3>
          <MetricsInputGrid metrics={metrics} onChange={handleMetricChange} />
        </div>

        <button
          type="submit"
          disabled={loading || isLoadingWeekData}
          className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Save Weekly Analytics
            </>
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}
