import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

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
      console.log(`[LOGIN] Attempting login for: ${email}`);
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        console.log(`[LOGIN] User not found: ${email}`);
        // No account exists — only auto-create if signing up (role explicitly provided)
        if (providedRole) {
          console.log(`[LOGIN] Creating new user: ${email} with role: ${role}`);
          user = await prisma.user.create({
            data: {
              email,
              password: password,
              name: providedName || email.split('@')[0],
              role,
            },
          });
          console.log(`[LOGIN] User created successfully: ${user.id}`);
        } else {
          console.log(`[LOGIN] No providedRole, returning no account error`);
          return NextResponse.json({ error: 'No account found with this email. Please contact your administrator.' }, { status: 401 });
        }
      } else {
        console.log(`[LOGIN] User found: ${user.id}, verifying password`);
        // User exists — verify password
        if (user.password !== password) {
          console.log(`[LOGIN] Invalid password for: ${email}`);
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
        console.log(`[LOGIN] Password verified successfully`);
      }
    } catch (dbError) {
      console.error('[LOGIN] Database error during login:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      }, { status: 500 });
    }

    const uiRole = user.role === 'super_admin' ? 'admin' : user.role;

    // Create JWT token (works in serverless environments like Vercel)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: uiRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: uiRole,
        avatar: user.avatar,
      },
    }, { status: 200 });

    response.cookies.set('auth_token', token, {
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
