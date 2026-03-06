import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listGmbAccounts } from '@/lib/gmb';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const { connection, accounts } = await listGmbAccounts(clinicId);

    return NextResponse.json({
      accounts,
      selectedAccountId: connection.businessAccountId,
      selectedLocationId: connection.businessLocationId,
    });
  } catch (error: any) {
    console.error('GMB accounts error:', error);
    const msg = error?.message || 'Failed to load GMB accounts';
    const isQuota = msg.toLowerCase().includes('quota');
    return NextResponse.json(
      { error: isQuota ? 'Google API rate limit reached. Please wait a few minutes and try again.' : msg },
      { status: isQuota ? 429 : 500 }
    );
  }
}
