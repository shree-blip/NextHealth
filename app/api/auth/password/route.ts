import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sessions } from '@/lib/sessions';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

async function getAuthenticatedUser(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session')?.value;

    if (sessionId && sessions.has(sessionId)) {
      const sessionUser = sessions.get(sessionId);
      if (!sessionUser) return null;

      try {
        const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
        if (!dbUser) return null;

        return { dbUser, sessionId };
      } catch (sessionDbError) {
        console.error('Session DB error:', sessionDbError);
        return null;
      }
    }

    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
        if (!decoded?.id) return null;

        try {
          const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
          if (!dbUser) return null;

          return { dbUser, sessionId: null };
        } catch (jwtDbError) {
          console.error('JWT DB error:', jwtDbError);
          return null;
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      currentPassword: auth.dbUser.password,
      role: auth.dbUser.role,
    });
  } catch (error) {
    console.error('Get password settings error:', error);
    return NextResponse.json({ error: 'Failed to load password settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
    }

    if (auth.dbUser.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match' }, { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: auth.dbUser.id },
        data: { password: newPassword },
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json({ error: 'Failed to update password in database' }, { status: 500 });
    }

    if (auth.sessionId && sessions.has(auth.sessionId)) {
      const currentSession = sessions.get(auth.sessionId);
      if (currentSession) {
        sessions.set(auth.sessionId, {
          ...currentSession,
          name: auth.dbUser.name,
          avatar: auth.dbUser.avatar || undefined,
          role: auth.dbUser.role,
        });
      }
    }

    return NextResponse.json({
      message: 'Password updated successfully',
      currentPassword: newPassword,
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
