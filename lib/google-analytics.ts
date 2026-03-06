/**
 * Google Analytics 4 (GA4) & Search Console Data Fetching
 *
 * Uses the same OAuth connection stored in GMBConnection but calls
 * the GA4 Data API and Search Console API.
 *
 * Required scopes (already added to GMB_SCOPES):
 *   - https://www.googleapis.com/auth/analytics.readonly
 *   - https://www.googleapis.com/auth/webmasters.readonly
 */

import prisma from '@/lib/prisma';

// ─── Constants ────────────────────────────────────────────────
const GA4_DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';
const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── Token helpers ────────────────────────────────────────────
async function getValidToken(connectionId: string): Promise<string> {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw new Error('Connection not found');

  // If the token is still fresh, return it
  if (conn.tokenExpiry && conn.tokenExpiry.getTime() > Date.now() + 60_000) {
    return conn.accessToken;
  }

  // Refresh
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
  if (!res.ok) throw new Error(data?.error_description || 'Token refresh failed');

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: data.access_token,
      tokenExpiry: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    },
  });

  return data.access_token as string;
}

// ─── Generic authenticated request ───────────────────────────
async function googleApiRequest(connectionId: string, url: string, init: RequestInit = {}) {
  const token = await getValidToken(connectionId);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  let rawBody = '';

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      rawBody = await res.text();
    } catch {
      rawBody = '';
    }
  }

  if (!res.ok) {
    const apiMessage = data?.error?.message || data?.error;
    if (apiMessage) {
      throw new Error(apiMessage);
    }

    if (rawBody) {
      if (rawBody.includes('<!DOCTYPE') || rawBody.includes('<html')) {
        throw new Error(
          `Google API returned HTML instead of JSON (${res.status}). Verify required Google APIs are enabled and OAuth scopes are granted.`
        );
      }

      throw new Error(`Google API error (${res.status}): ${rawBody.slice(0, 200)}`);
    }

    throw new Error(`Google API error (${res.status})`);
  }

  return data ?? {};
}

// ══════════════════════════════════════════════════════════════
// GA4 — Property Discovery
// ══════════════════════════════════════════════════════════════
export async function listGA4Properties(connectionId: string) {
  const data = await googleApiRequest(
    connectionId,
    `${GA4_ADMIN_API}/accountSummaries`,
  );

  const properties: { propertyId: string; displayName: string; account: string }[] = [];
  for (const acct of data.accountSummaries || []) {
    for (const prop of acct.propertySummaries || []) {
      properties.push({
        propertyId: prop.property, // e.g. "properties/123456"
        displayName: prop.displayName || prop.property,
        account: acct.displayName || acct.account,
      });
    }
  }
  return properties;
}

// ══════════════════════════════════════════════════════════════
// GA4 — Fetch Daily Metrics
// ══════════════════════════════════════════════════════════════
export async function fetchGA4Data(connectionId: string, propertyId: string, startDate: string, endDate: string) {
  // Ensure propertyId format is "properties/123456"
  const propId = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;

  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'engagementRate' },
      { name: 'conversions' },
    ],
  };

  const data = await googleApiRequest(
    connectionId,
    `${GA4_DATA_API}/${propId}:runReport`,
    { method: 'POST', body: JSON.stringify(body) },
  );

  return (data.rows || []).map((row: any) => {
    const date = row.dimensionValues[0].value; // "20260301"
    const m = row.metricValues;
    return {
      date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      activeUsers: parseInt(m[0]?.value || '0', 10),
      newUsers: parseInt(m[1]?.value || '0', 10),
      sessions: parseInt(m[2]?.value || '0', 10),
      pageViews: parseInt(m[3]?.value || '0', 10),
      avgSessionDuration: parseFloat(m[4]?.value || '0'),
      bounceRate: parseFloat(m[5]?.value || '0'),
      engagementRate: parseFloat(m[6]?.value || '0'),
      conversions: parseInt(m[7]?.value || '0', 10),
    };
  });
}

// GA4 — Traffic source breakdown
export async function fetchGA4TrafficSources(connectionId: string, propertyId: string, startDate: string, endDate: string) {
  const propId = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;

  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
  };

  const data = await googleApiRequest(
    connectionId,
    `${GA4_DATA_API}/${propId}:runReport`,
    { method: 'POST', body: JSON.stringify(body) },
  );

  // Aggregate by date → channel
  const byDate = new Map<string, Record<string, number>>();
  for (const row of data.rows || []) {
    const rawDate = row.dimensionValues[0].value;
    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    const channel = (row.dimensionValues[1].value || 'Other').toLowerCase();
    const sessions = parseInt(row.metricValues[0]?.value || '0', 10);

    if (!byDate.has(date)) byDate.set(date, {});
    const existing = byDate.get(date)!;

    if (channel.includes('organic')) existing.organic = (existing.organic || 0) + sessions;
    else if (channel.includes('paid')) existing.paid = (existing.paid || 0) + sessions;
    else if (channel.includes('direct')) existing.direct = (existing.direct || 0) + sessions;
    else if (channel.includes('referral')) existing.referral = (existing.referral || 0) + sessions;
    else if (channel.includes('social')) existing.social = (existing.social || 0) + sessions;
    else existing.other = (existing.other || 0) + sessions;
  }

  return Array.from(byDate.entries()).map(([date, channels]) => ({
    date,
    organic: channels.organic || 0,
    paid: channels.paid || 0,
    direct: channels.direct || 0,
    referral: channels.referral || 0,
    social: channels.social || 0,
  }));
}

