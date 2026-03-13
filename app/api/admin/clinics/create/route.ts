import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { normalizeServiceCategories } from '@/lib/service-categories';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const auth = await requireAdmin(request);
    if ('response' in auth) return auth.response;

    const { name, type, location, assignedUsers, serviceCategories } = await request.json();
    const normalizedServiceCategories = normalizeServiceCategories(serviceCategories);

    // Validate input
    if (!name || !type || !location) {
      return NextResponse.json(
        { error: 'Name, type, and location are required' },
        { status: 400 }
      );
    }

    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name,
        type,
        location,
        leads: 0,
        appointments: 0,
      },
    });

    // Assign to users if provided
    if (assignedUsers && Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      await Promise.all(
        assignedUsers.map((userId: string) =>
          prisma.clientClinic.upsert({
            where: {
              userId_clinicId: {
                userId,
                clinicId: clinic.id,
              },
            },
            update: {},
            create: {
              userId,
              clinicId: clinic.id,
              serviceCategories: normalizedServiceCategories,
            },
          })
        )
      );
    }

    // Fetch full clinic data with assignments
    const fullClinic = await prisma.clinic.findUnique({
      where: { id: clinic.id },
      include: {
        clientAssignments: true,
      },
    });

    return NextResponse.json(fullClinic, { status: 201 });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
