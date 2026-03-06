import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });
    if (!connection) {
      return NextResponse.json({ error: 'No Google connection found' }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [ga4Data, scData] = await Promise.all([
      prisma.gA4Data.findMany({
        where: { gmbConnectionId: connection.id, date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
      prisma.searchConsoleData.findMany({
        where: { gmbConnectionId: connection.id, date: { gte: since } },
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
  } catch (error: any) {
    console.error('Analytics data fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch analytics data' }, { status: 500 });
  }
}
