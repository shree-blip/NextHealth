'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Phone, Globe, MapPin, Eye, Star, Loader2 } from 'lucide-react';

interface AnalyticsData {
  id: number;
  date: string;
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

interface AnalyticsSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  totalPhoneCalls: number;
  totalWebsiteClicks: number;
  totalDirectionRequests: number;
  totalActions: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ClientAnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resSummary] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics/summary')
      ]);

      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalytics(data);
      }

      if (resSummary.ok) {
        const data = await resSummary.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!analytics.length || !summary) {
    return (
      <div className="rounded-2xl p-8 border border-slate-200 bg-slate-50 text-center">
        <TrendingUp className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">No Analytics Data Yet</h3>
        <p className="text-slate-600">Your admin will add Google Search Console and Google My Business data here soon.</p>
      </div>
    );
  }

  // Prepare chart data with proper formatting
  const chartData = analytics.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: item.gscClicks,
    impressions: item.gscImpressions,
    ctr: parseFloat(item.gscCtr.toFixed(2)),
    position: parseFloat(item.gscAvgPosition.toFixed(1)),
    calls: item.gmbPhoneCalls,
    websiteClicks: item.gmbWebsiteClicks,
    directions: item.gmbDirectionRequests,
    reviews: item.gmbReviewCount,
  })).reverse();

  // GMB breakdown for pie chart
  const gmbBreakdown = [
    { name: 'Phone Calls', value: summary.totalPhoneCalls },
    { name: 'Website Clicks', value: summary.totalWebsiteClicks },
    { name: 'Direction Requests', value: summary.totalDirectionRequests },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Total Clicks</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-700">{summary.totalClicks.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2">From Google Search</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Impressions</span>
            <Eye className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-700">{summary.totalImpressions.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2">Avg CTR: {summary.avgCtr.toFixed(2)}%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Phone Calls</span>
            <Phone className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-700">{summary.totalPhoneCalls.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2">From GMB Profile</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Website Clicks</span>
            <Globe className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{summary.totalWebsiteClicks.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2">GMB Action</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clicks & Impressions Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-slate-200 bg-white">
          <h3 className="text-lg font-bold mb-6">Google Search Console Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} dot={false} name="Impressions" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* CTR & Position Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6 border border-slate-200 bg-white">
          <h3 className="text-lg font-bold mb-6">Click-Through Rate & Position</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} dot={false} name="CTR (%)" />
              <Line yAxisId="right" type="monotone" dataKey="position" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg Position" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* GMB Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GMB Actions Pie Chart */}
        {gmbBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-slate-200 bg-white">
            <h3 className="text-lg font-bold mb-6">Google My Business Actions Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gmbBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gmbBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* GMB Actions Over Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6 border border-slate-200 bg-white">
          <h3 className="text-lg font-bold mb-6">GMB Actions Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="calls" fill="#f59e0b" name="Phone Calls" />
              <Bar dataKey="websiteClicks" fill="#3b82f6" name="Website Clicks" />
              <Bar dataKey="directions" fill="#10b981" name="Directions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Metrics Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6 border border-slate-200 bg-white overflow-x-auto">
        <h3 className="text-lg font-bold mb-6">Detailed Analytics</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-bold text-slate-700">Date</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Clicks</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Impressions</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">CTR</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Position</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Calls</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Website</th>
              <th className="text-right py-3 px-4 font-bold text-slate-700">Directions</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-900">{row.date}</td>
                <td className="text-right py-3 px-4 text-blue-600 font-semibold">{row.clicks.toLocaleString()}</td>
                <td className="text-right py-3 px-4 text-purple-600 font-semibold">{row.impressions.toLocaleString()}</td>
                <td className="text-right py-3 px-4 text-orange-600 font-semibold">{row.ctr}%</td>
                <td className="text-right py-3 px-4 text-red-600 font-semibold">{row.position}</td>
                <td className="text-right py-3 px-4 text-orange-600 font-semibold">{row.calls}</td>
                <td className="text-right py-3 px-4 text-emerald-600 font-semibold">{row.websiteClicks}</td>
                <td className="text-right py-3 px-4 text-cyan-600 font-semibold">{row.directions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
