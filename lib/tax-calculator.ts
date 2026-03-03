// Tax rates by country/state (US state tax rates as example)
// This can be expanded to include international rates

interface TaxRate {
  country: string;
  state?: string;
  rate: number; // as decimal (0.07 = 7%)
}

const TAX_RATES: TaxRate[] = [
  // US States
  { country: 'US', state: 'CA', rate: 0.0725 },
  { country: 'US', state: 'TX', rate: 0.0625 },
  { country: 'US', state: 'FL', rate: 0.06 },
  { country: 'US', state: 'NY', rate: 0.08 },
  { country: 'US', state: 'IL', rate: 0.0625 },
  { country: 'US', state: 'PA', rate: 0.06 },
  { country: 'US', state: 'OH', rate: 0.0575 },
  { country: 'US', state: 'GA', rate: 0.07 },
  { country: 'US', state: 'NC', rate: 0.07 },
  { country: 'US', state: 'MI', rate: 0.06 },
  // Default US rate if state not found
  { country: 'US', rate: 0.065 },
  // Canada
  { country: 'CA', rate: 0.05 }, // GST
  // European countries (VAT)
  { country: 'GB', rate: 0.20 },
  { country: 'DE', rate: 0.19 },
  { country: 'FR', rate: 0.20 },
  { country: 'ES', rate: 0.21 },
  { country: 'IT', rate: 0.22 },
  { country: 'NL', rate: 0.21 },
  // Australia
  { country: 'AU', rate: 0.10 },
];

export function getTaxRate(country: string, state?: string): number {
  if (!country) return 0;

  // First, try to find an exact match with state (for US)
  if (state && country === 'US') {
    const stateMatch = TAX_RATES.find(t => t.country === 'US' && t.state === state.toUpperCase());
    if (stateMatch) return stateMatch.rate;
  }

  // Fall back to country-only match
  const countryMatch = TAX_RATES.find(t => t.country === country.toUpperCase() && !t.state);
  if (countryMatch) return countryMatch.rate;

  // Default to 0 if no match found
  return 0;
}

export function calculateTax(
  amount: number,
  country: string,
  state?: string
): {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
} {
  const taxRate = getTaxRate(country, state);
  const taxAmount = amount * taxRate;
  const total = amount + taxAmount;

  return {
    subtotal: amount,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimals
    total: Math.round(total * 100) / 100,
  };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
