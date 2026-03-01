import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sessions } from '@/lib/sessions';

const prisma = new PrismaClient();

// Admin emails – add more as needed
const ADMIN_EMAILS = ['shree@focusyourfinance.com'];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Auto-detect role from email
    const role = isAdminEmail(email) ? 'admin' : 'client';

    // Try to find or create user in database
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: password || 'demo',
            name: email.split('@')[0],
            role,
          },
        });
      }
    } catch (dbError) {
      console.warn('Database error, using session-only auth:', dbError);
      user = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role,
        avatar: null,
        password: 'demo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Create session
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || undefined,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    }, { status: 200 });

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
