import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/sessions';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export async function GET(req: NextRequest) {
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  try {
    // First try session-based auth (in-memory)
    const sessionId = req.cookies.get('session')?.value;
    if (sessionId && sessions.has(sessionId)) {
      const sessionUser = sessions.get(sessionId);
      if (sessionUser?.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
          if (dbUser) {
            return NextResponse.json({
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role === 'super_admin' ? 'admin' : dbUser.role,
              avatar: dbUser.avatar || null,
            }, { status: 200, headers: noCacheHeaders });
          }
        } catch (sessionDbError) {
          console.error('Session DB lookup error:', sessionDbError);
          // Fall through to JWT auth or 401
        }
      }
    }

    // Fallback to JWT-based auth (from Express server)
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // Look up user in database
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
          if (dbUser) {
            return NextResponse.json({
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role === 'super_admin' ? 'admin' : dbUser.role,
              avatar: dbUser.avatar || null,
            }, { status: 200, headers: noCacheHeaders });
          }
        } catch (jwtDbError) {
          console.error('JWT DB lookup error:', jwtDbError);
          // Fall through to 401
        }
      } catch (jwtError) {
        // Invalid JWT, fall through to 401
      }
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: noCacheHeaders });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500, headers: noCacheHeaders });
  }
}