// ══════════════════════════════════════════════════════════════
// Search Console — Site Discovery
// ══════════════════════════════════════════════════════════════
export async function listSearchConsoleSites(connectionId: string) {
  const data = await googleApiRequest(
    connectionId,
    `${SEARCH_CONSOLE_API}/sites`,
  );

  return (data.siteEntry || []).map((s: any) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));
}

// ══════════════════════════════════════════════════════════════
// Search Console — Fetch Performance Data
// ══════════════════════════════════════════════════════════════
export async function fetchSearchConsoleData(connectionId: string, siteUrl: string, startDate: string, endDate: string) {
  const body = {
    startDate,
    endDate,
    dimensions: ['date'],
    rowLimit: 500,
  };

  const data = await googleApiRequest(
    connectionId,
    `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: 'POST', body: JSON.stringify(body) },
  );

  return (data.rows || []).map((row: any) => ({
    date: row.keys[0],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    avgPosition: row.position || 0,
  }));
}

// Search Console — Top queries (for AI ranking view)
export async function fetchTopQueries(connectionId: string, siteUrl: string, startDate: string, endDate: string, limit = 25) {
  const body = {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: limit,
    type: 'web',
  };

  const data = await googleApiRequest(
    connectionId,
    `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: 'POST', body: JSON.stringify(body) },
  );

  return (data.rows || []).map((row: any) => ({
    query: row.keys[0],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// Search Console — Top pages
export async function fetchTopPages(connectionId: string, siteUrl: string, startDate: string, endDate: string, limit = 25) {
  const body = {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: limit,
    type: 'web',
  };

  const data = await googleApiRequest(
    connectionId,
    `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: 'POST', body: JSON.stringify(body) },
  );

  return (data.rows || []).map((row: any) => ({
    page: row.keys[0],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// ══════════════════════════════════════════════════════════════
// Sync — Store GA4 + Search Console data in database
// ══════════════════════════════════════════════════════════════
export async function syncGA4Data(connectionId: string) {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.ga4PropertyId) return { synced: 0 };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const format = (d: Date) => d.toISOString().slice(0, 10);

  const [dailyData, trafficData] = await Promise.all([
    fetchGA4Data(connectionId, conn.ga4PropertyId, format(startDate), format(endDate)),
    fetchGA4TrafficSources(connectionId, conn.ga4PropertyId, format(startDate), format(endDate)),
  ]);

  // Merge traffic source data into daily data
  const trafficMap = new Map(trafficData.map(d => [d.date, d]));

  let synced = 0;
  for (const day of dailyData) {
    const traffic = trafficMap.get(day.date);
    const date = new Date(day.date + 'T00:00:00Z');

    await prisma.gA4Data.upsert({
      where: {
        gmbConnectionId_date: { gmbConnectionId: connectionId, date },
      },
      create: {
        gmbConnectionId: connectionId,
        date,
        activeUsers: day.activeUsers,
        newUsers: day.newUsers,
        sessions: day.sessions,
        pageViews: day.pageViews,
        avgSessionDuration: day.avgSessionDuration,
        bounceRate: day.bounceRate,
        engagementRate: day.engagementRate,
        conversions: day.conversions,
        organicSessions: traffic?.organic || 0,
        paidSessions: traffic?.paid || 0,
        directSessions: traffic?.direct || 0,
        referralSessions: traffic?.referral || 0,
        socialSessions: traffic?.social || 0,
      },
      update: {
        activeUsers: day.activeUsers,
        newUsers: day.newUsers,
        sessions: day.sessions,
        pageViews: day.pageViews,
        avgSessionDuration: day.avgSessionDuration,
        bounceRate: day.bounceRate,
        engagementRate: day.engagementRate,
        conversions: day.conversions,
        organicSessions: traffic?.organic || 0,
        paidSessions: traffic?.paid || 0,
        directSessions: traffic?.direct || 0,
        referralSessions: traffic?.referral || 0,
        socialSessions: traffic?.social || 0,
      },
    });
    synced++;
  }

  return { synced };
}

export async function syncSearchConsoleData(connectionId: string) {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.searchConsoleSite) return { synced: 0 };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const format = (d: Date) => d.toISOString().slice(0, 10);

  const [dailyData, topQueries, topPages] = await Promise.all([
    fetchSearchConsoleData(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
    fetchTopQueries(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
    fetchTopPages(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
  ]);

  let synced = 0;
  for (const day of dailyData) {
    const date = new Date(day.date + 'T00:00:00Z');

    await prisma.searchConsoleData.upsert({
      where: {
        gmbConnectionId_date: { gmbConnectionId: connectionId, date },
      },
      create: {
        gmbConnectionId: connectionId,
        date,
        clicks: day.clicks,
        impressions: day.impressions,
        ctr: day.ctr,
        avgPosition: day.avgPosition,
        topQueries: synced === 0 ? topQueries : undefined,
        topPages: synced === 0 ? topPages : undefined,
      },
      update: {
        clicks: day.clicks,
        impressions: day.impressions,
        ctr: day.ctr,
        avgPosition: day.avgPosition,
        ...(synced === 0 ? { topQueries, topPages } : {}),
      },
    });
    synced++;
  }

  return { synced };
}
