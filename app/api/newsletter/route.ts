import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { active: true },
        });
        return NextResponse.json({ message: 'Subscription reactivated' }, { status: 200 });
      }
    }

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        source: source || 'footer',
      },
    });

    return NextResponse.json({ message: 'Successfully subscribed', subscriber }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      orderBy: { subscribedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ subscribers, count: subscribers.length }, { status: 200 });
  } catch (error) {
    console.error('Newsletter fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
