# GBP Sync - Implementation Fixes & Code Samples

This document provides ready-to-use code samples for fixing the critical issues identified in [GBP_SYNC_ANALYSIS.md](GBP_SYNC_ANALYSIS.md).

---

## Fix #1: Add Cooldown to Manual Sync Endpoint

### Before ❌
```typescript
// app/api/admin/gmb/sync/route.ts
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const clinicId = body?.clinicId as string | undefined;

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No GMB connection found for this clinic' }, { status: 404 });
    }

    await syncGmbConnection(connection.id);
    // ❌ User can click again immediately and trigger another sync
```

### After ✅
```typescript
// app/api/admin/gmb/sync/route.ts
const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const body = await req.json().catch(() => ({}));
    const clinicId = body?.clinicId as string | undefined;

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No GMB connection found for this clinic' }, { status: 404 });
    }

    // ✅ NEW: Check cooldown
    if (connection.lastSyncedAt) {
      const timeSinceLastSync = Date.now() - connection.lastSyncedAt.getTime();
      if (timeSinceLastSync < SYNC_COOLDOWN_MS) {
        const secondsRemaining = Math.ceil((SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${secondsRemaining} seconds before syncing again (max once every 5 minutes).`,
            retryAfter: secondsRemaining,
          },
          { status: 429, headers: { 'Retry-After': secondsRemaining.toString() } }
        );
      }
    }

    await syncGmbConnection(connection.id);

    const refreshed = await prisma.gMBConnection.findUnique({ where: { id: connection.id } });

    return NextResponse.json({
      success: true,
      connection: refreshed,
    });
  } catch (error: any) {
    console.error('GMB manual sync error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync GMB data' }, { status: 500 });
  }
}
```

### Frontend Changes
```typescript
// app/dashboard/admin/page.tsx - in the sync button section

// Add state for cooldown
const [syncCooldownSeconds, setSyncCooldownSeconds] = useState(0);

useEffect(() => {
  if (syncCooldownSeconds <= 0) return;
  const timer = setInterval(() => {
    setSyncCooldownSeconds(s => s - 1);
  }, 1000);
  return () => clearInterval(timer);
}, [syncCooldownSeconds]);

// Update sync button click handler
<button
  onClick={async () => {
    if (!editingClinic?.id) return;
    setGmbState(prev => ({ ...prev, confirmSyncing: true, error: '', message: '' }));
    try {
      const syncPromises: Promise<void>[] = [];
      if (gmbState.connection.businessLocationId) {
        syncPromises.push(
          fetch('/api/admin/gmb/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clinicId: editingClinic.id }),
          })
            .then(r => {
              if (r.status === 429) {
                const retryAfter = r.headers.get('Retry-After');
                setSyncCooldownSeconds(parseInt(retryAfter || '300', 10));
                throw new Error('Sync cooldown active - please wait');
              }
              if (!r.ok) throw new Error('GBP sync failed');
            })
            .catch(() => {})
        );
      }
      if (gmbState.selectedGA4Property || gmbState.selectedSCSite) {
        syncPromises.push(
          fetch('/api/admin/gmb/sync-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clinicId: editingClinic.id }),
          }).then(r => { if (!r.ok) throw new Error('Analytics sync failed'); }).catch(() => {})
        );
      }
      if (syncPromises.length === 0) throw new Error('No integrations configured to sync');
      await Promise.allSettled(syncPromises);
      await fetchGmbConnection(editingClinic.id, true);
      setGmbState(prev => ({
        ...prev,
        confirmSyncing: false,
        message: `Data synced successfully at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Dashboard charts will update shortly.`,
      }));
    } catch (err: any) {
      setGmbState(prev => ({
        ...prev,
        confirmSyncing: false,
        error: err?.message || 'Sync failed. Please try again.',
      }));
    }
  }}
  disabled={
    gmbState.confirmSyncing ||
    syncCooldownSeconds > 0 ||  // ✅ Disable if cooldown active
    (!gmbState.connection.businessLocationId && !gmbState.selectedGA4Property && !gmbState.selectedSCSite)
  }
  className={...}
