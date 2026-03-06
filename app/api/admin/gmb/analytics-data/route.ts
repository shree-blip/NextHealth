import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

function formatGA4Row(d: any) {
  return {
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
  };
}

function formatSCRow(d: any) {
  return {
    date: d.date.toISOString().slice(0, 10),
    clicks: d.clicks,
    impressions: d.impressions,
    ctr: d.ctr,
    avgPosition: d.avgPosition,
    topQueries: d.topQueries,
    topPages: d.topPages,
  };
}

function formatGMBRow(d: any) {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId'); // optional — null = all clinics
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    const startDate = req.nextUrl.searchParams.get('startDate');  // YYYY-MM-DD
    const endDate = req.nextUrl.searchParams.get('endDate');      // YYYY-MM-DD

    const since = startDate ? new Date(startDate + 'T00:00:00Z') : new Date(Date.now() - days * 86400000);
    const until = endDate ? new Date(endDate + 'T23:59:59Z') : new Date();
    const dateFilter = { gte: since, lte: until };

    // If clinicId provided, fetch for that one clinic
    if (clinicId) {
      const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
      if (!connection) {
        return NextResponse.json({ error: 'No Google connection found' }, { status: 404 });
      }

      const [ga4Data, scData, gmbData] = await Promise.all([
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
      ]);

      return NextResponse.json({
        ga4PropertyId: connection.ga4PropertyId,
        searchConsoleSite: connection.searchConsoleSite,
        businessLocationId: connection.businessLocationId,
        ga4Data: ga4Data.map(formatGA4Row),
        searchConsoleData: scData.map(formatSCRow),
        gmbData: gmbData.map(formatGMBRow),
      });
    }

    // No clinicId = aggregate across ALL connected clinics
    const connections = await prisma.gMBConnection.findMany({
      where: {
        connectionStatus: 'connected',
        refreshToken: { not: null },
      },
    });

    // Collect raw rows from all connections
    const allScRows: any[] = [];
    const allGa4Rows: any[] = [];
    const allGmbRows: any[] = [];

    for (const conn of connections) {
      const [scRows, ga4Rows, gmbRows] = await Promise.all([
        conn.searchConsoleSite
          ? prisma.searchConsoleData.findMany({ where: { gmbConnectionId: conn.id, date: dateFilter }, orderBy: { date: 'asc' } })
          : [],
        conn.ga4PropertyId
          ? prisma.gA4Data.findMany({ where: { gmbConnectionId: conn.id, date: dateFilter }, orderBy: { date: 'asc' } })
          : [],
        conn.businessLocationId
          ? prisma.gMBData.findMany({ where: { gmbConnectionId: conn.id, date: dateFilter }, orderBy: { date: 'asc' } })
          : [],
      ]);
      for (const d of scRows) allScRows.push(formatSCRow(d));
      for (const d of ga4Rows) allGa4Rows.push(formatGA4Row(d));
      for (const d of gmbRows) allGmbRows.push(formatGMBRow(d));
    }

    // Aggregate SC by date
    const scByDate: Record<string, { clicks: number; impressions: number; positionSum: number; count: number }> = {};
    for (const row of allScRows) {
      if (!scByDate[row.date]) scByDate[row.date] = { clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      scByDate[row.date].clicks += row.clicks;
      scByDate[row.date].impressions += row.impressions;
      scByDate[row.date].positionSum += row.avgPosition;
      scByDate[row.date].count += 1;
    }
    const aggregatedSC = Object.entries(scByDate)
      .map(([date, v]) => ({
        date,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        avgPosition: v.count > 0 ? v.positionSum / v.count : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate GA4 by date
    const ga4ByDate: Record<string, { activeUsers: number; newUsers: number; sessions: number; pageViews: number; avgSessionDuration: number; bounceRate: number; engagementRate: number; conversions: number; organicSessions: number; paidSessions: number; directSessions: number; referralSessions: number; socialSessions: number; count: number }> = {};
    for (const row of allGa4Rows) {
      if (!ga4ByDate[row.date]) ga4ByDate[row.date] = { activeUsers: 0, newUsers: 0, sessions: 0, pageViews: 0, avgSessionDuration: 0, bounceRate: 0, engagementRate: 0, conversions: 0, organicSessions: 0, paidSessions: 0, directSessions: 0, referralSessions: 0, socialSessions: 0, count: 0 };
      const b = ga4ByDate[row.date];
      b.activeUsers += row.activeUsers;
      b.newUsers += row.newUsers;
      b.sessions += row.sessions;
      b.pageViews += row.pageViews;
      b.avgSessionDuration += row.avgSessionDuration;
      b.bounceRate += row.bounceRate;
      b.engagementRate += row.engagementRate;
      b.conversions += row.conversions;
      b.organicSessions += row.organicSessions;
      b.paidSessions += row.paidSessions;
      b.directSessions += row.directSessions;
      b.referralSessions += row.referralSessions;
      b.socialSessions += row.socialSessions;
      b.count += 1;
    }
    const aggregatedGA4 = Object.entries(ga4ByDate)
      .map(([date, v]) => ({
        date,
        activeUsers: v.activeUsers,
        newUsers: v.newUsers,
        sessions: v.sessions,
        pageViews: v.pageViews,
        avgSessionDuration: v.count > 0 ? v.avgSessionDuration / v.count : 0,
        bounceRate: v.count > 0 ? v.bounceRate / v.count : 0,
        engagementRate: v.count > 0 ? v.engagementRate / v.count : 0,
        conversions: v.conversions,
        organicSessions: v.organicSessions,
        paidSessions: v.paidSessions,
        directSessions: v.directSessions,
        referralSessions: v.referralSessions,
        socialSessions: v.socialSessions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate GMB by date
    const gmbByDate: Record<string, { views: number; directionRequests: number; phoneCalls: number; websiteClicks: number; count: number }> = {};
    for (const row of allGmbRows) {
      if (!gmbByDate[row.date]) gmbByDate[row.date] = { views: 0, directionRequests: 0, phoneCalls: 0, websiteClicks: 0, count: 0 };
      gmbByDate[row.date].views += row.views;
      gmbByDate[row.date].directionRequests += row.directionRequests;
      gmbByDate[row.date].phoneCalls += row.phoneCalls;
      gmbByDate[row.date].websiteClicks += row.websiteClicks;
      gmbByDate[row.date].count += 1;
    }
    const aggregatedGMB = Object.entries(gmbByDate)
      .map(([date, v]) => ({
        date,
        views: v.views,
        discovery: v.views,
        directionRequests: v.directionRequests,
        phoneCalls: v.phoneCalls,
        websiteClicks: v.websiteClicks,
        messageCount: 0,
        totalReviews: 0,
        averageRating: 0,
        newReviews: 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      ga4PropertyId: aggregatedGA4.length > 0 ? 'all' : null,
      searchConsoleSite: aggregatedSC.length > 0 ? 'all' : null,
      businessLocationId: aggregatedGMB.length > 0 ? 'all' : null,
      ga4Data: aggregatedGA4,
      searchConsoleData: aggregatedSC,
      gmbData: aggregatedGMB,
    });
  } catch (error: any) {
    console.error('Analytics data fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch analytics data' }, { status: 500 });
  }
}
