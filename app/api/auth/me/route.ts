import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/sessions';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session')?.value;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = sessions.get(sessionId);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
