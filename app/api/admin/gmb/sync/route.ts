import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { syncGmbConnection } from '@/lib/gmb';

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

    // ── Cooldown check: prevent sync spam (30-minute cooldown) ──────
    const now = new Date();
    if (connection.nextSyncAt && connection.nextSyncAt > now) {
      const secondsUntilNext = Math.ceil((connection.nextSyncAt.getTime() - now.getTime()) / 1000);
      return NextResponse.json(
        {
          error: `Sync is on cooldown. Please try again in ${Math.ceil(secondsUntilNext / 60)} minute${Math.ceil(secondsUntilNext / 60) !== 1 ? 's' : ''}.`,
          nextSyncAt: connection.nextSyncAt.toISOString(),
          secondsUntilNext,
        },
        { status: 429 }
      );
    }

    // ── Schedule next sync 30 minutes from now ────────────────────────
    const nextSyncAt = new Date(now.getTime() + 30 * 60_000);

    await syncGmbConnection(connection.id, nextSyncAt);

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
