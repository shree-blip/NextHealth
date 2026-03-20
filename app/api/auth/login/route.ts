import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@/lib/password';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return secret;
}

// Admin emails – add more as needed
const ADMIN_EMAILS = ['shree@focusyourfinance.com'];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: rawEmail, password, name: providedName } = body;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase().slice(0, 254);

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Cap password length to prevent bcrypt DoS (72 byte limit anyway)
    if (password.length > 128) {
      return NextResponse.json({ error: 'Password too long' }, { status: 400 });
    }

    // Role is NEVER accepted from the client — always server-determined
    const role: string = isAdminEmail(email) ? 'admin' : 'client';

    // Try to find or create user in database
    let user;
    try {
      // Avoid logging emails in production
      if (process.env.NODE_ENV !== 'production') console.log(`[LOGIN] Attempting login for: ${email}`);
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // No account exists — login endpoint does not auto-create accounts.
        // Users must sign up via the signup page or OAuth.
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      } else {
        console.log(`[LOGIN] User found: ${user.id}, verifying password`);
        // User exists — verify password (supports both bcrypt and legacy plaintext)
        const passwordValid = await verifyPassword(password, user.password || '');
        if (!passwordValid) {
          console.log(`[LOGIN] Invalid password for: ${email}`);
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        console.log(`[LOGIN] Password verified successfully`);

        // Auto-upgrade legacy plaintext passwords to bcrypt
        if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const upgraded = await hashPassword(password);
          await prisma.user.update({ where: { id: user.id }, data: { password: upgraded } });
          console.log(`[LOGIN] Password upgraded to bcrypt for: ${email}`);
        }
      }
    } catch (dbError) {
      console.error('[LOGIN] Database error during login:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.'
      }, { status: 500 });
    }

    const uiRole = user.role === 'super_admin' ? 'admin' : user.role;

    // Create JWT token (works in serverless environments like Vercel)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: uiRole },
      getJwtSecret(),
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
