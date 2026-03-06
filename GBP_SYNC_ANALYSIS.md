# Google Business Profile (GBP) Sync Implementation Analysis
**Date**: March 7, 2026  
**Status**: Production Implementation with Several Critical Issues Identified

---

## Executive Summary

The GBP sync system has a **functional core** but suffers from **critical rate-limiting deficiencies**, **no cooldown enforcement on manual syncs**, and **missing exponential backoff patterns**. The system will fail against Google's rate limits under normal multi-clinic usage and lacks resilience mechanisms found in production-grade integrations.

**Risk Level**: 🔴 **HIGH** for concurrent multi-clinic operations

---

## 1. Current GBP Sync Flow

### Architecture Overview
```
Dashboard (admin/page.tsx)
    ↓
API Routes (app/api/admin/gmb/*)
    ↓
Core Library (lib/gmb.ts)
    ↓
Google APIs:
    - mybusinessaccountmanagement.googleapis.com (accounts)
    - mybusinessbusinessinformation.googleapis.com (locations)
    - businessprofileperformance.googleapis.com (metrics)
    - oauth2.googleapis.com (tokens)
```

### Flow Diagram

**Manual Sync ("Sync Now" Button)**:
1. User clicks "Sync Data Now" in [admin/page.tsx](app/dashboard/admin/page.tsx#L2519)
2. Calls POST `/api/admin/gmb/sync` → [sync/route.ts](app/api/admin/gmb/sync/route.ts)
3. Calls `syncGmbConnection(connectionId)` in [lib/gmb.ts](lib/gmb.ts#L530)
4. Updates `GMBConnection.syncStatus = 'syncing'` → fetches metrics → stores in `GMBData` table
5. Returns updated connection status

**Daily Cron Sync**:
1. Vercel triggers `/api/cron/google-sync` at **06:00 UTC daily** ([vercel.json](vercel.json#L6))
2. Protected by `CRON_SECRET` header verification
3. Queries all "connected" clinics with `businessLocationId` and `refreshToken` set
4. Iterates through, calling `syncGmbConnection()` for each
5. Also syncs GA4 and Search Console data
6. Logs results

### Key Sync Functions

| Function | Location | Purpose | Rate Limit Handling |
|----------|----------|---------|-------------------|
| `listGmbAccounts()` | [lib/gmb.ts:401](lib/gmb.ts#L401) | Fetch available Google accounts | 5-min in-memory cache |
| `listGmbLocations()` | [lib/gmb.ts:417](lib/gmb.ts#L417) | Fetch locations for account | 5-min in-memory cache |
| `syncGmbConnection()` | [lib/gmb.ts:530](lib/gmb.ts#L530) | Sync GBP metrics for last 30 days | ⚠️ **No backoff** |
| `gmbApiRequest()` | [lib/gmb.ts:227](lib/gmb.ts#L227) | Core HTTP client for all requests | **Single retry only** |
| `syncDueGmbConnections()` | [lib/gmb.ts:623](lib/gmb.ts#L623) | Called daily, syncs up to 20 clinics | No rate limiting between clinics |

---

## 2. Rate Limit Handling

### Current Implementation

**Location**: [lib/gmb.ts:271-276](lib/gmb.ts#L271-L276)

```typescript
// Handle 429 rate limit with one automatic retry after a short delay
if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
  const waitMs = Math.min(retryAfter * 1000, 30_000);
  await new Promise(resolve => setTimeout(resolve, waitMs));
  response = await makeRequest(accessToken);
}
```

### ❌ Critical Issues

1. **Single Retry Only**
   - Only retries once on 429 responses
   - If second attempt also fails → throws immediately
   - **Missing**: Exponential backoff with jitter

2. **No Jitter/Spread**
   - All clinics retry at the exact same time
   - **Example**: If 10 clinics hit rate limit at 9:00 AM, all wait 5-30s then retry simultaneously
   - Creates thundering herd problem

3. **No Request Queuing**
   - Parallel requests in `fetchGmbConnection()` (lines 1372-1405) can overwhelm API
   - Each clinic can spawn 4 parallel requests (accounts, locations, GA4, Search Console)
   - **No backpressure mechanism**

4. **No Rate Limit Detection Before Hitting Limit**
   - Doesn't track 429s in memory
   - Doesn't implement sliding window rate tracking
   - Could hit same API limit multiple times per day

5. **User-Facing Rate Limit Message**
   - [Connection fetch code](app/dashboard/admin/page.tsx#L1475-L1480) has basic quota message
   - Dashboard error message: *"Google API rate limit reached. Your data is cached — please wait a few minutes and retrying"*
   - **No status page** showing when rate limit will reset

### What Google Allows

Google Business Profile APIs have these quotas (per documentation):
- **100 queries per second** per user per API
- **10,000 queries per day** per API per project
- **Business Profile Performance API**: Additional daily quota of 1,000,000 requests

**Our Issue**: Sequential calls across 10+ clinics × 4 API calls each = **40+ requests in seconds** during sync

---

## 3. Caching Strategy

### Current Implementation

**In-Memory Map Cache** - [lib/gmb.ts:9-22](lib/gmb.ts#L9-L22)

```typescript
const apiCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null { ... }
function setCache(key: string, data: any) { ... }
export function clearGmbCache(clinicId?: string) { ... }
```

### ✅ What's Good

1. **TTL-based expiration**: 5 minutes per entry
2. **Keyed by clinic**: `accounts:${clinicId}`, `locations:${clinicId}:${accountName}`
3. **Automatic cleanup**: Entries removed on expiry check
4. **Clinic-level clearing**: `clearGmbCache(clinicId)` called after OAuth connection

### ❌ Issues

1. **In-Memory Only**
   - ⚠️ **Lost on server restart**
   - Not shared across Node processes (if running on multiple dynos)
   - Not persistent across deployments

2. **Missing Database Cache Layer**
   - Could cache locations/accounts in DB with last_fetched timestamp
   - Would survive restarts
   - Example: Could store in a `GmbCache` table

3. **5-Minute TTL Might Be Too Long**
   - If user updates location name in Google, takes 5 min to see in UI
   - But also might be too aggressive for low-traffic clinics

4. **No Size Limits**
   - If 1,000 clinics × 10 accounts × 10 locations = 100K cache entries
   - Could cause memory bloat on long-running servers

### Recommendation
Upgrade to Redis cache or persistent DB cache with:
```typescript
// Example pattern
const cacheKey = `gmb:accounts:${clinicId}`;
const cached = await redis.get(cacheKey); // check Redis first
if (!cached) {
  const fresh = await listGmbAccounts(clinicId);
  await redis.setex(cacheKey, 300, JSON.stringify(fresh)); // 5-min TTL
}
```

---

## 4. Cooldown Mechanism (Sync Now Button)

### Current Implementation

**Location**: [admin/page.tsx:2519-2560](app/dashboard/admin/page.tsx#L2519-L2560)

```typescript
{/* Sync Data */}
<button
  onClick={async () => {
    if (!editingClinic?.id) return;
    setGmbState(prev => ({ ...prev, confirmSyncing: true, ... }));
    try {
      await Promise.allSettled(syncPromises);
      await fetchGmbConnection(editingClinic.id, true);
      setGmbState(prev => ({
        ...prev,
        confirmSyncing: false,
        message: `Data synced successfully at ${new Date().toLocaleTimeString(...)}`
      }));
    } catch (error: any) { ... }
  }}
  disabled={gmbState.confirmSyncing || (...)}
>
  {gmbState.confirmSyncing ? (
    <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing Data...</>
  ) : (
    <><RefreshCw className="h-4 w-4" /> Sync Data Now</>
  )}
</button>
```

### ❌ Critical Issue: NO REAL COOLDOWN

**What Exists**:
- `confirmSyncing` flag prevents button clicks **during active sync only**
- Once sync completes, button becomes enabled immediately
- User can click it unlimited times, hammering the API

**What's Missing**:
- No cooldown timer after sync completes
- No backend validation preventing rapid re-syncs
- No database field tracking "last manual sync" timestamp

### Attack Scenario
```javascript
// Attacker/frustrated user clicking rapidly
for (let i = 0; i < 10; i++) {
  fetch('/api/admin/gmb/sync', {
    method: 'POST',
    body: JSON.stringify({ clinicId: 'clinic-123' })
  });
}
// Result: 10 concurrent sync requests in milliseconds
// → Likely hits rate limits
// → Other clinics can't sync
```

### Recommended Fix

**Backend Cooldown** - Add to [sync/route.ts](app/api/admin/gmb/sync/route.ts):

```typescript
const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });

// Check cooldown (minimum 5 minutes between manual syncs)
if (connection.lastSyncedAt && Date.now() - connection.lastSyncedAt.getTime() < 5 * 60 * 1000) {
  return NextResponse.json(
    { error: 'Please wait 5 minutes before syncing again' },
    { status: 429 }
  );
}
```

**Frontend Countdown** - [admin/page.tsx](app/dashboard/admin/page.tsx#L2519):

```typescript
const [syncCooldownRemaining, setSyncCooldownRemaining] = useState(0);

useEffect(() => {
  if (syncCooldownRemaining <= 0) return;
  const timer = setInterval(() => {
    setSyncCooldownRemaining(prev => prev - 1);
  }, 1000);
  return () => clearInterval(timer);
}, [syncCooldownRemaining]);

// In the button:
<button
  disabled={
    gmbState.confirmSyncing || 
    syncCooldownRemaining > 0 ||
    (...)
  }
>
  {gmbState.confirmSyncing ? (
    <><RefreshCw ... /> Syncing...</>
  ) : syncCooldownRemaining > 0 ? (
    <>Try again in {syncCooldownRemaining}s</>
  ) : (
    <><RefreshCw ... /> Sync Data Now</>
  )}
</button>
```

---

## 5. Daily Cron Sync

### Configuration

**File**: [vercel.json](vercel.json#L1-L8)

```json
{
  "crons": [
    {
      "path": "/api/cron/google-sync",
      "schedule": "0 6 * * *"  // 6:00 AM UTC daily
    }
  ]
}
```

**Endpoint**: [app/api/cron/google-sync/route.ts](app/api/cron/google-sync/route.ts)

### What It Does

1. **Security**: Validates `CRON_SECRET` header
2. **Scope**: Finds all "connected" clinics with refresh token:
   ```typescript
   const connections = await prisma.gMBConnection.findMany({
     where: {
       connectionStatus: 'connected',
       refreshToken: { not: null },
     },
     take: 20,  // ⚠️ Only syncs first 20!
   });
   ```

3. **Sync Logic**:
   - For each clinic:
     - Sets `syncStatus = 'syncing'`
     - Calls `syncGmbConnection(conn.id)` if `businessLocationId` is set
     - Calls `syncGA4Data()` if GA4 property is connected
     - Calls `syncSearchConsoleData()` if SC site is connected
     - Updates `lastSyncedAt` and `nextSyncAt` (always set to +24 hours)

4. **Error Handling**: Individual clinic errors don't stop the loop; logged and included in response

### ✅ What's Good

- Cron is protected by secret
- Individual clinic failures don't block others
- Results logged with elapsed time
- Supports up to 300-second execution (5 min Vercel limit)

### ❌ Issues

1. **Only Syncs 20 Clinics Per Day**
   - If you have 100+ clinics, most won't sync daily
   - `take: 20` hard limit with no looping
   - **Fix**: Remove the `take: 20` or paginate across multiple cron job invocations

2. **Rigid 6 AM UTC Schedule**
   - All syncs start at same time = API spike
   - If you have 1,000 clinics, all trigger within seconds
   - **Should use**: Staggered jobs or queue-based sync

3. **No Exponential Backoff Within Cron**
   - If clinic 1 hits rate limit, clinics 2-20 may also
   - No delay between individual clinic syncs

4. **nextSyncAt Always Set to +24h**
   - Even if sync failed, next sync is always +24h later
   - Fails silently if daily window has low quota left
   - **Should check**: If errors occurred, backoff more aggressively

### Recommended Cron Schedule Fix

**Option A: Remove `take: 20` limit**
```typescript
const connections = await prisma.gMBConnection.findMany({
  where: {
    connectionStatus: 'connected',
    refreshToken: { not: null },
    OR: [
      { nextSyncAt: null },
      { nextSyncAt: { lte: new Date() } }, // Due for sync
    ],
  },
  orderBy: { nextSyncAt: 'asc' },
  // Remove: take: 20
});
```

**Option B: Implement Queue-Based Syncing**
Add a new model:
```prisma
model GmbSyncJob {
  id          String   @id @default(cuid())
  clinicId    String
  status      String   @default("pending") // pending, syncing, completed, failed
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  
  @@index([status])
  @@index([createdAt])
}
```

Then in cron, process limited batch from queue with rate-limiting between items.

---

## 6. Data Storage & GMBData Table

### Schema

**File**: [prisma/schema.prisma:294-323](prisma/schema.prisma#L294-L323)

```prisma
model GMBData {
  id                String        @id @default(cuid())
  gmbConnectionId   String
  date              DateTime
  views             Int           @default(0)          // Impressions
  discovery         Int           @default(0)          // = views
  directionRequests Int           @default(0)
  phoneImpressions  Int           @default(0)          // NOT SYNCED ⚠️
  phoneCalls        Int           @default(0)          // CALL_CLICKS metric
  websiteClicks     Int           @default(0)
  messageCount      Int           @default(0)          // NOT SYNCED ⚠️
  totalReviews      Int           @default(0)          // NOT SYNCED ⚠️
  averageRating     Float         @default(0)          // NOT SYNCED ⚠️
  newReviews        Int           @default(0)          // NOT SYNCED ⚠️
  questions         Int           @default(0)          // NOT SYNCED ⚠️
  answers           Int           @default(0)          // NOT SYNCED ⚠️
  totalPosts        Int           @default(0)          // NOT SYNCED ⚠️
  activePosts       Int           @default(0)          // NOT SYNCED ⚠️
  isOpenNow         Boolean       @default(false)      // NOT SYNCED ⚠️
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@unique([gmbConnectionId, date])
  @@index([gmbConnectionId])
  @@index([date])
}
```

### What Gets Synced

**File**: [lib/gmb.ts:530-620](lib/gmb.ts#L530-L620)

```typescript
// Only these metrics are fetched from Google
const DAILY_METRICS = [
  'WEBSITE_CLICKS',
  'BUSINESS_DIRECTION_REQUESTS',
  'CALL_CLICKS',
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
];

// Only these are stored
await prisma.gMBData.upsert({
  where: { gmbConnectionId_date: { gmbConnectionId, date } },
  create: {
    gmbConnectionId,
    date,
    views: metrics.views,              // From IMPRESSIONS metrics
    discovery: metrics.views,           // ⚠️ Same as views!
    directionRequests: metrics.directionRequests,
    phoneImpressions: 0,               // ❌ HARDCODED 0
    phoneCalls: metrics.phoneCalls,    // From CALL_CLICKS
    websiteClicks: metrics.websiteClicks,
    messageCount: 0,                   // ❌ HARDCODED 0
    totalReviews: 0,                   // ❌ HARDCODED 0
    // ... all review/post/rating fields hardcoded to 0/false
  },
  update: {
    views: metrics.views,
    discovery: metrics.views,
    directionRequests: metrics.directionRequests,
    phoneCalls: metrics.phoneCalls,
    websiteClicks: metrics.websiteClicks,
  },
});
```

### ❌ Major Issues

1. **Many Fields Hardcoded to 0**
   - Column exists but never populated
   - Wastes DB storage
   - Dashboards showing 0 reviews, 0 posts, 0 messages

2. **`discovery` = `views` (Redundant)**
   - Storing same value twice
   - Should be separate metric if Google provides it

3. **Missing GBP Metrics**
   - No review count, rating, new reviews
   - No message count
   - No post/activity data
   - These require separate Google Business Profile Insights API calls

4. **No Historical Rollup**
   - Only stores last 14 days in memory (recent data fetch)
   - Weekly/monthly aggregates calculated on-the-fly
   - Could pre-compute summaries for better performance

### ✅ What IS Being Used

**Analytics Dashboard Reads**:
- [ClientAnalyticsView.tsx](components/ClientAnalyticsView.tsx) — reads GMBData, GA4Data, SearchConsoleData
- [analytics-data/route.ts](app/api/admin/gmb/analytics-data/route.ts) — serves data to dashboards
  - Queries last 30 days (or custom date range)
  - Formats for charts

### Recommendation: Fix Schema

```prisma
model GMBData {
  id                String   @id @default(cuid())
  gmbConnectionId   String
  date              DateTime
  
  // GBP Performance Metrics (from Business Profile Performance API)
  impressions       Int      @default(0)  // Total impressions
  directionRequests Int      @default(0)
  phoneCalls        Int      @default(0)
  websiteClicks     Int      @default(0)
  
  // GBP Insights (from Business Profile Insights API) — currently missing
  reviewCount       Int      @default(0)
  averageRating     Float    @default(0)
  newReviews        Int      @default(0)
  messageCount      Int      @default(0)
  postsCount        Int      @default(0)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  gmbConnection     GMBConnection @relation(fields: [gmbConnectionId], references: [id], onDelete: Cascade)

  @@unique([gmbConnectionId, date])
  @@index([gmbConnectionId])
  @@index([date])
}
```

---

## 7. Account/Location Selection Efficiency

### Current Flow

**Step 1: Fetch Connection** - [fetchGmbConnection, line 1331](app/dashboard/admin/page.tsx#L1331)
```typescript
const connRes = await fetch(`/api/admin/gmb/connection?clinicId=${clinicId}`);
// Hits DB only, returns cached data
```

**Step 2: Fetch Accounts** - [line 1372](app/dashboard/admin/page.tsx#L1372)
```typescript
fetch(`/api/admin/gmb/accounts?clinicId=${clinicId}`)
  // Calls listGmbAccounts() in lib/gmb.ts:401
  // Uses 5-min in-memory cache
  // If miss: calls Google API
```

**Step 3: Fetch Locations** - [line 1389](app/dashboard/admin/page.tsx#L1389)
```typescript
fetch(`/api/admin/gmb/locations?clinicId=${clinicId}&accountName=${accountName}`)
  // Uses 5-min in-memory cache
  // If miss: calls Google API
```

**Step 4: Fetch GA4 Properties** - [line 1404](app/dashboard/admin/page.tsx#L1404)
```typescript
fetch(`/api/admin/gmb/ga4-properties?clinicId=${clinicId}`)
  // Likely calls Google Analytics Reporting API
```

**Step 5: Fetch Search Console Sites** - [line 1421](app/dashboard/admin/page.tsx#L L1421)
```typescript
fetch(`/api/admin/gmb/sc-sites?clinicId=${clinicId}`)
```

### ✅ What's Good

1. **In-Memory Cache**: 5-min TTL prevents re-fetching same day
2. **Parallel Loading**: Uses `Promise.allSettled()` to fetch all 4 in parallel
3. **Smart Skip Logic**: 
   - Only fetches locations if account selected
   - Only fetches GA4/SC if connection exists

### ❌ Issues

1. **Cache Lost on Server Restart**
   - First user after restart triggers 4 parallel API calls
   - If 10 users open admin dashboard → multiple cache misses

2. **Every Admin Page Load Fetches Data**
   - [fetchGmbConnection called in useEffect, line 944](app/dashboard/admin/page.tsx#L944)
   - Even if user just viewing (not editing), data refreshed
   - Should only fetch when modal opens

3. **No Persistent Cache**
   - Accounts list rarely changes (maybe monthly)
   - Could cache in DB for weeks, not minutes

4. **Parallel Requests Can Exceed Rate Limits**
   - 4 concurrent requests × 10 admins = 40 requests > Google's per-second limit
   - Could add sequential backoff

### Recommendation: Implement Persistent Cache

```prisma
model GmbCache {
  id          String   @id @default(cuid())
  clinicId    String
  type        String   // "accounts", "locations", "ga4_properties", "sc_sites"
  accountName String?  // for locations cache
  data        Json
  expiresAt   DateTime
  
  @@unique([clinicId, type, accountName])
  @@index([expiresAt])
}
```

Then upgrade cache layer:
```typescript
async function getCachedAccounts(clinicId: string) {
  // Try Redis/memory first
  let cached = getCached(`accounts:${clinicId}`);
  if (cached) return cached;
  
  // Try database
  const dbCache = await prisma.gmbCache.findUnique({
    where: { clinicId_type_accountName: { clinicId, type: 'accounts', accountName: null } }
  });
  if (dbCache && dbCache.expiresAt > new Date()) {
    setCache(`accounts:${clinicId}`, dbCache.data);
    return dbCache.data;
  }
  
  // Fetch fresh from API
  const fresh = await gmbApiRequest(...);
  
  // Store in both layers
  setCache(`accounts:${clinicId}`, fresh);
  await prisma.gmbCache.upsert({
    where: { clinicId_type_accountName: { clinicId, type: 'accounts', accountName: null } },
    create: { clinicId, type: 'accounts', data: fresh, expiresAt: new Date(Date.now() + 7 * 86400000) },
    update: { data: fresh, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });
  
  return fresh;
}
```

---

## 8. Sync Error Handling

### Error Display Paths

#### Frontend Error Display

**Dashboard Modal** - [admin/page.tsx:2621-2633](app/dashboard/admin/page.tsx#L2621-L2633)

```typescript
{gmbState.error && (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 animate-in fade-in">
    <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
      <X className="h-3.5 w-3.5 text-white" />
    </div>
    <div>
      <p className="text-sm font-semibold text-red-800 dark:text-red-300">{gmbState.error}</p>
    </div>
  </div>
)}
```

**Connection Fetch Error** - [admin/page.tsx:1475-1480](app/dashboard/admin/page.tsx#L1475-L1480)

```typescript
const msg = error?.message || 'Failed to load GMB status';
const isQuota = msg.toLowerCase().includes('quota');
setGmbState(prev => ({
  ...prev,
  loading: false,
  error: isQuota
    ? 'Google API rate limit reached. Your data is cached — please wait a few minutes before retrying.'
    : msg,
}));
```

**Manual Sync Errors** - [admin/page.tsx:2537-2545](app/dashboard/admin/page.tsx#L2537-L2545)

```typescript
} catch (error: any) {
  setGmbState(prev => ({
    ...prev,
    confirmSyncing: false,
    error: error?.message || 'Sync failed. Please try again.',
  }));
}
```

#### Backend Error Handling

**Sync Endpoint** - [sync/route.ts:1-33](app/api/admin/gmb/sync/route.ts#L1-L33)

```typescript
try {
  await syncGmbConnection(connection.id);
  const refreshed = await prisma.gMBConnection.findUnique({ where: { id: connection.id } });
  return NextResponse.json({ success: true, connection: refreshed });
} catch (error: any) {
  console.error('GMB manual sync error:', error);
  return NextResponse.json(
    { error: error?.message || 'Failed to sync GMB data' },
    { status: 500 }
  );
}
```

**Core Sync Function** - [lib/gmb.ts:530-620](lib/gmb.ts#L530-L620)

```typescript
export async function syncGmbConnection(connectionId: string) {
  const connection = await prisma.gMBConnection.findUnique({ where: { id: connectionId } });
  
  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: { syncStatus: 'syncing', lastSyncError: null },
  });

  try {
    // ... sync logic ...
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

### ✅ What's Good

1. **Error Message Propagation**: Errors bubble from API → backend → frontend
2. **Persistent Error Storage**: `lastSyncError` field saved to DB
3. **Status Tracking**: `syncStatus` shows "syncing", "idle", "error"
4. **Rate Limit Detection**: Special handling for "quota" keyword

### ❌ Issues

1. **Limited Error Context**
   - Generic "Failed to sync GMB data" doesn't help users
   - Could include request count, retry count, rate limit remaining

2. **No Error Analytics**
   - Errors logged to console only
   - No tracking which clinics fail most
   - No alerting on repeated failures

3. **Rate Limit Message Vague**
   - *"Your data is cached — please wait a few minutes before retrying"*
   - Doesn't tell user:
     - How long until rate limit resets
     - Which API is rate-limited
     - Whether to try different time

4. **No Retry Queuing**
   - If sync fails, no attempt to retry later
   - `nextSyncAt` still set to +24h even if error occurred
   - Should implement exponential backoff for failures

### Recommended Error Handling Improvements

```typescript
// Add to GMBConnection schema
model GMBConnection {
  // ... existing fields ...
  lastSyncError         String?
  lastSyncErrorCode     String?      // New: "429", "401", "timeout", etc.
  lastSyncErrorAt       DateTime?    // New: when error occurred
  syncErrorCount        Int          @default(0) // New: track repeated failures
  nextRetryAt           DateTime?    // New: when to retry if error
  // ...
}

// In syncGmbConnection():
try {
  // ... sync logic ...
  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      syncStatus: 'idle',
      lastSyncError: null,
      lastSyncErrorCode: null,
      syncErrorCount: 0,
      nextRetryAt: null,
    },
  });
} catch (error: any) {
  const errorCode = error?.response?.status?.toString() || 'unknown';
  const isRateLimit = errorCode === '429';
  
  // Exponential backoff: 5min, 15min, 1hr, 3hr, 24hr
  const backoffMinutes = isRateLimit
    ? [5, 15, 60, 180, 1440][Math.min(currentSyncErrorCount, 4)]
    : [1, 5, 15, 60, 240][Math.min(currentSyncErrorCount, 4)];
  
  await prisma.gMBConnection.update({
    where: { id: connectionId },
    data: {
      syncStatus: 'error',
      lastSyncError: error?.message,
      lastSyncErrorCode: errorCode,
      lastSyncErrorAt: new Date(),
      syncErrorCount: { increment: 1 },
      nextRetryAt: new Date(Date.now() + backoffMinutes * 60000),
    },
  });
  throw error;
}
```

---

## Summary of Findings

| Area | Status | Severity | Details |
|------|--------|----------|---------|
| **Rate Limiting** | ❌ Broken | 🔴 CRITICAL | Only 1 retry, no backoff, no jitter, users hit limits immediately |
| **Cooldown** | ❌ Missing | 🔴 CRITICAL | No cooldown on "Sync Now" button; users can hammer API |
| **Caching** | ⚠️ Partial | 🟡 MEDIUM | In-memory only, lost on restart; no DB persistence |
| **Daily Sync** | ⚠️ Partial | 🟡 MEDIUM | Only syncs 20 clinics; all trigger at same time (spike) |
| **Data Storage** | ⚠️ Incomplete | 🟡 MEDIUM | Many fields hardcoded to 0; missing GBP Insights metrics |
| **Account/Location Cache** | ⚠️ Basic | 🟡 MEDIUM | 5-min memory cache; no persistent DB cache |
| **Error Handling** | ⚠️ Basic | 🟠 LOW | Generic error messages; no retry queuing; no alerting |

---

## Priority Fix Roadmap

### Phase 1: Critical (Do Immediately)
1. **Implement Cooldown on /api/admin/gmb/sync**
   - Add 5-min minimum between manual syncs
   - Return 429 if within cooldown
   - Effort: 30 minutes

2. **Add Exponential Backoff to gmbApiRequest()**
   - Change single retry → max 5 retries with exponential backoff + jitter
   - Effort: 1 hour

3. **Extend Rate Limit Retry in Cron**
   - Add backoff between individual clinic syncs
   - Remove hard `take: 20` limit
   - Effort: 45 minutes

### Phase 2: High (Next Sprint)
1. **Database Cache for Accounts/Locations**
   - Add GmbCache table
   - Persist with 7-day TTL
   - Effort: 2 hours

2. **Fix GMBData Schema**
   - Remove hardcoded 0s
   - Add review/message/post fields
   - Fetch from separate Insights API
   - Effort: 3 hours

3. **Implement Error Backoff**
   - Add errorCode, errorCount, nextRetryAt fields
   - Exponential backoff for failures
   - Effort: 2 hours

### Phase 3: Nice-to-Have (Later)
1. Queue-based sync system
2. Detailed rate limit error messages
3. Sync health dashboard
4. Webhook-based updates instead of polling

---

## Code Locations Reference

| Component | File | Lines |
|-----------|------|-------|
| Core GBP API | [lib/gmb.ts](lib/gmb.ts) | 1-647 |
| Rate Limit Handler | [lib/gmb.ts](lib/gmb.ts#L271-L276) | 271-276 |
| Cache Logic | [lib/gmb.ts](lib/gmb.ts#L9-L22) | 9-22 |
| Manual Sync (BE) | [app/api/admin/gmb/sync/route.ts](app/api/admin/gmb/sync/route.ts) | 1-33 |
| Manual Sync (FE) | [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx#L2519-L2560) | 2519-2560 |
| Cooldown Missing | [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx#L2519) | 2519 |
| Daily Cron | [app/api/cron/google-sync/route.ts](app/api/cron/google-sync/route.ts) | 1-135 |
| Cron Limit | [app/api/cron/google-sync/route.ts](app/api/cron/google-sync/route.ts#L33) | 33 |
| Connection Fetch | [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx#L1322-L1492) | 1322-1492 |
| Schema: GMBConnection | [prisma/schema.prisma](prisma/schema.prisma#L262-L295) | 262-295 |
| Schema: GMBData | [prisma/schema.prisma](prisma/schema.prisma#L297-L323) | 297-323 |
| Sync Core Logic | [lib/gmb.ts](lib/gmb.ts#L530-L620) | 530-620 |
| Daily Sync Logic | [lib/gmb.ts](lib/gmb.ts#L623-L640) | 623-640 |

