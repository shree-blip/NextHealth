import { createHash } from 'node:crypto';

import { Prisma, WeeklyOngoingTask } from '@prisma/client';

import { getCanonicalWeekData } from '@/lib/analytics-week';
import prisma from '@/lib/prisma';
import {
  deriveServiceCategoriesFromPlan,
  normalizeServiceCategories,
  SERVICE_CATEGORY_OPTIONS,
} from '@/lib/service-categories';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ALLOWED_PROGRESS_VALUES = [10, 25, 50, 75, 100] as const;
const STATUS_ORDER = ['planned', 'in_progress', 'review', 'waiting', 'completed'] as const;

type AllowedProgress = (typeof ALLOWED_PROGRESS_VALUES)[number];

export type WeeklyOngoingStatus = (typeof STATUS_ORDER)[number];

export interface WeeklyOngoingSummary {
  total: number;
  averageProgress: number;
  byStatus: Record<WeeklyOngoingStatus, number>;
}

export interface WeeklyOngoingItemPayload {
  id: string;
  clinicId: string;
  serviceCategory: string;
  title: string;
  status: WeeklyOngoingStatus;
  statusNote: string;
  progress: AllowedProgress;
  source: 'task' | 'snapshot';
  updatedAt: string;
}

export interface WeeklyOngoingCategorySection {
  serviceCategory: string;
  summary: WeeklyOngoingSummary;
  items: WeeklyOngoingItemPayload[];
}

export interface WeeklyOngoingClinicSection {
  clinicId: string;
  clinicName: string;
  clinicType: string;
  clinicLocation: string;
  serviceCategories: string[];
  summary: WeeklyOngoingSummary;
  categories: WeeklyOngoingCategorySection[];
}

export interface WeeklyOngoingApiPayload {
  weekYear: number;
  weekNumber: number;
  weekLabel: string;
  generatedAt: string;
  clinics: WeeklyOngoingClinicSection[];
}

export interface WeeklyOngoingAssignment {
  clinicId: string;
  serviceCategories: string[];
  clinic: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
}

interface WeeklySnapshotItem {
  id: string;
  templateKey: string;
  serviceCategory: string;
  title: string;
  statusNote: string;
  order: number;
}

interface WeeklyTaskTemplate {
  key: string;
  title: string;
  statusNote: string;
}

interface CurrentWeekContext {
  weekYear: number;
  weekNumber: number;
  weekLabel: string;
  weekStartDate: Date;
  weekEndDate: Date;
}

