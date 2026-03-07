/**
 * Google API Core — Shared infrastructure for all Google API integrations.
 *
 * Provides:
 *  1. Unified token management (single getValidToken, no duplication)
 *  2. Exponential Backoff with Jitter for 429/5xx errors
 *  3. Per-service rate limiting via semaphore
 *  4. SQL-backed API response cache (GoogleApiCache table)
 *  5. Authenticated request helper with retry
 *  6. API health diagnostics
 */

import prisma from '@/lib/prisma';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ══════════════════════════════════════════════════════════════
// Google API Registry — Maps URLs to human-readable names & enablement links
// ══════════════════════════════════════════════════════════════

const API_REGISTRY: { pattern: string; name: string; enableUrl: string; testUrl?: string }[] = [
  {
    pattern: 'mybusinessaccountmanagement.googleapis.com',
    name: 'My Business Account Management API',
    enableUrl: 'https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com',
    testUrl: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
  },
  {
    pattern: 'mybusinessbusinessinformation.googleapis.com',
    name: 'My Business Business Information API',
    enableUrl: 'https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com',
  },
  {
    pattern: 'businessprofileperformance.googleapis.com',
    name: 'Business Profile Performance API',
    enableUrl: 'https://console.cloud.google.com/apis/library/businessprofileperformance.googleapis.com',
  },
  {
    pattern: 'analyticsdata.googleapis.com',
    name: 'Google Analytics Data API',
    enableUrl: 'https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com',
    testUrl: 'https://analyticsdata.googleapis.com/v1beta/properties/0:runReport',
  },
  {
    pattern: 'analyticsadmin.googleapis.com',
    name: 'Google Analytics Admin API',
    enableUrl: 'https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com',
    testUrl: 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
  },
  {
    pattern: 'googleapis.com/webmasters',
    name: 'Google Search Console API',
    enableUrl: 'https://console.cloud.google.com/apis/library/searchconsole.googleapis.com',
    testUrl: 'https://www.googleapis.com/webmasters/v3/sites',
  },
  {
    pattern: 'googleads.googleapis.com',
    name: 'Google Ads API',
    enableUrl: 'https://console.cloud.google.com/apis/library/googleads.googleapis.com',
  },
];

function getApiInfoFromUrl(url: string): { name: string; enableUrl: string } {
  for (const entry of API_REGISTRY) {
    if (url.includes(entry.pattern)) {
      return { name: entry.name, enableUrl: entry.enableUrl };
    }
  }
  return { name: 'Google API', enableUrl: 'https://console.cloud.google.com/apis/library' };
}

// Negative-result cache: prevents hammering broken APIs
const ERROR_CACHE_TTL_MS = 5 * 60 * 1000; // Cache errors for 5 minutes

// ══════════════════════════════════════════════════════════════
// 1. Unified Token Management
// ══════════════════════════════════════════════════════════════

// In-memory token cache to avoid repeated DB reads within the same request
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function getValidToken(connectionId: string): Promise<string> {
  // Check in-memory cache first (valid if >2 min remaining)
  const cached = tokenCache.get(connectionId);
  if (cached && cached.expiresAt > Date.now() + 120_000) {
    return cached.token;
  }

  const conn = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw new Error('Connection not found');

  // Token still fresh (>60s remaining)
  if (conn.tokenExpiry && conn.tokenExpiry.getTime() > Date.now() + 60_000) {
    tokenCache.set(connectionId, {
      token: conn.accessToken,
      expiresAt: conn.tokenExpiry.getTime(),
    });
    return conn.accessToken;
  }

  // Refresh needed
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
    // Clear from token cache
    tokenCache.delete(connectionId);
    throw new Error(data?.error_description || data?.error || 'Token refresh failed');
  }

  const newExpiry = Date.now() + (data.expires_in || 3600) * 1000;

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: data.access_token,
      tokenExpiry: new Date(newExpiry),
      connectionStatus: 'connected',
      syncStatus: 'idle',
      lastSyncError: null,
    },
  });

  tokenCache.set(connectionId, {
    token: data.access_token,
    expiresAt: newExpiry,
  });

  return data.access_token as string;
}

