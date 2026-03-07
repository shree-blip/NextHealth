import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { syncGmbConnection } from '@/lib/gmb';

const GBP_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between GBP syncs

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
      return NextResponse.json({ error: 'No GMB connection found for this clinic' }, { status: 404 });
    }

    // ── DB-based cooldown using lastSyncedAt (survives deploys) ──────
    if (connection.lastSyncedAt) {
      const elapsed = Date.now() - connection.lastSyncedAt.getTime();
      if (elapsed < GBP_COOLDOWN_MS) {
        const secondsLeft = Math.ceil((GBP_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Sync is on cooldown. Please try again in ${Math.ceil(secondsLeft / 60)} minute${Math.ceil(secondsLeft / 60) !== 1 ? 's' : ''}.`,
            secondsUntilNext: secondsLeft,
            cooldown: true,
          },
          { status: 429 }
        );
      }
    }

    await syncGmbConnection(connection.id);

    // Update lastSyncedAt for cooldown tracking
    await prisma.gMBConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() },
    });

    const refreshed = await prisma.gMBConnection.findUnique({ where: { id: connection.id } });

    return NextResponse.json({
      success: true,
      connection: refreshed,
    });
  } catch (error: any) {
    console.error('GMB manual sync error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync GMB data' }, { status: 500 });
  }
}
