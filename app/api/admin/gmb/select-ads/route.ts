import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGoogleAdsData } from '@/lib/google-ads';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const { clinicId, googleAdsCustomerId } = body as {
      clinicId?: string;
      googleAdsCustomerId?: string;
    };

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    const updated = await prisma.gMBConnection.update({
      where: { id: connection.id },
      data: { googleAdsCustomerId: googleAdsCustomerId || null },
    });

    // Auto-sync Google Ads data after saving (non-blocking)
    let syncResult = { synced: 0 };
    if (updated.googleAdsCustomerId && process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      try {
        syncResult = await syncGoogleAdsData(connection.id);
      } catch (err: any) {
        console.error('Google Ads auto-sync error:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      googleAdsCustomerId: updated.googleAdsCustomerId,
      synced: syncResult,
    });
  } catch (error: any) {
    console.error('Select Google Ads error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save Google Ads configuration' }, { status: 500 });
  }
}