// ══════════════════════════════════════════════════════════════
// 2. Exponential Backoff with Jitter
// ══════════════════════════════════════════════════════════════

interface BackoffOptions {
  maxAttempts?: number;     // default 5
  baseDelayMs?: number;     // default 1000
  maxDelayMs?: number;      // default 64000
  jitterFactor?: number;    // default 0.5 (±50%)
}

async function sleepWithJitter(baseMs: number, jitterFactor: number, maxMs: number) {
  const jitter = baseMs * jitterFactor * (Math.random() * 2 - 1);
  const delay = Math.min(Math.max(100, baseMs + jitter), maxMs);
  await new Promise(r => setTimeout(r, delay));
  return delay;
}

// ══════════════════════════════════════════════════════════════
// 3. Rate Limiting — In-process Semaphore per Service
// ══════════════════════════════════════════════════════════════

type ServiceKey = 'gbp' | 'ga4' | 'search_console' | 'google_ads';

interface SemaphoreTicket {
  resolve: () => void;
}

class RateLimiter {
  private concurrency: Map<ServiceKey, number> = new Map();
  private active: Map<ServiceKey, number> = new Map();
  private queues: Map<ServiceKey, SemaphoreTicket[]> = new Map();

  // Minimum interval between requests per service (ms)
  private minInterval: Map<ServiceKey, number> = new Map();
  private lastRequestAt: Map<ServiceKey, number> = new Map();

  constructor() {
    // Max concurrent requests per service
    this.concurrency.set('gbp', 5);        // GBP: conservative
    this.concurrency.set('ga4', 10);       // GA4: 10 concurrent as spec'd
    this.concurrency.set('search_console', 5);
    this.concurrency.set('google_ads', 5);

    // Minimum interval between requests (ms)
    // GBP edits: 10/min = 6000ms apart; reads: 1000ms
    this.minInterval.set('gbp', 1000);
    this.minInterval.set('ga4', 200);
    this.minInterval.set('search_console', 500);
    this.minInterval.set('google_ads', 500);

    for (const key of this.concurrency.keys()) {
      this.active.set(key, 0);
      this.queues.set(key, []);
      this.lastRequestAt.set(key, 0);
    }
  }

  async acquire(service: ServiceKey): Promise<void> {
    const max = this.concurrency.get(service) || 5;
    const current = this.active.get(service) || 0;

    if (current < max) {
      this.active.set(service, current + 1);
      // Enforce minimum interval
      await this.enforceInterval(service);
      return;
    }

    // Wait in queue
    return new Promise<void>((resolve) => {
      this.queues.get(service)!.push({ resolve });
    });
  }

  release(service: ServiceKey): void {
    const queue = this.queues.get(service)!;
    if (queue.length > 0) {
      const ticket = queue.shift()!;
      // Enforce interval before releasing next request
      this.enforceInterval(service).then(() => ticket.resolve());
    } else {
      this.active.set(service, (this.active.get(service) || 1) - 1);
    }
  }

  private async enforceInterval(service: ServiceKey) {
    const interval = this.minInterval.get(service) || 0;
    const last = this.lastRequestAt.get(service) || 0;
    const elapsed = Date.now() - last;
    if (elapsed < interval) {
      await new Promise(r => setTimeout(r, interval - elapsed));
    }
    this.lastRequestAt.set(service, Date.now());
  }
}

const rateLimiter = new RateLimiter();

// ══════════════════════════════════════════════════════════════
// 4. SQL-Backed API Response Cache
// ══════════════════════════════════════════════════════════════

const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function getCachedApiResponse<T>(cacheKey: string): Promise<T | null> {
  try {
    const entry = await prisma.googleApiCache.findUnique({ where: { cacheKey } });
    if (!entry) return null;
    if (entry.expiresAt < new Date()) {
      // Expired but still return stale data; caller decides whether to refresh
      return null;
    }
    return entry.responseData as T;
  } catch {
    return null;
  }
}

export async function getStaleCachedApiResponse<T>(cacheKey: string): Promise<{ data: T; isStale: boolean } | null> {
  try {
    const entry = await prisma.googleApiCache.findUnique({ where: { cacheKey } });
    if (!entry) return null;
    const isStale = entry.expiresAt < new Date();
    return { data: entry.responseData as T, isStale };
  } catch {
    return null;
  }
}

