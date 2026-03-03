import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' }) : null;

const PLAN_MAP = {
  silver: {
    name: 'Wellness & Longevity',
    priceId: process.env.STRIPE_SILVER_PRICE_ID || 'price_silver',
  },
  gold: {
    name: 'ER & Urgent Care',
    priceId: process.env.STRIPE_GOLD_PRICE_ID || 'price_gold',
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum',
  },
} as const;

type PlanId = keyof typeof PLAN_MAP;

function normalizePlan(input: string): PlanId | null {
  const plan = String(input || '').toLowerCase();
  if (plan === 'silver' || plan === 'gold' || plan === 'premium') return plan;
  if (plan === 'platinum') return 'premium';
  return null;
}

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedDbUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const plan = normalizePlan(body?.plan);

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const planInfo = PLAN_MAP[plan];
    const appUrl = getAppUrl(req);

    const isPlaceholderKey = !stripeSecretKey || stripeSecretKey.includes('placeholder') || !stripe;

    if (isPlaceholderKey) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: planInfo.name,
          planId: plan,
          subscriptionStatus: 'active',
          stripeSubscriptionId: `demo_sub_${Date.now()}`,
        },
      });

      return NextResponse.json({
        url: `${appUrl}/dashboard/client?upgrade=success&plan=${plan}`,
      });
    }

    let customerId = user.stripeCustomerId || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planInfo.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/client?upgrade=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/client?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe checkout session' }, { status: 500 });
  }
}
