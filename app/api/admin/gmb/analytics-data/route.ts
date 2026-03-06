import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

      const [ga4Data, scData] = await Promise.all([
        prisma.gA4Data.findMany({
          where: { gmbConnectionId: connection.id, date: dateFilter },
          orderBy: { date: 'asc' },
        }),
        prisma.searchConsoleData.findMany({
          where: { gmbConnectionId: connection.id, date: dateFilter },
          orderBy: { date: 'asc' },
        }),
      ]);

      return NextResponse.json({
        ga4PropertyId: connection.ga4PropertyId,
        searchConsoleSite: connection.searchConsoleSite,
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
      });
    }

    // No clinicId = aggregate across ALL connected clinics
    const connections = await prisma.gMBConnection.findMany({
      where: { searchConsoleSite: { not: null } },
    });

    const allScData: any[] = [];
    for (const conn of connections) {
      const scRows = await prisma.searchConsoleData.findMany({
        where: { gmbConnectionId: conn.id, date: dateFilter },
        orderBy: { date: 'asc' },
      });
      for (const d of scRows) {
        allScData.push({
          date: d.date.toISOString().slice(0, 10),
          clicks: d.clicks,
          impressions: d.impressions,
          ctr: d.ctr,
          avgPosition: d.avgPosition,
        });
      }
    }

    // Aggregate by date
    const byDate: Record<string, { clicks: number; impressions: number; positionSum: number; count: number }> = {};
    for (const row of allScData) {
      if (!byDate[row.date]) byDate[row.date] = { clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      byDate[row.date].clicks += row.clicks;
      byDate[row.date].impressions += row.impressions;
      byDate[row.date].positionSum += row.avgPosition;
      byDate[row.date].count += 1;
    }

    const aggregated = Object.entries(byDate)
      .map(([date, v]) => ({
        date,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        avgPosition: v.count > 0 ? v.positionSum / v.count : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      ga4PropertyId: null,
      searchConsoleSite: 'all',
      ga4Data: [],
      searchConsoleData: aggregated,
    });
  } catch (error: any) {
    console.error('Analytics data fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch analytics data' }, { status: 500 });
  }
}