export async function setCachedApiResponse(cacheKey: string, data: any, ttlMs: number = DEFAULT_CACHE_TTL_MS) {
  try {
    await prisma.googleApiCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        responseData: data,
        expiresAt: new Date(Date.now() + ttlMs),
      },
      update: {
        responseData: data,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });
  } catch (err) {
    console.warn('[GoogleApiCache] Failed to write cache:', err);
  }
}

export async function clearCachedApiResponse(cacheKeyPrefix: string) {
  try {
    await prisma.googleApiCache.deleteMany({
      where: { cacheKey: { startsWith: cacheKeyPrefix } },
    });
  } catch {
    // Best-effort
  }
}

// ══════════════════════════════════════════════════════════════
// 5. Authenticated Request with Retry + Backoff + Rate Limiting
// ══════════════════════════════════════════════════════════════

interface GoogleApiRequestOptions {
  connectionId: string;
  url: string;
  init?: RequestInit;
  service: ServiceKey;
  backoff?: BackoffOptions;
  /** Extra headers (e.g. developer-token for Google Ads) */
  extraHeaders?: Record<string, string>;
}

export async function googleApiRequestWithRetry(options: GoogleApiRequestOptions): Promise<any> {
  const {
    connectionId,
    url,
    init = {},
    service,
    extraHeaders = {},
    backoff: backoffOpts = {},
  } = options;

  // ── Check negative cache — skip if API recently returned 403 ──
  const errCacheKey = `api_error:${service}:403`;
  const cachedError = await getCachedApiResponse<{ error: string; status: number }>(errCacheKey).catch(() => null);
  if (cachedError && cachedError.status === 403) {
    throw new Error(cachedError.error);
  }

  const maxAttempts = backoffOpts.maxAttempts ?? 5;
  const baseDelayMs = backoffOpts.baseDelayMs ?? 1000;
  const maxDelayMs = backoffOpts.maxDelayMs ?? 64_000;
  const jitterFactor = backoffOpts.jitterFactor ?? 0.5;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Acquire rate limiter slot
    await rateLimiter.acquire(service);

    try {
      const token = await getValidToken(connectionId);

      const res = await fetch(url, {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...extraHeaders,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Parse response
      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      let rawBody = '';

      if (contentType.includes('application/json')) {
        try { data = await res.json(); } catch { data = null; }
      } else {
        rawBody = await res.text().catch(() => '');
      }

      // ── Success ───────────────────────────────────────────
      if (res.ok) {
        if (!data && rawBody) {
          try { data = JSON.parse(rawBody); } catch { data = {}; }
        }
        return data ?? {};
      }

      // ── 401 Unauthorized — token expired, refresh and retry ──
      if (res.status === 401 && attempt < maxAttempts - 1) {
        console.log(`[GoogleAPI] 401 on attempt ${attempt + 1}, refreshing token...`);
        tokenCache.delete(connectionId);
        // Force token refresh by clearing expiry
        await prisma.gMBConnection.update({
          where: { id: connectionId },
          data: { tokenExpiry: new Date(0) },
        }).catch(() => {});
        continue; // Retry immediately (no backoff for 401)
      }

      // ── 429 Rate Limited — backoff with jitter ────────────
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '0', 10);
        const delayMs = retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
        const actualDelay = await sleepWithJitter(delayMs, jitterFactor, maxDelayMs);
        console.log(`[GoogleAPI] 429 rate limited, attempt ${attempt + 1}/${maxAttempts}, waited ${Math.round(actualDelay)}ms`);
        lastError = new Error(`Google API rate limited (429)`);
        continue;
      }

      // ── 5xx Server Error — backoff with jitter ────────────
      if (res.status >= 500) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        const actualDelay = await sleepWithJitter(delayMs, jitterFactor, maxDelayMs);
        console.log(`[GoogleAPI] ${res.status} server error, attempt ${attempt + 1}/${maxAttempts}, waited ${Math.round(actualDelay)}ms`);
        lastError = new Error(`Google API server error (${res.status})`);
        continue;
      }

      // ── Other client errors — don't retry ─────────────────
      const apiMessage = data?.error?.message
        || data?.error?.details?.[0]?.errors?.[0]?.message
        || (typeof data?.error === 'string' ? data.error : null)
        || null;

      const { name: apiName, enableUrl } = getApiInfoFromUrl(url);

      // Special GA4 metric error handling
      if (res.status === 400 && typeof apiMessage === 'string' && apiMessage.includes('is not a valid metric')) {
        const err = new Error(apiMessage);
        (err as any).isMetricError = true;
        throw err;
      }

      if (rawBody && (rawBody.includes('<!DOCTYPE') || rawBody.includes('<html'))) {
        throw new Error(
          `${apiName} returned HTML instead of JSON (${res.status}). Ensure the API is enabled at: ${enableUrl}`
        );
      }

      // ── 403 Permission Denied — usually means API not enabled or missing scopes
      if (res.status === 403) {
        const isNotEnabled = typeof apiMessage === 'string' && (
          apiMessage.includes('has not been used') ||
          apiMessage.includes('is disabled') ||
          apiMessage.includes('not been enabled')
        );
        const isScopeIssue = typeof apiMessage === 'string' && apiMessage.includes('insufficient authentication scopes');

        let guidance: string;
        if (isNotEnabled) {
          guidance = `${apiName} is not enabled. Enable it at: ${enableUrl}`;
        } else if (isScopeIssue) {
          guidance = `${apiName}: Insufficient OAuth scopes. Disconnect and reconnect your Google account to grant the required permissions.`;
        } else {
          guidance = `${apiName}: Access denied (403). ${apiMessage || 'Ensure the API is enabled and your account has permission.'}  Enable API: ${enableUrl}`;
        }

        // Cache the 403 error to stop hammering a misconfigured API
        const errCacheKey = `api_error:${service}:403`;
        await setCachedApiResponse(errCacheKey, { error: guidance, status: 403 }, ERROR_CACHE_TTL_MS).catch(() => {});

        const err = new Error(guidance);
        (err as any).statusCode = 403;
        (err as any).apiName = apiName;
        (err as any).enableUrl = enableUrl;
        throw err;
      }

      throw new Error(
        `${apiName}: ${apiMessage || `API error (${res.status})`}`
      );

    } catch (err: any) {
      lastError = err;
      // If it's a non-retryable error (metric error, HTML response, etc.), throw immediately
      if (err.isMetricError || err.message?.includes('HTML instead of JSON') || err.message?.includes('OAuth credentials missing') || err.message?.includes('No refresh token')) {
        throw err;
      }
      // For unexpected fetch errors (network), backoff and retry
      if (attempt < maxAttempts - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await sleepWithJitter(delayMs, jitterFactor, maxDelayMs);
      }
    } finally {
      rateLimiter.release(service);
    }
  }

  throw lastError || new Error('Google API request failed after all retries');
}

