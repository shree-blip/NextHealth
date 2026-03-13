/**
 * ONE-TIME DATA RESTORE ENDPOINT
 * Restores Clinic, User, and ClientClinic data from CSV backups.
 * Protected by CRON_SECRET (Authorization: Bearer <secret>).
 * Safe to run multiple times — all operations use upsert.
 *
 * Call: POST /api/admin/restore-data
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// ─── Clinic data from clinics_fixed.csv ────────────────────────────────────
const CLINICS = [
  {
    id: 'cmm95mcov0000m3b33gam35ij',
    name: 'ER of Lufkin',
    type: 'ER',
    location: 'Lufkin, TX',
    leads: 86,
    appointments: 23,
  },
  {
    id: 'cmm95ncql0001m3b337f4uupv',
    name: 'ER of Irving',
    type: 'ER',
    location: 'Irving, TX',
    leads: 114,
    appointments: 42,
  },
  {
    id: 'cmm95odul0002m3b3ekssh3h2',
    name: 'ER OF WHITE ROCK',
    type: 'ER',
    location: 'Dallas, TX',
    leads: 57,
    appointments: 31,
  },
  {
    id: 'cmm95p3se0003m3b36q6t6wzh',
    name: 'Irving Med Spa',
    type: 'Wellness',
    location: 'Irving, TX',
    leads: 99,
    appointments: 41,
  },
  {
    id: 'cmm95pksy0004m3b36b0ni5eq',
    name: 'Naperville Med Spa',
    type: 'MedSpa',
    location: 'Naperville, IL',
    leads: 92,
    appointments: 63,
  },
] as const;

// ─── User data from users_final_clean.csv ─────────────────────────────────
const USERS = [
  {
    id: 'cmm8msso90000fnsm3ry01ak9',
    email: 'shree@focusyourfinance.com',
    password: 'Hello@123',
    name: 'Shree',
    role: 'admin',
    avatar: '/uploads/avatars/avatar-1772443344983.png',
    plan: 'Premium',
    planId: 'premium',
    subscriptionStatus: 'active',
  },
  {
    id: 'cmm8mssoc0001fnsm1dwy0j8f',
    email: 'jaya.r.dahal@focusyourfinance.com',
    password: 'Hello@1234',
    name: 'Jaya R. Dahal',
    role: 'client',
    avatar: 'https://ca.slack-edge.com/TD22QE5K7-UD15CMB08-56026d79f668-512',
    plan: 'ER & Urgent Care',
    planId: 'gold',
    subscriptionStatus: 'active',
  },
  {
    id: 'cmm96h23o000bm3b3ie6fx3s9',
    email: 'hello@focusyourfinance.com',
    password: 'Hello@123',
    name: 'Bikash Neupane',
    role: 'admin',
    avatar: '/uploads/avatars/avatar-1772512470937.png',
    plan: null,
    planId: null,
    subscriptionStatus: null,
  },
  {
    id: 'cmm96iy07000cm3b3o2oryfdu',
    email: 'manager@napervillehwclinic.com',
    password: 'Hello@123',
    name: 'Sajid Hussain',
    role: 'client',
    avatar: null,
    plan: null,
    planId: null,
    subscriptionStatus: null,
  },
  {
    id: 'cmm96k6vd000fm3b3hi67rek2',
    email: 'julie@focusyourfinance.com',
    password: 'Hello@123',
    name: 'Julie Moreno',
    role: 'client',
    avatar: 'https://ca.slack-edge.com/TD22QE5K7-U08CS2NUWCF-bc11f3dfa209-192',
    plan: 'Wellness & Longevity',
    planId: 'silver',
    subscriptionStatus: 'active',
  },
  {
    id: 'cmmalon4m0000xiyjrqv2l89e',
    email: 'bijesh@focusyourfinance.com',
    password: 'Hello@123',
    name: 'Bijesh Khadgi',
    role: 'admin',
    avatar: '/uploads/avatars/avatar-1772543077080.png',
    plan: null,
    planId: null,
    subscriptionStatus: null,
  },
] as const;

// ─── ClientClinic assignments (inferred from plan/email context) ────────────
//   Jaya (ER & Urgent Care / gold) → all 3 ER clinics
//   Sajid (manager@napervillehwclinic.com) → Naperville Med Spa
//   Julie (Wellness & Longevity / silver) → Irving Med Spa + Naperville Med Spa
const ASSIGNMENTS: Array<{
  userId: string;
  clinicId: string;
  serviceCategories: string[];
}> = [
  // Jaya → ER clinics
  {
    userId: 'cmm8mssoc0001fnsm1dwy0j8f',
    clinicId: 'cmm95mcov0000m3b33gam35ij', // ER of Lufkin
    serviceCategories: [
      'SEO & Local Search',
      'Google Business Profile',
      'Google Ads / Paid Search',
      'Social Media',
    ],
  },
  {
    userId: 'cmm8mssoc0001fnsm1dwy0j8f',
    clinicId: 'cmm95ncql0001m3b337f4uupv', // ER of Irving
    serviceCategories: [
      'SEO & Local Search',
      'Google Business Profile',
      'Google Ads / Paid Search',
      'Social Media',
    ],
  },
  {
    userId: 'cmm8mssoc0001fnsm1dwy0j8f',
    clinicId: 'cmm95odul0002m3b3ekssh3h2', // ER OF WHITE ROCK
    serviceCategories: [
      'SEO & Local Search',
      'Google Business Profile',
      'Google Ads / Paid Search',
      'Social Media',
    ],
  },
  // Sajid → Naperville Med Spa
  {
    userId: 'cmm96iy07000cm3b3o2oryfdu',
    clinicId: 'cmm95pksy0004m3b36b0ni5eq', // Naperville Med Spa
    serviceCategories: ['SEO & Local Search', 'Google Business Profile'],
  },
  // Julie → Wellness clinics
  {
    userId: 'cmm96k6vd000fm3b3hi67rek2',
    clinicId: 'cmm95p3se0003m3b36q6t6wzh', // Irving Med Spa
    serviceCategories: [
      'SEO & Local Search',
      'Google Business Profile',
      'Social Media',
    ],
  },
  {
    userId: 'cmm96k6vd000fm3b3hi67rek2',
    clinicId: 'cmm95pksy0004m3b36b0ni5eq', // Naperville Med Spa
    serviceCategories: [
      'SEO & Local Search',
      'Google Business Profile',
      'Social Media',
    ],
  },
];

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userCount, clinicCount, assignmentCount, analyticsCount, weeklyCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.clinic.count(),
        prisma.clientClinic.count(),
        prisma.analyticsData.count(),
        prisma.weeklyAnalytics.count(),
      ]);

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, plan: true, planId: true },
    });
    const clinics = await prisma.clinic.findMany({
      select: { id: true, name: true, type: true },
    });
    const assignments = await prisma.clientClinic.findMany({
      select: { userId: true, clinicId: true, serviceCategories: true },
    });

    return NextResponse.json({
      counts: {
        users: userCount,
        clinics: clinicCount,
        clientClinicAssignments: assignmentCount,
        analyticsData: analyticsCount,
        weeklyAnalytics: weeklyCount,
      },
      users,
      clinics,
      assignments,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    // ── 1. Restore Clinics ───────────────────────────────────────────────
    const clinicResults = await Promise.all(
      CLINICS.map((clinic) =>
        prisma.clinic.upsert({
          where: { id: clinic.id },
          create: {
            id: clinic.id,
            name: clinic.name,
            type: clinic.type,
            location: clinic.location,
            leads: clinic.leads,
            appointments: clinic.appointments,
          },
          update: {
            name: clinic.name,
            type: clinic.type,
            location: clinic.location,
            leads: clinic.leads,
            appointments: clinic.appointments,
          },
        })
      )
    );
    results.clinics = { restored: clinicResults.length, names: clinicResults.map((c) => c.name) };

    // ── 2. Restore Users ─────────────────────────────────────────────────
    const userResults = await Promise.all(
      USERS.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email,
            password: hashedPassword,
            name: user.name,
            role: user.role,
            avatar: user.avatar ?? null,
            plan: user.plan ?? null,
            planId: user.planId ?? null,
            subscriptionStatus: user.subscriptionStatus ?? null,
          },
          update: {
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar ?? null,
            plan: user.plan ?? null,
            planId: user.planId ?? null,
            subscriptionStatus: user.subscriptionStatus ?? null,
            // Note: password only upserted on create so existing passwords aren't wiped
          },
        });
      })
    );
    results.users = { restored: userResults.length, names: userResults.map((u) => u.name) };

    // ── 3. Restore ClientClinic assignments ──────────────────────────────
    const assignmentResults = await Promise.all(
      ASSIGNMENTS.map((a) =>
        prisma.clientClinic.upsert({
          where: { userId_clinicId: { userId: a.userId, clinicId: a.clinicId } },
          create: {
            userId: a.userId,
            clinicId: a.clinicId,
            serviceCategories: a.serviceCategories,
          },
          update: {
            serviceCategories: a.serviceCategories,
          },
        })
      )
    );
    results.assignments = {
      restored: assignmentResults.length,
      detail: ASSIGNMENTS.map((a) => {
        const user = USERS.find((u) => u.id === a.userId);
        const clinic = CLINICS.find((c) => c.id === a.clinicId);
        return `${user?.name} → ${clinic?.name}`;
      }),
    };

    // ── 4. Current DB counts ─────────────────────────────────────────────
    const [userCount, clinicCount, assignmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.clinic.count(),
      prisma.clientClinic.count(),
    ]);
    results.dbCounts = { users: userCount, clinics: clinicCount, assignments: assignmentCount };

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (err) {
    console.error('[restore-data] Error:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
