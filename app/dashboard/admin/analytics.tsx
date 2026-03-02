'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Loader2, Check, AlertCircle, Trash2, Edit, FileText, TrendingUp } from 'lucide-react';

interface WeeklyAnalyticsInput {
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

export default function AnalyticsForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [existingData, setExistingData] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [data, setData] = useState<WeeklyAnalyticsInput>({
    clinicId: '',
    weekLabel: '',
    year: currentYear,
    month: currentMonth,
    weekNumber: 1,
    blogsPublished: 0,
    avgRanking: 0,
    totalTraffic: 0,
    callsRequested: 0,
    websiteVisits: 0,
    directionClicks: 0,
    metaImpressions: 0,
    metaClicks: 0,
    metaCTR: 0,
    metaConversions: 0,
    metaAdSpend: 0,
    googleImpressions: 0,
    googleClicks: 0,
    googleCTR: 0,
    googleCPC: 0,
    googleConversions: 0,
    googleCVR: 0,
    googleCostPerConversion: 0,
    googleTotalCost: 0,
    socialPosts: 0,
    socialViews: 0,
    patientCount: 0,
    digitalConversion: 0,
    conversionRate: 0,
    dailyPatientAvg: 0,
  });

  // Load clinics on mount
  useEffect(() => {
    fetch('/api/admin/clinics')
      .then(res => res.json())
      .then(data => setClinics(data.clinics || []))
      .catch(err => console.error('Failed to load clinics:', err));
  }, []);

  // Load existing analytics when clinic changes
  useEffect(() => {
    if (data.clinicId) {
      fetch(`/api/analytics/weekly?clinicId=${data.clinicId}`)
        .then(res => res.json())
        .then(result => setExistingData(result.analytics || []))
        .catch(err => console.error('Failed to load analytics:', err));
    }
  }, [data.clinicId]);

