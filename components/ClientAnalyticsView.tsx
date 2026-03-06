'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, Building2, TrendingUp, RefreshCw } from 'lucide-react';

interface WeeklyAnalytics {
  id: string;
  clinicId: string;
  weekLabel: string;
  year: number;
  month: number;
  weekNumber: number;
  // Items 5 & 6 only
  socialPosts: number;
  socialViews: number;
  patientCount: number;
  digitalConversion: number;
  conversionRate: number;
  dailyPatientAvg: number;
}

interface ClientAnalyticsViewProps {
  refreshTrigger?: number;
  isAdmin?: boolean;
  onLoadingStateChange?: (loading: boolean) => void;
}

export default function ClientAnalyticsView({ refreshTrigger, isAdmin = false, onLoadingStateChange }: ClientAnalyticsViewProps) {
  const isDark = true; // Default to dark mode
  const [analytics, setAnalytics] = useState<WeeklyAnalytics[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Update loading state callback
  useEffect(() => {
    onLoadingStateChange?.(loading);
  }, [loading, onLoadingStateChange]);

  // Fetch clinics on mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const endpoint = isAdmin ? '/api/admin/clinics' : '/api/auth/me';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch clinics');
        
        const data = await res.json();
        let clinicList = [];
        
        if (isAdmin) {
          clinicList = data.clinics || [];
        } else {
          const userId = data.id;
          const assignRes = await fetch(`/api/client/clinics?userId=${userId}`);
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            clinicList = assignData.clinics || [];
          }
        }
        
        setClinics(clinicList);
        if (clinicList.length > 0) {
          setSelectedClinic(clinicList[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
      }
    };

    fetchClinics();
  }, [isAdmin]);

  // Fetch analytics when clinic changes
  useEffect(() => {
    if (!selectedClinic) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/weekly?clinicId=${selectedClinic}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        
        const data = await res.json();
        const records = (data.analytics || []) as WeeklyAnalytics[];
        
        // Sort by year and week number
        records.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.weekNumber - b.weekNumber;
        });
        
        setAnalytics(records);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedClinic, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="rounded-2xl p-8 border bg-slate-800 border-slate-700 text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-bold mb-2 text-white">No Clinics Assigned</h3>
        <p className="text-slate-400">Please contact your admin to assign clinics to your account.</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="rounded-2xl p-8 border bg-slate-800 border-slate-700 text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-bold mb-2 text-white">No Analytics Data Yet</h3>
        <p className="text-slate-400">Your admin will add weekly analytics data for your clinic soon.</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = analytics.map(week => ({
    week: `W${week.weekNumber}`,
    socialPosts: week.socialPosts || 0,
    socialViews: week.socialViews || 0,
    patientCount: week.patientCount || 0,
    digitalConversion: week.digitalConversion || 0,
    conversionRate: week.conversionRate || 0,
  }));

  // Calculate summaries
  const summaryStats = {
    totalPosts: analytics.reduce((sum, w) => sum + (w.socialPosts || 0), 0),
    totalViews: analytics.reduce((sum, w) => sum + (w.socialViews || 0), 0),
    totalPatients: analytics.reduce((sum, w) => sum + (w.patientCount || 0), 0),
    totalConversions: analytics.reduce((sum, w) => sum + (w.digitalConversion || 0), 0),
    avgConversionRate: (analytics.reduce((sum, w) => sum + (w.conversionRate || 0), 0) / analytics.length).toFixed(2),
  };

  return (
    <div className="space-y-6">
      {/* Clinic Selector */}
      {!isAdmin && clinics.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-white font-semibold">Clinic:</label>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Posts</p>
          <p className="text-2xl font-bold text-white">{summaryStats.totalPosts}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Views</p>
          <p className="text-2xl font-bold text-white">{summaryStats.totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Patients</p>
          <p className="text-2xl font-bold text-white">{summaryStats.totalPatients}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Conversions</p>
          <p className="text-2xl font-bold text-white">{Math.round(summaryStats.totalConversions)}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Avg Conv Rate</p>
          <p className="text-2xl font-bold text-white">{summaryStats.avgConversionRate}%</p>
        </div>
      </div>

      {/* Item 5: Social Media Performance */}
      <div className="rounded-xl p-6 bg-slate-800 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-6">📱 Social Media Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" yAxisId="left" />
            <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="socialPosts" name="Posts" stroke="#8b5cf6" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="socialViews" name="Views" stroke="#06b6d4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Item 6: Patient Metrics */}
      <div className="rounded-xl p-6 bg-slate-800 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-6">👥 Patient Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="patientCount" name="Patient Count" fill="#10b981" />
            <Bar yAxisId="right" dataKey="conversionRate" name="Conversion Rate (%)" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="rounded-xl p-6 bg-slate-800 border border-slate-700 overflow-x-auto">
        <h3 className="text-xl font-bold text-white mb-4">📊 Detailed Weekly Breakdown</h3>
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-white">Week</th>
              <th className="text-right py-3 px-4">Posts</th>
              <th className="text-right py-3 px-4">Views</th>
              <th className="text-right py-3 px-4">Patients</th>
              <th className="text-right py-3 px-4">Conversions</th>
              <th className="text-right py-3 px-4">Conv Rate</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((week) => (
              <tr key={week.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="py-3 px-4 font-medium">{week.weekLabel}</td>
                <td className="text-right py-3 px-4">{week.socialPosts || 0}</td>
                <td className="text-right py-3 px-4">{(week.socialViews || 0).toLocaleString()}</td>
                <td className="text-right py-3 px-4">{week.patientCount || 0}</td>
                <td className="text-right py-3 px-4">{Math.round(week.digitalConversion || 0)}</td>
                <td className="text-right py-3 px-4">{(week.conversionRate || 0).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
