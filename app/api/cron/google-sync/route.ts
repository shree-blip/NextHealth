import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncGmbConnection } from '@/lib/gmb';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';
import { syncGoogleAdsData } from '@/lib/google-ads';
import { runSyncWorker } from '@/lib/google-api-core';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — may need to sync many clinics

/**
 * Google Data Sync Cron Job
 *
 * Runs every 24 hours (schedule configured in vercel.json).
 * Syncs GMB, GA4, Search Console, and Google Ads data for every
 * clinic that has a connected Google account with a refresh token.
 *
 * Uses runSyncWorker from google-api-core.ts for concurrency-controlled
 * processing (max 3 clinics synced in parallel) to stay within rate limits.
 *
 * Security: Protected by CRON_SECRET header verification.
 */
export async function GET(request: Request) {
  const started = Date.now();

  try {
    // ── Verify cron secret (Vercel sends this automatically) ──────────
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Find all connected clinics with a refresh token ───────────────
    const connections = await prisma.gMBConnection.findMany({
      where: {
        connectionStatus: 'connected',
        refreshToken: { not: null },
      },
      select: {
        id: true,
        clinicId: true,
        businessLocationId: true,
        ga4PropertyId: true,
        searchConsoleSite: true,
        googleAdsCustomerId: true,
      },
    });

    console.log(`[CRON:google-sync] Starting sync for ${connections.length} connected clinics`);

    // ── Build task list for each clinic ─────────────────────────────
    const tasks: { connectionId: string; clinicId: string; type: 'gmb' | 'ga4' | 'search_console' | 'google_ads' }[] = [];

    for (const conn of connections) {
      if (conn.businessLocationId) {
        tasks.push({ connectionId: conn.id, clinicId: conn.clinicId, type: 'gmb' });
      }
      if (conn.ga4PropertyId) {
        tasks.push({ connectionId: conn.id, clinicId: conn.clinicId, type: 'ga4' });
      }
      if (conn.searchConsoleSite) {
        tasks.push({ connectionId: conn.id, clinicId: conn.clinicId, type: 'search_console' });
      }
      if (conn.googleAdsCustomerId) {
        tasks.push({ connectionId: conn.id, clinicId: conn.clinicId, type: 'google_ads' });
      }

      // Mark syncing
      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: { syncStatus: 'syncing', lastSyncError: null },
      }).catch(() => {});
    }

    console.log(`[CRON:google-sync] ${tasks.length} sync tasks queued (max 3 concurrent)`);

    // ── Execute with concurrency-controlled worker pool ──────────────
    const workerResults = await runSyncWorker(tasks, async (task) => {
      switch (task.type) {
        case 'gmb': {
          const cronNextSync = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await syncGmbConnection(task.connectionId, cronNextSync);
          return { synced: 1 };
        }
        case 'ga4':
          return await syncGA4Data(task.connectionId, 90);
        case 'search_console':
          return await syncSearchConsoleData(task.connectionId, 90);
        case 'google_ads':
          return await syncGoogleAdsData(task.connectionId, 90);
      }
    }, 3); // Max 3 concurrent sync tasks

    // ── Aggregate results by clinic ──────────────────────────────────
    const clinicResults = new Map<string, {
      clinicId: string;
      gmb: { synced: number } | { error: string };
      ga4: { synced: number } | { error: string };
      sc: { synced: number } | { error: string };
      ads: { synced: number } | { error: string };
    }>();

    for (const r of workerResults) {
      if (!clinicResults.has(r.clinicId)) {
        clinicResults.set(r.clinicId, {
          clinicId: r.clinicId,
          gmb: { synced: 0 },
          ga4: { synced: 0 },
          sc: { synced: 0 },
          ads: { synced: 0 },
        });
      }
      const entry = clinicResults.get(r.clinicId)!;
      const resultData = r.error ? { error: r.error } : (r.result || { synced: 0 });

      switch (r.type) {
        case 'gmb': entry.gmb = resultData; break;
        case 'ga4': entry.ga4 = resultData; break;
        case 'search_console': entry.sc = resultData; break;
        case 'google_ads': entry.ads = resultData; break;
      }
    }

    // ── Update sync timestamps for all connections ───────────────────
    for (const conn of connections) {
      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: {
          lastSyncedAt: new Date(),
          syncStatus: 'idle',
        },
      }).catch(() => {});
    }

    const results = Array.from(clinicResults.values());
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[CRON:google-sync] Finished in ${elapsed}s — ${results.length} clinics, ${tasks.length} tasks`);

    return NextResponse.json({
      success: true,
      clinicsSynced: results.length,
      totalTasks: tasks.length,
      elapsedSeconds: parseFloat(elapsed),
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.error(`[CRON:google-sync] Cron job failed after ${elapsed}s:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Google sync cron failed',
        elapsedSeconds: parseFloat(elapsed),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
