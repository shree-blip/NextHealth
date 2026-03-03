import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' }) : null;

const PLAN_MAP = {
  silver: { name: 'Wellness & Longevity' },
  gold: { name: 'ER & Urgent Care' },
  premium: { name: 'Premium' },
} as const;

type PlanId = keyof typeof PLAN_MAP;

function normalizePlan(input: string): PlanId | null {
  const plan = String(input || '').toLowerCase();
  if (plan === 'silver' || plan === 'gold' || plan === 'premium') return plan;
  if (plan === 'platinum') return 'premium';
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedDbUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const plan = normalizePlan(body?.plan);
    const sessionId = String(body?.sessionId || '');

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const isPlaceholderKey = !stripeSecretKey || stripeSecretKey.includes('placeholder') || !stripe;

    if (isPlaceholderKey) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: PLAN_MAP[plan].name,
          planId: plan,
          subscriptionStatus: 'active',
          stripeSubscriptionId: user.stripeSubscriptionId || `demo_sub_${Date.now()}`,
        },
      });

      return NextResponse.json({ success: true, plan: updated.plan, planId: updated.planId });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing Stripe session id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadataUserId = session.metadata?.userId;
    const metadataPlan = normalizePlan(session.metadata?.plan || '');

    if (!metadataUserId || metadataUserId !== user.id) {
      return NextResponse.json({ error: 'Checkout session does not belong to this user' }, { status: 403 });
    }

    const finalPlan = metadataPlan || plan;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
    const customerId = typeof session.customer === 'string' ? session.customer : null;

    let subscriptionStatus: string | null = null;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: PLAN_MAP[finalPlan].name,
        planId: finalPlan,
        stripeCustomerId: customerId || user.stripeCustomerId,
        stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
        subscriptionStatus: subscriptionStatus || 'active',
      },
    });

    return NextResponse.json({
      success: true,
      plan: updated.plan,
      planId: updated.planId,
      subscriptionStatus: updated.subscriptionStatus,
    });
  } catch (error) {
    console.error('Stripe confirm checkout error:', error);
    return NextResponse.json({ error: 'Failed to confirm checkout session' }, { status: 500 });
  }
}
