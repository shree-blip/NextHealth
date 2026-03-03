import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ clinics });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 });
  }
}
