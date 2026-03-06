import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { listSearchConsoleSites } from '@/lib/google-analytics';

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

    const sites = await listSearchConsoleSites(connection.id);
    return NextResponse.json({ sites, selectedSite: connection.searchConsoleSite });
  } catch (error: any) {
    console.error('Search Console sites error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to list Search Console sites' }, { status: 500 });
  }
}
