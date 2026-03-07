/**
 * Google Analytics 4 (GA4) & Search Console Data Fetching
 *
 * Uses the same OAuth connection stored in GMBConnection but calls
 * the GA4 Data API and Search Console API.
 *
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

// ─── Constants ────────────────────────────────────────────────
const GA4_DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';
const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';

// Cache TTL: 30 minutes for discovery endpoints
const DISCOVERY_CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Thin request wrappers using google-api-core ─────────────
async function ga4ApiRequest(connectionId: string, url: string, init: RequestInit = {}) {
  return googleApiRequestWithRetry({
    connectionId,
    url,
    init,
    service: 'ga4',
    backoff: { maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 64_000, jitterFactor: 0.5 },
  });
}

async function searchConsoleApiRequest(connectionId: string, url: string, init: RequestInit = {}) {
  return googleApiRequestWithRetry({
    connectionId,
    url,
    init,
    service: 'search_console',
    backoff: { maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 64_000, jitterFactor: 0.5 },
  });
}

// ══════════════════════════════════════════════════════════════
// GA4 — Property Discovery
// ══════════════════════════════════════════════════════════════
export async function listGA4Properties(connectionId: string) {
  // Check SQL cache first (30-min TTL)
  const cacheKey = `ga4:${connectionId}:properties`;
  const cached = await getCachedApiResponse<{ propertyId: string; displayName: string; account: string }[]>(cacheKey);
  if (cached) return cached;

  const properties: { propertyId: string; displayName: string; account: string }[] = [];
  let pageToken: string | undefined;
  let attempts = 0;

  do {
    const url = pageToken
      ? `${GA4_ADMIN_API}/accountSummaries?pageToken=${encodeURIComponent(pageToken)}`
      : `${GA4_ADMIN_API}/accountSummaries`;

    const data = await ga4ApiRequest(connectionId, url);

    for (const acct of data.accountSummaries || []) {
      for (const prop of acct.propertySummaries || []) {
        properties.push({
          propertyId: prop.property, // e.g. "properties/123456"
          displayName: prop.displayName || prop.property,
          account: acct.displayName || acct.account,
        });
      }
    }

    pageToken = data.nextPageToken;
    attempts++;
  } while (pageToken && attempts < 10);

  await setCachedApiResponse(cacheKey, properties, DISCOVERY_CACHE_TTL_MS);
  return properties;
}

// ══════════════════════════════════════════════════════════════
// GA4 — Fetch Daily Metrics
// ══════════════════════════════════════════════════════════════
export async function fetchGA4Data(connectionId: string, propertyId: string, startDate: string, endDate: string) {
  // Ensure propertyId format is "properties/123456"
  const propId = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;

  // Google renamed "conversions" → "keyEvents" in late 2024.
  // Try keyEvents first, fall back to conversions for older properties.
  const conversionMetricNames = ['keyEvents', 'conversions'];

  for (const convMetric of conversionMetricNames) {
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
        { name: convMetric },
      ],
    };

    try {
      const data = await ga4ApiRequest(
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
    } catch (err: any) {
      // If this metric name is invalid, try the next one
      if (err.isMetricError && convMetric !== conversionMetricNames[conversionMetricNames.length - 1]) {
        console.warn(`[GA4] Metric "${convMetric}" not valid, retrying with fallback...`);
        continue;
      }
      throw err;
    }
  }

  // Should never reach here, but return empty array as safety net
  return [];
}

// GA4 — Traffic source breakdown
export async function fetchGA4TrafficSources(connectionId: string, propertyId: string, startDate: string, endDate: string) {
  const propId = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;

  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
  };

  const data = await ga4ApiRequest(
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
  // Check SQL cache first (30-min TTL)
  const cacheKey = `sc:${connectionId}:sites`;
  const cached = await getCachedApiResponse<{ siteUrl: string; permissionLevel: string }[]>(cacheKey);
  if (cached) return cached;

  const data = await searchConsoleApiRequest(
    connectionId,
    `${SEARCH_CONSOLE_API}/sites`,
  );

  const sites = (data.siteEntry || []).map((s: any) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));

  await setCachedApiResponse(cacheKey, sites, DISCOVERY_CACHE_TTL_MS);
  return sites;
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

  const data = await searchConsoleApiRequest(
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

  const data = await searchConsoleApiRequest(
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

  const data = await searchConsoleApiRequest(
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
export async function syncGA4Data(connectionId: string, syncDays = 90) {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.ga4PropertyId) return { synced: 0 };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - syncDays);

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

export async function syncSearchConsoleData(connectionId: string, syncDays = 90) {
  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.searchConsoleSite) return { synced: 0 };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - syncDays);

  const format = (d: Date) => d.toISOString().slice(0, 10);

  const [dailyData, topQueries, topPages] = await Promise.all([
    fetchSearchConsoleData(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
    fetchTopQueries(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
    fetchTopPages(connectionId, conn.searchConsoleSite, format(startDate), format(endDate)),
  ]);

  let synced = 0;
  const lastIndex = dailyData.length - 1;
  for (let i = 0; i < dailyData.length; i++) {
    const day = dailyData[i];
    const date = new Date(day.date + 'T00:00:00Z');
    const isLatest = i === lastIndex;

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
        topQueries: isLatest ? topQueries : undefined,
        topPages: isLatest ? topPages : undefined,
      },
      update: {
        clicks: day.clicks,
        impressions: day.impressions,
        ctr: day.ctr,
        avgPosition: day.avgPosition,
        ...(isLatest ? { topQueries, topPages } : {}),
      },
    });
    synced++;
  }

  return { synced };
}