const TASK_TEMPLATE_CATALOG: Record<string, WeeklyTaskTemplate[]> = {
  'SEO & Local Search': [
    { key: 'service-page-keywords', title: 'Refine local keyword targets for priority service pages', statusNote: 'Keyword targets are being tightened around current market demand and local intent.' },
    { key: 'metadata-refresh', title: 'Update titles and descriptions on high-value pages', statusNote: 'Priority page metadata is being refreshed to improve local click-through rate.' },
    { key: 'citation-cleanup', title: 'Audit citations and location consistency', statusNote: 'Directory listings are being reviewed for naming, address, and phone consistency.' },
  ],
  'Google Business Profile': [
    { key: 'gbp-post-refresh', title: 'Publish this week’s Google Business Profile update', statusNote: 'The next profile post is being finalized around current offers and patient demand.' },
    { key: 'review-responses', title: 'Reply to priority reviews and profile questions', statusNote: 'Outstanding profile interactions are being cleared for faster response coverage.' },
    { key: 'photo-check', title: 'Refresh photos and core profile highlights', statusNote: 'Profile imagery and business details are being updated for accuracy and recency.' },
  ],
  'Google Ads / Paid Search': [
    { key: 'search-term-review', title: 'Review search terms and add negative keywords', statusNote: 'Search query quality is being checked to reduce wasted spend and tighten targeting.' },
    { key: 'budget-bid-tuning', title: 'Adjust bids and daily budget pacing', statusNote: 'Bid and budget pacing are being tuned against current conversion performance.' },
    { key: 'conversion-check', title: 'Validate call and form conversion tracking', statusNote: 'Paid search conversion events are being checked before the next optimization pass.' },
  ],
  'Social Media': [
    { key: 'content-calendar', title: 'Finalize the weekly social publishing calendar', statusNote: 'Content timing and topic mix are being aligned to current promotions and seasonal demand.' },
    { key: 'creative-approvals', title: 'Prepare creative assets for upcoming posts', statusNote: 'Post graphics and captions are moving through review before scheduling.' },
    { key: 'engagement-insights', title: 'Review engagement trends and response themes', statusNote: 'Audience engagement is being assessed to sharpen messaging and cadence.' },
  ],
  'Blog / Content': [
    { key: 'blog-outline', title: 'Outline this week’s blog and content priorities', statusNote: 'Content planning is focused on high-intent topics and patient education gaps.' },
    { key: 'draft-revisions', title: 'Revise active blog and landing page copy', statusNote: 'Current drafts are being refined for clarity, search intent, and conversion fit.' },
    { key: 'content-publishing-qa', title: 'QA content formatting and internal linking', statusNote: 'Publishing checks are underway to keep new content clean and well-connected.' },
  ],
  'Email Campaigns': [
    { key: 'segment-refresh', title: 'Refresh email segments and send logic', statusNote: 'Audience segments are being updated to keep campaigns relevant and timely.' },
    { key: 'campaign-copy', title: 'Update copy for the next email send', statusNote: 'Email messaging is being revised to match current promotions and patient questions.' },
    { key: 'deliverability-health', title: 'Review deliverability and engagement health', statusNote: 'Open, click, and deliverability trends are being checked before launch.' },
  ],
  'Strategy & Planning': [
    { key: 'weekly-priorities', title: 'Review channel priorities for the current week', statusNote: 'This week’s work is being aligned to the clearest growth opportunities and blockers.' },
    { key: 'performance-review', title: 'Review performance trends and market changes', statusNote: 'Recent channel movement is being reviewed to guide near-term decisions.' },
    { key: 'next-actions', title: 'Prepare next-step recommendations for the client', statusNote: 'Recommended actions are being organized into a clear next-step plan.' },
  ],
  'Brand Identity / Graphic Design': [
    { key: 'brand-asset-audit', title: 'Review brand assets for consistency across campaigns', statusNote: 'Current branded materials are being checked against approved visual standards.' },
    { key: 'creative-revisions', title: 'Revise requested graphic design assets', statusNote: 'Requested design updates are in progress for active campaigns and launches.' },
    { key: 'handoff-package', title: 'Prepare design handoff notes and approvals', statusNote: 'Final design notes are being organized so approved assets can move into use quickly.' },
  ],
  'Brochure / Print Design': [
    { key: 'brochure-copy-refresh', title: 'Refresh brochure copy and service highlights', statusNote: 'Printed messaging is being updated to reflect current offers and positioning.' },
    { key: 'layout-proofing', title: 'Proof layouts and print production details', statusNote: 'Layouts are being checked for spacing, bleed, and print-ready accuracy.' },
    { key: 'approval-files', title: 'Prepare print-ready proofs for approval', statusNote: 'Final proof files are being organized for stakeholder review and release.' },
  ],
  'Medical Automation': [
    { key: 'workflow-review', title: 'Review automation workflow performance and exceptions', statusNote: 'Automation logs and edge cases are being checked for reliability and follow-through.' },
    { key: 'routing-updates', title: 'Tune intake routing and handoff rules', statusNote: 'Lead and patient routing logic is being adjusted to reduce response delays.' },
    { key: 'automation-qa', title: 'QA active automations before the next release', statusNote: 'Current automations are being tested to catch issues before they affect patient flow.' },
  ],
  'Custom Software / Dashboard / Integrations': [
    { key: 'integration-check', title: 'Review integration health across connected systems', statusNote: 'Connected systems are being checked for sync failures, missing records, and API issues.' },
    { key: 'dashboard-improvements', title: 'Implement dashboard and reporting improvements', statusNote: 'Requested dashboard updates are being moved through implementation and QA.' },
    { key: 'release-prep', title: 'Prepare the next software or integration release', statusNote: 'Release notes, testing, and deployment checks are being finalized for the next update.' },
  ],
};

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getFirstWeekMonday(year: number): Date {
  return startOfWeekMonday(new Date(year, 0, 1));
}

