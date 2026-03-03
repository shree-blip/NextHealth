# Feature Specification: Client Admin Overview Page

## Product Context
**Product:** Clinic Analytics Dashboard  
**Module:** Client Dashboard → Overview Tab  
**User:** Client Admin (clinic owner/manager with 1+ assigned clinics)  
**Purpose:** Unified view of patient acquisition metrics across all assigned clinics

---

## 1. Feature Goals

### Primary Goal
Enable a client admin to see **combined patient visit totals** across all their assigned clinics with the ability to:
- View in multiple time periods (last week, current month, last month)
- Compare period-over-period performance (WoW, MoM)
- Drill down to individual clinic performance
- Identify which clinics are driving growth

### Success Metrics
- Page loads within 1.5 seconds
- All calculations computed server-side for accuracy
- Real-time data updates when admin saves new weekly records
- Zero calculation errors (especially divide-by-zero handling)

---

## 2. Data Model & Definitions

### Base Data Source
- **WeeklyAnalytics** records created by Admin Analytics form
- Filtered by: clinics assigned to current client user
- Field used: `patientCount` (number of patient visits in that week)

### Date Definitions

#### Week Period
- **Start:** Monday (ISO week standard, not Sunday)
- **End:** Sunday (ISO week standard)
- **Last Week:** Most recent complete Monday-Sunday period before today
- **Formula:** 
  ```
  thisMonday = current date rounded back to nearest Monday
  lastWeekStart = thisMonday - 7 days (previous Monday)
  lastWeekEnd = thisMonday - 1 day (previous Sunday)
  ```

#### Month Period
- **Start:** 1st day of month
- **End:** Last day of month

#### Comparison Periods

**Week-over-Week (WoW):**
```
lastWeekStart = Monday of last complete week
lastWeekEnd = Sunday of last complete week
weekBeforeStart = lastWeekStart - 7 days
weekBeforeEnd = lastWeekStart - 1 day
```

**Month-over-Month (MoM):**
```
lastMonthStart = first day of previous calendar month
lastMonthEnd = last day of previous calendar month
prevMonthStart = first day of month before last
prevMonthEnd = last day of month before last
```

### Calculation Formulas

#### Week-over-Week Change
```
WoW_units = lastWeekTotal - weekBeforeTotal
WoW_percent = (WoW_units / weekBeforeTotal) × 100

// Edge case: weekBeforeTotal = 0
if weekBeforeTotal = 0:
  if WoW_units > 0:
    WoW_percent = "+∞" or "N/A (new growth)"
  else if WoW_units = 0:
    WoW_percent = "N/A (no data)"
  else:
    WoW_percent = "N/A"
```

#### Month-over-Month Change
```
MoM_units = lastMonthTotal - prevMonthTotal
MoM_percent = (MoM_units / prevMonthTotal) × 100

// Edge case: prevMonthTotal = 0
if prevMonthTotal = 0:
  if MoM_units > 0:
    MoM_percent = "+∞" or "N/A (new growth)"
  else if MoM_units = 0:
    MoM_percent = "N/A (no data)"
  else:
    MoM_percent = "N/A"
```

#### Daily Average
```
dailyAvgLastWeek = lastWeekTotal / 7
dailyAvgLastMonth = lastMonthTotal / daysInLastMonth
// Always round to 1 decimal place
```

---

## 3. User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT OVERVIEW                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter: Last Week ▼]  [Last Week vs Week Before ▼]     │
│  Showing: Feb 23 – Mar 1, 2026                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     SUMMARY CARDS (4 columns)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │Total Visits │  │Total Visits │  │ Week Trend  │       │
│  │ (Last Week) │  │(Last Month) │  │  (WoW)      │       │
│  │    342      │  │   1,205     │  │  +45 (+15%) │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
│  ┌─────────────┐                                           │
│  │Month Trend  │                                           │
│  │  (MoM)      │                                           │
│  │  +120 (+11%)│                                           │
│  └─────────────┘                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ DAILY AVERAGE (LAST WEEK): 48.9 patients/day               │
├─────────────────────────────────────────────────────────────┤
│                     CLINIC BREAKDOWN TABLE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Clinic Name    │ Visits   │ Visits  │ WoW  │ WoW %  │   │
│                 │ Wk       │ Month   │      │        │   │
│ ───────────────────────────────────────────────────────────│
│ Main Clinic     │   195    │   620   │ +28  │ +16.7% │   │
│ North Branch    │   147    │   585   │ +17  │ +13.0% │   │
│ Sort ▼ (By Visits ▼)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Card Components

