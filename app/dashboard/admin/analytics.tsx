'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Loader2, Check, AlertCircle } from 'lucide-react';

interface AnalyticsInput {
  userId: string;
  clinicId: string;
  gscClicks: number;
  gscImpressions: number;
  gscCtr: number;
  gscAvgPosition: number;
  gmbPhoneCalls: number;
  gmbWebsiteClicks: number;
  gmbDirectionRequests: number;
  gmbActions: number;
  gmbProfileViews: number;
  gmbReviewCount: number;
}

export default function AnalyticsForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [data, setData] = useState<AnalyticsInput>({
    userId: '',
    clinicId: '',
    gscClicks: 0,
    gscImpressions: 0,
    gscCtr: 0,
    gscAvgPosition: 0,
    gmbPhoneCalls: 0,
    gmbWebsiteClicks: 0,
    gmbDirectionRequests: 0,
    gmbActions: 0,
    gmbProfileViews: 0,
    gmbReviewCount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    if (!data.userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analytics/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save analytics');
      }

      setSubmitted(true);
      setData({
        userId: '',
        clinicId: '',
        gscClicks: 0,
        gscImpressions: 0,
        gscCtr: 0,
        gscAvgPosition: 0,
        gmbPhoneCalls: 0,
        gmbWebsiteClicks: 0,
        gmbDirectionRequests: 0,
        gmbActions: 0,
        gmbProfileViews: 0,
        gmbReviewCount: 0,
      });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2">Analytics Data Entry</h2>
        <p className="text-slate-600">Add Google Search Console & GMB metrics for clients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700">
            <Check className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Analytics data saved successfully!</span>
          </div>
        )}

        {/* User Selection */}
        <div className="rounded-2xl p-6 border border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold mb-4">Client Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">User ID *</label>
              <input
                type="text"
                name="userId"
                value={data.userId}
                onChange={handleChange}
                placeholder="Enter client User ID"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Clinic ID (Optional)</label>
              <input
                type="text"
                name="clinicId"
                value={data.clinicId}
                onChange={handleChange}
                placeholder="Enter clinic ID"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Google Search Console Section */}
        <div className="rounded-2xl p-6 border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">🔍</div>
            Google Search Console Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Total Clicks</label>
              <input
                type="number"
                name="gscClicks"
                value={data.gscClicks}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Total Impressions</label>
              <input
                type="number"
                name="gscImpressions"
                value={data.gscImpressions}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Click-Through Rate (CTR) %</label>
              <input
                type="number"
                name="gscCtr"
                value={data.gscCtr}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Average Position</label>
              <input
                type="number"
                name="gscAvgPosition"
                value={data.gscAvgPosition}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Google My Business Section */}
        <div className="rounded-2xl p-6 border border-slate-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">📍</div>
            Google My Business Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Calls</label>
              <input
                type="number"
                name="gmbPhoneCalls"
                value={data.gmbPhoneCalls}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Website Clicks</label>
              <input
                type="number"
                name="gmbWebsiteClicks"
                value={data.gmbWebsiteClicks}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Direction Requests</label>
              <input
                type="number"
                name="gmbDirectionRequests"
                value={data.gmbDirectionRequests}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Actions</label>
              <input
                type="number"
                name="gmbActions"
                value={data.gmbActions}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Profile Views</label>
              <input
                type="number"
                name="gmbProfileViews"
                value={data.gmbProfileViews}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Review Count</label>
              <input
                type="number"
                name="gmbReviewCount"
                value={data.gmbReviewCount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
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
              Saving...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Analytics Data
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