>
  {gmbState.confirmSyncing ? (
    <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing Data...</>
  ) : syncCooldownSeconds > 0 ? (
    <><RefreshCw className="h-4 w-4" /> Try again in {syncCooldownSeconds}s</>  // ✅ Show countdown
  ) : (
    <><RefreshCw className="h-4 w-4" /> Sync Data Now</>
  )}
</button>
```

---

## Fix #2: Implement Exponential Backoff with Jitter

### Before ❌
```typescript
// lib/gmb.ts - lines 271-276
const gmbApiRequest = async (connectionId: string, url: string, init: RequestInit = {}) => {
  // ... token handling ...

  // Handle 429 rate limit with one automatic retry after a short delay
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
    const waitMs = Math.min(retryAfter * 1000, 30_000);
    await new Promise(resolve => setTimeout(resolve, waitMs));
    response = await makeRequest(accessToken);
  }
  // ❌ Only retries once, then gives up
  // ❌ No jitter — all clients wait same amount
  // ❌ No exponential backoff
```

### After ✅
```typescript
// lib/gmb.ts - Replace gmbApiRequest function

const MAX_RETRIES = 5;

function getExponentialBackoffMs(attempt: number, baseMs: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (base * 2^attempt)
  return baseMs * Math.pow(2, attempt);
}

function getJitteredBackoffMs(delayMs: number): number {
  // Add random jitter of ±10% to prevent thundering herd
  const jitter = delayMs * (0.9 + Math.random() * 0.2);
  return Math.ceil(jitter);
}

async function gmbApiRequest(connectionId: string, url: string, init: RequestInit = {}) {
  let connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error('GMB connection not found');

  let accessToken = connection.accessToken;

  if (
    connection.tokenExpiry &&
    connection.tokenExpiry.getTime() < Date.now() + 60_000 &&
    connection.refreshToken
  ) {
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

  // ✅ RETRY LOOP with exponential backoff + jitter
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let response = await makeRequest(accessToken);

    // Handle 401 Unauthorized — try refreshing token once
    if (response.status === 401 && connection.refreshToken) {
      accessToken = await refreshGmbToken(connectionId);
      response = await makeRequest(accessToken);
    }

    // Success — return response
    if (response.status !== 429 && response.status !== 503) {
      return handleApiResponse(response);
    }

    // Rate limit or service unavailable — backoff and retry
    if (attempt < MAX_RETRIES - 1) {
      let backoffMs = getExponentialBackoffMs(attempt);

      // If server provided Retry-After header, respect it (but cap at 120 seconds)
      const retryAfterHeader = response.headers.get('Retry-After');
      if (retryAfterHeader) {
        const serverBackoffSec = parseInt(retryAfterHeader, 10);
        backoffMs = Math.min(serverBackoffSec * 1000, 120_000);
      }

      const jitteredMs = getJitteredBackoffMs(backoffMs);
      console.warn(
        `[GMB API] Rate limited (${response.status}). Retry ${attempt + 1}/${MAX_RETRIES} in ${jitteredMs}ms`,
        { url: url.split('?')[0], attempt }
      );

      await new Promise(resolve => setTimeout(resolve, jitteredMs));
      continue;
    }

    // Max retries exhausted
    lastError = new Error(
      `Google API rate limit (${response.status}). Max retries (${MAX_RETRIES}) exceeded. Please try again later.`
    );
  }

  if (lastError) throw lastError;
  throw new Error('Unknown error in API request');
}

// Helper function to handle API response
async function handleApiResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const rawBody = await response.text().catch(() => '');
    if (!response.ok) {
      if (rawBody.includes('<!DOCTYPE') || rawBody.includes('<html')) {
        throw new Error(
          `Google API returned HTML instead of JSON (${response.status}). Is the My Business API enabled for this project?`
        );
      }
      throw new Error(`Google API error (${response.status}): ${rawBody.slice(0, 200)}`);
    }
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || `Google API error (${response.status})`);
  }

  return data ?? {};
}
```

---

## Fix #3: Remove Cron Sync Limit

### Before ❌
```typescript
// app/api/cron/google-sync/route.ts