**Summary Cards** (4 KPI cards, grid layout):

| Card | Metric | Value Format | Color |
|------|--------|--------------|-------|
| 1 | Total Patient Visits (Last Week) | Large number | Emerald |
| 2 | Total Patient Visits (Last Month) | Large number | Blue |
| 3 | Week-over-Week Change | +/- units + percent | Green (↑) / Red (↓) |
| 4 | Month-over-Month Change | +/- units + percent | Green (↑) / Red (↓) |

**Daily Average Card** (separate, full-width):
- Label: "Daily Patient Average (Last Week)"
- Value: Decimal to 1 place (e.g., "48.9 patients/day")

### Filter Controls

**Location:** Top of page, above cards

**Filter Dropdown:**
- Options: Last Week, Current Month, Last Month
- Default: Last Week
- Behavior: Clicking an option updates all cards and table instantly

**Date Range Display:**
- Format: "Showing: [Mon Date] – [Sun Date], [Year]"
- Example: "Showing: Feb 23 – Mar 1, 2026"
- Updates dynamically based on selected filter

**Compare Toggle:**
- Label: "Compare Mode"
- Options: 
  - None (default, shows single period)
  - Last Week vs Week Before
  - Last Month vs Month Before
- Behavior: Activates compare mode in cards and table
  - Cards show side-by-side metrics for both periods
  - Table shows both period columns

### Clinic Breakdown Table

**Columns:**
1. **Clinic Name** (sortable by name, default: sort by visits desc)
2. **Visits (Last Week)** (sortable)
3. **Visits (Last Month)** (sortable)
4. **WoW Change** (units) (sortable)
5. **WoW %** (sortable)
6. **MoM Change** (units) (sortable, optional if space)
7. **MoM %** (sortable, optional if space)

**Sort Options Dropdown:**
- Default: Patient Visits (Last Week), Highest First
- Options:
  - Patient Visits (Last Week) - Highest First
  - Patient Visits (Last Week) - Lowest First
  - Week-over-Week Change - Biggest Gain
  - Week-over-Week Change - Biggest Drop
  - Patient Visits (Last Month) - Highest First

**Row Highlighting:**
- Highlight top performer (highest visits, last week) in light green
- Highlight biggest growth in light blue
- Missing data rows: gray background, "No data" label

**Pagination:**
- Show 10 rows per page if > 10 clinics
- Standard pagination controls at bottom

### Responsive Behavior

**Desktop (1024px+):**
- 4-column card layout
- Full table with all columns
- Filters in single row

**Tablet (768px-1023px):**
- 2-column card layout
- Table with selected columns (Name, Visits Wk, WoW %)
- Filters stacked

**Mobile (<768px):**
- 1-column card stack
- Scrollable table (horizontal scroll)
- Filters stacked vertically

---

## 4. Filtering & Date Logic

### Filter States & Calculations

#### State: Last Week (Default)
```
Period: lastWeekStart to lastWeekEnd
Compare: N/A
Card Metrics:
  - Total Visits: patientCount sum for lastWeekStart to lastWeekEnd
  - Total Visits (Month): sum for lastMonthStart to lastMonthEnd
  - WoW: compare with weekBeforeStart to weekBeforeEnd
  - MoM: compare with prevMonthStart to prevMonthEnd
```

#### State: Current Month
```
Period: first day of current month to today
Compare: N/A
Card Metrics:
  - Total Visits: patientCount sum for current month (to date)
  - Total Visits (Month): sum for last month
  - WoW: N/A (month vs month measured via MoM)
  - MoM: compare with previous calendar month
```

#### State: Last Month
```
Period: lastMonthStart to lastMonthEnd
Compare: N/A
Card Metrics:
  - Total Visits: patientCount sum for lastMonthStart to lastMonthEnd
  - Total Visits (Year): not shown, use last month value
  - WoW: N/A
  - MoM: compare with prevMonthStart to prevMonthEnd
```

