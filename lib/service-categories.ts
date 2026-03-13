const RAW_SERVICE_CATEGORY_OPTIONS = [
  'SEO & Local Search',
  'Google Business Profile',
  'Google Ads / Paid Search',
  'Social Media',
  'Blog / Content',
  'Email Campaigns',
  'Strategy & Planning',
  'Brand Identity / Graphic Design',
  'Brochure / Print Design',
  'Medical Automation',
  'Custom Software / Dashboard / Integrations',
] as const;

export const SERVICE_CATEGORY_OPTIONS = [...RAW_SERVICE_CATEGORY_OPTIONS];

export type ServiceCategory = (typeof RAW_SERVICE_CATEGORY_OPTIONS)[number];

const CATEGORY_LOOKUP = new Map<string, ServiceCategory>([
  ['seo & local search', 'SEO & Local Search'],
  ['seo', 'SEO & Local Search'],
  ['local search', 'SEO & Local Search'],
  ['local seo', 'SEO & Local Search'],
  ['google business profile', 'Google Business Profile'],
  ['google my business', 'Google Business Profile'],
  ['gmb', 'Google Business Profile'],
  ['gbp', 'Google Business Profile'],
  ['google ads / paid search', 'Google Ads / Paid Search'],
  ['google ads & paid search', 'Google Ads / Paid Search'],
  ['google ads', 'Google Ads / Paid Search'],
  ['paid search', 'Google Ads / Paid Search'],
  ['search ads', 'Google Ads / Paid Search'],
  ['ppc', 'Google Ads / Paid Search'],
  ['social media', 'Social Media'],
  ['social media marketing', 'Social Media'],
  ['social', 'Social Media'],
  ['meta ads', 'Social Media'],
  ['facebook ads', 'Social Media'],
  ['instagram ads', 'Social Media'],
  ['blog / content', 'Blog / Content'],
  ['blog content', 'Blog / Content'],
  ['blogging', 'Blog / Content'],
  ['content', 'Blog / Content'],
  ['content & copywriting', 'Blog / Content'],
  ['copywriting', 'Blog / Content'],
  ['email campaigns', 'Email Campaigns'],
  ['email campaign', 'Email Campaigns'],
  ['email & drip campaigns', 'Email Campaigns'],
  ['drip campaigns', 'Email Campaigns'],
  ['email marketing', 'Email Campaigns'],
  ['strategy & planning', 'Strategy & Planning'],
  ['strategy', 'Strategy & Planning'],
  ['planning', 'Strategy & Planning'],
  ['analytics & reporting', 'Strategy & Planning'],
  ['analytics', 'Strategy & Planning'],
  ['reporting', 'Strategy & Planning'],
  ['brand identity / graphic design', 'Brand Identity / Graphic Design'],
  ['brand identity design', 'Brand Identity / Graphic Design'],
  ['brand identity', 'Brand Identity / Graphic Design'],
  ['graphic design', 'Brand Identity / Graphic Design'],
  ['branding', 'Brand Identity / Graphic Design'],
  ['brochure / print design', 'Brochure / Print Design'],
  ['brochure & print design', 'Brochure / Print Design'],
  ['brochure design', 'Brochure / Print Design'],
  ['print design', 'Brochure / Print Design'],
  ['medical automation', 'Medical Automation'],
  ['automation', 'Medical Automation'],
  ['chatbot', 'Medical Automation'],
  ['ai chatbot', 'Medical Automation'],
  ['call tracking', 'Medical Automation'],
  ['insurance verification bots', 'Medical Automation'],
  ['custom software / dashboard / integrations', 'Custom Software / Dashboard / Integrations'],
  ['custom software', 'Custom Software / Dashboard / Integrations'],
  ['dashboard', 'Custom Software / Dashboard / Integrations'],
  ['dashboards', 'Custom Software / Dashboard / Integrations'],
  ['integrations', 'Custom Software / Dashboard / Integrations'],
  ['integration', 'Custom Software / Dashboard / Integrations'],
  ['website design & dev', 'Custom Software / Dashboard / Integrations'],
  ['website design', 'Custom Software / Dashboard / Integrations'],
  ['web design', 'Custom Software / Dashboard / Integrations'],
  ['website development', 'Custom Software / Dashboard / Integrations'],
]);

const STARTER_DEFAULTS: ServiceCategory[] = [
  'SEO & Local Search',
  'Google Business Profile',
  'Google Ads / Paid Search',
  'Social Media',
  'Blog / Content',
  'Strategy & Planning',
];

const GROWTH_DEFAULTS: ServiceCategory[] = [
  ...STARTER_DEFAULTS,
  'Email Campaigns',
  'Medical Automation',
];

const PREMIUM_DEFAULTS: ServiceCategory[] = [...SERVICE_CATEGORY_OPTIONS];

function normalizeCategoryLabel(value: string): ServiceCategory | null {
  const normalized = value.trim().toLowerCase();
  return CATEGORY_LOOKUP.get(normalized) ?? null;
}

function normalizePlanTier(planId?: string | null): 'starter' | 'growth' | 'premium' {
  const normalized = (planId ?? '').trim().toLowerCase();

  if (
    normalized === 'premium' ||
    normalized === 'platinum' ||
    normalized === 'scale elite' ||
    normalized === 'enterprise'
  ) {
    return 'premium';
  }

  if (
    normalized === 'gold' ||
    normalized === 'growth pro' ||
    normalized === 'growth'
  ) {
    return 'growth';
  }

  return 'starter';
}

export function normalizeServiceCategories(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(',')
      : [];

  const selected = new Set<ServiceCategory>();

  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    const normalized = normalizeCategoryLabel(value);
    if (normalized) {
      selected.add(normalized);
    }
  }

  return SERVICE_CATEGORY_OPTIONS.filter((category) => selected.has(category));
}

export function deriveServiceCategoriesFromPlan(planId?: string | null): string[] {
  const tier = normalizePlanTier(planId);

  if (tier === 'premium') {
    return [...PREMIUM_DEFAULTS];
  }

  if (tier === 'growth') {
    return [...GROWTH_DEFAULTS];
  }

  return [...STARTER_DEFAULTS];
}