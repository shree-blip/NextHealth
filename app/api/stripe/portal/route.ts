import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedDbUser } from '@/lib/auth';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' }) : null;

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedDbUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const appUrl = getAppUrl(req);

  if (!user.stripeCustomerId) {
    return NextResponse.json({ url: `${appUrl}/dashboard/client?upgrade=no-subscription` });
  }

  const isPlaceholderKey = !stripeSecretKey || stripeSecretKey.includes('placeholder') || !stripe;
  if (isPlaceholderKey) {
    return NextResponse.json({ url: `${appUrl}/dashboard/client` });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard/client`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
