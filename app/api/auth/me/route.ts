import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return secret;
}

export async function GET(req: NextRequest) {
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  try {
    // JWT-based auth (works in serverless environments like Vercel)
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, getJwtSecret()) as any;
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
              plan: dbUser.plan || null,
              planId: dbUser.planId || null,
              subscriptionStatus: dbUser.subscriptionStatus || null,
            }, { status: 200, headers: noCacheHeaders });
          }
        } catch (jwtDbError) {
          console.error('JWT DB lookup error:', jwtDbError);
          if (decoded?.id && decoded?.email) {
            return NextResponse.json({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name || decoded.email,
              role: decoded.role === 'super_admin' ? 'admin' : (decoded.role || 'client'),
              avatar: null,
              plan: null,
              planId: null,
              subscriptionStatus: null,
            }, { status: 200, headers: noCacheHeaders });
          }
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