function getWeekdayNumber(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function hashValue(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function getStableBucket(seed: string): number {
  return Number.parseInt(hashValue(seed).slice(0, 8), 16);
}

function normalizeStatus(status: string | null | undefined): WeeklyOngoingStatus {
  const normalized = (status ?? '').trim().toLowerCase().replace(/[-\s]+/g, '_');

  if (normalized === 'in_progress') {
    return 'in_progress';
  }

  if (normalized === 'review') {
    return 'review';
  }

  if (normalized === 'waiting') {
    return 'waiting';
  }

  if (normalized === 'completed') {
    return 'completed';
  }

  return 'planned';
}

function normalizeProgress(progress: number | null | undefined): AllowedProgress {
  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    return 10;
  }

  return ALLOWED_PROGRESS_VALUES.reduce<AllowedProgress>((closest, candidate) => {
    return Math.abs(candidate - progress) < Math.abs(closest - progress) ? candidate : closest;
  }, 10);
}

function buildEmptySummary(): WeeklyOngoingSummary {
  return {
    total: 0,
    averageProgress: 0,
    byStatus: {
      planned: 0,
      in_progress: 0,
      review: 0,
      waiting: 0,
      completed: 0,
    },
  };
}

function sortServiceCategories(categories: string[]): string[] {
  const normalized = normalizeServiceCategories(categories);
  const known = new Set(normalized);
  const unknown = categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0 && !known.has(category));

  return [...normalized, ...unknown];
}

export function getCurrentWeeklyOngoingWeek(date: Date = new Date()): CurrentWeekContext {
  const weekStart = startOfWeekMonday(date);
  const nextYear = weekStart.getFullYear() + 1;
  const nextYearFirstWeekMonday = getFirstWeekMonday(nextYear);
  const weekYear = weekStart >= nextYearFirstWeekMonday ? nextYear : date.getFullYear();
  const firstWeekMonday = getFirstWeekMonday(weekYear);
  const weekNumber = Math.floor((weekStart.getTime() - firstWeekMonday.getTime()) / WEEK_IN_MS) + 1;
  const canonicalWeek = getCanonicalWeekData(weekYear, weekNumber);

  return {
    weekYear,
    weekNumber,
    weekLabel: canonicalWeek.weekLabel,
    weekStartDate: canonicalWeek.weekStartDate,
    weekEndDate: canonicalWeek.weekEndDate,
  };
}

export function hashServiceCategories(categories: string[]): string {
  const normalizedCategories = sortServiceCategories(categories);
  return hashValue(normalizedCategories.join('|'));
}

export function generateWeeklySnapshotItems(params: {
  userId: string;
  clinicId: string;
  weekYear: number;
  weekNumber: number;
  serviceCategories: string[];
}): WeeklySnapshotItem[] {
  const orderedCategories = sortServiceCategories(params.serviceCategories);

  return orderedCategories.flatMap((serviceCategory, categoryIndex) => {
    const templates = TASK_TEMPLATE_CATALOG[serviceCategory] ?? [];

    return templates.map((template, templateIndex) => ({
      id: hashValue(`${params.userId}:${params.clinicId}:${params.weekYear}:${params.weekNumber}:${serviceCategory}:${template.key}`).slice(0, 24),
      templateKey: template.key,
      serviceCategory,
      title: template.title,
      statusNote: template.statusNote,
      order: categoryIndex * 100 + templateIndex,
    }));
  });
}

function toSnapshotJsonValue(items: WeeklySnapshotItem[]): Prisma.InputJsonValue {
  return items as unknown as Prisma.InputJsonValue;
}

export function materializeDisplayState(seed: string, asOfDate: Date = new Date()): {
  status: WeeklyOngoingStatus;
  progress: AllowedProgress;
} {
  const weekday = getWeekdayNumber(asOfDate);
  const bucket = getStableBucket(seed);

  if (weekday <= 1) {
    return bucket % 3 === 0
      ? { status: 'in_progress', progress: 25 }
      : { status: 'planned', progress: 10 };
  }

  if (weekday === 2) {
    return bucket % 4 === 0
      ? { status: 'review', progress: 75 }
      : { status: 'in_progress', progress: 25 };
  }

  if (weekday === 3) {
    return bucket % 5 === 0
      ? { status: 'review', progress: 75 }
      : { status: 'in_progress', progress: 50 };
  }

  if (weekday === 4) {
    return bucket % 3 === 0
      ? { status: 'review', progress: 75 }
      : { status: 'in_progress', progress: 50 };
  }

  return bucket % 4 === 0
    ? { status: 'waiting', progress: 25 }
    : { status: 'completed', progress: 100 };
}

