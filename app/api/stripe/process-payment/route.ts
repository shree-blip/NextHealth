import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { updateUserSubscriptionAfterPayment } from '@/lib/subscription-utils'; // Uncomment when ready
import prisma from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

// Lazy-initialize Stripe to avoid build-time crash when env var is missing
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any });
}

// Fallback for testing with placeholder keys
const USE_DEMO_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('test');

interface PaymentPayload {
  planId: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  billing: {
    email: string;
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  // NOTE: Raw card data removed. Use Stripe Elements / Checkout on the frontend.
  // This route should receive a Stripe PaymentMethod ID, not raw card numbers.
  paymentMethodId?: string;
}

/**
 * Get authenticated user from JWT cookie (no SSRF).
 */
async function getAuthenticatedPaymentUser(req: NextRequest) {
  return getAuthenticatedDbUser(req);
}

async function savePaymentToDB(
  userId: string,
  planId: string,
  amount: number,
  taxAmount: number,
  taxRate: number,
  billingInfo: PaymentPayload['billing'],
  stripeChargeId?: string
) {
  try {
    // Update user subscription immediately
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId === 'silver' ? 'Starter Care' : planId === 'gold' ? 'Growth Pro' : 'Scale Elite',
        planId: planId,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planId: true,
      },
    });

    console.log('✓ User subscription updated:', {
      userId: updatedUser.id,
      plan: updatedUser.plan,
      planId: updatedUser.planId,
    });

    return true;
  } catch (err) {
    console.error('✗ DB save error:', err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedPaymentUser(req);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload: PaymentPayload = await req.json();

    // Validate payload
    if (!payload.planId || !payload.amount || !payload.billing) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const planMap: Record<string, string> = {
      'silver': 'Starter Care - $5,000/month',
      'gold': 'Growth Pro - $10,000/month',
      'premium': 'Scale Elite - Custom pricing',
    };

    // Demo mode for testing
    if (USE_DEMO_MODE) {
      // Simulate successful payment in demo mode
      await savePaymentToDB(
        user.id,
        payload.planId,
        payload.amount,
        payload.taxAmount,
        payload.taxRate,
        payload.billing
      );

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        chargeId: 'demo_charge_' + Date.now(),
        plan: planMap[payload.planId] || payload.planId,
        amount: payload.amount,
      });
    }

    // Real Stripe payment processing
    const stripe = getStripe();
    let charge: Stripe.Charge | null = null;

    try {
      // Create or get customer
      let customer: Stripe.Customer | null = null;
      
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer;
      } else {
        customer = await stripe.customers.create({
          email: payload.billing.email,
          name: payload.billing.fullName,
          address: {
            line1: payload.billing.address,
            city: payload.billing.city,
            state: payload.billing.state,
            postal_code: payload.billing.zipCode,
            country: payload.billing.country,
          },
        });
      }

      // Use PaymentMethod created by Stripe Elements on the frontend
      // This avoids handling raw card data server-side (PCI compliance)
      let paymentMethodId = payload.paymentMethodId;
      if (!paymentMethodId) {
        return NextResponse.json(
          { message: 'PaymentMethod ID is required. Use Stripe Elements to collect card details securely.' },
          { status: 400 }
        );
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Create intent instead of direct charge (more modern approach)
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(payload.amount * 100), // Convert to cents
        currency: 'usd',
        customer: customer.id,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `${planMap[payload.planId] || payload.planId} - Tax: $${payload.taxAmount}`,
        metadata: {
          userId: user.id,
          planId: payload.planId,
          taxAmount: payload.taxAmount.toString(),
          taxRate: payload.taxRate.toString(),
        },
      });

      // Use the payment intent ID as the transaction reference
      charge = {
        id: intent.id,
      } as Stripe.Charge;

      // Detach payment method after use (for security)
      await stripe.paymentMethods.detach(paymentMethodId);
    } catch (stripeErr: any) {
      console.error('Stripe error:', stripeErr);
      return NextResponse.json(
        {
          message: stripeErr.message || 'Payment processing failed',
          error: stripeErr.code,
        },
        { status: 400 }
      );
    }

    // Save payment to database
    await savePaymentToDB(
      user.id,
      payload.planId,
      payload.amount,
      payload.taxAmount,
      payload.taxRate,
      payload.billing,
      charge?.id
    );

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      chargeId: charge?.id,
      plan: planMap[payload.planId] || payload.planId,
      amount: payload.amount,
    });
  } catch (err: any) {
    console.error('Payment error:', err);
    return NextResponse.json(
      { message: 'Payment processing error: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
