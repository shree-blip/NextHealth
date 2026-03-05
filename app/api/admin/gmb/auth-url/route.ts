import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

/**
 * Endpoint to generate GMB OAuth URL without redirecting.
 * Returns JSON with auth URL that can be opened in a popup window.
 * Useful for client-side OAuth flow handling.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const clinicId = req.nextUrl.searchParams.get('clinicId');
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId is required' },
        { status: 400 }
      );
    }

    // Import here to avoid module resolution issues
    const { getGmbOAuthUrl } = await import('@/lib/gmb');

    const authUrl = getGmbOAuthUrl(clinicId);

    // Return the URL for client-side handling
    return NextResponse.json({
      authUrl,
      popup: {
        width: 600,
        height: 700,
        features: 'toolbar=no,scrollbars=yes,resizable=yes',
      },
    });
  } catch (error: any) {
    console.error('[GMB Auth URL] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate GMB auth URL',
      },
      { status: 500 }
    );
  }
}