#### Compare Mode: Last Week vs Week Before
```
Period 1 (Left): lastWeekStart to lastWeekEnd
Period 2 (Right): weekBeforeStart to weekBeforeEnd

Card Layout:
  [Card] shows:
    Total Visits (Last Week): XXX
    Total Visits (Week Before): YYY
    Change: +/- units and %
```

#### Compare Mode: Last Month vs Month Before
```
Period 1 (Left): lastMonthStart to lastMonthEnd
Period 2 (Right): prevMonthStart to prevMonthEnd

Card Layout:
  [Card] shows:
    Total Visits (Last Month): XXX
    Total Visits (Month Before): YYY
    Change: +/- units and %
```

---

## 5. API Requirements

### GET /api/client/overview/summary

**Purpose:** Fetch aggregated metrics for all clinics assigned to logged-in client

**Query Parameters:**
```
filter: 'last_week' | 'current_month' | 'last_month' (default: 'last_week')
compareMode: 'none' | 'wow' | 'mom' (default: 'none')
```

**Response Payload:**

```json
{
  "dateRange": {
    "label": "Last Week",
    "startDate": "2026-02-23",
    "endDate": "2026-03-01",
    "displayText": "Feb 23 – Mar 1, 2026"
  },
  "metrics": {
    "totalVisitsCurrentPeriod": 342,
    "totalVisitsLastMonth": 1205,
    "dailyAverage": 48.9,
    "weekOverWeek": {
      "units": 45,
      "percent": 15.0,
      "percentLabel": "+15.0%"
    },
    "monthOverMonth": {
      "units": 120,
      "percent": 11.2,
      "percentLabel": "+11.2%"
    }
  },
  "compareMetrics": null // if compareMode = 'none'
  // OR:
  "compareMetrics": {
    "period1": {
      "label": "Last Week",
      "startDate": "2026-02-23",
      "endDate": "2026-03-01",
      "total": 342
    },
    "period2": {
      "label": "Week Before",
      "startDate": "2026-02-16",
      "endDate": "2026-02-22",
      "total": 297
    },
    "change": {
      "units": 45,
      "percent": 15.15,
      "percentLabel": "+15.2%"
    }
  }
}
```

### GET /api/client/overview/clinics

**Purpose:** Fetch per-clinic breakdown for table

**Query Parameters:**
```
filter: 'last_week' | 'current_month' | 'last_month' (default: 'last_week')
sortBy: 'visits_week' | 'visits_month' | 'wow_gain' | 'wow_drop' (default: 'visits_week')
sortOrder: 'asc' | 'desc' (default: 'desc')
page: integer (default: 1)
limit: integer (default: 10)
```

**Response Payload:**

```json
{
  "clinics": [
    {
      "clinicId": "clinic_001",
      "clinicName": "Main Clinic",
      "lastWeekVisits": 195,
      "lastMonthVisits": 620,
      "weekOverWeek": {
        "units": 28,
        "percent": 16.7,
        "percentLabel": "+16.7%"
      },
      "monthOverMonth": {
        "units": 85,
        "percent": 15.9,
        "percentLabel": "+15.9%"
      },
      "dataQuality": "complete" // 'complete' | 'partial' | 'missing'
    },
    {
      "clinicId": "clinic_002",
      "clinicName": "North Branch",
      "lastWeekVisits": 147,
      "lastMonthVisits": 585,
      "weekOverWeek": {
        "units": 17,
        "percent": 13.0,
        "percentLabel": "+13.0%"
      },
      "monthOverMonth": {
        "units": 35,
        "percent": 6.3,
        "percentLabel": "+6.3%"
      },
      "dataQuality": "complete"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

### Error Handling

**400 Bad Request:**
```json
{ "error": "Invalid filter or compareMode" }
```

**401 Unauthorized:**
```json
{ "error": "User not authenticated or no clinics assigned" }
```

**500 Server Error:**
```json
{ "error": "Failed to fetch overview metrics" }
```

---

## 6. Data Calculation Layer (Backend)

### Pseudocode for Summary Calculation

```typescript
function calculateOverviewMetrics(userId: string, filter: string, compareMode: string) {
  // 1. Get all clinics assigned to user
  const clinics = getClinicsByUser(userId);
  
  // 2. Determine date ranges based on filter
  const dateRanges = getDateRanges(filter); // { currentPeriod, lastMonth, ... }
  
  // 3. Fetch all weekly records for all clinics in all periods
  const allRecords = fetchWeeklyAnalytics(clinics.map(c => c.id), dateRanges);
  
  // 4. Aggregate by period
  const totalVisitsCurrentPeriod = sumPatientCount(
    allRecords.filter(r => r.date >= dateRanges.current.start && r.date <= dateRanges.current.end)
  );
  
  const totalVisitsLastMonth = sumPatientCount(
    allRecords.filter(r => r.date >= dateRanges.lastMonth.start && r.date <= dateRanges.lastMonth.end)
  );
  
  const totalVisitsWeekBefore = sumPatientCount(
    allRecords.filter(r => r.date >= dateRanges.weekBefore.start && r.date <= dateRanges.weekBefore.end)
  );
  
  // 5. Calculate WoW and MoM
  const wow = calculateWoW(totalVisitsCurrentPeriod, totalVisitsWeekBefore);
  const mom = calculateMoM(totalVisitsCurrentPeriod, totalVisitsLastMonth);
  
  // 6. Return payload
  return {
    dateRange: formatDateRange(dateRanges.current),
    metrics: {
      totalVisitsCurrentPeriod,
      totalVisitsLastMonth,
      dailyAverage: totalVisitsCurrentPeriod / 7, // or daysInPeriod
      weekOverWeek: wow,
      monthOverMonth: mom
    },
    compareMetrics: compareMode === 'none' ? null : calculateCompareMetrics(...)
  };
}
```

### Missing Data Handling

```
If a clinic has no weekly record for a given week:
  - Treat patient count as 0 for that week
  - Mark clinic row as "partial" or "missing" in dataQuality
  - Show tooltip: "Data incomplete for this period"
  - Still include in aggregations (add 0 to totals)
