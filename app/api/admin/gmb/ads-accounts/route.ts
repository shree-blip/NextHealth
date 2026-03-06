import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { listGoogleAdsAccounts } from '@/lib/google-ads';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      return NextResponse.json({
        accounts: [],
        warning: 'Google Ads developer token not configured. Add GOOGLE_ADS_DEVELOPER_TOKEN to environment variables.',
      });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    const accounts = await listGoogleAdsAccounts(connection.id);
    return NextResponse.json({
      accounts,
      selectedCustomerId: connection.googleAdsCustomerId,
    });
  } catch (error: any) {
    console.error('Google Ads accounts error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to list Google Ads accounts' }, { status: 500 });
  }
}
