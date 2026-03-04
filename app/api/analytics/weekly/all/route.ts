import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Only admins can view all clinics' analytics
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

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