const connections = await prisma.gMBConnection.findMany({
  where: {
    connectionStatus: 'connected',
    refreshToken: { not: null },
  },
  select: {
    id: true,
    clinicId: true,
    businessLocationId: true,
    ga4PropertyId: true,
    searchConsoleSite: true,
  },
  take: 20,  // ❌ LIMITS TO 20 CLINICS PER DAY
});

for (const conn of connections) {
  // sync...
}
```

### After ✅
```typescript
// app/api/cron/google-sync/route.ts

const MAX_CONCURRENT = 5; // Process 5 clinics in parallel, rest sequential
const SYNC_DELAY_MS = 2000; // 2s delay between clinic syncs for rate limiting

const connections = await prisma.gMBConnection.findMany({
  where: {
    connectionStatus: 'connected',
    refreshToken: { not: null },
    OR: [
      { nextSyncAt: null },
      { nextSyncAt: { lte: new Date() } }, // Only sync if due
    ],
  },
  orderBy: { nextSyncAt: 'asc' }, // Sync oldest first
  // ✅ REMOVED: take: 20
});

console.log(
  `[CRON:google-sync] Processing ${connections.length} clinics (max ${MAX_CONCURRENT} concurrent)`
);

const results: any[] = [];

// Process in batches to avoid overwhelming the API
for (let i = 0; i < connections.length; i += MAX_CONCURRENT) {
  const batch = connections.slice(i, i + MAX_CONCURRENT);

  const batchPromises = batch.map((conn, idx) =>
    // Add delay between clinic syncs within batch
    new Promise<void>(async resolve => {
      await new Promise(r => setTimeout(r, idx * SYNC_DELAY_MS));

      const entry: (typeof results)[number] = {
        clinicId: conn.clinicId,
        gmb: { synced: 0 },
        ga4: { synced: 0 },
        sc: { synced: 0 },
      };

      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: { syncStatus: 'syncing', lastSyncError: null },
      }).catch(() => {});

      // GMB sync
      if (conn.businessLocationId) {
        try {
          await syncGmbConnection(conn.id);
          entry.gmb = { synced: 1 };
        } catch (err: any) {
          console.error(
            `[CRON:google-sync] GMB sync failed for clinic ${conn.clinicId}:`,
            err.message
          );
          entry.gmb = { error: err.message };
        }
      }

      // GA4 sync
      if (conn.ga4PropertyId) {
        try {
          entry.ga4 = await syncGA4Data(conn.id, 90);
        } catch (err: any) {
          console.error(
            `[CRON:google-sync] GA4 sync failed for clinic ${conn.clinicId}:`,
            err.message
          );
          entry.ga4 = { error: err.message };
        }
      }

      // Search Console sync
      if (conn.searchConsoleSite) {
        try {
          entry.sc = await syncSearchConsoleData(conn.id, 90);
        } catch (err: any) {
          console.error(
            `[CRON:google-sync] SC sync failed for clinic ${conn.clinicId}:`,
            err.message
          );
          entry.sc = { error: err.message };
        }
      }

      // Update final status
      const hasErrors = [entry.gmb, entry.ga4, entry.sc].some(
        e => 'error' in e
      );
      await prisma.gMBConnection.update({
        where: { id: conn.id },
        data: {
          lastSyncedAt: new Date(),
          nextSyncAt: hasErrors
            ? new Date(Date.now() + 30 * 60000) // ✅ Retry in 30 min if error
            : new Date(Date.now() + 24 * 60 * 60 * 1000), // Normal: 24h later
          syncStatus: hasErrors ? 'error' : 'idle',
        },
      }).catch(() => {});

      results.push(entry);
      resolve();
    })
  );

  await Promise.all(batchPromises);

  // Small delay between batches
  if (i + MAX_CONCURRENT < connections.length) {
    await new Promise(r => setTimeout(r, SYNC_DELAY_MS));
  }
}

const elapsed = ((Date.now() - started) / 1000).toFixed(1);
```

---

## Fix #4: Database Persistent Cache

### Schema Update
```prisma
// prisma/schema.prisma - Add new model

