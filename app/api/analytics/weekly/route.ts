import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch weekly analytics for a specific clinic
export async function GET(request: NextRequest) {
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
        { month: 'asc' },
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
  try {
    const body = await request.json();
    const { clinicId, year, month, weekNumber, weekLabel, ...data } = body;

    console.log('[Analytics API POST] Received data for:', { clinicId, year, month, weekNumber, weekLabel });

    if (!clinicId || !year || !month || !weekNumber || !weekLabel) {
      console.error('[Analytics API POST] Missing required fields',' body:', body);
      return NextResponse.json(
        { error: 'Missing required fields: clinicId, year, month, weekNumber, weekLabel' },
        { status: 400 }
      );
    }

    // Ensure numeric values are properly typed
    const numericYear = Number(year);
    const numericMonth = Number(month);
    const numericWeekNumber = Number(weekNumber);

    if (isNaN(numericYear) || isNaN(numericMonth) || isNaN(numericWeekNumber)) {
      console.error('[Analytics API POST] Invalid numeric values:', { year, month, weekNumber });
      return NextResponse.json({ error: 'Year, month, and weekNumber must be valid numbers' }, { status: 400 });
    }

    console.log('[Analytics API POST] Upserting analytics data...');

    // Upsert the analytics data
    const analytics = await prisma.weeklyAnalytics.upsert({
      where: {
        clinicId_year_month_weekNumber: {
          clinicId,
          year: numericYear,
          month: numericMonth,
          weekNumber: numericWeekNumber
        }
      },
      update: {
        weekLabel,
        ...data,
        updatedAt: new Date()
      },
      create: {
        clinicId,
        year: numericYear,
        month: numericMonth,
        weekNumber: numericWeekNumber,
        weekLabel,
        ...data
      }
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