```

---

## 7. Acceptance Criteria

### AC1: Default Load State
**Given** a client admin opens Overview tab  
**When** the page loads  
**Then**
- [ ] Cards show Last Week metrics by default
- [ ] Date range displays as "Showing: [Mon Date] – [Sun Date], [Year]"
- [ ] Table shows all clinics sorted by visits (highest first)
- [ ] No compare mode is active
- [ ] Page loads within 1.5 seconds

---

### AC2: Filter - Last Week
**Given** user is on Overview page  
**When** user selects "Last Week" from filter dropdown  
**Then**
- [ ] All cards update to show last week metrics
- [ ] Date range updates correctly (Monday to Sunday of last complete week)
- [ ] WoW card shows comparison with week before
- [ ] MoM card shows comparison with last month
- [ ] Table updates with last week visit counts

---

### AC3: Filter - Current Month
**Given** user is on Overview page  
**When** user selects "Current Month" from filter dropdown  
**Then**
- [ ] Cards show current month data (from 1st to today)
- [ ] Date range shows "Current Month (Jan 1 – Jan [today], 2026)"
- [ ] WoW comparison is disabled (gray out)
- [ ] MoM card compares current month (to date) vs last full month
- [ ] Table updates with current month totals

---

### AC4: Filter - Last Month
**Given** user is on Overview page  
**When** user selects "Last Month" from filter dropdown  
**Then**
- [ ] Cards show last month's full period
- [ ] Date range shows "Last Month (Jan 1 – Jan 31, 2026)"
- [ ] WoW comparison is disabled
- [ ] MoM card compares last month vs month before last
- [ ] Table updates with last month visit counts

---

### AC5: Compare Mode - Last Week vs Week Before
**Given** user is on Overview with Last Week filter  
**When** user toggles "Compare Last Week vs Week Before"  
**Then**
- [ ] Each card displays two columns: "Last Week" and "Week Before"
- [ ] Change metric shows units and percent difference
- [ ] Table shows Week Before visit counts in separate column
- [ ] Date range updates to show both periods: "Last Week (Feb 23 – Mar 1) vs Week Before (Feb 16 – Feb 22)"
- [ ] Toggling off removes compare columns and returns to single-period view

---

### AC6: Compare Mode - Last Month vs Month Before
**Given** user is on Overview with Last Month or Current Month filter  
**When** user selects "Compare Last Month vs Month Before"  
**Then**
- [ ] Each card displays two columns: current month and previous month
- [ ] Change metric shows units and percent difference
- [ ] Table adds column for "Month Before" visit counts
- [ ] Date range displays both months

---

### AC7: Week Start Date is Monday
**Given** today is [Wed, Mar 5, 2026]  
**When** user opens Overview (default Last Week)  
**Then**
- [ ] Last Week range is Feb 23 (Monday) – Mar 1 (Sunday)
- [ ] Week Before range is Feb 16 (Monday) – Feb 22 (Sunday)
- [ ] NOT Sunday-Saturday or any other day boundary

---

### AC8: Divide-by-Zero Handling
**Given** Week Before had 0 patient visits  
**When** calculating WoW percent  
**Then**
- [ ] If Last Week > 0: show "N/A (new growth)" or "+∞"
- [ ] If Last Week = 0: show "N/A (no data)"
- [ ] Do NOT show "∞" or any error message
- [ ] Same logic applies to MoM when comparing against 0

---

### AC9: Real-Time Updates
**Given** a client admin has this Overview page open  
**When** an admin saves new weekly analytics data for one of the client's clinics  
**Then**
- [ ] Overview metrics update within 5 seconds (via poll or WebSocket)
- [ ] Cards reflect new totals
- [ ] Table row for that clinic updates
- [ ] No page reload required
- [ ] User is NOT interrupted (e.g., no modal/alert)

---

### AC10: Single Clinic Client
**Given** a client has only 1 assigned clinic  
**When** user opens Overview  
**Then**
- [ ] Summary cards show that clinic's metrics
- [ ] Table shows 1 row for that clinic
- [ ] All calculations work correctly (no null/undefined errors)

---

### AC11: Many Clinics Client
**Given** a client has 15+ assigned clinics  
**When** user opens Overview  
**Then**
- [ ] Summary cards show combined metrics for all 15+ clinics
- [ ] Table paginates (e.g., 10 per page)
- [ ] Page load time remains under 2 seconds
- [ ] Sorting on any column works correctly across all pages

---

### AC12: Daily Average Calculation
**Given** Last Week total visits = 342 for a client with 2 clinics  
**When** viewing summary card  
**Then**
- [ ] Daily Average = 342 ÷ 7 = 48.857... → display as "48.9 patients/day"
- [ ] Rounded to 1 decimal place
- [ ] Label clearly states "(Last Week)"

---

### AC13: Sorting in Clinic Table
**Given** the clinic breakdown table is displayed  
**When** user clicks "Sort By" dropdown and selects an option  
**Then**
- [ ] Table re-sorts immediately
- [ ] Options include:
  - [ ] Patient Visits (Last Week), Highest First
  - [ ] Patient Visits (Last Week), Lowest First
  - [ ] Week-over-Week Change, Biggest Gain
  - [ ] Week-over-Week Change, Biggest Drop
  - [ ] Patient Visits (Last Month), Highest First
- [ ] Sort persists if user changes filter (e.g., Last Week → Current Month)

---

### AC14: Missing Data Indication
**Given** clinic "South Branch" has no weekly records for last week  
**When** viewing the clinic breakdown table  
**Then**
- [ ] Row shows "South Branch | 0 | [last month total] | N/A | N/A"
- [ ] Background color is gray (different from complete data rows)
- [ ] Hover tooltip says "Data incomplete for this period"
- [ ] Row is NOT excluded (still sums in totals)

---

### AC15: Responsive Design
**Given** user opens Overview on a mobile phone (< 768px)  
**When** page renders  
**Then**
- [ ] Cards stack vertically (1 column)
- [ ] Table is horizontally scrollable
- [ ] Filters and date range display clearly
- [ ] No text overflow or layout issues

---

### AC16: Error State
**Given** API fails to fetch metrics  
**When** page attempts to load  
**Then**
- [ ] Show user-friendly error message: "Unable to load overview. Please try again."
- [ ] Display a "Retry" button
- [ ] Do NOT show raw API error or stack trace
- [ ] Log error server-side for debugging

---

### AC17: Performance
**Given** a client with 10+ clinics and multiple weeks of historical data  
**When** Overview page loads  
**Then**
- [ ] Time to first paint: < 1 second
- [ ] Time to interactive: < 1.5 seconds
- [ ] Summary API call: < 500ms
- [ ] Clinics table API call: < 700ms

---

### AC18: Date Range Display Accuracy
**Given** various filter selections and current dates  
**When** date range is displayed  
**Then**
- [ ] Format: "Showing: [Mon Date] – [Sun Date], [Year]"
- [ ] Examples:
  - [ ] "Showing: Feb 23 – Mar 1, 2026" (Last Week, current date = Mar 5)
  - [ ] "Showing: Mar 1 – Mar 31, 2026" (Current Month)
  - [ ] "Showing: Feb 1 – Feb 28, 2026" (Last Month, current date = Mar 5)

---

## 8. Technical Implementation Notes

### Backend (Node.js / Prisma)

1. **Create DB queries for aggregation:**
   - `getWeeklyAnalyticsByClinicAndDateRange(clinicIds, startDate, endDate)`
   - `aggregatePatientCountsByDateRange(records)`

2. **Implement date utility functions:**
   - `getLastMonday(date)`
   - `getDateRange(filter)` → returns all needed date ranges
   - `calculateWoW(current, previous)`
   - `calculateMoM(current, previous)`

3. **Create controller endpoints:**
   - `GET /api/client/overview/summary`
   - `GET /api/client/overview/clinics`

4. **Data validation:**
   - Ensure user is authenticated
   - Verify user owns the clinics being queried
   - Validate filter and compareMode parameters

### Frontend (React / Next.js)

1. **Component structure:**
   ```
   ClientOverviewPage
   ├── OverviewHeader (filters, date range, compare toggle)
   ├── SummaryCardsContainer (4 KPI cards)
   ├── DailyAverageCard
   └── ClinicBreakdownTable (with sort, pagination)
   ```

2. **State management:**
   - `filter` (last_week | current_month | last_month)
   - `compareMode` (none | wow | mom)
   - `sortBy` (visits_week | visits_month | wow_gain | wow_drop)
   - `sortOrder` (asc | desc)
   - `page` (for pagination)

3. **Real-time updates:**
   - Implement polling with 5-second interval OR
   - WebSocket listener for admin save events
   - Re-fetch summary and clinics data on update

4. **Error handling:**
   - Graceful fallback UI if API fails
   - Retry button for failed requests
   - Toast notifications for successful updates

### Database Indexes (for performance)

```sql
CREATE INDEX idx_weekly_clinic_date 
ON WeeklyAnalytics(clinicId, year, month, weekNumber);

