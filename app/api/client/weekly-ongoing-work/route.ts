import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getWeeklyOngoingWorkForUser } from '@/lib/weekly-ongoing-work';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clinicId = request.nextUrl.searchParams.get('clinicId');

    const assignments = await prisma.clientClinic.findMany({
      where: {
        userId: user.id,
        ...(clinicId ? { clinicId } : {}),
      },
      select: {
        clinicId: true,
        serviceCategories: true,
        clinic: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
          },
        },
      },
      orderBy: {
        clinic: {
          name: 'asc',
        },
      },
    });

    const payload = await getWeeklyOngoingWorkForUser({
      user: {
        id: user.id,
        planId: user.planId,
        plan: user.plan,
      },
      assignments,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching weekly ongoing work:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly ongoing work' }, { status: 500 });
  }
}