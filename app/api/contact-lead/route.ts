import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, businessType, budget, message, source } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Create new lead
    const lead = await prisma.contactLead.create({
      data: {
        name,
        email,
        phone: phone || null,
        businessType: businessType || null,
        budget: budget || null,
        message: message || null,
        source: source || 'unknown',
        status: 'new',
      },
    });

    return NextResponse.json({ message: 'Lead submitted successfully', lead }, { status: 201 });
  } catch (error) {
    console.error('Contact lead error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const leads = await prisma.contactLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ leads, count: leads.length }, { status: 200 });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// PATCH endpoint for updating lead status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const lead = await prisma.contactLead.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json({ message: 'Lead updated successfully', lead }, { status: 200 });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
