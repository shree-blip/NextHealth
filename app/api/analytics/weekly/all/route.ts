import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const analytics = await prisma.weeklyAnalytics.findMany({
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
        { weekNumber: 'asc' }
      ]
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