export function summarizeWeeklyOngoingItems(items: WeeklyOngoingItemPayload[]): WeeklyOngoingSummary {
  const summary = buildEmptySummary();

  if (items.length === 0) {
    return summary;
  }

  let progressTotal = 0;

  for (const item of items) {
    summary.total += 1;
    summary.byStatus[item.status] += 1;
    progressTotal += item.progress;
  }

  summary.averageProgress = Math.round(progressTotal / items.length);
  return summary;
}

function parseSnapshotItems(items: Prisma.JsonValue): WeeklySnapshotItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item): WeeklySnapshotItem[] => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : '';
    const templateKey = typeof record.templateKey === 'string' ? record.templateKey : '';
    const serviceCategory = typeof record.serviceCategory === 'string' ? record.serviceCategory : '';
    const title = typeof record.title === 'string' ? record.title : '';
    const statusNote = typeof record.statusNote === 'string' ? record.statusNote : '';
    const order = typeof record.order === 'number' ? record.order : 0;

    if (!id || !templateKey || !serviceCategory || !title) {
      return [];
    }

    return [{ id, templateKey, serviceCategory, title, statusNote, order }];
  });
}

function buildSnapshotPayloadItem(
  clinicId: string,
  item: WeeklySnapshotItem,
  updatedAt: Date,
  asOfDate: Date,
): WeeklyOngoingItemPayload {
  const state = materializeDisplayState(`${clinicId}:${item.id}:${item.templateKey}`, asOfDate);

  return {
    id: item.id,
    clinicId,
    serviceCategory: item.serviceCategory,
    title: item.title,
    status: state.status,
    statusNote: item.statusNote,
    progress: state.progress,
    source: 'snapshot',
    updatedAt: updatedAt.toISOString(),
  };
}

function buildTaskPayloadItem(task: WeeklyOngoingTask): WeeklyOngoingItemPayload {
  return {
    id: task.id,
    clinicId: task.clinicId,
    serviceCategory: sortServiceCategories([task.serviceCategory])[0] ?? task.serviceCategory,
    title: task.title,
    status: normalizeStatus(task.status),
    statusNote: task.statusNote || 'Weekly task is being actively tracked.',
    progress: normalizeProgress(task.progress),
    source: 'task',
    updatedAt: task.updatedAt.toISOString(),
  };
}

function buildClinicSection(params: {
  clinic: WeeklyOngoingAssignment['clinic'];
  serviceCategories: string[];
  items: WeeklyOngoingItemPayload[];
}): WeeklyOngoingClinicSection {
  const orderedCategories = sortServiceCategories(
    params.serviceCategories.length > 0
      ? params.serviceCategories
      : Array.from(new Set(params.items.map((item) => item.serviceCategory))),
  );

  const categories = orderedCategories
    .map((serviceCategory) => {
      const categoryItems = params.items
        .filter((item) => item.serviceCategory === serviceCategory)
        .sort((left, right) => left.title.localeCompare(right.title));

      return {
        serviceCategory,
        summary: summarizeWeeklyOngoingItems(categoryItems),
        items: categoryItems,
      };
    })
    .filter((category) => category.items.length > 0);

  return {
    clinicId: params.clinic.id,
    clinicName: params.clinic.name,
    clinicType: params.clinic.type,
    clinicLocation: params.clinic.location,
    serviceCategories: orderedCategories,
    summary: summarizeWeeklyOngoingItems(params.items),
    categories,
  };
}

