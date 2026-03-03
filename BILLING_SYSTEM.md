# Billing System Implementation Guide

## Overview
The billing system collects payment details, calculates taxes based on country/state, and processes payments through Stripe with immediate membership updates.

## Components & Files

### 1. **Tax Calculator** (`lib/tax-calculator.ts`)
- Automatically calculates tax rates based on country and state
- Supports 50+ US states and major countries (Canada, UK, EU, Australia)
- Exported functions:
  - `getTaxRate(country, state?)` - Returns tax rate as decimal
  - `calculateTax(amount, country, state)` - Returns breakdown with subtotal, tax, total
  - `formatCurrency(amount)` - Formats numbers as USD

### 2. **Billing View Component** (`components/BillingView.tsx`)
Fully featured payment form with:
- **Contact Section**: Email & full name
- **Billing Address**: Street, city, state (US only), country, postal code
- **Payment Method**: Card number, expiry (MM/YY), CVC
- **Auto Tax Calculation**: Updates when country/state changes
- **Order Summary**: Shows subtotal, tax amount, total
- **Card Validation**: 
  - Card number: Auto-formats to XXXX XXXX XXXX XXXX
  - Expiry: Auto-formats to MM/YY
  - CVC: Numeric input with 3-4 digit validation

**Flow:**
1. User clicks "Upgrade" on a pricing card in Membership view
2. System navigates to Billing view with selected plan details
3. User fills billing/payment form
4. Tax is calculated in real-time based on country/state
5. User clicks "Pay $X.XX"
6. Request sent to `/api/stripe/process-payment`
7. On success, user is returned to Membership view with updated plan

### 3. **Payment Processing API** (`app/api/stripe/process-payment/route.ts`)

**Endpoint:** `POST /api/stripe/process-payment`

**Request Payload:**
```json
{
  "planId": "silver|gold|premium",
  "amount": 5250.00,
  "subtotal": 5000,
  "taxAmount": 250,
  "taxRate": 0.05,
  "billing": {
    "email": "user@clinic.com",
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "card": {
    "number": "4111111111111111",
    "expiry": "12/25",
    "cvc": "123"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "chargeId": "ch_1234567890",
  "plan": "Starter Care - $5,000/month",
  "amount": 5250.00
}
```

**Features:**
- Authenticates user from auth token in cookies
- Validates all required fields
- Creates or retrieves Stripe customer
- Creates payment method with billing details
- Processes charge through Stripe
- Detaches payment method after use (security)
- **Demo Mode**: Tests without real Stripe keys
- Returns charge ID and confirmation

### 4. **Database Integration** (TODO)

Currently, the API logs payment data. To persist to database, uncomment and complete this Prisma call in `app/api/stripe/process-payment/route.ts`:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    plan: planId,                          // 'silver', 'gold', 'premium'
    planId: planId,                        // Same as plan for consistency
    subscriptionStatus: 'active',          // 'active', 'inactive', 'past_due'
    billingEmail: billingInfo.email,
    billingAddress: billingInfo.address,
    billingCity: billingInfo.city,
    billingState: billingInfo.state,
    billingZip: billingInfo.zipCode,
    billingCountry: billingInfo.country,
    lastPaymentDate: new Date(),           // Current timestamp
    lastPaymentAmount: amount,             // Total amount paid
    stripeChargeId: stripeChargeId,       // For reconciliation
  },
});
```

**Database Schema Requirements:**
```prisma
model User {
  // ... existing fields ...
  
  // Subscription fields
  plan                  String?          // 'silver', 'gold', 'premium'
  planId                String?
  subscriptionStatus    String?          // 'active', 'inactive', 'past_due'
  stripeSubscriptionId  String?
  stripeCustomerId      String?
  stripeChargeId        String?
  
  // Billing fields
  billingEmail          String?
  billingAddress        String?
  billingCity           String?
  billingState          String?
  billingZip            String?
  billingCountry        String?
  lastPaymentDate       DateTime?
  lastPaymentAmount     Float?
}
```

## Flow Diagram

```
User in Membership View
         ↓
     [Click Upgrade]
         ↓
  handleUpgrade(planId)
         ↓
   Store plan details in 
   selectedPlanForBilling
         ↓
  Navigate to Billing View
         ↓
  [Fill billing form]
         ↓
  [Manual tax calculation
   on country change]
         ↓
    [Click Pay button]
         ↓
  POST /api/stripe/process-payment
         ↓
  Stripe processes charge
         ↓
  ✓ Success → Save to DB
         ↓
  Return to Membership View
  (User sees updated plan)
