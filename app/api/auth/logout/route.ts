import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/sessions';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;

  // Remove session from store
  if (sessionId) {
    sessions.delete(sessionId);
  }

  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.cookies.delete('session');
  return response;
}
