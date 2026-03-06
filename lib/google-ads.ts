/**
 * Google Ads API Integration
 *
 * Uses the same OAuth connection stored in GMBConnection.
 * Requires a Google Ads developer token (GOOGLE_ADS_DEVELOPER_TOKEN env var).
 *
 * Required scope (added to GMB_SCOPES):
 *   - https://www.googleapis.com/auth/adwords
 */

import prisma from '@/lib/prisma';

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v16';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── Token helpers (shared pattern with google-analytics.ts) ──
async function getValidToken(connectionId: string): Promise<string> {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw new Error('Connection not found');

  if (conn.tokenExpiry && conn.tokenExpiry.getTime() > Date.now() + 60_000) {
    return conn.accessToken;
  }

  if (!conn.refreshToken) throw new Error('No refresh token. Please reconnect Google.');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth credentials missing');

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: conn.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        connectionStatus: 'refresh_failed',
        syncStatus: 'error',
        lastSyncError: data?.error_description || data?.error || 'Token refresh failed',
      },
    });
    throw new Error(data?.error_description || 'Token refresh failed');
  }

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: data.access_token,
      tokenExpiry: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      connectionStatus: 'connected',
      syncStatus: 'idle',
      lastSyncError: null,
    },
  });

  return data.access_token as string;
}

// ─── Authenticated Google Ads request ─────────────────────────
async function googleAdsRequest(connectionId: string, url: string, init: RequestInit = {}, loginCustomerId?: string) {
  const token = await getValidToken(connectionId);
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!developerToken) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is not configured. Add it to your environment variables.');
  }

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'developer-token': developerToken,
  };

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }

  const res = await fetch(url, { ...init, headers });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    const rawBody = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`Google Ads API error (${res.status}): ${rawBody.slice(0, 200)}`);
    }
    try { data = JSON.parse(rawBody); } catch { data = {}; }
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.error?.details?.[0]?.errors?.[0]?.message || `Google Ads API error (${res.status})`;
    throw new Error(errMsg);
  }

  return data ?? {};
}

// ══════════════════════════════════════════════════════════════
// Google Ads — List Accessible Customer Accounts
// ══════════════════════════════════════════════════════════════
export async function listGoogleAdsAccounts(connectionId: string) {
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
