import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/sessions';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;

  // Remove session from store
  if (sessionId) {
    sessions.delete(sessionId);
  }

  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires: new Date(0),
    path: '/',
  };

  response.cookies.set('session', '', cookieOptions);
  response.cookies.set('auth_token', '', cookieOptions);
  response.cookies.set('token', '', cookieOptions);
  response.cookies.delete('session');
  response.cookies.delete('auth_token');
  response.cookies.delete('token');

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
