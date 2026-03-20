import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware — applies to ALL requests.
 *
 * 1. Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. In-memory rate limiting for sensitive API routes
 */

// ── Simple in-memory rate limiter ─────────────────────────────────────
// In production with multiple instances, replace with Redis / Upstash.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) return true;
  return false;
}

// Periodically clean up expired entries (every 60 s)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 60_000);
}

// ── Rate-limit tiers (path prefix → { limit, windowMs }) ─────────────
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login':           { limit: 10,  windowMs: 15 * 60 * 1000 }, // 10 req / 15 min
  '/api/auth/callback':        { limit: 10,  windowMs: 15 * 60 * 1000 },
  '/api/auth/password':        { limit: 5,   windowMs: 15 * 60 * 1000 }, // 5 / 15 min
  '/api/auth/token-login':     { limit: 5,   windowMs: 15 * 60 * 1000 },
  '/api/auth/update-role':     { limit: 5,   windowMs: 60 * 1000 },
  '/api/contact-lead':         { limit: 5,   windowMs: 60 * 1000 },      // 5 / min
  '/api/newsletter':           { limit: 5,   windowMs: 60 * 1000 },
  '/api/chat':                 { limit: 20,  windowMs: 60 * 1000 },      // 20 / min
  '/api/ai/':                  { limit: 10,  windowMs: 60 * 1000 },      // 10 / min (all AI)
  '/api/upload/':              { limit: 10,  windowMs: 60 * 1000 },
  '/api/revalidate-sitemap':   { limit: 5,   windowMs: 60 * 1000 },
};

function getRateLimit(pathname: string) {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return config;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting (API routes only) ──────────────────────────────
  if (pathname.startsWith('/api/')) {
    const rl = getRateLimit(pathname);
    if (rl) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const key = `${ip}:${pathname}`;

      if (isRateLimited(key, rl.limit, rl.windowMs)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }
  }

  const response = NextResponse.next();

  // ── Security headers ─────────────────────────────────────────────
  // Content-Security-Policy — primary XSS defence
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://api.stripe.com https://www.google-analytics.com https://region1.google-analytics.com https://*.vercel.app wss:",
      "frame-src 'self' https://accounts.google.com https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Prevent click-jacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS built-in browser filter
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy – send origin only cross-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy – restrict powerful browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // HSTS – enforce HTTPS (1 year, include subdomains)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// Apply to all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/).*)'],
};
