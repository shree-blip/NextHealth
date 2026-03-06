import prisma from '@/lib/prisma';

const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── Simple in-memory cache to avoid quota exhaustion ─────────
const apiCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any) {
  apiCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearGmbCache(clinicId?: string) {
  if (clinicId) {
    for (const key of apiCache.keys()) {
      if (key.includes(clinicId)) apiCache.delete(key);
    }
  } else {
    apiCache.clear();
  }
}

export const GMB_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

const DAILY_METRICS = [
  'WEBSITE_CLICKS',
  'BUSINESS_DIRECTION_REQUESTS',
  'CALL_CLICKS',
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
];

function normalizeAccountName(name: string) {
  return name.startsWith('accounts/') ? name : `accounts/${name}`;
}

function normalizeLocationName(name: string) {
  return name.startsWith('locations/') ? name : `locations/${name}`;
}

function toGoogleDateParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function toUtcMidnight(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getAppUrl() {
  return process.env.APP_URL || 'http://localhost:3000';
}

function formatStorefrontAddress(address: any) {
  if (!address) return null;

  const parts = [
    ...(address.addressLines || []),
    address.locality,
    address.administrativeArea,
    address.postalCode,
    address.regionCode,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

export function createGmbState(clinicId: string) {
  const payload = {
    clinicId,
    t: Date.now(),
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function parseGmbState(state: string) {
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      clinicId?: string;
      t?: number;
    };

    if (!parsed.clinicId || !parsed.t) return null;

    const ageMs = Date.now() - parsed.t;
    if (ageMs > 15 * 60 * 1000) return null;

    return { clinicId: parsed.clinicId };
  } catch {
    return null;
  }
}

export function getGmbOAuthUrl(clinicId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const redirectUri = `${getAppUrl()}/api/admin/gmb/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent select_account',
    scope: GMB_SCOPES.join(' '),
    state: createGmbState(clinicId),
  });

  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const redirectUri = `${getAppUrl()}/api/admin/gmb/callback`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await response.json();
  if (!response.ok) {
    throw new Error(tokenData?.error_description || tokenData?.error || 'Failed to exchange OAuth code');
  }

  return {
    accessToken: tokenData.access_token as string,
    refreshToken: tokenData.refresh_token as string | undefined,
    expiresIn: (tokenData.expires_in as number | undefined) || 3600,
  };
}

export async function fetchGoogleEmail(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch Google user profile');
  }

  return (data.email as string | undefined) || null;
}

async function refreshGmbToken(connectionId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection?.refreshToken) {
    throw new Error('Missing refresh token. Please reconnect Google Business Profile.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        connectionStatus: 'refresh_failed',
        syncStatus: 'error',
        lastSyncError: data?.error_description || data?.error || 'Token refresh failed',
      },
    });

    throw new Error(data?.error_description || data?.error || 'Failed to refresh Google token');
  }

  const updated = await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: data.access_token,
      tokenExpiry: new Date(Date.now() + ((data.expires_in || 3600) * 1000)),
      connectionStatus: 'connected',
      syncStatus: 'idle',
      lastSyncError: null,
    },
  });

  return updated.accessToken;
}

async function gmbApiRequest(connectionId: string, url: string, init: RequestInit = {}) {
  let connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error('GMB connection not found');

  let accessToken = connection.accessToken;

  if (connection.tokenExpiry && connection.tokenExpiry.getTime() < Date.now() + 60_000 && connection.refreshToken) {
    accessToken = await refreshGmbToken(connectionId);
  }

  const makeRequest = async (token: string) => {
    return fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && connection.refreshToken) {
    accessToken = await refreshGmbToken(connectionId);
    response = await makeRequest(accessToken);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || 'Google API request failed');
  }

  return data;
}

export async function upsertOAuthConnection(params: {
  clinicId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  googleEmail: string | null;
}) {
  const tokenExpiry = new Date(Date.now() + params.expiresIn * 1000);

  const existing = await prisma.gMBConnection.findUnique({ where: { clinicId: params.clinicId } });

  if (existing) {
    return prisma.gMBConnection.update({
      where: { clinicId: params.clinicId },
      data: {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken || existing.refreshToken,
        tokenExpiry,
        googleEmail: params.googleEmail,
        connectionStatus: existing.businessLocationId ? 'connected' : 'pending_selection',
        syncStatus: 'idle',
        lastSyncError: null,
      },
    });
  }

  return prisma.gMBConnection.create({
    data: {
      clinicId: params.clinicId,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      tokenExpiry,
      googleEmail: params.googleEmail,
      connectionStatus: 'pending_selection',
      syncStatus: 'idle',
      businessAccountId: null,
      businessLocationId: null,
      businessName: null,
      locationName: null,
      locationAddress: null,
      lastSyncedAt: null,
      nextSyncAt: null,
      lastSyncError: null,
    },
  });
}

export async function listGmbAccounts(clinicId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
  if (!connection) throw new Error('No Google connection found for this clinic');

  // Check cache first
  const cacheKey = `accounts:${clinicId}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return { connection, accounts: cached };

  const data = await gmbApiRequest(connection.id, 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
  const accounts = (data.accounts || []).map((account: any) => ({
    name: account.name,
    accountName: account.accountName,
    type: account.type,
  }));

  setCache(cacheKey, accounts);
  return { connection, accounts };
}

export async function listGmbLocations(clinicId: string, accountName: string) {
  const normalizedAccount = normalizeAccountName(accountName);
  const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
  if (!connection) throw new Error('No Google connection found for this clinic');

  // Check cache first
  const cacheKey = `locations:${clinicId}:${normalizedAccount}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  const readMask = [
    'name',
    'title',
    'storefrontAddress',
  ].join(',');

  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${normalizedAccount}/locations?readMask=${encodeURIComponent(readMask)}&pageSize=100`;
  const data = await gmbApiRequest(connection.id, url);

  const locations = (data.locations || []).map((location: any) => ({
    name: location.name,
    title: location.title,
    address: formatStorefrontAddress(location.storefrontAddress),
  }));

  setCache(cacheKey, locations);
  return locations;
}

export async function selectGmbLocation(params: {
  clinicId: string;
  accountName: string;
  locationName: string;
}) {
  const normalizedAccount = normalizeAccountName(params.accountName);
  const normalizedLocation = normalizeLocationName(params.locationName);

  const { accounts } = await listGmbAccounts(params.clinicId);
  const locations = await listGmbLocations(params.clinicId, normalizedAccount);

  const selectedAccount = accounts.find((account: any) => account.name === normalizedAccount);
  if (!selectedAccount) {
    throw new Error('Selected account not found in connected Google account');
  }

  const selectedLocation = locations.find((location: any) => location.name === normalizedLocation);
  if (!selectedLocation) {
    throw new Error('Selected location not found in selected account');
  }

  const updated = await prisma.gMBConnection.update({
    where: { clinicId: params.clinicId },
    data: {
      businessAccountId: selectedAccount.name,
      businessName: selectedAccount.accountName || selectedAccount.name,
      businessLocationId: selectedLocation.name,
      locationName: selectedLocation.title || selectedLocation.name,
      locationAddress: selectedLocation.address,
      connectionStatus: 'connected',
      syncStatus: 'idle',
      lastSyncError: null,
      nextSyncAt: addDays(toUtcMidnight(new Date()), 1),
    },
  });

  return updated;
}

function aggregateMetricSeries(series: any[]) {
  const byDate = new Map<string, {
    views: number;
    directionRequests: number;
    phoneCalls: number;
    websiteClicks: number;
  }>();

  for (const metricSeries of series) {
    const metricName = metricSeries.dailyMetric;
    const datedValues = metricSeries.timeSeries?.datedValues || [];

    for (const valueEntry of datedValues) {
      const date = valueEntry.date;
      if (!date?.year || !date?.month || !date?.day) continue;

      const dayDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
      const dateKey = dayDate.toISOString();

      const existing = byDate.get(dateKey) || {
        views: 0,
        directionRequests: 0,
        phoneCalls: 0,
        websiteClicks: 0,
      };

      const value = Number(valueEntry.value || 0);

      if (metricName === 'WEBSITE_CLICKS') {
        existing.websiteClicks += value;
      } else if (metricName === 'BUSINESS_DIRECTION_REQUESTS') {
        existing.directionRequests += value;
      } else if (metricName === 'CALL_CLICKS') {
        existing.phoneCalls += value;
      } else if (
        metricName === 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS' ||
        metricName === 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH' ||
        metricName === 'BUSINESS_IMPRESSIONS_MOBILE_MAPS' ||
        metricName === 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'
      ) {
        existing.views += value;
      }

      byDate.set(dateKey, existing);
    }
  }

  return byDate;
}

export async function syncGmbConnection(connectionId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection) {
    throw new Error('GMB connection not found');
  }

  if (!connection.businessLocationId) {
    throw new Error('No business location selected');
  }

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      syncStatus: 'syncing',
      lastSyncError: null,
    },
  });

  try {
    const endDate = toUtcMidnight(new Date());
    const startDate = connection.lastSyncedAt
      ? toUtcMidnight(addDays(connection.lastSyncedAt, 1))
      : toUtcMidnight(addDays(endDate, -30));

    const effectiveStart = startDate > endDate ? endDate : startDate;

    const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/${connection.businessLocationId}:fetchMultiDailyMetricsTimeSeries`;

    const performanceData = await gmbApiRequest(connectionId, performanceUrl, {
      method: 'POST',
      body: JSON.stringify({
        dailyMetrics: DAILY_METRICS,
        dailyRange: {
          startDate: toGoogleDateParts(effectiveStart),
          endDate: toGoogleDateParts(endDate),
        },
      }),
    });

    const dateMap = aggregateMetricSeries(performanceData.multiDailyMetricTimeSeries || []);

    for (const [dateKey, metrics] of dateMap.entries()) {
      const date = new Date(dateKey);

      await prisma.gMBData.upsert({
        where: {
          gmbConnectionId_date: {
            gmbConnectionId: connectionId,
            date,
          },
        },
        create: {
          gmbConnectionId: connectionId,
          date,
          views: metrics.views,
          discovery: metrics.views,
          directionRequests: metrics.directionRequests,
          phoneImpressions: 0,
          phoneCalls: metrics.phoneCalls,
          websiteClicks: metrics.websiteClicks,
          messageCount: 0,
          totalReviews: 0,
          averageRating: 0,
          newReviews: 0,
          questions: 0,
          answers: 0,
          totalPosts: 0,
          activePosts: 0,
          isOpenNow: false,
        },
        update: {
          views: metrics.views,
          discovery: metrics.views,
          directionRequests: metrics.directionRequests,
          phoneCalls: metrics.phoneCalls,
          websiteClicks: metrics.websiteClicks,
        },
      });
    }

    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        syncStatus: 'idle',
        connectionStatus: 'connected',
        lastSyncedAt: new Date(),
        nextSyncAt: addDays(toUtcMidnight(new Date()), 1),
        lastSyncError: null,
      },
    });
  } catch (error: any) {
    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        syncStatus: 'error',
        lastSyncError: error?.message || 'GMB sync failed',
      },
    });

    throw error;
  }
}

export async function syncDueGmbConnections() {
  const dueConnections = await prisma.gMBConnection.findMany({
    where: {
      connectionStatus: 'connected',
      businessLocationId: { not: null },
      OR: [
        { nextSyncAt: null },
        { nextSyncAt: { lte: new Date() } },
      ],
    },
    orderBy: { nextSyncAt: 'asc' },
    take: 20,
  });

  for (const connection of dueConnections) {
    try {
      await syncGmbConnection(connection.id);
    } catch (error) {
      console.error(`[GMB Sync] Failed for clinic ${connection.clinicId}:`, error);
    }
  }
}

export async function getGmbConnectionByClinic(clinicId: string) {
  return prisma.gMBConnection.findUnique({
    where: { clinicId },
    include: {
      gmbData: {
        orderBy: { date: 'desc' },
        take: 14,
      },
    },
  });
}
