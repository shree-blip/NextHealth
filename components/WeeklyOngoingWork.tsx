'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Loader2, MapPin, RefreshCw } from 'lucide-react';

interface WeeklyOngoingItem {
  id: string;
  clinicId: string;
  serviceCategory: string;
  title: string;
  status: 'planned' | 'in_progress' | 'review' | 'waiting' | 'completed';
  statusNote: string;
  progress: number;
  source: 'task' | 'snapshot';
  updatedAt: string;
}

interface WeeklyOngoingSummary {
  total: number;
  averageProgress: number;
  byStatus: Record<'planned' | 'in_progress' | 'review' | 'waiting' | 'completed', number>;
}

interface WeeklyOngoingCategorySection {
  serviceCategory: string;
  summary: WeeklyOngoingSummary;
  items: WeeklyOngoingItem[];
}

interface WeeklyOngoingClinicSection {
  clinicId: string;
  clinicName: string;
  clinicType: string;
  clinicLocation: string;
  serviceCategories: string[];
  summary: WeeklyOngoingSummary;
  categories: WeeklyOngoingCategorySection[];
}

interface WeeklyOngoingApiPayload {
  weekYear: number;
  weekNumber: number;
  weekLabel: string;
  generatedAt: string;
  clinics: WeeklyOngoingClinicSection[];
}

interface WeeklyOngoingWorkProps {
  clinicId?: string;
}

const STATUS_STYLES: Record<WeeklyOngoingItem['status'], string> = {
  planned: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  waiting: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const STATUS_LABELS: Record<WeeklyOngoingItem['status'], string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  review: 'In Review',
  waiting: 'Waiting on Client',
  completed: 'Completed',
};

export default function WeeklyOngoingWork({ clinicId }: WeeklyOngoingWorkProps) {
  const [data, setData] = useState<WeeklyOngoingApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchWeeklyWork = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (clinicId) {
          params.set('clinicId', clinicId);
        }

        const response = await fetch(`/api/client/weekly-ongoing-work${params.toString() ? `?${params.toString()}` : ''}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load weekly ongoing work');
        }

        setData(payload);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load weekly ongoing work');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchWeeklyWork();
    return () => controller.abort();
  }, [clinicId, reloadKey]);

  const totals = useMemo(() => {
    const clinics = data?.clinics || [];
    const items = clinics.flatMap((clinic) => clinic.categories.flatMap((category) => category.items));

    return {
      activeTasks: items.filter((item) => item.status !== 'completed').length,
      completedThisWeek: items.filter((item) => item.status === 'completed').length,
      waitingOnClient: items.filter((item) => item.status === 'waiting').length,
    };
  }, [data]);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/50">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Ongoing Work</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Loading the latest work across your active service categories.</p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-rose-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-rose-900/60 dark:bg-slate-900/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Ongoing Work</h2>
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError('');
              setReloadKey((current) => current + 1);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data || data.clinics.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/50">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Ongoing Work</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stay on top of active deliverables and completion progress.</p>
        </div>
        <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <Activity className="mx-auto mb-4 h-10 w-10 text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No weekly work available</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Assignments will appear here once clinic services are configured and weekly work is generated.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/50">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Ongoing Work</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {data.weekLabel} · Active work grouped by clinic and service category.
          </p>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Updated {new Date(data.generatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Active tasks" value={totals.activeTasks} icon={<Clock3 className="h-5 w-5 text-blue-500" />} />
        <SummaryCard label="Completed this week" value={totals.completedThisWeek} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <SummaryCard label="Waiting on client" value={totals.waitingOnClient} icon={<Activity className="h-5 w-5 text-orange-500" />} />
      </div>

      <div className="space-y-6">
        {data.clinics.map((clinic) => (
          <div
            key={clinic.clinicId}
            className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/70 p-5 dark:border-slate-700/70 dark:bg-slate-950/30"
          >
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{clinic.clinicName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{clinic.clinicType}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {clinic.clinicLocation}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <MiniStat label="Total" value={clinic.summary.total} />
                <MiniStat label="Avg progress" value={`${clinic.summary.averageProgress}%`} />
                <MiniStat label="Completed" value={clinic.summary.byStatus.completed} />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {clinic.categories.map((category) => (
                <div
                  key={`${clinic.clinicId}-${category.serviceCategory}`}
                  className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{category.serviceCategory}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {category.summary.total} task{category.summary.total === 1 ? '' : 's'} · {category.summary.averageProgress}% average progress
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {category.summary.byStatus.in_progress + category.summary.byStatus.review} active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/70 dark:bg-slate-950/40"
                      >
                        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h5 className="font-semibold text-slate-900 dark:text-white">{item.title}</h5>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.statusNote}</p>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                            {STATUS_LABELS[item.status]}
                          </span>
                        </div>

                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
                          <span>{data.weekLabel}</span>
                          <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-slate-50/90 p-5 dark:border-slate-700/70 dark:bg-slate-950/40">
      <div className="mb-3 inline-flex rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">{icon}</div>
      <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 text-right dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
