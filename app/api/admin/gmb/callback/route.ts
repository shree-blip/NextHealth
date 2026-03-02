import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import {
  parseGmbState,
  exchangeCodeForTokens,
  fetchGoogleEmail,
  upsertOAuthConnection,
} from '@/lib/gmb';

function popupHtml(success: boolean, message: string, clinicId?: string) {
  const payload = success
    ? `{ type: 'GMB_OAUTH_SUCCESS', clinicId: '${clinicId || ''}', message: ${JSON.stringify(message)} }`
    : `{ type: 'GMB_OAUTH_ERROR', message: ${JSON.stringify(message)} }`;

  return `
<!doctype html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.opener.postMessage(${payload}, window.location.origin);
      }
      window.close();
    </script>
    <p>${message}</p>
  </body>
</html>
`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) {
      return new NextResponse(popupHtml(false, 'Authentication failed for admin session.'), {
        status: 401,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const oauthError = req.nextUrl.searchParams.get('error');

    if (oauthError) {
      return new NextResponse(popupHtml(false, `Google OAuth error: ${oauthError}`), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code || !state) {
      return new NextResponse(popupHtml(false, 'Missing OAuth parameters.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const parsedState = parseGmbState(state);
    if (!parsedState?.clinicId) {
      return new NextResponse(popupHtml(false, 'Invalid OAuth state.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: parsedState.clinicId } });
    if (!clinic) {
      return new NextResponse(popupHtml(false, 'Clinic not found.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const tokens = await exchangeCodeForTokens(code);
    const googleEmail = await fetchGoogleEmail(tokens.accessToken);

    await upsertOAuthConnection({
      clinicId: parsedState.clinicId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      googleEmail,
    });

    return new NextResponse(popupHtml(true, 'Google Business Profile connected. Select account and location to finish setup.', parsedState.clinicId), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('GMB callback error:', error);
    return new NextResponse(popupHtml(false, error?.message || 'Failed to finish Google OAuth'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