// ══════════════════════════════════════════════════════════════
// 6. API Health Diagnostics — Test connectivity for each Google API
// ══════════════════════════════════════════════════════════════

export interface ApiHealthStatus {
  api: string;
  enabled: boolean;
  error?: string;
  enableUrl: string;
  latencyMs?: number;
}

/**
 * Tests connectivity for each Google API by making lightweight probe requests.
 * Returns per-API status so admins can see exactly which APIs need attention.
 */
export async function checkGoogleApiHealth(connectionId: string): Promise<ApiHealthStatus[]> {
  let token: string;
  try {
    token = await getValidToken(connectionId);
  } catch (err: any) {
    return API_REGISTRY.map(api => ({
      api: api.name,
      enabled: false,
      error: `Token error: ${err.message}`,
      enableUrl: api.enableUrl,
    }));
  }

  const results: ApiHealthStatus[] = [];

  const probes: { name: string; url: string; enableUrl: string; method?: string }[] = [
    {
      name: 'My Business Account Management API',
      url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      enableUrl: 'https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com',
    },
    {
      name: 'Business Profile Performance API',
      url: 'https://businessprofileperformance.googleapis.com/v1/locations/0:fetchMultiDailyMetricsTimeSeries',
      enableUrl: 'https://console.cloud.google.com/apis/library/businessprofileperformance.googleapis.com',
    },
    {
      name: 'Google Analytics Admin API',
      url: 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
      enableUrl: 'https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com',
    },
    {
      name: 'Google Analytics Data API',
      url: 'https://analyticsdata.googleapis.com/v1beta/properties/0:runReport',
      enableUrl: 'https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com',
      method: 'POST',
    },
    {
      name: 'Google Search Console API',
      url: 'https://www.googleapis.com/webmasters/v3/sites',
      enableUrl: 'https://console.cloud.google.com/apis/library/searchconsole.googleapis.com',
    },
  ];

  // Run probes in parallel
  const probePromises = probes.map(async (probe) => {
    const start = Date.now();
    try {
      const res = await fetch(probe.url, {
        method: probe.method || 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(probe.method === 'POST' ? { body: JSON.stringify({}) } : {}),
      });

      const latencyMs = Date.now() - start;
      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      }

      // 200 or 400 (bad request but API is reachable) means the API is enabled
      // 403 with "not been used" / "disabled" means the API is not enabled
      // 404 on a known endpoint means the API is enabled but resource doesn't exist
      if (res.ok || res.status === 400 || res.status === 404) {
        return {
          api: probe.name,
          enabled: true,
          enableUrl: probe.enableUrl,
          latencyMs,
        };
      }

      if (res.status === 403) {
        const msg = data?.error?.message || '';
        const isNotEnabled = msg.includes('has not been used') || msg.includes('disabled') || msg.includes('not been enabled');
        return {
          api: probe.name,
          enabled: !isNotEnabled,
          error: isNotEnabled
            ? `API not enabled. Enable at: ${probe.enableUrl}`
            : `Access denied: ${msg || 'Check permissions'}`,
          enableUrl: probe.enableUrl,
          latencyMs,
        };
      }

      return {
        api: probe.name,
        enabled: false,
        error: `HTTP ${res.status}: ${data?.error?.message || 'Unknown error'}`,
        enableUrl: probe.enableUrl,
        latencyMs,
      };
    } catch (err: any) {
      return {
        api: probe.name,
        enabled: false,
        error: `Network error: ${err.message}`,
        enableUrl: probe.enableUrl,
      };
    }
  });

  return Promise.all(probePromises);
}