  // Auto-generate weekLabel based on month and week number
  useEffect(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (data.month >= 1 && data.month <= 12) {
      setData(prev => ({
        ...prev,
        weekLabel: `${monthNames[data.month - 1]} Week ${data.weekNumber}`
      }));
    }
  }, [data.month, data.weekNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: ['clinicId', 'weekLabel'].includes(name) ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    if (!data.clinicId) {
      setError('Clinic is required');
      return;
    }

    setLoading(true);
    try {
      const payload = editingId ? { id: editingId, ...data } : data;
      
      const res = await fetch('/api/analytics/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save analytics');
      }

      setSubmitted(true);
      setEditingId(null);
      
      // Reload data
      if (data.clinicId) {
        const refreshRes = await fetch(`/api/analytics/weekly?clinicId=${data.clinicId}`);
        const refreshData = await refreshRes.json();
        setExistingData(refreshData.analytics || []);
      }

      // Reset form
      setData({
        clinicId: data.clinicId, // Keep clinic selected
        weekLabel: '',
        year: currentYear,
        month: currentMonth,
        weekNumber: 1,
        blogsPublished: 0,
        avgRanking: 0,
        totalTraffic: 0,
        callsRequested: 0,
        websiteVisits: 0,
        directionClicks: 0,
        metaImpressions: 0,
        metaClicks: 0,
        metaCTR: 0,
        metaConversions: 0,
        metaAdSpend: 0,
        googleImpressions: 0,
        googleClicks: 0,
        googleCTR: 0,
        googleCPC: 0,
        googleConversions: 0,
        googleCVR: 0,
        googleCostPerConversion: 0,
        googleTotalCost: 0,
        socialPosts: 0,
        socialViews: 0,
        patientCount: 0,
        digitalConversion: 0,
        conversionRate: 0,
        dailyPatientAvg: 0,
      });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setData({
      clinicId: item.clinicId,
      weekLabel: item.weekLabel,
      year: item.year,
      month: item.month,
      weekNumber: item.weekNumber,
      blogsPublished: item.blogsPublished || 0,
      avgRanking: item.avgRanking || 0,
      totalTraffic: item.totalTraffic || 0,
      callsRequested: item.callsRequested || 0,
      websiteVisits: item.websiteVisits || 0,
      directionClicks: item.directionClicks || 0,
      metaImpressions: item.metaImpressions || 0,
      metaClicks: item.metaClicks || 0,
      metaCTR: item.metaCTR || 0,
      metaConversions: item.metaConversions || 0,
      metaAdSpend: item.metaAdSpend || 0,
      googleImpressions: item.googleImpressions || 0,
      googleClicks: item.googleClicks || 0,
      googleCTR: item.googleCTR || 0,
      googleCPC: item.googleCPC || 0,
      googleConversions: item.googleConversions || 0,
      googleCVR: item.googleCVR || 0,
      googleCostPerConversion: item.googleCostPerConversion || 0,
      googleTotalCost: item.googleTotalCost || 0,
      socialPosts: item.socialPosts || 0,
      socialViews: item.socialViews || 0,
      patientCount: item.patientCount || 0,
      digitalConversion: item.digitalConversion || 0,
      conversionRate: item.conversionRate || 0,
      dailyPatientAvg: item.dailyPatientAvg || 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analytics entry?')) return;
    
    try {
      const res = await fetch(`/api/analytics/weekly?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      // Refresh data
      if (data.clinicId) {
        const refreshRes = await fetch(`/api/analytics/weekly?clinicId=${data.clinicId}`);
        const refreshData = await refreshRes.json();
        setExistingData(refreshData.analytics || []);
      }
    } catch (err) {
      setError('Failed to delete analytics entry');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2">📊 Weekly Analytics Management</h2>
        <p className="text-slate-600 dark:text-slate-400">Enter and manage weekly performance metrics for each clinic</p>
      </div>

      {/* Existing Data Table */}
      {existingData.length > 0 && (
        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-xl font-bold mb-4">Existing Weekly Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 font-bold">Week</th>
                  <th className="text-left py-2 px-3 font-bold">Traffic</th>
                  <th className="text-left py-2 px-3 font-bold">Blogs</th>
                  <th className="text-left py-2 px-3 font-bold">GMB Calls</th>
                  <th className="text-left py-2 px-3 font-bold">Meta Spend</th>
                  <th className="text-right py-2 px-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingData.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3">{item.weekLabel}</td>
                    <td className="py-3 px-3">{item.totalTraffic}</td>
                    <td className="py-3 px-3">{item.blogsPublished}</td>
                    <td className="py-3 px-3">{item.callsRequested}</td>
                    <td className="py-3 px-3">${item.metaAdSpend}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold mr-2 hover:bg-blue-600"
                      >
                        <Edit className="h-3 w-3 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                      >
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300">
            <Check className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{editingId ? 'Analytics updated!' : 'Analytics saved!'}</span>
          </div>
        )}

        {/* Clinic & Week Selection */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <h3 className="text-lg font-bold mb-4">📍 Clinic & Time Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Clinic *</label>
              <select
                name="clinicId"
                value={data.clinicId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">Select Clinic</option>
                {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Year</label>
              <input
                type="number"
                name="year"
                value={data.year}
                onChange={handleChange}
                min="2020"
                max="2030"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Month</label>
              <select
                name="month"
                value={data.month}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Week #</label>
              <select
                name="weekNumber"
                value={data.weekNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
                <option value="3">Week 3</option>
                <option value="4">Week 4</option>
              </select>
            </div>
          </div>
          {data.weekLabel && (
            <div className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Week Label: {data.weekLabel}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Content Metrics
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Blogs Published</label>
              <input
                type="number"
                name="blogsPublished"
                value={data.blogsPublished}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            SEO Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avg Ranking (lower is better)</label>
              <input
                type="number"
                name="avgRanking"
                value={data.avgRanking}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Traffic</label>
              <input
                type="number"
                name="totalTraffic"
                value={data.totalTraffic}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* GMB Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50">
          <h3 className="text-lg font-bold mb-4">📍 Google My Business</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Calls Requested</label>
              <input
                type="number"
                name="callsRequested"
                value={data.callsRequested}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Website Visits</label>
              <input
                type="number"
                name="websiteVisits"
                value={data.websiteVisits}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Direction Clicks</label>
              <input
                type="number"
                name="directionClicks"
                value={data.directionClicks}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Meta Ads Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50">
          <h3 className="text-lg font-bold mb-4">📘 Meta Ads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Impressions</label>
              <input
                type="number"
                name="metaImpressions"
                value={data.metaImpressions}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Clicks</label>
              <input
                type="number"
                name="metaClicks"
                value={data.metaClicks}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CTR %</label>
              <input
                type="number"
                name="metaCTR"
                value={data.metaCTR}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Conversions</label>
              <input
                type="number"
                name="metaConversions"
                value={data.metaConversions}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ad Spend ($)</label>
              <input
                type="number"
                name="metaAdSpend"
                value={data.metaAdSpend}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Google Ads Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
          <h3 className="text-lg font-bold mb-4">🔍 Google Ads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Impressions</label>
              <input
                type="number"
                name="googleImpressions"
                value={data.googleImpressions}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Clicks</label>
              <input
                type="number"
                name="googleClicks"
                value={data.googleClicks}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CTR %</label>
              <input
                type="number"
                name="googleCTR"
                value={data.googleCTR}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CPC ($)</label>
              <input
                type="number"
                name="googleCPC"
                value={data.googleCPC}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Conversions</label>
              <input
                type="number"
                name="googleConversions"
                value={data.googleConversions}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CVR %</label>
              <input
                type="number"
                name="googleCVR"
                value={data.googleCVR}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cost Per Conv ($)</label>
              <input
                type="number"
                name="googleCostPerConversion"
                value={data.googleCostPerConversion}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Cost ($)</label>
              <input
                type="number"
                name="googleTotalCost"
                value={data.googleTotalCost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50">
          <h3 className="text-lg font-bold mb-4">📱 Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Posts</label>
              <input
                type="number"
                name="socialPosts"
                value={data.socialPosts}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Views</label>
              <input
                type="number"
                name="socialViews"
                value={data.socialViews}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Patient Count</label>
              <input
                type="number"
                name="patientCount"
                value={data.patientCount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Digital Conversion</label>
              <input
                type="number"
                name="digitalConversion"
                value={data.digitalConversion}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Conversion Rate %</label>
              <input
                type="number"
                name="conversionRate"
                value={data.conversionRate}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Daily Patient Avg</label>
              <input
                type="number"
                name="dailyPatientAvg"
                value={data.dailyPatientAvg}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {editingId ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              {editingId ? 'Update Weekly Analytics' : 'Save Weekly Analytics'}
            </>
          )}
        </button>
        
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setData({
                ...data,
                weekLabel: '',
                year: currentYear,
                month: currentMonth,
                weekNumber: 1,
                blogsPublished: 0,
                avgRanking: 0,
                totalTraffic: 0,
                callsRequested: 0,
                websiteVisits: 0,
                directionClicks: 0,
                metaImpressions: 0,
                metaClicks: 0,
                metaCTR: 0,
                metaConversions: 0,
                metaAdSpend: 0,
                googleImpressions: 0,
                googleClicks: 0,
                googleCTR: 0,
                googleCPC: 0,
                googleConversions: 0,
                googleCVR: 0,
                googleCostPerConversion: 0,
                googleTotalCost: 0,
                socialPosts: 0,
                socialViews: 0,
                patientCount: 0,
                digitalConversion: 0,
                conversionRate: 0,
                dailyPatientAvg: 0,
              });
            }}
            className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </motion.div>
  );
}
