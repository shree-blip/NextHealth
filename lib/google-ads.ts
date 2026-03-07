/**
 * Google Ads API Integration
 *
 * Uses the same OAuth connection stored in GMBConnection.
 * All requests go through google-api-core.ts which provides:
 *   - Unified token management
 *   - Exponential backoff with jitter for 429/5xx
 *   - Per-service rate limiting
 *   - SQL-backed response cache
 */

import prisma from '@/lib/prisma';
import {
  googleApiRequestWithRetry,
  getCachedApiResponse,
  setCachedApiResponse,
} from '@/lib/google-api-core';

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v16';

// Cache TTL: 30 minutes for discovery endpoints
const DISCOVERY_CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Thin request wrapper using google-api-core ───────────────
async function googleAdsRequest(connectionId: string, url: string, init: RequestInit = {}, loginCustomerId?: string) {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is not configured. Add it to your environment variables.');
  }

  const extraHeaders: Record<string, string> = {
    'developer-token': developerToken,
  };
  if (loginCustomerId) {
    extraHeaders['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }

  return googleApiRequestWithRetry({
    connectionId,
    url,
    init,
    service: 'google_ads',
    extraHeaders,
    backoff: { maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 64_000, jitterFactor: 0.5 },
  });
}

// ══════════════════════════════════════════════════════════════
// Google Ads — List Accessible Customer Accounts
// ══════════════════════════════════════════════════════════════
export async function listGoogleAdsAccounts(connectionId: string) {
  // Check SQL cache first (30-min TTL)
  const cacheKey = `ads:${connectionId}:accounts`;
  const cached = await getCachedApiResponse<{ customerId: string; descriptiveName: string; currencyCode: string; isManager: boolean }[]>(cacheKey);
  if (cached) return cached;

  // Step 1: Get list of accessible customer IDs
  const listData = await googleAdsRequest(
    connectionId,
    `${GOOGLE_ADS_API}/customers:listAccessibleCustomers`,
  );

  const customerResourceNames: string[] = listData.resourceNames || [];

  // Step 2: Fetch details for each customer
  const accounts: { customerId: string; descriptiveName: string; currencyCode: string; isManager: boolean }[] = [];

  for (const resourceName of customerResourceNames) {
    const customerId = resourceName.replace('customers/', '');
    try {
      const query = `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.manager FROM customer LIMIT 1`;
      const searchData = await googleAdsRequest(
        connectionId,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          body: JSON.stringify({ query }),
        },
        customerId,
      );

      const row = searchData.results?.[0]?.customer;
      if (row) {
        accounts.push({
          customerId: row.id || customerId,
          descriptiveName: row.descriptiveName || `Account ${customerId}`,
          currencyCode: row.currencyCode || 'USD',
          isManager: row.manager || false,
        });
      }
    } catch (err: any) {
      // Some accounts may not be accessible — skip silently
      console.warn(`[Google Ads] Could not fetch details for ${customerId}:`, err.message);
      accounts.push({
        customerId,
        descriptiveName: `Account ${customerId}`,
        currencyCode: 'USD',
        isManager: false,
      });
    }
  }

  await setCachedApiResponse(cacheKey, accounts, DISCOVERY_CACHE_TTL_MS);
  return accounts;
}

// ══════════════════════════════════════════════════════════════
// Google Ads — Fetch Daily Performance Metrics
// ══════════════════════════════════════════════════════════════
export async function fetchGoogleAdsData(connectionId: string, customerId: string, startDate: string, endDate: string) {
  const cleanId = customerId.replace(/-/g, '');

  const query = `
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_per_conversion
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY segments.date ASC
  `;

  const data = await googleAdsRequest(
    connectionId,
    `${GOOGLE_ADS_API}/customers/${cleanId}/googleAds:search`,
    {
      method: 'POST',
      body: JSON.stringify({ query }),
    },
    cleanId,
  );

  return (data.results || []).map((row: any) => ({
    date: row.segments?.date || '',
    impressions: parseInt(row.metrics?.impressions || '0', 10),
    clicks: parseInt(row.metrics?.clicks || '0', 10),
    costMicros: BigInt(row.metrics?.costMicros || '0'),
    conversions: parseFloat(row.metrics?.conversions || '0'),
    ctr: parseFloat(row.metrics?.ctr || '0'),
    avgCpc: parseFloat(row.metrics?.averageCpc || '0') / 1_000_000,
    costPerConversion: parseFloat(row.metrics?.costPerConversion || '0') / 1_000_000,
  }));
}

// ══════════════════════════════════════════════════════════════
// Sync — Store Google Ads data in database
// ══════════════════════════════════════════════════════════════
export async function syncGoogleAdsData(connectionId: string, syncDays = 90) {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.googleAdsCustomerId) return { synced: 0 };

  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    console.warn('[Google Ads] No developer token configured, skipping sync');
    return { synced: 0 };
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - syncDays);

  const format = (d: Date) => d.toISOString().slice(0, 10);

  const dailyData = await fetchGoogleAdsData(
    connectionId,
    conn.googleAdsCustomerId,
    format(startDate),
    format(endDate),
  );

  let synced = 0;
  for (const day of dailyData) {
    if (!day.date) continue;
    const date = new Date(day.date + 'T00:00:00Z');

    await prisma.googleAdsData.upsert({
      where: {
        gmbConnectionId_date: { gmbConnectionId: connectionId, date },
      },
      create: {
        gmbConnectionId: connectionId,
        date,
        impressions: day.impressions,
        clicks: day.clicks,
        costMicros: day.costMicros,
        conversions: day.conversions,
        ctr: day.ctr,
        avgCpc: day.avgCpc,
        costPerConversion: day.costPerConversion,
      },
      update: {
        impressions: day.impressions,
        clicks: day.clicks,
        costMicros: day.costMicros,
        conversions: day.conversions,
        ctr: day.ctr,
        avgCpc: day.avgCpc,
        costPerConversion: day.costPerConversion,
      },
    });
    synced++;
  }

  return { synced };
}
