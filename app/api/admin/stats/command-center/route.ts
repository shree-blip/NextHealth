import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Calculate week numbers (simple approximation)
    const getWeekNumber = (date: Date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    
    const currentWeek = getWeekNumber(now);
    const lastWeek = currentWeek - 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Fetch this week's data
    const thisWeekData = await prisma.weeklyAnalytics.findMany({
      where: {
        year: currentYear,
        month: currentMonth,
        weekNumber: currentWeek,
      },
      include: {
        clinic: true,
      },
    });

    // Fetch last week's data for comparison
    const lastWeekData = await prisma.weeklyAnalytics.findMany({
      where: {
        OR: [
          { year: currentYear, month: currentMonth, weekNumber: lastWeek },
          { year: currentYear, month: lastMonth, weekNumber: lastWeek },
        ],
      },
    });

    // Fetch this month's data
    const thisMonthData = await prisma.weeklyAnalytics.findMany({
      where: {
        year: currentYear,
        month: currentMonth,
      },
      include: {
        clinic: true,
      },
    });

    // Fetch last month's data for comparison
    const lastMonthData = await prisma.weeklyAnalytics.findMany({
      where: {
        year: lastMonthYear,
        month: lastMonth,
      },
    });

    // Calculate weekly metrics
    const weeklyPatients = thisWeekData.reduce((sum, d) => sum + (d.patientCount || 0), 0);
    const lastWeekPatients = lastWeekData.reduce((sum, d) => sum + (d.patientCount || 0), 0);
    const weeklyPatientsTrend = lastWeekPatients > 0 
      ? Math.round(((weeklyPatients - lastWeekPatients) / lastWeekPatients) * 100)
      : 0;

    const weeklyMetaSpend = thisWeekData.reduce((sum, d) => sum + (d.metaAdSpend || 0), 0);
    const weeklyGoogleSpend = thisWeekData.reduce((sum, d) => sum + (d.googleTotalCost || 0), 0);

    // Calculate monthly metrics
    const monthlyPatients = thisMonthData.reduce((sum, d) => sum + (d.patientCount || 0), 0);
    const lastMonthPatients = lastMonthData.reduce((sum, d) => sum + (d.patientCount || 0), 0);
    const monthlyPatientsTrend = lastMonthPatients > 0
      ? Math.round(((monthlyPatients - lastMonthPatients) / lastMonthPatients) * 100)
      : 0;

    const monthlyMetaSpend = thisMonthData.reduce((sum, d) => sum + (d.metaAdSpend || 0), 0);
    const monthlyGoogleSpend = thisMonthData.reduce((sum, d) => sum + (d.googleTotalCost || 0), 0);

    // Calculate traffic metrics
    const totalTraffic = thisMonthData.reduce((sum, d) => sum + (d.totalTraffic || 0), 0);
    const callsRequested = thisMonthData.reduce((sum, d) => sum + (d.callsRequested || 0), 0);
    const websiteVisits = thisMonthData.reduce((sum, d) => sum + (d.websiteVisits || 0), 0);
    const directionClicks = thisMonthData.reduce((sum, d) => sum + (d.directionClicks || 0), 0);

    // Calculate top clinics by patient count
    const clinicMap = new Map();
    thisMonthData.forEach((d) => {
      if (!d.clinic) return;
      const existing = clinicMap.get(d.clinicId) || { 
        name: d.clinic.name, 
        location: d.clinic.location,
        patients: 0,
        trend: 0,
      };
      existing.patients += d.patientCount || 0;
      clinicMap.set(d.clinicId, existing);
    });

    // Calculate trends for top clinics
    lastMonthData.forEach((d) => {
      if (clinicMap.has(d.clinicId)) {
        const clinic = clinicMap.get(d.clinicId);
        const lastMonthPatients = lastMonthData
          .filter(ld => ld.clinicId === d.clinicId)
          .reduce((sum, ld) => sum + (ld.patientCount || 0), 0);
        
        if (lastMonthPatients > 0) {
          clinic.trend = Math.round(((clinic.patients - lastMonthPatients) / lastMonthPatients) * 100);
        }
      }
    });

    const topClinics = Array.from(clinicMap.entries())
      .map(([id, data]) => ({ clinicId: id, ...data }))
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 5);

    // Check for alerts
    const alerts = [];
    
    // Check for clinics with no data this week
    const allClinics = await prisma.clinic.findMany({
      select: { id: true, name: true },
    });
    
    const clinicsWithData = new Set(thisWeekData.map(d => d.clinicId));
    const clinicsWithoutData = allClinics.filter(c => !clinicsWithData.has(c.id));
    
    if (clinicsWithoutData.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${clinicsWithoutData.length} clinic(s) missing data this week`,
        details: clinicsWithoutData.map(c => c.name).join(', '),
      });
    }

    // Check for duplicate clinic names
    const clinicNames = allClinics.map(c => c.name.toLowerCase());
    const duplicates = clinicNames.filter((name, index) => clinicNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${duplicates.length} duplicate clinic name(s) detected`,
        details: [...new Set(duplicates)].join(', '),
      });
    }

    // Get recent activity (last 10 user/clinic changes)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { name: true, email: true, createdAt: true, role: true },
    });

    const recentClinics = await prisma.clinic.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { name: true, location: true, updatedAt: true, createdAt: true },
    });

    const recentActivity = [
      ...recentUsers.map(u => ({
        type: 'user',
        action: 'User created',
        name: u.name,
        details: u.email,
        timestamp: u.createdAt,
      })),
      ...recentClinics.map(c => ({
        type: 'clinic',
        action: c.createdAt.getTime() === c.updatedAt.getTime() ? 'Clinic created' : 'Clinic updated',
        name: c.name,
        details: c.location,
        timestamp: c.updatedAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return NextResponse.json({
      weeklyPatients,
      weeklyPatientsTrend,
      monthlyPatients,
      monthlyPatientsTrend,
      weeklyAdSpend: {
        meta: Math.round(weeklyMetaSpend * 100) / 100,
        google: Math.round(weeklyGoogleSpend * 100) / 100,
        total: Math.round((weeklyMetaSpend + weeklyGoogleSpend) * 100) / 100,
      },
      monthlyAdSpend: {
        meta: Math.round(monthlyMetaSpend * 100) / 100,
        google: Math.round(monthlyGoogleSpend * 100) / 100,
        total: Math.round((monthlyMetaSpend + monthlyGoogleSpend) * 100) / 100,
      },
      topClinics,
      traffic: {
        total: totalTraffic,
        calls: callsRequested,
        websiteVisits,
        directionClicks,
      },
      alerts,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching command center data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch command center data' },
      { status: 500 }
    );
  }
}
