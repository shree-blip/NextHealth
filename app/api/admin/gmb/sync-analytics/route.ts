import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';
import { syncGoogleAdsData } from '@/lib/google-ads';

// In-memory cooldown tracker (per clinic, 30-min window)
const analyticsSyncCooldowns = new Map<string, number>();
const ANALYTICS_COOLDOWN_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const clinicId = body?.clinicId as string | undefined;

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    // ── Cooldown check: prevent analytics sync spam ──────────────
    const lastSync = analyticsSyncCooldowns.get(clinicId) || 0;
    const elapsed = Date.now() - lastSync;
    if (elapsed < ANALYTICS_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((ANALYTICS_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        {
          error: `Analytics sync is on cooldown. Please try again in ${Math.ceil(secondsLeft / 60)} minute${Math.ceil(secondsLeft / 60) !== 1 ? 's' : ''}.`,
          secondsUntilNext: secondsLeft,
        },
        { status: 429 }
      );
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    // Set cooldown immediately
    analyticsSyncCooldowns.set(clinicId, Date.now());

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
