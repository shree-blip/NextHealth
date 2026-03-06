import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncGmbConnection } from '@/lib/gmb';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — may need to sync many clinics

/**
 * Google Data Sync Cron Job
 *
 * Runs every 24 hours (schedule configured in vercel.json).
 * Syncs GMB, GA4, and Search Console data for every clinic
 * that has a connected Google account with a refresh token.
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
      },
    });

    console.log(`[CRON:google-sync] Starting sync for ${connections.length} connected clinics`);

    const results: {
      clinicId: string;
      gmb: { synced: number } | { error: string };
      ga4: { synced: number } | { error: string };
      sc: { synced: number } | { error: string };
    }[] = [];

    for (const conn of connections) {
      const entry: (typeof results)[number] = {
        clinicId: conn.clinicId,
        gmb: { synced: 0 },
        ga4: { synced: 0 },
        sc: { synced: 0 },
      };

      // Mark syncing
      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: { syncStatus: 'syncing', lastSyncError: null },
      }).catch(() => {});

      // ── GMB sync ────────────────────────────────────────────────────
      if (conn.businessLocationId) {
        try {
          await syncGmbConnection(conn.id);
          entry.gmb = { synced: 1 };
        } catch (err: any) {
          console.error(`[CRON:google-sync] GMB sync failed for clinic ${conn.clinicId}:`, err.message);
          entry.gmb = { error: err.message };
        }
      }

      // ── GA4 sync ────────────────────────────────────────────────────
      if (conn.ga4PropertyId) {
        try {
          entry.ga4 = await syncGA4Data(conn.id, 90);
        } catch (err: any) {
          console.error(`[CRON:google-sync] GA4 sync failed for clinic ${conn.clinicId}:`, err.message);
          entry.ga4 = { error: err.message };
        }
      }

      // ── Search Console sync ─────────────────────────────────────────
      if (conn.searchConsoleSite) {
        try {
          entry.sc = await syncSearchConsoleData(conn.id, 90);
        } catch (err: any) {
          console.error(`[CRON:google-sync] SC sync failed for clinic ${conn.clinicId}:`, err.message);
          entry.sc = { error: err.message };
        }
      }

      // Update sync timestamps
      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: {
          lastSyncedAt: new Date(),
          nextSyncAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // next sync in 24h
          syncStatus: 'idle',
        },
      }).catch(() => {});

      results.push(entry);
    }

    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[CRON:google-sync] Finished in ${elapsed}s — ${results.length} clinics synced`);

    return NextResponse.json({
      success: true,
      clinicsSynced: results.length,
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
