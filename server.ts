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

// Mock Database
const db = {
  users: [] as any[],
  clinics: [
    { id: 'c1', name: 'Dallas ER', type: 'ER', location: 'Dallas, TX', leads: 120, appointments: 45 },
    { id: 'c2', name: 'Houston Urgent Care', type: 'Urgent Care', location: 'Houston, TX', leads: 300, appointments: 150 },
    { id: 'c3', name: 'Austin Wellness', type: 'Wellness', location: 'Austin, TX', leads: 80, appointments: 20 },
  ],
  assignments: [] as { userId: string, clinicId: string }[],
};

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

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
  // Only parse JSON for Express-handled routes; skip for Next.js App Router API routes
  // to avoid consuming the request body stream before Next.js can read it
  server.use((req, res, next) => {
    const nextAppRoutes = ['/api/chat', '/api/posts', '/api/admin'];
    if (nextAppRoutes.some((r) => req.path.startsWith(r))) {
      return next();
    }
    express.json()(req, res, next);
  });

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

      // Determine role (mock logic: if email contains admin, make them admin)
      if (email.includes('admin') || email === 'shree@focusyourfinance.com') {
        role = 'admin';
      }

      let user = db.users.find(u => u.email === email);
      if (!user) {
        user = { id: Math.random().toString(36).substr(2, 9), email, name, role };
        db.users.push(user);
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

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
                window.location.href = '/dashboard/' + '${user.role}';
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

  server.get('/api/auth/me', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.users.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: 'User not found' });
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar || null });
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
  server.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Auto-detect role from email
    const detectedRole = (email.includes('admin') || email === 'shree@focusyourfinance.com') ? 'admin' : 'client';

    // Find or create user
    let user = db.users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role: detectedRole,
        avatar: null,
        password
      };
      db.users.push(user);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
        role: user.role,
        avatar: user.avatar || null,
      },
      success: true
    });
  });

  // Profile Update
  server.patch('/api/auth/profile', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.users.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: 'User not found' });

      const { name, avatar } = req.body;
      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;

      res.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar || null });
    } catch (e) {
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

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    try {
      const analytics = await prisma.analyticsData.findMany({
        where: { userId: user.id },
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

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    try {
      const analytics = await prisma.analyticsData.findMany({
        where: { userId: user.id },
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

  // Socket.io Logic
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial state
    socket.emit('initial_state', {
      clinics: db.clinics,
      assignments: db.assignments,
      users: db.users
    });

    socket.on('assign_clinic', (data: { userId: string, clinicId: string }) => {
      // Idempotent check
      const exists = db.assignments.find(a => a.userId === data.userId && a.clinicId === data.clinicId);
      if (!exists) {
        db.assignments.push(data);
        io.emit('assignment_added', data);
      }
    });

    socket.on('remove_assignment', (data: { userId: string, clinicId: string }) => {
      db.assignments = db.assignments.filter(a => !(a.userId === data.userId && a.clinicId === data.clinicId));
      io.emit('assignment_removed', data);
    });

    socket.on('update_clinic_stats', (data: { clinicId: string, leads: number, appointments: number }) => {
      const clinic = db.clinics.find(c => c.id === data.clinicId);
      if (clinic) {
        clinic.leads = data.leads;
        clinic.appointments = data.appointments;
        io.emit('clinic_updated', clinic);
      }
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
