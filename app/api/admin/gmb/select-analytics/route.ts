import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const { clinicId, ga4PropertyId, searchConsoleSite } = body as {
      clinicId?: string;
      ga4PropertyId?: string;
      searchConsoleSite?: string;
    };

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    const updateData: Record<string, string | null> = {};
    if (ga4PropertyId !== undefined) updateData.ga4PropertyId = ga4PropertyId || null;
    if (searchConsoleSite !== undefined) updateData.searchConsoleSite = searchConsoleSite || null;

    const updated = await prisma.gMBConnection.update({
      where: { id: connection.id },
      data: updateData,
    });

    // Auto-sync data after saving configuration (non-blocking)
    const syncResults = { ga4: { synced: 0 }, searchConsole: { synced: 0 } };
    try {
      const syncPromises: Promise<any>[] = [];
      if (updated.ga4PropertyId) {
        syncPromises.push(
          syncGA4Data(connection.id)
            .then(r => { syncResults.ga4 = r; })
            .catch(err => console.error('GA4 auto-sync error:', err.message))
        );
      }
      if (updated.searchConsoleSite) {
        syncPromises.push(
          syncSearchConsoleData(connection.id)
            .then(r => { syncResults.searchConsole = r; })
            .catch(err => console.error('SC auto-sync error:', err.message))
        );
      }
      if (syncPromises.length > 0) {
        await Promise.allSettled(syncPromises);
        await prisma.gMBConnection.update({
          where: { id: connection.id },
          data: { lastSyncedAt: new Date(), syncStatus: 'idle' },
        });
      }
    } catch (err) {
      console.error('Auto-sync after select-analytics failed:', err);
    }

    return NextResponse.json({
      success: true,
      ga4PropertyId: updated.ga4PropertyId,
      searchConsoleSite: updated.searchConsoleSite,
      synced: syncResults,
    });
  } catch (error: any) {
    console.error('Select analytics sources error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save analytics sources' }, { status: 500 });
  }
}
