import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { sessions } from '@/lib/sessions';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export async function getAuthenticatedDbUser(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;

  if (sessionId && sessions.has(sessionId)) {
    const sessionUser = sessions.get(sessionId);
    if (!sessionUser) return null;

    const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    return dbUser;
  }

  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded?.id) return null;

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    return dbUser;
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest): Promise<{ user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedDbUser>>> } | { response: NextResponse }> {
  const user = await getAuthenticatedDbUser(req);

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    };
  }

  if (user.role !== 'admin') {
    return {
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user };
}
