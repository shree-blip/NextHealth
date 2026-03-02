import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/sessions';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export async function GET(req: NextRequest) {
  try {
    // First try session-based auth (in-memory)
    const sessionId = req.cookies.get('session')?.value;
    if (sessionId && sessions.has(sessionId)) {
      const user = sessions.get(sessionId);
      return NextResponse.json(user, { status: 200 });
    }

    // Fallback to JWT-based auth (from Express server)
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // Look up user in database
        const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (dbUser) {
          return NextResponse.json({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            avatar: dbUser.avatar || null,
          }, { status: 200 });
        }
      } catch (jwtError) {
        // Invalid JWT, fall through to 401
      }
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
