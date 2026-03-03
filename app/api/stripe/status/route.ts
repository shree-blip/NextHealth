import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedDbUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedDbUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    plan: user.plan || null,
    planId: user.planId || null,
    subscriptionStatus: user.subscriptionStatus || null,
    stripeSubscriptionId: user.stripeSubscriptionId || null,
    stripeCustomerId: user.stripeCustomerId || null,
  });
}
