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
    // Check if requester is authenticated
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

    // Verify requester is admin
    const adminUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 401 });
    }
    if (adminUser.role !== 'admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only admins can update user roles' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }
    if (role !== 'admin' && role !== 'client') {
      return NextResponse.json({ error: 'role must be either "admin" or "client"' }, { status: 400 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    console.log(`✅ User role updated: ${updatedUser.email} changed from "${targetUser.role}" to "${role}"`);

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatar: updatedUser.avatar || null,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

