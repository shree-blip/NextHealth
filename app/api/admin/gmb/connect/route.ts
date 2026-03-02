import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getGmbOAuthUrl } from '@/lib/gmb';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const url = getGmbOAuthUrl(clinicId);
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('GMB connect error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to start GMB OAuth' }, { status: 500 });
  }
}
