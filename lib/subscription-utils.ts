// Example helper function for updating user subscription in database
// This should be imported and called after successful Stripe payment

import prisma from '@/lib/prisma'; // Adjust path based on your setup

interface BillingInfo {
  email: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Updates user subscription after successful payment
 * 
 * IMPORTANT: Before using this in production, you need to add billing fields to the User model.
 * See BILLING_SYSTEM.md for the required database schema updates.
 */
export async function updateUserSubscriptionAfterPayment(
  userId: string,
  planId: string,
  paymentAmount: number,
  taxAmount: number,
  billingInfo: BillingInfo,
  stripeChargeId?: string
) {
  try {
    // Update user with subscription details (existing fields)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Existing subscription fields
        plan: planId,
        planId: planId,
        subscriptionStatus: 'active',
        updatedAt: new Date(),

        // TODO: Add these fields to the User model in prisma/schema.prisma
        // and uncomment below once schema is updated:
        //
        // Billing address fields
        // billingEmail: billingInfo.email,
        // billingAddress: billingInfo.address,
        // billingCity: billingInfo.city,
        // billingState: billingInfo.state,
        // billingZip: billingInfo.zipCode,
        // billingCountry: billingInfo.country,
        // 
        // Payment tracking
        // lastPaymentDate: new Date(),
        // lastPaymentAmount: paymentAmount,
        // stripeChargeId: stripeChargeId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    console.log('✓ User subscription updated:', {
      userId: updatedUser.id,
      plan: updatedUser.plan,
      status: updatedUser.subscriptionStatus,
    });

    return updatedUser;
  } catch (err) {
    console.error('✗ Failed to update user subscription:', err);
    throw new Error(`Subscription update failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Optional: Create a payment record for audit trail
 * 
 * You can create a separate Payment/Invoice model to track all transactions.
 * This helps with reconciliation and customer service.
 */
export async function createPaymentRecord(
  userId: string,
  planId: string,
  amountPaid: number,
  taxAmount: number,
  currency: string = 'USD',
  stripeChargeId?: string
) {
  try {
    // TODO: Create a Payment model in Prisma schema:
    // 
    // model Payment {
    //   id        String   @id @default(cuid())
    //   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    //   userId    String
    //   planId    String
    //   amount    Float
    //   tax       Float
    //   currency  String   @default("USD")
    //   stripeChargeId String?
    //   status    String   @default("completed") // completed, failed, refunded
    //   createdAt DateTime @default(now())
    //   @@index([userId])
    // }
    //
    // Then uncomment and use:
    // const payment = await prisma.payment.create({
    //   data: {
    //     userId,
    //     planId,
    //     amount: amountPaid,
    //     tax: taxAmount,
    //     currency,
    //     stripeChargeId,
    //     status: 'completed',
    //   },
    // });

    console.log('✓ Payment record logged:', {
      userId,
      planId,
      amount: amountPaid,
      stripeId: stripeChargeId,
    });

    return true;
  } catch (err) {
    console.error('✗ Failed to create payment record:', err);
    // Don't throw - payment succeeded even if audit log failed
    return false;
  }
}

/**
 * Fetch user's current subscription details
 * Uses only existing User model fields
 */
export async function getUserSubscription(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planId: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        // Add these when schema is updated:
        // lastPaymentDate: true,
        // lastPaymentAmount: true,
        // billingEmail: true,
        // billingAddress: true,
        // billingCity: true,
        // billingState: true,
        // billingZip: true,
        // billingCountry: true,
      },
    });

    return user;
  } catch (err) {
    console.error('Failed to fetch user subscription:', err);
    return null;
  }
}