CREATE INDEX idx_clinic_user 
ON Clinic(owner_id);
```

---

## 9. Success Metrics (Product KPIs)

- Overview page engagement: % of client users visiting weekly
- Filter adoption: % using filters beyond default (Last Week)
- Time spent on page: average session duration
- Calculation accuracy: 0 errors in WoW/MoM calculations across 1M+ page views
- Real-time update latency: P95 latency < 2 seconds

---

## 10. Out of Scope

- Drill-down into specific clinic's weekly details (separate feature)
- Export/download reports (separate feature)
- Custom date range picker (use fixed filters only)
- Year-over-year comparisons
- Revenue-based metrics (patient visits only for MVP)
- Predictive analytics or forecasting

---

## 11. Appendix: Example Calculations

### Example 1: Last Week Filter
```
Current Date: Wed, Mar 5, 2026
Last Week: Mon Feb 23 – Sun Mar 1, 2026
Week Before: Mon Feb 16 – Sun Feb 22, 2026
Last Month: Feb 1 – Feb 28, 2026
Month Before: Jan 1 – Jan 31, 2026

Client has 2 clinics: Main (195 visits LW, 170 visits WB), North (147 visits LW, 127 visits WB)

Totals Last Week: 195 + 147 = 342 visits
Totals Week Before: 170 + 127 = 297 visits

WoW:
  units = 342 - 297 = +45
  percent = (45 / 297) × 100 = 15.15% → display as "+15.2%"

Last Month Total: 620 visits
Month Before: 500 visits

MoM:
  units = 620 - 500 = +120
  percent = (120 / 500) × 100 = 24% → display as "+24.0%"

Daily Avg = 342 / 7 = 48.857 → display as "48.9 patients/day"
```

### Example 2: Clinic with No Data
```
South Branch: 0 visits Last Week (no records entered)
Other clinics: 342 visits Last Week

Combined total = 342 (includes 0 from South)

In table:
  South Branch | 0 | 285 | N/A | N/A | (gray bg) "No data"
```

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Status:** Ready for Development Sprint
