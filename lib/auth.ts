import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set. Refusing to start with insecure defaults.');
  }
  return secret;
}

export function hasAdminAccess(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export async function getAuthenticatedDbUser(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id?: string };
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

  if (!hasAdminAccess(user.role)) {
    return {
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user };
}
