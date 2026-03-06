# GBP Sync - Quick Reference & Risk Summary

## 🔴 Critical Issues (Fix Immediately)

### 1. No Cooldown on "Sync Now" Button
**Risk**: Users can spam the button and overwhelm Google APIs  
**Current**: User clicks → sync begins → completes → immediately clickable again  
**Fix**: Add 5-min cooldown between manual syncs  
**Time to Fix**: 30 min  
**File**: [app/api/admin/gmb/sync/route.ts](app/api/admin/gmb/sync/route.ts)

```typescript
// Check if last sync was < 5 minutes ago
if (connection.lastSyncedAt && Date.now() - connection.lastSyncedAt < 5*60*1000) {
  return NextResponse.json({ error: 'Cooldown active' }, { status: 429 });
}
```

---

### 2. Only Single Retry on Rate Limit
**Risk**: When Google returns 429 (rate limited), system retries once then fails  
**Impact**: Multi-clinic usage immediately triggers failures  
**Current**: 
```typescript
if (response.status === 429) {
  await wait(5000); // Wait 5 seconds
  response = await makeRequest(); // Single retry
  // If still 429 → throws error ❌
}
```
**Fix**: Implement exponential backoff (1s, 2s, 4s, 8s, 16s) with jitter  
**Time to Fix**: 1 hour  
**File**: [lib/gmb.ts:227-276](lib/gmb.ts#L227-L276)

---

### 3. Cron Only Syncs 20 Clinics Per Day
**Risk**: If you have 100+ clinics, most don't sync daily  
**Current**: `take: 20` hard limit in query  
**Why It Matters**: 
- Clinic 1-20 sync daily
- Clinic 21+ only sync when manually triggered
- Data stale after >24 hours

**Fix**: Remove limit, add delay between clinic syncs  
**Time to Fix**: 45 min  
**File**: [app/api/cron/google-sync/route.ts:33](app/api/cron/google-sync/route.ts#L33)

---

## 🟡 High Priority Issues (Next Sprint)

### 4. In-Memory Cache Lost on Restart
**Risk**: After deploy/restart, first admin open triggers 4 API calls (accounts, locations, GA4, SC)  
**Current**: `apiCache = new Map()` loses all entries when server restarts  
**Fix**: Add database cache table with 7-day TTL  
**Time to Fix**: 2 hours  
**Impact**: Improves loading speed and reduces API quota burn  

---

### 5. GMBData Has Many Unused Fields
**Risk**: DB stores 20 fields but only populates 5; wastes space  
**Fields Hardcoded to 0**: reviews, ratings, messages, posts  
**Current Impact**: 
- Dashboards show "0 reviews" (confusing)
- Can't track review sentiment
- Missing key GBP metrics

**Fix**: Clean schema, fetch from Insights API  
**Time to Fix**: 3 hours  
**Files**: 
- [prisma/schema.prisma:297-323](prisma/schema.prisma#L297-L323) (schema)
- [lib/gmb.ts:530-620](lib/gmb.ts#L530-L620) (sync logic)

---

### 6. Limited Error Context
**Risk**: Generic error messages don't help users  
**Current**: "Failed to sync GMB data" (What failed? When can they retry?)  
**Fix**:
- Track error type (429, 401, timeout)
- Add retry backoff (5min → 15min → 1hr)
- Show error code to user

**Time to Fix**: 2 hours  

---

## 🟢 Medium Priority (Nice-to-Have)

### 7. Cache Reload on Every Admin Page Load
**Risk**: Unnecessary API calls  
**Current**: `fetchGmbConnection()` called in useEffect whenever admin page loads  
**Fix**: Only fetch when modal opens  
**Time to Fix**: 1 hour  

---

### 8. No Rate Limit Awareness
**Risk**: System doesn't track "we're near quota limit"  
**Current**: Only reacts when Google returns 429  
**Better**: Implement quota tracking before you hit limit  
**Time to Fix**: 4 hours (optional)  

---

## 📊 Current State Summary

| Component | Status | Impact |
|-----------|--------|--------|
| **API Retry Logic** | ❌ Broken | Will fail under load |
| **Rate Limiting** | ❌ None | No backoff, no detection |
| **Cooldown** | ❌ None | Users can spam |
| **Caching** | ⚠️ Partial | In-memory only |
| **Daily Sync** | ⚠️ Limited | Only 20 clinics |
| **Data Completeness** | ⚠️ Poor | Many fields unused |
| **Error Handling** | ⚠️ Basic | Generic messages |

---

## Architecture Flow

```
┌─────────────────────────┐
│   Admin Dashboard       │
│  (admin/page.tsx)       │
└────────┬────────────────┘
         │ onClick "Sync Now"
         ▼
┌─────────────────────────┐          ┌──────────────────┐
│  /api/admin/gmb/sync    │ ❌ No    │  Manual Sync     │
│  (sync/route.ts)        │  cooldown│  Cooldown        │
└────────┬────────────────┘          └──────────────────┘
         │
         ▼
┌─────────────────────────┐
│ syncGmbConnection()     │
│ (lib/gmb.ts)            │
└────────┬────────────────┘
         │
         ├─────► gmbApiRequest() ──┐
         │       ❌ Single retry   │
         │       ❌ No backoff     │
         │       ❌ No jitter      │
         │                        │
         │       ┌────────────────┘
         │       │
         │       ▼
         │  Google APIs
         │  • Performance
         │  • GA4
         │  • Search Console
         │
         ▼
┌─────────────────────────┐
│  GMBData table          │
│  (schema.prisma)        │
│  ❌ Unused fields       │
│  ⚠️  In-memory cache    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Dashboards             │
│  (analytics views)      │
└─────────────────────────┘

Daily Cron (06:00 UTC):
┌─────────────────────────┐
│  /api/cron/google-sync  │
│  ❌ take: 20 limit      │
│  ❌ No delay between    │
└────────┬────────────────┘
         │
         ├─► Clinic 1 sync
         ├─► Clinic 2 sync
         ├─► ...
         └─► Clinic 20 sync
         ❌ Clinic 21+ never synced
```

---

## Configuration Reference

### Current Cron Schedule
- **File**: [vercel.json](vercel.json)
- **Endpoint**: `/api/cron/google-sync`
- **Schedule**: `0 6 * * *` (6:00 AM UTC daily)
- **Max Duration**: 300 seconds (5 min)

### API Quotas (Google)
- **Per-user per API**: 100 requests/second
- **Per project per day**: 10,000 requests/day
- **GBP Performance API**: 1,000,000/day

### Current Implementation
- **Clients**: ~10-100 clinics expected
- **API Calls/Day From Cron**: 20 clinics × 3 APIs = ~60 requests
- **API Calls During Manual Sync**: 1 clinic × 4 APIs = 4 requests
- **Estimated Monthly**: ~2,000-10,000 requests (OK, but fragile)

---

## Testing the Fixes

### Test Rate Limiting
```bash
# Mock a 429 response and verify exponential backoff kicks in
# See: GBP_SYNC_FIXES.md - Testing Checklist
```

### Test Cooldown
```typescript
// In admin dashboard console:
1. Click "Sync Data Now"
2. Wait for completion
3. Try clicking again immediately
4. Should show: "Try again in 300s"
```

### Test Cron with >20 Clinics
```bash
# Add 50 clinics to DB
# Run: /api/cron/google-sync
# Verify in logs: all 50 synced (not just 20)
```

---

## Implementation Timeline

```
Week 1:
├─ Mon: Deploy cooldown (Fix #1)
├─ Wed: Deploy exponential backoff (Fix #2)
└─ Fri: Test both in production

Week 2:
├─ Mon: Deploy cron sync limit removal (Fix #3)
├─ Wed: Deploy persistent cache (Fix #4)
└─ Fri: Monitor in production

Week 3:
├─ Mon: Deploy schema cleanup (Fix #5)
├─ Wed: Deploy error backoff (Fix #6)
└─ Fri: Monitor dashboards for data accuracy
```

---

## Key Files to Update

| Fix | Primary Files | Secondary Files |
|-----|---------------|-----------------|
| #1 Cooldown | sync/route.ts | admin/page.tsx |
| #2 Backoff | lib/gmb.ts | - |
| #3 Cron Limit | cron/google-sync/route.ts | - |
| #4 Persistent Cache | lib/gmb.ts, schema.prisma | accounts/locations routes |
| #5 GMBData Schema | schema.prisma, lib/gmb.ts | - |
| #6 Error Backoff | lib/gmb.ts, schema.prisma | - |

---

## Risk Assessment

### Current Risk if Nothing Changes
- **Probability**: 80% chance of rate limit errors within 3 months with 50+ clinics
- **Impact**: Multiple daily failures, user frustration, lost data
- **Recovery**: Manual intervention required, retry delays manual

### Risk After Fixes #1-3 
- **Probability**: 20% (within quota limits)
- **Impact**: Rare, well-handled with backoff
- **Recovery**: Automatic with exponential backoff

---

## Questions Answered

✅ **1. Current GBP sync flow?**  
Manual sync via "Sync Now" button → `/api/admin/gmb/sync` → `syncGmbConnection()` → Google APIs → GMBData table  
Daily cron at 6 AM UTC → syncs all connected clinics

✅ **2. Rate limit handling?**  
⚠️ Only single retry on 429 + no jitter/backoff = fails under load

✅ **3. Caching strategy?**  
⚠️ 5-min in-memory cache only = lost on restart

✅ **4. Cooldown mechanism?**  
❌ **None** — users can spam button unlimited times

✅ **5. Daily sync?**  
⚠️ Only 20 clinics per run (`take: 20`)

✅ **6. Data storage?**  
⚠️ Many fields hardcoded to 0 (reviews, messages, posts)

✅ **7. Account/location caching?**  
⚠️ 5-min in-memory cache, fetched on every page load

✅ **8. Error handling?**  
⚠️ Generic messages, no retry queuing

---

## Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| [GBP_SYNC_ANALYSIS.md](GBP_SYNC_ANALYSIS.md) | Comprehensive technical analysis | Engineers, Tech Leads |
| [GBP_SYNC_FIXES.md](GBP_SYNC_FIXES.md) | Ready-to-use code samples | Developers implementing fixes |
| This file | Quick reference & timeline | Project managers, Dev leads |

