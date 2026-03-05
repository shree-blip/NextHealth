import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@/lib/password';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return secret;
}

async function getAuthenticatedUser(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id?: string };
      if (!decoded?.id) return null;

      const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!dbUser) return null;

      return { dbUser };
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * GET — returns whether the user has a password set (never returns the actual password).
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      hasPassword: !!auth.dbUser.password,
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

    // Verify current password using bcrypt-aware comparison
    const currentValid = await verifyPassword(currentPassword, auth.dbUser.password || '');
    if (!currentValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match' }, { status: 400 });
    }

    try {
      const hashed = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: auth.dbUser.id },
        data: { password: hashed },
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json({ error: 'Failed to update password in database' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
