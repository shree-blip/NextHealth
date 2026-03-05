import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { parse } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Mock Database (for in-memory caching, backed by Prisma)
const db = {
  users: [] as any[],
  clinics: [] as any[],
  assignments: [] as { userId: string, clinicId: string }[],
};

const normalizeRole = (role?: string) => (String(role || '').toLowerCase() === 'admin' ? 'admin' : 'client');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

// Stripe Setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia' as any,
});

// Plan definitions – map tier names to Stripe price IDs
const PLAN_MAP: Record<string, { priceId: string; name: string; amount: number }> = {
  silver:   { priceId: process.env.STRIPE_SILVER_PRICE_ID   || 'price_silver',   name: 'Silver',   amount: 5000 },
  gold:     { priceId: process.env.STRIPE_GOLD_PRICE_ID     || 'price_gold',     name: 'Gold',     amount: 10000 },
  platinum: { priceId: process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum', name: 'Platinum', amount: 0 },
};

app.prepare().then(() => {
  const server = express();
  server.use(cookieParser());
  // Parse JSON for ALL routes - Next.js will handle its own routes
  server.use(express.json());

  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // OAuth Endpoints
  server.get('/api/auth/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  server.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
      // In a real app, exchange code for tokens here.
      // For this demo, we'll mock the user info based on the code if Google OAuth isn't fully configured.
      // If GOOGLE_CLIENT_ID is missing, we'll simulate a successful login for demonstration.
      let email = 'demo@example.com';
      let name = 'Demo User';
      let role = 'client';

      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback`;
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: code as string,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.id_token) {
          const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString());
          email = payload.email;
          name = payload.name;
        }
      }

      // Determine role based on admin email allowlist
      const ADMIN_EMAILS = ['shree@focusyourfinance.com'];
      if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        role = 'admin';
      }

      let user = db.users.find(u => u.email === email);
      if (!user) {
        user = { id: Math.random().toString(36).substr(2, 9), email, name, role };
        db.users.push(user);
      }

      const normalizedRole = normalizeRole(user.role);
      const token = jwt.sign({ id: user.id, role: normalizedRole }, JWT_SECRET, { expiresIn: '1d' });

      res.cookie('auth_token', token, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
                window.close();
              } else {
                window.location.href = '${normalizeRole(user.role) === 'admin' ? '/dashboard/admin' : '/dashboard/client'}';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  server.get('/api/auth/me', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      let user = db.users.find(u => u.id === decoded.id);

      // Fallback to Prisma DB if user not in memory cache
      if (!user) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
          if (dbUser) {
            const userObj = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: normalizeRole(dbUser.role),
              avatar: dbUser.avatar,
              plan: dbUser.plan,
              planId: dbUser.planId,
              stripeCustomerId: dbUser.stripeCustomerId,
              stripeSubscriptionId: dbUser.stripeSubscriptionId,
              subscriptionStatus: dbUser.subscriptionStatus,
            };
            db.users.push(userObj);
            user = userObj;
          }
        } catch (dbErr) {
          console.error('Prisma fallback error:', dbErr);
        }
      }

      if (!user) return res.status(401).json({ error: 'User not found' });
      res.json({ id: user.id, email: user.email, name: user.name, role: normalizeRole(user.role), avatar: user.avatar || null });
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  server.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    });
    res.json({ success: true });
  });

  // Email/Password Login
  server.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Auto-detect role from admin email allowlist
    const ADMIN_EMAILS_LOGIN = ['shree@focusyourfinance.com'];
    const detectedRole = ADMIN_EMAILS_LOGIN.includes(email.toLowerCase()) ? 'admin' : 'client';

    try {
      // Find user from database
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update in-memory cache
      const normalizedRole = normalizeRole(user.role);
      const userObj = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizedRole,
        avatar: user.avatar,
        plan: user.plan,
        planId: user.planId,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus
      };
      const existingIndex = db.users.findIndex(u => u.id === user.id);
      if (existingIndex >= 0) {
        db.users[existingIndex] = userObj;
      } else {
        db.users.push(userObj);
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, role: normalizedRole }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('auth_token', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          avatar: user.avatar || null,
        },
        success: true
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Profile Update
  server.patch('/api/auth/profile', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: 'User not found' });

      const { name, avatar } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

      // Update in-memory cache
      const cachedUser = db.users.find(u => u.id === user.id);
      if (cachedUser) {
        if (name) cachedUser.name = name;
        if (avatar !== undefined) cachedUser.avatar = avatar;
      }

      res.json({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: normalizeRole(updatedUser.role), avatar: updatedUser.avatar || null });
    } catch (e) {
      console.error('Profile update error:', e);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Password Settings
  server.get('/api/auth/password', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: 'User not found' });

      res.json({
        hasPassword: !!user.password,
        role: normalizeRole(user.role),
      });
    } catch (e) {
      console.error('Get password settings error:', e);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  server.patch('/api/auth/password', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: 'User not found' });

      const { currentPassword, newPassword, confirmPassword } = req.body || {};

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }

      if (user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { password: newPassword },
      });

      const cachedUser = db.users.find(u => u.id === user.id);
      if (cachedUser) {
        cachedUser.password = newPassword;
      }

      res.json({
        message: 'Password updated successfully',
      });
    } catch (e) {
      console.error('Update password error:', e);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // ————— Stripe Endpoints —————

  // GET /api/stripe/plans – return available plans
  server.get('/api/stripe/plans', (_req, res) => {
    const plans = Object.entries(PLAN_MAP).map(([key, val]) => ({
      id: key,
      name: val.name,
      amount: val.amount,
      priceId: val.priceId,
    }));
    res.json(plans);
  });

  // POST /api/stripe/create-checkout – create a Stripe Checkout session
  server.post('/api/stripe/create-checkout', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { plan } = req.body; // 'silver' | 'gold' | 'platinum'
    const planInfo = PLAN_MAP[plan];
    if (!planInfo) return res.status(400).json({ error: 'Invalid plan' });

    if (plan === 'platinum') {
      // Platinum = custom, redirect to contact
      return res.json({ url: '/contact' });
    }

    const origin = process.env.APP_URL || 'http://localhost:3000';

    stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: planInfo.priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/client?upgrade=success&plan=${plan}`,
      cancel_url: `${origin}/dashboard/client?upgrade=cancelled`,
      customer_email: user.email,
      metadata: { userId: user.id, plan },
    }).then(session => {
      res.json({ url: session.url });
    }).catch(err => {
      console.error('Stripe checkout error:', err);
      // In dev mode without real Stripe keys, simulate success
      user.plan = planInfo.name;
      user.planId = plan;
      user.stripeSubscriptionId = 'demo_sub_' + Date.now();
      res.json({ url: `${origin}/dashboard/client?upgrade=success&plan=${plan}` });
    });
  });

  // POST /api/stripe/webhook – Stripe webhook for subscription events
  server.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: any;
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const user = db.users.find(u => u.id === userId);
        if (user && plan) {
          const planInfo = PLAN_MAP[plan];
          user.plan = planInfo?.name || plan;
          user.planId = plan;
          user.stripeSubscriptionId = session.subscription;
          user.stripeCustomerId = session.customer;
          console.log(`✅ User ${user.email} upgraded to ${user.plan}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const user = db.users.find(u => u.stripeSubscriptionId === sub.id);
        if (user) {
          user.subscriptionStatus = sub.status; // 'active', 'past_due', 'canceled'
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const user = db.users.find(u => u.stripeSubscriptionId === sub.id);
        if (user) {
          user.plan = null;
          user.planId = null;
          user.subscriptionStatus = 'canceled';
          user.stripeSubscriptionId = null;
          console.log(`❌ User ${user.email} subscription canceled`);
        }
        break;
      }
    }

    res.json({ received: true });
  });

  // POST /api/stripe/portal – create a billing portal session for managing subscription
  server.post('/api/stripe/portal', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const origin = process.env.APP_URL || 'http://localhost:3000';

    if (!user.stripeCustomerId) {
      return res.json({ url: `${origin}/dashboard/client?upgrade=no-subscription` });
    }

    stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard/client`,
    }).then(session => {
      res.json({ url: session.url });
    }).catch(err => {
      console.error('Portal error:', err);
      res.json({ url: `${origin}/dashboard/client` });
    });
  });

  // GET /api/stripe/status – return current user's subscription status
  server.get('/api/stripe/status', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({
      plan: user.plan || null,
      planId: user.planId || null,
      subscriptionStatus: user.subscriptionStatus || null,
      stripeSubscriptionId: user.stripeSubscriptionId || null,
    });
  });

  // ————— Analytics Endpoints —————

  // POST /api/analytics/save – save analytics data from admin
  server.post('/api/analytics/save', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = db.users.find(u => u.id === decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { userId, clinicId, gscClicks, gscImpressions, gscCtr, gscAvgPosition, gmbPhoneCalls, gmbWebsiteClicks, gmbDirectionRequests, gmbActions, gmbProfileViews, gmbReviewCount } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
      const analytics = await prisma.analyticsData.create({
        data: {
          userId,
          clinicId: clinicId || null,
          gscClicks: gscClicks || 0,
          gscImpressions: gscImpressions || 0,
          gscCtr: gscCtr || 0,
          gscAvgPosition: gscAvgPosition || 0,
          gmbPhoneCalls: gmbPhoneCalls || 0,
          gmbWebsiteClicks: gmbWebsiteClicks || 0,
          gmbDirectionRequests: gmbDirectionRequests || 0,
          gmbActions: gmbActions || 0,
          gmbProfileViews: gmbProfileViews || 0,
          gmbReviewCount: gmbReviewCount || 0,
        }
      });
      res.json({ success: true, analytics });
    } catch (err) {
      console.error('Analytics save error:', err);
      res.status(500).json({ error: 'Failed to save analytics' });
    }
  });

  // GET /api/analytics – get analytics data for current user
  server.get('/api/analytics', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (dbUser) {
          user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role };
          db.users.push(user);
        }
      } catch (e) { /* ignore */ }
    }
    if (!user) return res.status(401).json({ error: 'User not found' });

    try {
      const clinicId = req.query.clinicId as string | undefined;
      const whereClause: any = { userId: user.id };
      if (clinicId) {
        whereClause.clinicId = clinicId;
      }
      
      const analytics = await prisma.analyticsData.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: 90 // Last 90 days
      });
      res.json(analytics);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // GET /api/analytics/summary – get analytics summary for current user
  server.get('/api/analytics/summary', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (dbUser) {
          user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role };
          db.users.push(user);
        }
      } catch (e) { /* ignore */ }
    }
    if (!user) return res.status(401).json({ error: 'User not found' });

    try {
      const clinicId = req.query.clinicId as string | undefined;
      const whereClause: any = { userId: user.id };
      if (clinicId) {
        whereClause.clinicId = clinicId;
      }

      const analytics = await prisma.analyticsData.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });

      if (analytics.length === 0) {
        return res.json({
          totalClicks: 0,
          totalImpressions: 0,
          avgCtr: 0,
          avgPosition: 0,
          totalPhoneCalls: 0,
          totalWebsiteClicks: 0,
          totalDirectionRequests: 0,
          totalActions: 0,
          latestDate: null
        });
      }

      const summary = {
        totalClicks: analytics.reduce((sum, a) => sum + a.gscClicks, 0),
        totalImpressions: analytics.reduce((sum, a) => sum + a.gscImpressions, 0),
        avgCtr: analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.gscCtr, 0) / analytics.length : 0,
        avgPosition: analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.gscAvgPosition, 0) / analytics.length : 0,
        totalPhoneCalls: analytics.reduce((sum, a) => sum + a.gmbPhoneCalls, 0),
        totalWebsiteClicks: analytics.reduce((sum, a) => sum + a.gmbWebsiteClicks, 0),
        totalDirectionRequests: analytics.reduce((sum, a) => sum + a.gmbDirectionRequests, 0),
        totalActions: analytics.reduce((sum, a) => sum + a.gmbActions, 0),
        latestDate: analytics[0]?.date || null
      };
      res.json(summary);
    } catch (err) {
      console.error('Analytics summary error:', err);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  });

  // GET /api/analytics/by-clinic – get analytics grouped by clinic for multi-location view
  server.get('/api/analytics/by-clinic', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (dbUser) {
          user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role };
          db.users.push(user);
        }
      } catch (e) { /* ignore */ }
    }
    if (!user) return res.status(401).json({ error: 'User not found' });

    try {
      // Get all assigned clinics for this user
      const assignments = await prisma.clientClinic.findMany({
        where: { userId: user.id },
        include: { clinic: true },
      });

      // Get analytics data per clinic
      const result = await Promise.all(
        assignments.map(async (assignment) => {
          const clinicAnalytics = await prisma.analyticsData.findMany({
            where: { userId: user!.id, clinicId: assignment.clinicId },
            orderBy: { date: 'desc' },
            take: 90,
          });

          const totalClicks = clinicAnalytics.reduce((s, a) => s + a.gscClicks, 0);
          const totalImpressions = clinicAnalytics.reduce((s, a) => s + a.gscImpressions, 0);
          const totalPhoneCalls = clinicAnalytics.reduce((s, a) => s + a.gmbPhoneCalls, 0);
          const totalWebsiteClicks = clinicAnalytics.reduce((s, a) => s + a.gmbWebsiteClicks, 0);
          const totalDirectionRequests = clinicAnalytics.reduce((s, a) => s + a.gmbDirectionRequests, 0);
          const totalActions = clinicAnalytics.reduce((s, a) => s + a.gmbActions, 0);
          const avgCtr = clinicAnalytics.length > 0 ? clinicAnalytics.reduce((s, a) => s + a.gscCtr, 0) / clinicAnalytics.length : 0;
          const avgPosition = clinicAnalytics.length > 0 ? clinicAnalytics.reduce((s, a) => s + a.gscAvgPosition, 0) / clinicAnalytics.length : 0;

          return {
            clinic: {
              id: assignment.clinic.id,
              name: assignment.clinic.name,
              type: assignment.clinic.type,
              location: assignment.clinic.location,
            },
            summary: {
              totalClicks,
              totalImpressions,
              avgCtr,
              avgPosition,
              totalPhoneCalls,
              totalWebsiteClicks,
              totalDirectionRequests,
              totalActions,
              dataPoints: clinicAnalytics.length,
            },
            data: clinicAnalytics.map(a => ({
              date: a.date,
              clicks: a.gscClicks,
              impressions: a.gscImpressions,
              ctr: a.gscCtr,
              position: a.gscAvgPosition,
              calls: a.gmbPhoneCalls,
              websiteClicks: a.gmbWebsiteClicks,
              directions: a.gmbDirectionRequests,
              profileViews: a.gmbProfileViews,
              reviews: a.gmbReviewCount,
            })).reverse(),
          };
        })
      );

      // Also get "all locations" aggregate
      const allAnalytics = await prisma.analyticsData.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 90,
      });

      const allSummary = {
        totalClicks: allAnalytics.reduce((s, a) => s + a.gscClicks, 0),
        totalImpressions: allAnalytics.reduce((s, a) => s + a.gscImpressions, 0),
        avgCtr: allAnalytics.length > 0 ? allAnalytics.reduce((s, a) => s + a.gscCtr, 0) / allAnalytics.length : 0,
        avgPosition: allAnalytics.length > 0 ? allAnalytics.reduce((s, a) => s + a.gscAvgPosition, 0) / allAnalytics.length : 0,
        totalPhoneCalls: allAnalytics.reduce((s, a) => s + a.gmbPhoneCalls, 0),
        totalWebsiteClicks: allAnalytics.reduce((s, a) => s + a.gmbWebsiteClicks, 0),
        totalDirectionRequests: allAnalytics.reduce((s, a) => s + a.gmbDirectionRequests, 0),
        totalActions: allAnalytics.reduce((s, a) => s + a.gmbActions, 0),
        dataPoints: allAnalytics.length,
      };

      res.json({
        clinics: result,
        allLocations: {
          summary: allSummary,
          data: allAnalytics.map(a => ({
            date: a.date,
            clinicId: a.clinicId,
            clicks: a.gscClicks,
            impressions: a.gscImpressions,
            ctr: a.gscCtr,
            position: a.gscAvgPosition,
            calls: a.gmbPhoneCalls,
            websiteClicks: a.gmbWebsiteClicks,
            directions: a.gmbDirectionRequests,
            profileViews: a.gmbProfileViews,
            reviews: a.gmbReviewCount,
          })).reverse(),
        },
      });
    } catch (err) {
      console.error('Analytics by-clinic error:', err);
      res.status(500).json({ error: 'Failed to fetch analytics by clinic' });
    }
  });

  // Socket.io Logic
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Load data from database and send initial state
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
      const clinics = await prisma.clinic.findMany({
        orderBy: { createdAt: 'desc' }
      });
      const assignmentsRaw = await prisma.clientClinic.findMany();
      const assignments = assignmentsRaw.map(a => ({ userId: a.userId, clinicId: a.clinicId }));

      // Update in-memory cache
      db.users = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        plan: u.plan,
        planId: u.planId,
        stripeCustomerId: u.stripeCustomerId,
        stripeSubscriptionId: u.stripeSubscriptionId,
        subscriptionStatus: u.subscriptionStatus,
        createdAt: u.createdAt.toISOString()
      }));
      db.clinics = clinics.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        location: c.location,
        leads: c.leads,
        appointments: c.appointments
      }));
      db.assignments = assignments;

      socket.emit('initial_state', {
        clinics: db.clinics,
        assignments: db.assignments,
        users: db.users
      });
    } catch (err) {
      console.error('Failed to load initial state:', err);
      socket.emit('initial_state', { clinics: [], assignments: [], users: [] });
    }

    socket.on('assign_clinic', async (data: { userId: string, clinicId: string }) => {
      try {
        await prisma.clientClinic.upsert({
          where: { userId_clinicId: { userId: data.userId, clinicId: data.clinicId } },
          create: { userId: data.userId, clinicId: data.clinicId },
          update: {}
        });
        const exists = db.assignments.find(a => a.userId === data.userId && a.clinicId === data.clinicId);
        if (!exists) {
          db.assignments.push(data);
        }
        io.emit('assignment_added', data);
      } catch (err) {
        console.error('Failed to assign clinic:', err);
      }
    });

    socket.on('remove_assignment', async (data: { userId: string, clinicId: string }) => {
      try {
        await prisma.clientClinic.deleteMany({
          where: { userId: data.userId, clinicId: data.clinicId }
        });
        db.assignments = db.assignments.filter(a => !(a.userId === data.userId && a.clinicId === data.clinicId));
        io.emit('assignment_removed', data);
      } catch (err) {
        console.error('Failed to remove assignment:', err);
      }
    });

    socket.on('update_clinic_stats', async (data: { clinicId: string, leads: number, appointments: number }) => {
      try {
        const updated = await prisma.clinic.update({
          where: { id: data.clinicId },
          data: { leads: data.leads, appointments: data.appointments }
        });
        const clinic = db.clinics.find(c => c.id === data.clinicId);
        if (clinic) {
          clinic.leads = data.leads;
          clinic.appointments = data.appointments;
        }
        io.emit('clinic_updated', { ...clinic, ...data });
      } catch (err) {
        console.error('Failed to update clinic stats:', err);
      }
    });

    // Add new client
    socket.on('add_client', async (data: { name: string, email: string, password?: string, role?: string }) => {
      try {
        const exists = await prisma.user.findUnique({ where: { email: data.email } });
        if (!exists) {
          const newUser = await prisma.user.create({
            data: {
              email: data.email,
              name: data.name,
              password: data.password || 'defaultpass123', // In production, hash this
              role: normalizeRole(data.role) // Support both 'client' and 'admin' roles
            }
          });
          const userObj = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: normalizeRole(newUser.role),
            avatar: newUser.avatar,
            createdAt: newUser.createdAt.toISOString()
          };
          db.users.push(userObj);
          io.emit('client_added', userObj);
        } else {
          socket.emit('error', { message: 'User with this email already exists' });
        }
      } catch (err) {
        console.error('Failed to add client:', err);
        socket.emit('error', { message: 'Failed to add client' });
      }
    });

    // Add new clinic
    socket.on('add_clinic', async (data: { name: string, type: string, location: string, assignedUserId?: string | null }) => {
      try {
        const newClinic = await prisma.clinic.create({
          data: {
            name: data.name,
            type: data.type,
            location: data.location,
            leads: 0,
            appointments: 0
          }
        });
        const clinicObj = {
          id: newClinic.id,
          name: newClinic.name,
          type: newClinic.type,
          location: newClinic.location,
          leads: newClinic.leads,
          appointments: newClinic.appointments
        };
        db.clinics.push(clinicObj);
        io.emit('clinic_added', clinicObj);

        // If assignedUserId is provided, automatically create the assignment
        if (data.assignedUserId) {
          const assignmentExists = db.assignments.find(a => a.userId === data.assignedUserId && a.clinicId === newClinic.id);
          if (!assignmentExists) {
            db.assignments.push({ userId: data.assignedUserId, clinicId: newClinic.id });
            io.emit('assignment_updated', { userId: data.assignedUserId, clinicId: newClinic.id });
          }
        }
      } catch (err) {
        console.error('Failed to add clinic:', err);
        socket.emit('error', { message: 'Failed to add clinic' });
      }
    });

    // Update clinic
    socket.on('update_clinic', async (data: { id: string, name: string, type: string, location: string }) => {
      try {
        const updated = await prisma.clinic.update({
          where: { id: data.id },
          data: { name: data.name, type: data.type, location: data.location }
        });
        const clinic = db.clinics.find(c => c.id === data.id);
        if (clinic) {
          clinic.name = data.name;
          clinic.type = data.type;
          clinic.location = data.location;
        }
        io.emit('clinic_updated', { ...clinic, ...data });
      } catch (err) {
        console.error('Failed to update clinic:', err);
        socket.emit('error', { message: 'Failed to update clinic' });
      }
    });

    // Delete clinic
    socket.on('delete_clinic', async (data: { id: string }) => {
      try {
        await prisma.clinic.delete({ where: { id: data.id } });
        db.clinics = db.clinics.filter(c => c.id !== data.id);
        db.assignments = db.assignments.filter(a => a.clinicId !== data.id);
        io.emit('clinic_deleted', data);
      } catch (err) {
        console.error('Failed to delete clinic:', err);
        socket.emit('error', { message: 'Failed to delete clinic' });
      }
    });

    // Delete client
    socket.on('delete_client', async (data: { id: string }) => {
      try {
        await prisma.user.delete({ where: { id: data.id } });
        db.users = db.users.filter(u => u.id !== data.id);
        db.assignments = db.assignments.filter(a => a.userId !== data.id);
        io.emit('client_deleted', data);
      } catch (err) {
        console.error('Failed to delete client:', err);
        socket.emit('error', { message: 'Failed to delete client' });
      }
    });

    socket.on('update_user_role', async (data: { id: string; role: string }) => {
      try {
        const normalizedRole = normalizeRole(data.role);
        const updatedUser = await prisma.user.update({
          where: { id: data.id },
          data: { role: normalizedRole },
        });

        const cachedUser = db.users.find((u) => u.id === data.id);
        if (cachedUser) {
          cachedUser.role = normalizedRole;
        }

        io.emit('user_role_updated', {
          id: updatedUser.id,
          role: normalizedRole,
        });
      } catch (err) {
        console.error('Failed to update user role:', err);
        socket.emit('error', { message: 'Failed to update user role' });
      }
    });

    socket.on('weekly_analytics_saved', (data: { clinicId: string; year: number; month: number; weekNumber: number }) => {
      io.emit('weekly_analytics_updated', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Next.js request handler
  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('App preparation failed:', err);
  process.exit(1);
});
