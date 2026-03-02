import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sessions } from '@/lib/sessions';

// Admin emails – add more as needed
const ADMIN_EMAILS = ['shree@focusyourfinance.com'];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name: providedName, role: providedRole } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Auto-detect role from email if not explicitly provided
    const role = providedRole || (isAdminEmail(email) ? 'admin' : 'client');

    // Try to find or create user in database
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // No account exists — only auto-create if signing up (role explicitly provided)
        if (providedRole) {
          user = await prisma.user.create({
            data: {
              email,
              password: password,
              name: providedName || email.split('@')[0],
              role,
            },
          });
        } else {
          return NextResponse.json({ error: 'No account found with this email. Please contact your administrator.' }, { status: 401 });
        }
      } else {
        // User exists — verify password
        if (user.password !== password) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
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
