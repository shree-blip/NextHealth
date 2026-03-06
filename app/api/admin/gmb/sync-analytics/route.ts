import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';
import { syncGoogleAdsData } from '@/lib/google-ads';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const clinicId = body?.clinicId as string | undefined;

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    const results = { ga4: { synced: 0 }, searchConsole: { synced: 0 }, googleAds: { synced: 0 } };

    if (connection.ga4PropertyId) {
      results.ga4 = await syncGA4Data(connection.id);
    }
    if (connection.searchConsoleSite) {
      results.searchConsole = await syncSearchConsoleData(connection.id);
    }
    if (connection.googleAdsCustomerId) {
      results.googleAds = await syncGoogleAdsData(connection.id);
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    console.error('Analytics sync error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync analytics data' }, { status: 500 });
  }
}
