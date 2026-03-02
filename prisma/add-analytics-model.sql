-- Run this SQL to add the WeeklyAnalytics table
CREATE TABLE IF NOT EXISTS "WeeklyAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    
    -- Content Writing Summary
    "blogsPublished" INTEGER NOT NULL DEFAULT 0,
    
    -- SEO Performance Summary
    "avgRanking" REAL NOT NULL DEFAULT 0,
    "totalTraffic" INTEGER NOT NULL DEFAULT 0,
    
    -- GMB Summary
    "callsRequested" INTEGER NOT NULL DEFAULT 0,
    "websiteVisits" INTEGER NOT NULL DEFAULT 0,
    "directionClicks" INTEGER NOT NULL DEFAULT 0,
    
    -- Meta Ads Summary
    "metaImpressions" INTEGER NOT NULL DEFAULT 0,
    "metaClicks" INTEGER NOT NULL DEFAULT 0,
    "metaCTR" REAL NOT NULL DEFAULT 0,
    "metaConversions" INTEGER NOT NULL DEFAULT 0,
    "metaAdSpend" REAL NOT NULL DEFAULT 0,
    
    -- Google Ads Summary
    "googleImpressions" INTEGER NOT NULL DEFAULT 0,
    "googleClicks" INTEGER NOT NULL DEFAULT 0,
    "googleCTR" REAL NOT NULL DEFAULT 0,
    "googleCPC" REAL NOT NULL DEFAULT 0,
    "googleConversions" INTEGER NOT NULL DEFAULT 0,
    "googleCVR" REAL NOT NULL DEFAULT 0,
    "googleCostPerConversion" REAL NOT NULL DEFAULT 0,
    "googleTotalCost" REAL NOT NULL DEFAULT 0,
    
    -- Social Media Summary
    "socialPosts" INTEGER NOT NULL DEFAULT 0,
    "socialViews" INTEGER NOT NULL DEFAULT 0,
    "patientCount" INTEGER NOT NULL DEFAULT 0,
    "digitalConversion" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "dailyPatientAvg" REAL NOT NULL DEFAULT 0,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    UNIQUE("clinicId", "year", "month", "weekNumber")
);

CREATE INDEX "WeeklyAnalytics_clinicId_idx" ON "WeeklyAnalytics"("clinicId");
CREATE INDEX "WeeklyAnalytics_year_month_idx" ON "WeeklyAnalytics"("year", "month");
