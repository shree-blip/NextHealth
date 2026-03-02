import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listGmbLocations } from '@/lib/gmb';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const accountName = req.nextUrl.searchParams.get('accountName');

    if (!clinicId || !accountName) {
      return NextResponse.json({ error: 'clinicId and accountName are required' }, { status: 400 });
    }

    const locations = await listGmbLocations(clinicId, accountName);
    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error('GMB locations error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load locations' }, { status: 500 });
  }
}