/**
 * Clears the negative (error) cache for a specific service or all services.
 * Call this after the user fixes their API configuration.
 */
export async function clearApiErrorCache(service?: ServiceKey) {
  if (service) {
    await clearCachedApiResponse(`api_error:${service}:`).catch(() => {});
  } else {
    for (const svc of ['gbp', 'ga4', 'search_console', 'google_ads'] as ServiceKey[]) {
      await clearCachedApiResponse(`api_error:${svc}:`).catch(() => {});
    }
  }
}

// ══════════════════════════════════════════════════════════════
// 7. Background Sync Worker — Concurrency-Controlled
// ══════════════════════════════════════════════════════════════

interface SyncTask {
  connectionId: string;
  clinicId: string;
  type: 'gmb' | 'ga4' | 'search_console' | 'google_ads';
}

export async function runSyncWorker(
  tasks: SyncTask[],
  syncFn: (task: SyncTask) => Promise<any>,
  maxConcurrent: number = 3,
): Promise<{ clinicId: string; type: string; result?: any; error?: string }[]> {
  const results: { clinicId: string; type: string; result?: any; error?: string }[] = [];
  let index = 0;

  const worker = async () => {
    while (index < tasks.length) {
      const taskIndex = index++;
      const task = tasks[taskIndex];

      try {
        const result = await syncFn(task);
        results.push({ clinicId: task.clinicId, type: task.type, result });
      } catch (err: any) {
        console.error(`[SyncWorker] ${task.type} sync failed for clinic ${task.clinicId}:`, err.message);
        results.push({ clinicId: task.clinicId, type: task.type, error: err.message });
      }
    }
  };

  // Launch workers up to maxConcurrent
  const workers = Array.from({ length: Math.min(maxConcurrent, tasks.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