```

## Tax Calculation Examples

### Example 1: New York (8% tax)
- Plan: Growth Pro ($10,000/month)
- Country: US, State: NY
- Tax Rate: 8%
- Calculation:
  - Subtotal: $10,000.00
  - Tax: $800.00 (10000 × 0.08)
  - **Total: $10,800.00**

### Example 2: California (7.25% tax)
- Plan: Starter Care ($5,000/month)
- Country: US, State: CA
- Tax Rate: 7.25%
- Calculation:
  - Subtotal: $5,000.00
  - Tax: $362.50 (5000 × 0.0725)
  - **Total: $5,362.50**

### Example 3: UK (20% VAT)
- Plan: Scale Elite (Custom)
- Country: UK
- Tax Rate: 20%
- Custom pricing handled with proportional tax

## Testing

### With Demo Mode (No Real Stripe Key)
- System uses `USE_DEMO_MODE = true` if Stripe key is missing or placeholder
- Payments succeed immediately without hitting real Stripe
- Charge ID: `demo_charge_[timestamp]`
- Perfect for development/testing

### With Real Stripe Key
- Set `STRIPE_SECRET_KEY` environment variable
- Real payment processing with card validation
- Stripe error responses properly returned
- Charge ID matches actual Stripe charge: `ch_xxxxx`

### Manual Testing Steps
```bash
# 1. Navigate to client dashboard
# 2. Click "Membership & Billing"
# 3. Click "Upgrade" on any plan
# 4. Fill form with test card: 4111 1111 1111 1111
# 5. Any future expiry MM/YY and 3-digit CVC
# 6. Complete address and click Pay
# 7. Should see success toast
# 8. Plan updated in membership view
```

## Security Considerations

1. **Card Data**: Never stored on server after use
2. **Encryption**: Stripe handles PCI compliance
3. **Payment Method Detachment**: Immediately after charge for cleanup
4. **Auth Check**: All payments require authenticated user
5. **Input Validation**: Client-side formatting + server-side validation

## Error Handling

| Error | Cause | User Message |
|-------|-------|--------------|
| 400 Bad Request | Missing required fields | "Please fill in all required billing fields" |
| 401 Unauthorized | Not logged in | "Unauthorized" |
| 400 Bad Request | Invalid card | Stripe error message |
| 400 Bad Request | Declined card | "Payment was declined" |
| 500 Server Error | DB save failed | "Payment processing error" |

## Next Steps (To Complete)

1. **Update User Schema** in Prisma to include all billing fields
2. **Uncomment DB Save** in `process-payment/route.ts`
3. **Test with Real Stripe** key in production
4. **Add Webhook Handler** for subscription events (optional but recommended)
5. **Email Receipts** - Send invoice email after successful payment
6. **Refund Handler** - Create endpoint for processing refunds
7. **Subscription Renewals** - Set up recurring billing if needed

## Plan Pricing Reference

| Plan | ID | Base Price | Tier |
|------|----|----|------|
| Starter Care | silver | $5,000/month | 1 |
| Growth Pro | gold | $10,000/month | 2 |
| Scale Elite | premium | Custom | 3 |

## Example Complete Integration

See `app/dashboard/client/page.tsx` for full integration example showing:
- Import of BillingView component
- activeView state management
- selectedPlanForBilling state
- handleUpgrade function workflow
- Conditional rendering logic