model GmbCache {
  id          String   @id @default(cuid())
  clinicId    String
  type        String   // "accounts", "locations", "ga4_properties", "sc_sites"
  accountName String?  // Only used for "locations" type
  data        Json
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([clinicId, type, accountName])
  @@index([clinicId])
  @@index([expiresAt])
  @@index([type])
}
```

### Migration
```bash
npx prisma migrate dev --name add_gmb_cache
```

### Updated Cache Logic
```typescript
// lib/gmb.ts - Add persistent cache layer

async function getCachedAccounts(clinicId: string): Promise<any[]> {
  // Try memory cache first (fast path)
  const cacheKey = `accounts:${clinicId}`;
  const memCached = getCached<any[]>(cacheKey);
  if (memCached) return memCached;

  // Try database cache (survived restart)
  const dbCached = await prisma.gmbCache.findUnique({
    where: { clinicId_type_accountName: { clinicId, type: 'accounts', accountName: null } },
  });

  if (dbCached && dbCached.expiresAt > new Date()) {
    setCache(cacheKey, dbCached.data);
    return dbCached.data;
  }

  // Cache miss — fetch fresh from API
  const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
  if (!connection) throw new Error('No Google connection found for this clinic');

  const data = await gmbApiRequest(
    connection.id,
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
  );

  const accounts = (data.accounts || []).map((account: any) => ({
    name: account.name,
    accountName: account.accountName,
    type: account.type,
  }));

  // Store in both layers
  setCache(cacheKey, accounts);
  await prisma.gmbCache.upsert({
    where: { clinicId_type_accountName: { clinicId, type: 'accounts', accountName: null } },
    create: {
      clinicId,
      type: 'accounts',
      accountName: null,
      data: accounts,
      expiresAt: new Date(Date.now() + 7 * 86400000), // 7 days
    },
    update: {
      data: accounts,
      expiresAt: new Date(Date.now() + 7 * 86400000),
      updatedAt: new Date(),
    },
  });

  return accounts;
}

