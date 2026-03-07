import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';
import { syncGoogleAdsData } from '@/lib/google-ads';

const ANALYTICS_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between analytics syncs

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

    // ── DB-based cooldown (survives deploys/restarts) ──────────────
    if (connection.lastSyncedAt) {
      const elapsed = Date.now() - connection.lastSyncedAt.getTime();
      if (elapsed < ANALYTICS_COOLDOWN_MS) {
        const secondsLeft = Math.ceil((ANALYTICS_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Analytics sync is on cooldown. Please try again in ${Math.ceil(secondsLeft / 60)} minute${Math.ceil(secondsLeft / 60) !== 1 ? 's' : ''}.`,
            secondsUntilNext: secondsLeft,
            cooldown: true,
          },
          { status: 429 }
        );
      }
    }

    // Mark as syncing
    await prisma.gMBConnection.update({
      where: { id: connection.id },
      data: { syncStatus: 'syncing' },
    });

    const results: Record<string, any> = {
      ga4: { synced: 0, error: null },
      searchConsole: { synced: 0, error: null },
      googleAds: { synced: 0, error: null },
    };
    const errors: string[] = [];

    // Run syncs in parallel with individual error isolation
    const syncTasks: Promise<void>[] = [];

    if (connection.ga4PropertyId) {
      syncTasks.push(
        syncGA4Data(connection.id)
          .then(r => { results.ga4 = { synced: r.synced, error: null }; })
          .catch(e => { results.ga4.error = e.message; errors.push(`GA4: ${e.message}`); })
      );
    }
    if (connection.searchConsoleSite) {
      syncTasks.push(
        syncSearchConsoleData(connection.id)
          .then(r => { results.searchConsole = { synced: r.synced, error: null }; })
          .catch(e => { results.searchConsole.error = e.message; errors.push(`SC: ${e.message}`); })
      );
    }
    if (connection.googleAdsCustomerId) {
      syncTasks.push(
        syncGoogleAdsData(connection.id)
          .then(r => { results.googleAds = { synced: r.synced, error: null }; })
          .catch(e => { results.googleAds.error = e.message; errors.push(`Ads: ${e.message}`); })
      );
    }

    await Promise.allSettled(syncTasks);

    // Update lastSyncedAt regardless of partial failures
    await prisma.gMBConnection.update({
      where: { id: connection.id },
      data: {
        lastSyncedAt: new Date(),
        syncStatus: errors.length > 0 ? 'error' : 'idle',
        lastSyncError: errors.length > 0 ? errors.join('; ') : null,
      },
    });

    const totalSynced = (results.ga4.synced || 0) + (results.searchConsole.synced || 0) + (results.googleAds.synced || 0);

    return NextResponse.json({
      success: errors.length === 0,
      partial: errors.length > 0 && totalSynced > 0,
      ...results,
      errors: errors.length > 0 ? errors : undefined,
      totalSynced,
    });
  } catch (error: any) {
    console.error('Analytics sync error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync analytics data' }, { status: 500 });
  }
}
