import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
      },
    });

    return NextResponse.json(
      sessions.map((session) => ({
        id: session.id,
        sessionKey: session.sessionKey,
        visitorId: session.visitorId,
        language: session.language,
        startedAt: session.startedAt,
        lastMessageAt: session.lastMessageAt,
        summary: session.summary,
        report: session.report,
        totalMessages: session.messages.length,
        messages: session.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        })),
      }))
    );
  } catch (error) {
    console.error('Admin chat reports API error:', error);
    return NextResponse.json([]);
  }
}
