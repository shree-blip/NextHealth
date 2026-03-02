'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Check,
  AlertCircle,
  Calendar,
  Building2,
  Save,
  FileText,
  TrendingUp,
  Trash2,
  Edit,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface WeekOption {
  weekNumber: number;
  year: number;
  month: number; // Thursday's month (1-12, ISO convention)
  monday: Date;
  sunday: Date;
  label: string; // e.g. "2026 Week 10 (Mar 2–Mar 8)"
}

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

type MetricField = (typeof METRIC_FIELDS)[number];
type FormValues = Record<MetricField, string>;

const FLOAT_FIELDS: Set<string> = new Set([
  'avgRanking',
  'metaCTR',
  'metaAdSpend',
  'googleCTR',
  'googleCPC',
  'googleCVR',
  'googleCostPerConversion',
  'googleTotalCost',
  'conversionRate',
  'dailyPatientAvg',
]);

interface AnalyticsFormProps {
  onSaved?: () => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function shortDate(d: Date): string {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[d.getMonth()]} ${d.getDate()}`;
}

/** Generate all Mon–Sun weeks for `year`. Week 1 contains Jan 1. */
function generateWeeks(year: number): WeekOption[] {
  const weeks: WeekOption[] = [];
  const jan1 = new Date(year, 0, 1);
  const dow = jan1.getDay(); // 0=Sun … 6=Sat
  // Monday of the week containing Jan 1
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  let monday = new Date(year, 0, 1 + mondayOffset);
  let weekNum = 1;

  while (true) {
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    // Thursday determines the week's month (ISO convention)
    const thursday = new Date(monday);
    thursday.setDate(thursday.getDate() + 3);
    const month = thursday.getMonth() + 1;

    weeks.push({
      weekNumber: weekNum,
      year,
      month,
      monday: new Date(monday),
      sunday: new Date(sunday),
      label: `${year} Week ${weekNum} (${shortDate(monday)}\u2013${shortDate(sunday)})`,
    });

    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    if (nextMonday.getFullYear() > year && weekNum >= 52) break;
    monday = nextMonday;
    weekNum++;
  }
  return weeks;
}

/** Default week: current week, or LAST week when today is Monday. */
function getDefaultWeekIndex(weeks: WeekOption[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isMonday = today.getDay() === 1;

  let idx = weeks.findIndex((w) => today >= w.monday && today <= w.sunday);
  if (idx === -1) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (weeks[i].monday <= today) { idx = i; break; }
    }
  }
  if (idx === -1) idx = 0;
  if (isMonday && idx > 0) return idx - 1;
  return idx;
}

function emptyForm(): FormValues {
  return Object.fromEntries(METRIC_FIELDS.map((f) => [f, ''])) as FormValues;
}

function recordToForm(record: any): FormValues {
  const form: any = {};
  for (const field of METRIC_FIELDS) {
    form[field] = record[field] != null ? String(record[field]) : '';
  }
  return form as FormValues;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AnalyticsForm({ onSaved }: AnalyticsFormProps) {
  const currentYear = new Date().getFullYear();

  // Clinic selector
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  // Week selector
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [weeks, setWeeks] = useState<WeekOption[]>(() => generateWeeks(currentYear));
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(-1);

  // Form
  const [formValues, setFormValues] = useState<FormValues>(emptyForm());
  const [existingRecord, setExistingRecord] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Table of all entries for this clinic
  const [existingEntries, setExistingEntries] = useState<any[]>([]);

  // ── Load clinics on mount ──
  useEffect(() => {
    fetch('/api/admin/clinics')
      .then((r) => r.json())
      .then((d) => setClinics(d.clinics || []))
      .catch(() => {});
  }, []);

  // ── Regenerate weeks when year changes ──
  useEffect(() => {
    const w = generateWeeks(selectedYear);
    setWeeks(w);
    setSelectedWeekIdx(
      selectedYear === currentYear ? getDefaultWeekIndex(w) : 0,
    );
  }, [selectedYear, currentYear]);

  // Set default week on first render
  useEffect(() => {
    if (weeks.length > 0 && selectedWeekIdx === -1)
      setSelectedWeekIdx(getDefaultWeekIndex(weeks));
  }, [weeks, selectedWeekIdx]);

  // ── Fetch the specific record for the selected clinic + week ──
  useEffect(() => {
    if (!selectedClinicId || selectedWeekIdx < 0 || selectedWeekIdx >= weeks.length) {
      setExistingRecord(null);
      setFormValues(emptyForm());
      return;
    }
    const wk = weeks[selectedWeekIdx];
    setLoadingData(true);
    setError('');
    setSaved(false);

    fetch(
      `/api/analytics/weekly?clinicId=${selectedClinicId}&year=${wk.year}&month=${wk.month}&weekNumber=${wk.weekNumber}`,
    )
      .then((r) => r.json())
      .then((d) => {
        const recs = d.analytics || [];
        if (recs.length > 0) {
          setExistingRecord(recs[0]);
          setFormValues(recordToForm(recs[0]));
        } else {
          setExistingRecord(null);
          setFormValues(emptyForm());
        }
      })
      .catch(() => {
        setExistingRecord(null);
        setFormValues(emptyForm());
      })
      .finally(() => setLoadingData(false));
  }, [selectedClinicId, selectedWeekIdx, weeks]);

  // ── Fetch all entries for the table ──
  const refreshEntries = () => {
    if (!selectedClinicId) { setExistingEntries([]); return; }
    fetch(`/api/analytics/weekly?clinicId=${selectedClinicId}`)
      .then((r) => r.json())
      .then((d) => setExistingEntries(d.analytics || []))
      .catch(() => setExistingEntries([]));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshEntries(); }, [selectedClinicId]);

  // ── Field change ──
  const handleFieldChange = (name: MetricField, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!selectedClinicId) { setError('Please select a clinic.'); return; }
    if (selectedWeekIdx < 0 || selectedWeekIdx >= weeks.length) { setError('Please select a week.'); return; }

    const wk = weeks[selectedWeekIdx];

    // Build payload – skip empty fields so DB keeps existing values
    const payload: any = {
      clinicId: selectedClinicId,
      year: wk.year,
      month: wk.month,
      weekNumber: wk.weekNumber,
      weekLabel: wk.label,
    };

    for (const field of METRIC_FIELDS) {
      const val = formValues[field];
      if (val !== '' && val != null) {
        const num = FLOAT_FIELDS.has(field) ? parseFloat(val) : parseInt(val, 10);
        if (!isNaN(num)) payload[field] = num;
      }
    }

    setSaving(true);
    try {
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

      // Refresh form with saved record
      setExistingRecord(result.analytics);
      setFormValues(recordToForm(result.analytics));
      setSaved(true);

      // Refresh table
      refreshEntries();

      // Notify parent → charts refresh
      onSaved?.();

      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Error saving analytics');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analytics entry?')) return;
    try {
      const res = await fetch(`/api/analytics/weekly?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      if (existingRecord?.id === id) {
        setExistingRecord(null);
        setFormValues(emptyForm());
      }
      refreshEntries();
      onSaved?.();
    } catch {
      setError('Failed to delete analytics entry');
    }
  };

  // ── Edit from table ──
  const handleEditFromTable = (item: any) => {
    const idx = weeks.findIndex(
      (w) => w.year === item.year && w.month === item.month && w.weekNumber === item.weekNumber,
    );
    if (idx !== -1) setSelectedWeekIdx(idx);
  };

  const selectedWeek = selectedWeekIdx >= 0 && selectedWeekIdx < weeks.length ? weeks[selectedWeekIdx] : null;

  /* ── Field renderer ── */
  const renderField = (name: MetricField, label: string, opts: { step?: string; prefix?: string; suffix?: string } = {}) => (
    <div key={name}>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
        {opts.prefix && <span className="text-slate-400 mr-1">{opts.prefix}</span>}
        {label}
        {opts.suffix && <span className="text-slate-400 ml-1">{opts.suffix}</span>}
      </label>
      <input
        type="number"
        value={formValues[name]}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        placeholder={existingRecord ? '0' : '\u2014'}
        step={opts.step || (FLOAT_FIELDS.has(name) ? '0.01' : '1')}
        min="0"
        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
      />
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-emerald-500" />
          Weekly Analytics Data Entry
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Select a clinic and week, then enter or update performance metrics. Saved data feeds directly into client analytics charts.
        </p>
      </div>

      {/* ── Clinic + Week Selectors ── */}
      <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Clinic */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Building2 className="h-4 w-4 inline mr-1 -mt-0.5" /> Clinic
            </label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            >
              <option value="">Select Clinic</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Week */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Calendar className="h-4 w-4 inline mr-1 -mt-0.5" /> Week (Mon–Sun)
            </label>
            <select
              value={selectedWeekIdx}
              onChange={(e) => setSelectedWeekIdx(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            >
              {weeks.map((w, i) => (
                <option key={i} value={i}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        {selectedClinicId && selectedWeek && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {loadingData ? (
              <><Loader2 className="h-4 w-4 animate-spin text-emerald-500" /><span className="text-slate-500">Loading data…</span></>
            ) : existingRecord ? (
              <><Edit className="h-4 w-4 text-blue-500" /><span className="font-semibold text-blue-600 dark:text-blue-400">Editing existing data for {selectedWeek.label}</span></>
            ) : (
              <><FileText className="h-4 w-4 text-emerald-500" /><span className="font-semibold text-emerald-600 dark:text-emerald-400">New entry — {selectedWeek.label}</span></>
            )}
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /><span className="font-semibold">{error}</span>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm">
          <Check className="h-5 w-5 shrink-0" /><span className="font-semibold">Analytics saved! Client charts will reflect the updated data.</span>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Content */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" /> Content Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('blogsPublished', 'Blogs Published')}
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> SEO Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('avgRanking', 'Avg Ranking', { step: '0.1' })}
            {renderField('totalTraffic', 'Total Traffic')}
          </div>
        </div>

        {/* GMB */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/40 dark:to-yellow-950/40">
          <h3 className="text-base font-bold mb-3">📍 Google My Business</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('callsRequested', 'Calls Requested')}
            {renderField('websiteVisits', 'Website Visits')}
            {renderField('directionClicks', 'Direction Clicks')}
          </div>
        </div>

        {/* Meta Ads */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40">
          <h3 className="text-base font-bold mb-3">📘 Meta Ads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {renderField('metaImpressions', 'Impressions')}
            {renderField('metaClicks', 'Clicks')}
            {renderField('metaCTR', 'CTR', { suffix: '%', step: '0.01' })}
            {renderField('metaConversions', 'Conversions')}
            {renderField('metaAdSpend', 'Ad Spend', { prefix: '$', step: '0.01' })}
          </div>
        </div>

        {/* Google Ads */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
          <h3 className="text-base font-bold mb-3">🔍 Google Ads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('googleImpressions', 'Impressions')}
            {renderField('googleClicks', 'Clicks')}
            {renderField('googleCTR', 'CTR', { suffix: '%', step: '0.01' })}
            {renderField('googleCPC', 'CPC', { prefix: '$', step: '0.01' })}
            {renderField('googleConversions', 'Conversions')}
            {renderField('googleCVR', 'CVR', { suffix: '%', step: '0.01' })}
            {renderField('googleCostPerConversion', 'Cost Per Conv.', { prefix: '$', step: '0.01' })}
            {renderField('googleTotalCost', 'Total Cost', { prefix: '$', step: '0.01' })}
          </div>
        </div>

        {/* Social Media & Patients */}
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40">
          <h3 className="text-base font-bold mb-3">📱 Social Media & Patients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('socialPosts', 'Social Posts')}
            {renderField('socialViews', 'Social Views')}
            {renderField('patientCount', 'Patient Count')}
            {renderField('digitalConversion', 'Digital Conversions')}
            {renderField('conversionRate', 'Conversion Rate', { suffix: '%', step: '0.01' })}
            {renderField('dailyPatientAvg', 'Daily Patient Avg', { step: '0.1' })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !selectedClinicId || selectedWeekIdx < 0}
          className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (<><Loader2 className="h-5 w-5 animate-spin" /> Saving…</>) : (<><Save className="h-5 w-5" /> {existingRecord ? 'Update Analytics' : 'Save Analytics'}</>)}
        </button>
      </form>

      {/* ── Existing entries table ── */}
      {existingEntries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-lg font-bold mb-3">
            Saved Entries for {clinics.find((c) => c.id === selectedClinicId)?.name || 'this clinic'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 font-bold">Week</th>
                  <th className="text-left py-2 px-3 font-bold">Traffic</th>
                  <th className="text-left py-2 px-3 font-bold">Blogs</th>
                  <th className="text-left py-2 px-3 font-bold">GMB Calls</th>
                  <th className="text-left py-2 px-3 font-bold">Meta $</th>
                  <th className="text-left py-2 px-3 font-bold">Google $</th>
                  <th className="text-right py-2 px-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingEntries.map((item: any) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 dark:border-slate-800 ${existingRecord?.id === item.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-medium">{item.weekLabel}</td>
                    <td className="py-2.5 px-3">{item.totalTraffic.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{item.blogsPublished}</td>
                    <td className="py-2.5 px-3">{item.callsRequested}</td>
                    <td className="py-2.5 px-3">${item.metaAdSpend}</td>
                    <td className="py-2.5 px-3">${item.googleTotalCost}</td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button type="button" onClick={() => handleEditFromTable(item)} className="px-2.5 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors" title="Edit">
                        <Edit className="h-3 w-3 inline" />
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors" title="Delete">
                        <Trash2 className="h-3 w-3 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