// Similar for locations:
async function getCachedLocations(clinicId: string, accountName: string): Promise<any[]> {
  const normalizedAccount = normalizeAccountName(accountName);
  const cacheKey = `locations:${clinicId}:${normalizedAccount}`;
  const memCached = getCached<any[]>(cacheKey);
  if (memCached) return memCached;

  const dbCached = await prisma.gmbCache.findUnique({
    where: {
      clinicId_type_accountName: {
        clinicId,
        type: 'locations',
        accountName: normalizedAccount,
      },
    },
  });

  if (dbCached && dbCached.expiresAt > new Date()) {
    setCache(cacheKey, dbCached.data);
    return dbCached.data;
  }

  const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
  if (!connection) throw new Error('No Google connection found for this clinic');

  const readMask = ['name', 'title', 'storefrontAddress'].join(',');
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${normalizedAccount}/locations?readMask=${encodeURIComponent(
    readMask
  )}&pageSize=100`;

  const data = await gmbApiRequest(connection.id, url);

  const locations = (data.locations || []).map((location: any) => ({
    name: location.name,
    title: location.title,
    address: formatStorefrontAddress(location.storefrontAddress),
  }));

  setCache(cacheKey, locations);
  await prisma.gmbCache.upsert({
    where: {
      clinicId_type_accountName: {
        clinicId,
        type: 'locations',
        accountName: normalizedAccount,
      },
    },
    create: {
      clinicId,
      type: 'locations',
      accountName: normalizedAccount,
      data: locations,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
    update: {
      data: locations,
      expiresAt: new Date(Date.now() + 7 * 86400000),
      updatedAt: new Date(),
    },
  });

  return locations;
}

// Export these instead of the originals
export async function listGmbAccounts(clinicId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
  if (!connection) throw new Error('No Google connection found for this clinic');

  const accounts = await getCachedAccounts(clinicId);
  return { connection, accounts };
}

export async function listGmbLocations(clinicId: string, accountName: string) {
  const locations = await getCachedLocations(clinicId, accountName);
  return locations;
}
```

---

## Fix #5: Fix GMBData Schema (Remove Hardcoded 0s)

### Updated Schema
```prisma
// prisma/schema.prisma

model GMBData {
  id                String        @id @default(cuid())
  gmbConnectionId   String
  date              DateTime
  
  // Business Profile Performance API metrics (currently implemented)
  impressions       Int           @default(0)     // Sum of all impression types
  directionRequests Int           @default(0)
  phoneCalls        Int           @default(0)
  websiteClicks     Int           @default(0)
  
  // Business Profile Insights API metrics (currently missing ❌)
  reviewCount       Int           @default(0)
  averageRating     Float         @default(0)
  newReviewsToday   Int           @default(0)
  messageCount      Int           @default(0)     // Customer messages
  
  // Posts metrics (new)
  totalPosts        Int           @default(0)     // Lifetime total
  activePosts       Int           @default(0)     // Posts in last 30 days
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  gmbConnection     GMBConnection @relation(fields: [gmbConnectionId], references: [id], onDelete: Cascade)

  @@unique([gmbConnectionId, date])
  @@index([gmbConnectionId])
  @@index([date])
}
```

### Migration
```bash
npx prisma generate
npx prisma migrate dev --name cleanup_gmb_data_schema
```

### Updated syncGmbConnection Function
```typescript
// lib/gmb.ts - Updated sync logic

export async function syncGmbConnection(connectionId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error('GMB connection not found');
  if (!connection.businessLocationId) throw new Error('No business location selected');

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: { syncStatus: 'syncing', lastSyncError: null },
  });

  try {
    const endDate = toUtcMidnight(new Date());
    const startDate = connection.lastSyncedAt
      ? toUtcMidnight(addDays(connection.lastSyncedAt, 1))
      : toUtcMidnight(addDays(endDate, -30));

    const effectiveStart = startDate > endDate ? endDate : startDate;

    // ✅ 1. Fetch Performance Metrics
    const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/${connection.businessLocationId}:fetchMultiDailyMetricsTimeSeries`;

    const performanceData = await gmbApiRequest(connectionId, performanceUrl, {
      method: 'POST',
      body: JSON.stringify({
        dailyMetrics: [
          'WEBSITE_CLICKS',
          'BUSINESS_DIRECTION_REQUESTS',
          'CALL_CLICKS',
          'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
          'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
          'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
          'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
        ],
        dailyRange: {
          startDate: toGoogleDateParts(effectiveStart),
          endDate: toGoogleDateParts(endDate),
        },
      }),
    });

    const dateMap = aggregateMetricSeries(performanceData.multiDailyMetricTimeSeries || []);

    // ✅ 2. Fetch Insights (reviews, ratings, messages, posts)
    let insightsData: any = {};
    const insightsUrl = `https://businessprofileperformance.googleapis.com/v1/${connection.businessLocationId}:fetchDailyMetricsTimeSeries`;

    try {
      insightsData = await gmbApiRequest(connectionId, insightsUrl, {
        method: 'POST',
        body: JSON.stringify({
          dailyMetrics: [
            'REVIEW_COUNT',
            'AVERAGE_RATING',
            'NEW_REVIEWS',
            'MESSAGE_COUNT',
            'POST_COUNT',
          ],
          dailyRange: {
            startDate: toGoogleDateParts(effectiveStart),
            endDate: toGoogleDateParts(endDate),
          },
        }),
      });
    } catch (err: any) {
      console.warn(
        `[GMB Insights] Failed to fetch insights for ${connection.businessLocationId}:`,
        err.message
      );
      // Continue with performance metrics only
    }

    // Combine insights data
    const aggregateInsights = new Map<
      string,
      {
        reviewCount: number;
        averageRating: number;
        newReviewsToday: number;
        messageCount: number;
        totalPosts: number;
        activePosts: number;
      }
    >();

    for (const metricSeries of insightsData.timeSeries || []) {
      const metricName = metricSeries.metric;
      const datedValues = metricSeries.datedValues || [];

      for (const valueEntry of datedValues) {
        const date = valueEntry.date;
        if (!date?.year || !date?.month || !date?.day) continue;

        const dayDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
        const dateKey = dayDate.toISOString();

        const existing = aggregateInsights.get(dateKey) || {
          reviewCount: 0,
          averageRating: 0,
          newReviewsToday: 0,
          messageCount: 0,
          totalPosts: 0,
          activePosts: 0,
        };

        const value = Number(valueEntry.value || 0);

        if (metricName === 'REVIEW_COUNT') existing.reviewCount = value;
        else if (metricName === 'AVERAGE_RATING')
          existing.averageRating = parseFloat(value.toFixed(2));
        else if (metricName === 'NEW_REVIEWS') existing.newReviewsToday = value;
        else if (metricName === 'MESSAGE_COUNT') existing.messageCount = value;
        else if (metricName === 'POST_COUNT') existing.totalPosts = value;

        aggregateInsights.set(dateKey, existing);
      }
    }

    // ✅ 3. Upsert combined data
    for (const [dateKey, metrics] of dateMap.entries()) {
      const date = new Date(dateKey);
      const insights = aggregateInsights.get(dateKey) || {
        reviewCount: 0,
        averageRating: 0,
        newReviewsToday: 0,
        messageCount: 0,
        totalPosts: 0,
        activePosts: 0,
      };

      await prisma.gMBData.upsert({
        where: {
          gmbConnectionId_date: { gmbConnectionId: connectionId, date },
        },
        create: {
          gmbConnectionId: connectionId,
          date,
          impressions: metrics.views,
          directionRequests: metrics.directionRequests,
          phoneCalls: metrics.phoneCalls,
          websiteClicks: metrics.websiteClicks,
          reviewCount: insights.reviewCount,
          averageRating: insights.averageRating,
          newReviewsToday: insights.newReviewsToday,
          messageCount: insights.messageCount,
          totalPosts: insights.totalPosts,
          activePosts: insights.activePosts,
        },
        update: {
          impressions: metrics.views,
          directionRequests: metrics.directionRequests,
          phoneCalls: metrics.phoneCalls,
          websiteClicks: metrics.websiteClicks,
          reviewCount: insights.reviewCount,
          averageRating: insights.averageRating,
          newReviewsToday: insights.newReviewsToday,
          messageCount: insights.messageCount,
          totalPosts: insights.totalPosts,
          activePosts: insights.activePosts,
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
```

---

## Fix #6: Better Error Handling with Backoff

### Schema Update
```prisma
// prisma/schema.prisma - Update GMBConnection model

model GMBConnection {
  // ... existing fields ...
  
  syncStatus         String    @default("idle")       // idle, syncing, error
  lastSyncError      String?
  lastSyncErrorCode  String?                          // ✅ NEW: 429, 401, timeout, etc.
  lastSyncErrorAt    DateTime?                        // ✅ NEW: when error occurred
  syncErrorCount     Int       @default(0)            // ✅ NEW: track repeated failures
  nextRetryAt        DateTime?                        // ✅ NEW: when to retry if error
  
  // ... rest of fields ...
}
```

### Updated syncGmbConnection with Error Backoff
```typescript
// lib/gmb.ts

const ERROR_BACKOFF_MINUTES = [5, 15, 60, 180, 1440]; // 5min, 15min, 1hr, 3hr, 24hr

export async function syncGmbConnection(connectionId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error('GMB connection not found');
  if (!connection.businessLocationId) throw new Error('No business location selected');

  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: { syncStatus: 'syncing', lastSyncError: null },
  });

  try {
    // ... sync logic (from Fix #5) ...

    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        syncStatus: 'idle',
        connectionStatus: 'connected',
        lastSyncedAt: new Date(),
        nextSyncAt: addDays(toUtcMidnight(new Date()), 1),
        lastSyncError: null,
        lastSyncErrorCode: null,
        lastSyncErrorAt: null,
        syncErrorCount: 0, // ✅ Reset on success
        nextRetryAt: null,
      },
    });
  } catch (error: any) {
    // ✅ NEW: Analyze error type
    let errorCode = 'unknown';
    if (error?.message?.includes('429')) errorCode = '429';
    else if (error?.message?.includes('401')) errorCode = '401';
    else if (error?.message?.includes('timeout')) errorCode = 'timeout';
    else if (error?.message?.includes('rate')) errorCode = 'rate_limit';

    // ✅ NEW: Exponential backoff based on error type
    const isRateLimit = errorCode === '429' || errorCode === 'rate_limit';
    const backoffIndex = Math.min(connection.syncErrorCount, ERROR_BACKOFF_MINUTES.length - 1);
    const backoffMinutes = isRateLimit
      ? ERROR_BACKOFF_MINUTES[backoffIndex] // More aggressive for rate limits
      : ERROR_BACKOFF_MINUTES[Math.max(0, backoffIndex - 1)]; // Less aggressive for other errors

    const nextRetryAt = new Date(Date.now() + backoffMinutes * 60000);

    await prisma.gMBConnection.update({
      where: { id: connectionId },
      data: {
        syncStatus: 'error',
        lastSyncError: error?.message || 'GMB sync failed',
        lastSyncErrorCode: errorCode,
        lastSyncErrorAt: new Date(),
        syncErrorCount: { increment: 1 },
        nextRetryAt: nextRetryAt,
      },
    });

    console.error(
      `[GMB Sync Error] Clinic ${connection.clinicId}: ${errorCode}. ` +
      `Attempt ${connection.syncErrorCount + 1}. Next retry at ${nextRetryAt.toISOString()}.`
    );

    throw error;
  }
}

