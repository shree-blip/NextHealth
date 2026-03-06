import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return secret;
}

const ADMIN_EMAILS = ['shree@focusyourfinance.com'];

function normalizeRole(role?: string) {
  if (role === 'super_admin') return 'super_admin';
  return role === 'admin' ? 'admin' : 'client';
}

function htmlResponse(messageType: 'OAUTH_AUTH_SUCCESS' | 'OAUTH_AUTH_ERROR', payload: Record<string, unknown>) {
  const targetOrigin = APP_URL;
  const message = JSON.stringify({ type: messageType, ...payload });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; }
          .container { text-align: center; }
          .spinner { border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          p { color: #666; margin: 10px 0; }
          button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 20px; }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <p>Connecting your account...</p>
          <p id="status" style="font-size: 14px; color: #999;"></p>
          <button onclick="closeSelf()">Close this window</button>
        </div>
        <script>
          (function () {
            var msg = ${JSON.stringify(message)};
            var parsed = JSON.parse(msg);
            var messageType = ${JSON.stringify(messageType)};
            
            console.log('[OAuth Callback] Message type:', messageType);
            console.log('[OAuth Callback] Attempting postMessage to parent window');
            console.log('[OAuth Callback] targetOrigin:', ${JSON.stringify(targetOrigin)});
            console.log('[OAuth Callback] window.opener:', !!window.opener);
            
            function updateStatus(msg) {
              var statusEl = document.getElementById('status');
              if (statusEl) statusEl.textContent = msg;
            }
            
            function attemptClose() {
              try {
                window.close();
              } catch (e) {
                console.error('[OAuth Callback] window.close() error:', e);
              }
            }
            
            if (window.opener) {
              try {
                // Try postMessage with strict origin matching
                window.opener.postMessage(parsed, ${JSON.stringify(targetOrigin)});
                console.log('[OAuth Callback] postMessage sent to specific origin');
                updateStatus('Connected! You can close this window...');
                
                // Wait a moment to ensure message is received, then close
                setTimeout(function() {
                  attemptClose();
                }, 500);
                
                // Fallback: If message is an error, try again with wildcard origin as a recovery
              } catch (err) {
                console.warn('[OAuth Callback] Strict origin postMessage failed, trying wildcard origin:', err);
                try {
                  window.opener.postMessage(parsed, '*');
                  console.log('[OAuth Callback] postMessage sent with wildcard origin');
                  updateStatus('Connected! You can close this window...');
                  setTimeout(function() {
                    attemptClose();
                  }, 500);
                } catch (err2) {
                  console.error('[OAuth Callback] Both postMessage attempts failed:', err2);
                  updateStatus('Authentication complete. Please close this window.');
                  setTimeout(function() {
                    attemptClose();
                  }, 1000);
                }
              }
            } else {
              console.warn('[OAuth Callback] No window.opener available');
              updateStatus('Authentication complete. Please close this window.');
              // Even without opener, try to close the window
              setTimeout(function() {
                attemptClose();
              }, 1000);
            }
          })();
          
          function closeSelf() {
            window.close();
          }
        </script>
      </body>
    </html>
  `;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const oauthError = req.nextUrl.searchParams.get('error');

  if (oauthError) {
    return new NextResponse(
      htmlResponse('OAUTH_AUTH_ERROR', { error: `Google OAuth error: ${oauthError}` }),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (!code) {
    return new NextResponse(
      htmlResponse('OAUTH_AUTH_ERROR', { error: 'Missing authorization code' }),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new NextResponse(
        htmlResponse('OAUTH_AUTH_ERROR', { error: 'Google OAuth credentials are not configured' }),
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const redirectUri = `${APP_URL}/api/auth/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData?.id_token) {
      throw new Error(tokenData?.error_description || tokenData?.error || 'Failed to exchange OAuth code');
    }

    const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString());
    const email = payload.email as string | undefined;
    const name = (payload.name as string | undefined) || 'Google User';

    if (!email) {
      throw new Error('Google account email is unavailable');
    }

    const inferredRole = ADMIN_EMAILS.includes(email.toLowerCase())
      ? 'admin'
      : 'client';

    const existing = await prisma.user.findUnique({ where: { email } });
    const user = existing
      ? existing
      : await prisma.user.create({
          data: {
            email,
            name,
            role: inferredRole,
            password: `oauth_${Date.now()}`,
          },
        });

    const userRole = normalizeRole(user.role);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: userRole },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const response = new NextResponse(
      htmlResponse('OAUTH_AUTH_SUCCESS', {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userRole,
          avatar: user.avatar || null,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return new NextResponse(
      htmlResponse('OAUTH_AUTH_ERROR', { error: message }),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}