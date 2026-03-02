import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
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
