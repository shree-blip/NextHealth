import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCanonicalWeekData } from '@/lib/analytics-week';
import { getAuthenticatedDbUser } from '@/lib/auth';

// GET - Fetch weekly analytics for a specific clinic
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const weekNumber = searchParams.get('weekNumber');
    const weekLabel = searchParams.get('weekLabel');

    console.log('[Analytics API] Fetching for clinicId:', clinicId);

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID required' }, { status: 400 });
    }

    const where: any = { clinicId };
    if (year && year !== 'all') where.year = Number(year);
    if (month && month !== 'all') where.month = Number(month);
    if (weekNumber && weekNumber !== 'all') where.weekNumber = Number(weekNumber);
    if (weekLabel && weekLabel.trim().length > 0) {
      where.weekLabel = { contains: weekLabel.trim() };
    }

    const analytics = await prisma.weeklyAnalytics.findMany({
      where,
      orderBy: [
        { year: 'asc' },
        { weekNumber: 'asc' }
      ]
    });

    console.log('[Analytics API] Found', analytics.length, 'records');

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// POST - Create or update weekly analytics
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clinicId, year, weekNumber } = body;

    // Allowlist of safe analytics fields (prevents field injection via spread)
    const ALLOWED_FIELDS = [
      'blogsPublished', 'avgRanking', 'totalTraffic', 'callsRequested',
      'websiteVisits', 'directionClicks', 'metaImpressions', 'metaClicks',
      'metaCTR', 'metaCPC', 'metaConversions', 'metaCostPerConversion',
      'metaAdSpend', 'googleImpressions', 'googleClicks', 'googleCTR',
      'googleCPC', 'googleConversions', 'googleCVR', 'googleCostPerConversion',
      'googleTotalCost', 'socialPosts', 'socialViews', 'patientCount',
      'digitalConversion', 'conversionRate', 'dailyPatientAvg',
    ] as const;

    const safeData: Record<string, number> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        safeData[field] = Number(body[field]) || 0;
      }
    }

    console.log('[Analytics API POST] Received data for:', { clinicId, year, weekNumber });

    if (!clinicId || !year || !weekNumber) {
      console.error('[Analytics API POST] Missing required fields',' body:', body);
      return NextResponse.json(
        { error: 'Missing required fields: clinicId, year, weekNumber' },
        { status: 400 }
      );
    }

    // Ensure numeric values are properly typed
    const numericYear = Number(year);
    const numericWeekNumber = Number(weekNumber);

    if (isNaN(numericYear) || isNaN(numericWeekNumber)) {
      console.error('[Analytics API POST] Invalid numeric values:', { year, weekNumber });
      return NextResponse.json({ error: 'Year and weekNumber must be valid numbers' }, { status: 400 });
    }

    const canonical = getCanonicalWeekData(numericYear, numericWeekNumber);

    console.log('[Analytics API POST] Upserting analytics data...');

    // Canonical write path: one record per clinic + year + weekNumber
    const existing = await prisma.weeklyAnalytics.findFirst({
      where: {
        clinicId,
        year: numericYear,
        weekNumber: numericWeekNumber,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const analytics = existing
      ? await prisma.weeklyAnalytics.update({
          where: { id: existing.id },
          data: {
            weekLabel: canonical.weekLabel,
            month: canonical.month,
            ...safeData,
            updatedAt: new Date(),
          },
        })
      : await prisma.weeklyAnalytics.create({
          data: {
            clinicId,
            year: numericYear,
            month: canonical.month,
            weekNumber: numericWeekNumber,
            weekLabel: canonical.weekLabel,
            ...safeData,
          },
        });

    console.log('[Analytics API POST] Successfully saved analytics:', analytics.id);
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('[Analytics API POST] Error saving weekly analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to save analytics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - Delete a specific analytics record
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Analytics ID required' }, { status: 400 });
    }

    await prisma.weeklyAnalytics.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analytics:', error);
    return NextResponse.json({ error: 'Failed to delete analytics' }, { status: 500 });
  }
}
