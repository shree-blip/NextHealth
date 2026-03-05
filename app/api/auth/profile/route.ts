import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return secret;
}

export async function PATCH(req: NextRequest) {
  try {
    // JWT-based auth (works in serverless)
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, avatar } = body;

    // Validate inputs
    if (!name && !avatar && avatar !== undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update user in database
    try {
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
        },
      });

      return NextResponse.json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
