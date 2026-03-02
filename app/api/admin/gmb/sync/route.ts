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

    await syncGmbConnection(connection.id);

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
