import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import {
  parseGmbState,
  exchangeCodeForTokens,
  fetchGoogleEmail,
  upsertOAuthConnection,
  clearGmbCache,
} from '@/lib/gmb';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function popupHtml(success: boolean, message: string, clinicId?: string) {
  const payload = success
    ? `{ type: 'gmb_auth_complete', success: true, clinicId: '${clinicId || ''}', message: ${JSON.stringify(message)} }`
    : `{ type: 'gmb_auth_complete', success: false, message: ${JSON.stringify(message)} }`;

  return `
<!doctype html>
<html>
  <head>
    <title>Connecting Google Business Profile...</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto Oxide', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5;">
    <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 400px;">
      <p style="font-size: 16px; color: #333; margin-bottom: 10px;"><strong>${success ? '✓ Connected!' : '✗ Connection Failed'}</strong></p>
      <p style="font-size: 14px; color: #666; margin: 0;">${message}</p>
    </div>
    <script>
      const appUrl = ${JSON.stringify(APP_URL)};
      // Try postMessage first (works when window.opener is available)
      if (window.opener) {
        try {
          window.opener.postMessage(${payload}, window.location.origin);
        } catch (e) {
          console.warn('postMessage to opener failed:', e);
        }
      }
      // Always write to localStorage as fallback (works cross-origin navigation)
      try {
        localStorage.setItem('gmb_oauth_result', JSON.stringify(${payload}));
      } catch (e) {
        console.warn('localStorage fallback failed:', e);
      }
      // If there is no opener (same-tab fallback), redirect user back to admin dashboard
      // with query params so the page auto-opens the clinic modal with success state.
      if (!window.opener) {
        const payload = ${payload};
        const params = new URLSearchParams({ view: 'command-center' });
        params.set('gmb_oauth', payload.success ? 'success' : 'error');
        if (payload.clinicId) params.set('gmb_clinic', payload.clinicId);
        if (payload.message) params.set('gmb_msg', payload.message);
        const redirectUrl = ${JSON.stringify(APP_URL)} + '/dashboard/admin?' + params.toString();
        setTimeout(() => window.location.replace(redirectUrl), 600);
      }
      // Close popup after 1.5 seconds
      setTimeout(() => window.close(), 1500);
    </script>
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

    // Clear cached API responses so fresh data is fetched
    await clearGmbCache(parsedState.clinicId);

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