// ✅ NEW: Function to clean up old caches
export async function cleanupExpiredGmbCaches() {
  const deleted = await prisma.gmbCache.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  console.log(`[GMB Cache Cleanup] Deleted ${deleted.count} expired entries`);
}
```

### Add Cron Job to Cleanup Caches
```typescript
// app/api/cron/cache-cleanup/route.ts - NEW FILE

import { NextResponse } from 'next/server';
import { cleanupExpiredGmbCaches } from '@/lib/gmb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const started = Date.now();
    await cleanupExpiredGmbCaches();
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      elapsedSeconds: parseFloat(elapsed),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cache cleanup failed',
      },
      { status: 500 }
    );
  }
}
```

### Add to vercel.json
```json
{
  "crons": [
    { "path": "/api/cron/google-sync", "schedule": "0 6 * * *" },
    { "path": "/api/cron/cache-cleanup", "schedule": "0 3 * * *" }
  ]
}
```

---

## Testing Checklist

- [ ] Deploy Fix #1 (cooldown) and test manual sync button
  - [ ] First click works
  - [ ] Second click within 5 min shows countdown
  - [ ] After 5 min, button re-enables
  - [ ] API returns 429 if cooldown exceeded

- [ ] Deploy Fix #2 (exponential backoff)
  - [ ] Mock rate limit (429) response
  - [ ] Verify retries with jitter (logs show delays)
  - [ ] Verify max 5 retries then fail

- [ ] Deploy Fix #3 (cron limit removal)
  - [ ] Add >20 clinics to test
  - [ ] Verify all sync in one cron run
  - [ ] Check logs for staggered delays

- [ ] Deploy Fix #4 (persistent cache)
  - [ ] DB cache stores accounts/locations
  - [ ] Restart server, verify cache still available
  - [ ] Cache expires after 7 days

- [ ] Deploy Fix #5 (GMBData schema)
  - [ ] Run migration
  - [ ] Verify new fields populate
  - [ ] Check dashboards show non-zero values

- [ ] Deploy Fix #6 (error backoff)
  - [ ] Trigger sync error, verify 5-min retry
  - [ ] Second error, verify 15-min retry
  - [ ] Check `nextRetryAt` calculation

---

## Deployment Order

**Week 1**:
1. Fix #1 (Cooldown) — Lowest risk, immediate impact
2. Fix #2 (Exponential Backoff) — Core rate limit fix

**Week 2**:
3. Fix #3 (Cron Limit) -  Increases coverage
4. Fix #4 (Persistent Cache) — Improves UX

**Week 3**:
5. Fix #5 (GMBData Schema) — Adds new metrics
6. Fix #6 (Error Backoff) — Completes resilience

Test each before deploying next!

