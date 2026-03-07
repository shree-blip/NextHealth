import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncGA4Data, syncSearchConsoleData } from '@/lib/google-analytics';
import { syncGmbConnection } from '@/lib/gmb';
import { syncGoogleAdsData } from '@/lib/google-ads';

/**
 * Client-facing analytics data endpoint.
 * Returns GA4 + Search Console + GMB data for clinics assigned to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedDbUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    const startDate = req.nextUrl.searchParams.get('startDate');  // YYYY-MM-DD
    const endDate = req.nextUrl.searchParams.get('endDate');      // YYYY-MM-DD

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    // Verify this user has access to this clinic (admin can access any clinic)
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!isAdmin) {
      const assignment = await prisma.clientClinic.findFirst({
        where: { userId: user.id, clinicId },
      });
      if (!assignment) {
        return NextResponse.json({ error: 'You do not have access to this clinic' }, { status: 403 });
      }
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({
        ga4PropertyId: null,
        searchConsoleSite: null,
        businessLocationId: null,
        googleAdsCustomerId: null,
        ga4Data: [],
        searchConsoleData: [],
        gmbData: [],
        googleAdsData: [],
      });
    }

    // Auto-sync if data has never been synced or is stale (>1 hour)
    const STALE_MS = 60 * 60 * 1000; // 1 hour
    const forceSync = req.nextUrl.searchParams.get('sync') === '1';
    const isStale = !connection.lastSyncedAt || (Date.now() - connection.lastSyncedAt.getTime() > STALE_MS);
    const syncErrors: string[] = [];

    if ((isStale || forceSync) && connection.refreshToken) {
      try {
        await prisma.gMBConnection.update({
          where: { id: connection.id },
          data: { syncStatus: 'syncing' },
        });
        const syncDays = Math.max(days, 90); // Sync at least 90 days for cache coverage
        const syncPromises: Promise<any>[] = [];
        if (connection.ga4PropertyId) syncPromises.push(syncGA4Data(connection.id, syncDays).catch(e => { console.error('GA4 sync error:', e.message); syncErrors.push(`GA4: ${e.message}`); }));
        if (connection.searchConsoleSite) syncPromises.push(syncSearchConsoleData(connection.id, syncDays).catch(e => { console.error('SC sync error:', e.message); syncErrors.push(`SC: ${e.message}`); }));
        if (connection.businessLocationId) syncPromises.push(syncGmbConnection(connection.id).catch(e => { console.error('GMB sync error:', e.message); syncErrors.push(`GBP: ${e.message}`); }));
        if (connection.googleAdsCustomerId) syncPromises.push(syncGoogleAdsData(connection.id, syncDays).catch(e => { console.error('Google Ads sync error:', e.message); syncErrors.push(`Ads: ${e.message}`); }));
        if (syncPromises.length > 0) await Promise.allSettled(syncPromises);
        await prisma.gMBConnection.update({
          where: { id: connection.id },
          data: {
            lastSyncedAt: new Date(),
            syncStatus: syncErrors.length > 0 ? 'error' : 'idle',
            lastSyncError: syncErrors.length > 0 ? syncErrors.join('; ') : null,
          },
        });
      } catch (syncErr: any) {
        console.error('Auto-sync failed:', syncErr.message);
        syncErrors.push(syncErr.message);
        await prisma.gMBConnection.update({
          where: { id: connection.id },
          data: { syncStatus: 'error', lastSyncError: syncErr.message },
        }).catch(() => {});
      }
    }

    const since = startDate ? new Date(startDate + 'T00:00:00Z') : new Date(Date.now() - days * 86400000);
    const until = endDate ? new Date(endDate + 'T23:59:59Z') : new Date();

    const dateFilter = { gte: since, lte: until };

    const [ga4Data, scData, gmbData, adsData] = await Promise.all([
      prisma.gA4Data.findMany({
        where: { gmbConnectionId: connection.id, date: dateFilter },
        orderBy: { date: 'asc' },
      }),
      prisma.searchConsoleData.findMany({
        where: { gmbConnectionId: connection.id, date: dateFilter },
        orderBy: { date: 'asc' },
      }),
      prisma.gMBData.findMany({
        where: { gmbConnectionId: connection.id, date: dateFilter },
        orderBy: { date: 'asc' },
      }),
      prisma.googleAdsData.findMany({
        where: { gmbConnectionId: connection.id, date: dateFilter },
        orderBy: { date: 'asc' },
      }),
    ]);

    return NextResponse.json({
      ga4PropertyId: connection.ga4PropertyId,
      searchConsoleSite: connection.searchConsoleSite,
      businessLocationId: connection.businessLocationId,
      googleAdsCustomerId: connection.googleAdsCustomerId,
      ga4Data: ga4Data.map(d => ({
        date: d.date.toISOString().slice(0, 10),
        activeUsers: d.activeUsers,
        newUsers: d.newUsers,
        sessions: d.sessions,
        pageViews: d.pageViews,
        avgSessionDuration: d.avgSessionDuration,
        bounceRate: d.bounceRate,
        engagementRate: d.engagementRate,
        conversions: d.conversions,
        organicSessions: d.organicSessions,
        paidSessions: d.paidSessions,
        directSessions: d.directSessions,
        referralSessions: d.referralSessions,
        socialSessions: d.socialSessions,
      })),
      searchConsoleData: scData.map(d => ({
        date: d.date.toISOString().slice(0, 10),
        clicks: d.clicks,
        impressions: d.impressions,
        ctr: d.ctr,
        avgPosition: d.avgPosition,
        topQueries: d.topQueries,
        topPages: d.topPages,
      })),
      gmbData: gmbData.map(d => ({
        date: d.date.toISOString().slice(0, 10),
        views: d.views,
        discovery: d.discovery,
        directionRequests: d.directionRequests,
        phoneCalls: d.phoneCalls,
        websiteClicks: d.websiteClicks,
        messageCount: d.messageCount,
        totalReviews: d.totalReviews,
        averageRating: d.averageRating,
        newReviews: d.newReviews,
      })),
      googleAdsData: adsData.map(d => ({
        date: d.date.toISOString().slice(0, 10),
        impressions: d.impressions,
        clicks: d.clicks,
        cost: Number(d.costMicros) / 1_000_000,
        conversions: d.conversions,
        ctr: d.ctr,
        avgCpc: d.avgCpc,
        costPerConversion: d.costPerConversion,
      })),
      ...(syncErrors.length > 0 ? { syncErrors } : {}),
    });
  } catch (error: any) {
    console.error('Client analytics data fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch analytics data' }, { status: 500 });
  }
}
