import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { listGA4Properties } from '@/lib/google-analytics';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    const properties = await listGA4Properties(connection.id);
    return NextResponse.json({ properties, selectedPropertyId: connection.ga4PropertyId });
  } catch (error: any) {
    console.error('GA4 properties error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to list GA4 properties' }, { status: 500 });
  }
}
