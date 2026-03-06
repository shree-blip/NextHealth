import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getGmbConnectionByClinic } from '@/lib/gmb';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await getGmbConnectionByClinic(clinicId);

    return NextResponse.json({
      connection: connection
        ? {
            id: connection.id,
            clinicId: connection.clinicId,
            googleEmail: connection.googleEmail,
            connectionStatus: connection.connectionStatus,
            businessAccountId: connection.businessAccountId,
            businessName: connection.businessName,
            businessLocationId: connection.businessLocationId,
            locationName: connection.locationName,
            locationAddress: connection.locationAddress,
            syncStatus: connection.syncStatus,
            lastSyncedAt: connection.lastSyncedAt,
            nextSyncAt: connection.nextSyncAt,
            lastSyncError: connection.lastSyncError,
            ga4PropertyId: connection.ga4PropertyId,
            searchConsoleSite: connection.searchConsoleSite,
            recentData: connection.gmbData,
          }
        : null,
    });
  } catch (error: any) {
    console.error('GMB connection fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch GMB connection' }, { status: 500 });
  }
}
