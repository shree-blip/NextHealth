import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clearGmbCache } from '@/lib/gmb';

export const dynamic = 'force-dynamic';

/**
 * Disconnect a clinic from Google (GMB, GA4, Search Console).
 *
 * 1. Revokes the Google OAuth token (best-effort)
 * 2. Deletes all synced data (GMBData, GA4Data, SearchConsoleData)
 * 3. Removes the GMBConnection record entirely
 * 4. Clears any in-memory caches
 *
 * This immediately stops all future cron syncs for this clinic
 * because the cron job only syncs clinics with a GMBConnection
 * that has connectionStatus='connected' and a refreshToken.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth check ─────────────────────────────────────────────────
    const { requireAdmin } = await import('@/lib/auth');
    const auth = await requireAdmin(request);
    if ('response' in auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId } = body;

    if (!clinicId || typeof clinicId !== 'string') {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    // ── Find existing connection ───────────────────────────────────
    const connection = await prisma.gMBConnection.findUnique({
      where: { clinicId },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        googleEmail: true,
        businessName: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found for this clinic' }, { status: 404 });
    }

    // ── 1. Revoke Google OAuth token (best-effort) ─────────────────
    // Try revoking the refresh token first (revokes all tokens for the grant).
    // Fall back to access token if no refresh token.
    const tokenToRevoke = connection.refreshToken || connection.accessToken;
    let revokeResult = 'skipped';

    if (tokenToRevoke) {
      try {
        const revokeRes = await fetch(
          `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokenToRevoke)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );
        revokeResult = revokeRes.ok ? 'revoked' : `revoke_failed_${revokeRes.status}`;
        if (!revokeRes.ok) {
          console.warn(`[Disconnect] Token revocation returned ${revokeRes.status} for clinic ${clinicId} — continuing with local cleanup`);
        }
      } catch (err: any) {
        revokeResult = 'revoke_error';
        console.warn(`[Disconnect] Token revocation request failed for clinic ${clinicId}:`, err.message);
      }
    }

    // ── 2. Delete all synced Google data for this connection ───────
    const [deletedGmb, deletedGa4, deletedSc] = await Promise.all([
      prisma.gMBData.deleteMany({ where: { gmbConnectionId: connection.id } }),
      prisma.gA4Data.deleteMany({ where: { gmbConnectionId: connection.id } }),
      prisma.searchConsoleData.deleteMany({ where: { gmbConnectionId: connection.id } }),
    ]);

    // ── 3. Delete the GMBConnection record ─────────────────────────
    await prisma.gMBConnection.delete({ where: { clinicId } });

    // ── 4. Clear in-memory caches ──────────────────────────────────
    clearGmbCache(clinicId);

    console.log(
      `[Disconnect] Clinic ${clinicId} disconnected from Google (${connection.googleEmail || 'unknown email'}). ` +
      `Revoke: ${revokeResult}. Deleted: ${deletedGmb.count} GMB, ${deletedGa4.count} GA4, ${deletedSc.count} SC records.`
    );

    return NextResponse.json({
      success: true,
      disconnectedEmail: connection.googleEmail,
      revokeResult,
      deletedData: {
        gmbRecords: deletedGmb.count,
        ga4Records: deletedGa4.count,
        searchConsoleRecords: deletedSc.count,
      },
    });
  } catch (error: any) {
    console.error('[Disconnect] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to disconnect Google account' },
      { status: 500 }
    );
  }
}