export async function getWeeklyOngoingWorkForUser(params: {
  user: { id: string; planId?: string | null; plan?: string | null };
  assignments: WeeklyOngoingAssignment[];
  asOfDate?: Date;
}): Promise<WeeklyOngoingApiPayload> {
  const asOfDate = params.asOfDate ?? new Date();
  const currentWeek = getCurrentWeeklyOngoingWeek(asOfDate);

  if (params.assignments.length === 0) {
    return {
      weekYear: currentWeek.weekYear,
      weekNumber: currentWeek.weekNumber,
      weekLabel: currentWeek.weekLabel,
      generatedAt: new Date().toISOString(),
      clinics: [],
    };
  }

  const clinicIds = params.assignments.map((assignment) => assignment.clinicId);

  const [tasks, snapshots] = await Promise.all([
    prisma.weeklyOngoingTask.findMany({
      where: {
        userId: params.user.id,
        clinicId: { in: clinicIds },
        weekYear: currentWeek.weekYear,
        weekNumber: currentWeek.weekNumber,
      },
      orderBy: [
        { serviceCategory: 'asc' },
        { title: 'asc' },
      ],
    }),
    prisma.weeklyOngoingSnapshot.findMany({
      where: {
        userId: params.user.id,
        clinicId: { in: clinicIds },
        weekYear: currentWeek.weekYear,
        weekNumber: currentWeek.weekNumber,
      },
    }),
  ]);

  const tasksByClinic = new Map<string, WeeklyOngoingTask[]>();
  for (const task of tasks) {
    const existing = tasksByClinic.get(task.clinicId);
    if (existing) {
      existing.push(task);
    } else {
      tasksByClinic.set(task.clinicId, [task]);
    }
  }

  const snapshotsByClinic = new Map(snapshots.map((snapshot) => [snapshot.clinicId, snapshot]));

  const clinics = await Promise.all(
    params.assignments.map(async (assignment) => {
      const configuredCategories = normalizeServiceCategories(assignment.serviceCategories);
      const derivedCategories = configuredCategories.length > 0
        ? configuredCategories
        : deriveServiceCategoriesFromPlan(params.user.planId ?? params.user.plan ?? null);
      const realTasks = tasksByClinic.get(assignment.clinicId) ?? [];

      if (realTasks.length > 0) {
        const taskItems = realTasks.map(buildTaskPayloadItem);
        return buildClinicSection({
          clinic: assignment.clinic,
          serviceCategories: derivedCategories,
          items: taskItems,
        });
      }

      const servicesHash = hashServiceCategories(derivedCategories);
      const existingSnapshot = snapshotsByClinic.get(assignment.clinicId);
      const shouldRegenerate = !existingSnapshot || existingSnapshot.servicesHash !== servicesHash;

      const snapshotRecord = shouldRegenerate
        ? await prisma.weeklyOngoingSnapshot.upsert({
            where: {
              userId_clinicId_weekYear_weekNumber: {
                userId: params.user.id,
                clinicId: assignment.clinicId,
                weekYear: currentWeek.weekYear,
                weekNumber: currentWeek.weekNumber,
              },
            },
            create: {
              userId: params.user.id,
              clinicId: assignment.clinicId,
              weekYear: currentWeek.weekYear,
              weekNumber: currentWeek.weekNumber,
              weekLabel: currentWeek.weekLabel,
              servicesHash,
              items: toSnapshotJsonValue(generateWeeklySnapshotItems({
                userId: params.user.id,
                clinicId: assignment.clinicId,
                weekYear: currentWeek.weekYear,
                weekNumber: currentWeek.weekNumber,
                serviceCategories: derivedCategories,
              })),
            },
            update: {
              weekLabel: currentWeek.weekLabel,
              servicesHash,
              items: toSnapshotJsonValue(generateWeeklySnapshotItems({
                userId: params.user.id,
                clinicId: assignment.clinicId,
                weekYear: currentWeek.weekYear,
                weekNumber: currentWeek.weekNumber,
                serviceCategories: derivedCategories,
              })),
            },
          })
        : existingSnapshot;

      const snapshotItems = parseSnapshotItems(snapshotRecord.items).map((item) =>
        buildSnapshotPayloadItem(assignment.clinicId, item, snapshotRecord.updatedAt, asOfDate),
      );

      return buildClinicSection({
        clinic: assignment.clinic,
        serviceCategories: derivedCategories,
        items: snapshotItems,
      });
    }),
  );

  return {
    weekYear: currentWeek.weekYear,
    weekNumber: currentWeek.weekNumber,
    weekLabel: currentWeek.weekLabel,
    generatedAt: new Date().toISOString(),
    clinics: clinics.sort((left, right) => left.clinicName.localeCompare(right.clinicName)),
  };
}

export { SERVICE_CATEGORY_OPTIONS };