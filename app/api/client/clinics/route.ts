import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Users can only view their own clinics unless they are admin
    if (userId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all clinic assignments for this user
    const assignments = await prisma.clientClinic.findMany({
      where: { userId },
      include: {
        clinic: true
      }
    });

    const clinics = assignments.map(a => a.clinic);

    return NextResponse.json({ clinics });
  } catch (error) {
    console.error('Error fetching client clinics:', error);
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 });
  }
}
