import { NextResponse } from 'next/server';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
    }

    const redirectUri = `${APP_URL}/api/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Auth URL error:', error);
    return NextResponse.json({ error: 'Failed to get auth URL' }, { status: 500 });
  }
}