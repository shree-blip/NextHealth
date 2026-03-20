import { NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
    }

    // Generate CSRF-protection state param
    const state = crypto.randomBytes(32).toString('hex');

    const redirectUri = `${APP_URL}/api/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const response = NextResponse.json({ url });
    // Store state in a short-lived httpOnly cookie for callback validation
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Auth URL error:', error);
    return NextResponse.json({ error: 'Failed to get auth URL' }, { status: 500 });
  }
}