import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { selectGmbLocation, syncGmbConnection } from '@/lib/gmb';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json();
    const clinicId = body?.clinicId as string | undefined;
    const accountName = body?.accountName as string | undefined;
    const locationName = body?.locationName as string | undefined;

    if (!clinicId || !accountName || !locationName) {
      return NextResponse.json({ error: 'clinicId, accountName, and locationName are required' }, { status: 400 });
    }

    const connection = await selectGmbLocation({ clinicId, accountName, locationName });

    try {
      await syncGmbConnection(connection.id);
    } catch (syncError: any) {
      return NextResponse.json({
        connection,
        warning: syncError?.message || 'Connected, but initial sync failed',
      });
    }

    return NextResponse.json({ connection });
  } catch (error: any) {
    console.error('GMB select location error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save GMB location' }, { status: 500 });
  }
}
