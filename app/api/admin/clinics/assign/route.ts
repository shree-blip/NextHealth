import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { normalizeServiceCategories } from '@/lib/service-categories';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const auth = await requireAdmin(request);
    if ('response' in auth) return auth.response;

    const { userId, clinicId, serviceCategories } = await request.json();

    if (!userId || !clinicId) {
      return NextResponse.json(
        { error: 'userId and clinicId are required' },
        { status: 400 }
      );
    }

    // Check if user and clinic exist
    const [user, clinic] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.clinic.findUnique({ where: { id: clinicId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const inheritedAssignment = await prisma.clientClinic.findFirst({
      where: { clinicId },
      select: { serviceCategories: true },
      orderBy: { assignedAt: 'asc' },
    });

    const normalizedServiceCategories = normalizeServiceCategories(
      serviceCategories ?? inheritedAssignment?.serviceCategories ?? [],
    );

    // Create assignment
    const assignment = await prisma.clientClinic.upsert({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
      update: {
        serviceCategories: normalizedServiceCategories,
      },
      create: {
        userId,
        clinicId,
        serviceCategories: normalizedServiceCategories,
      },
    });

    return NextResponse.json(
      {
        message: 'Clinic assigned successfully',
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error assigning clinic:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign clinic' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check auth
    const auth = await requireAdmin(request);
    if ('response' in auth) return auth.response;

    const { userId, clinicId } = await request.json();

    if (!userId || !clinicId) {
      return NextResponse.json(
        { error: 'userId and clinicId are required' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const assignment = await prisma.clientClinic.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Delete assignment
    await prisma.clientClinic.delete({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    return NextResponse.json({
      message: 'Clinic unassigned successfully',
    });
  } catch (error) {
    console.error('Error removing clinic assignment:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to remove assignment',
      },
      { status: 500 }
    );
  }
}
