import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Check auth
    const auth = await requireAdmin(request);
    if ('response' in auth) return auth.response;

    const { id: clinicId } = await context.params;
    const { name, type, location, assignedUsers } = await request.json();

    // Fetch current clinic
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { clientAssignments: true },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Update clinic details
    const updatedClinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(location && { location }),
      },
    });

    // Update assignments if provided
    if (assignedUsers !== undefined && Array.isArray(assignedUsers)) {
      // Get current assignments
      const currentAssignments = clinic.clientAssignments.map((ca) => ca.userId);

      // Remove old assignments not in new list
      for (const userId of currentAssignments) {
        if (!assignedUsers.includes(userId)) {
          await prisma.clientClinic.delete({
            where: {
              userId_clinicId: {
                userId,
                clinicId,
              },
            },
          });
        }
      }

      // Add new assignments
      for (const userId of assignedUsers) {
        if (!currentAssignments.includes(userId)) {
          await prisma.clientClinic.upsert({
            where: {
              userId_clinicId: {
                userId,
                clinicId,
              },
            },
            update: {},
            create: {
              userId,
              clinicId,
            },
          });
        }
      }
    }

    // Fetch full updated clinic data
    const fullClinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        clientAssignments: true,
      },
    });

    return NextResponse.json(fullClinic);
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Check auth
    const auth = await requireAdmin(request);
    if ('response' in auth) return auth.response;

    const { id: clinicId } = await context.params;

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Delete in transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete all GMB data for this clinic
      const gmbConnection = await tx.gMBConnection.findUnique({
        where: { clinicId },
      });

      if (gmbConnection) {
        await tx.gMBData.deleteMany({
          where: { gmbConnectionId: gmbConnection.id },
        });

        // Delete GMB connection
        await tx.gMBConnection.delete({
          where: { id: gmbConnection.id },
        });
      }

      // Delete all client assignments
      await tx.clientClinic.deleteMany({
        where: { clinicId },
      });

      // Delete all weekly analytics
      await tx.weeklyAnalytics.deleteMany({
        where: { clinicId },
      });

      // Delete the clinic
      return await tx.clinic.delete({
        where: { id: clinicId },
      });
    });

    return NextResponse.json({
      message: 'Clinic deleted successfully',
      clinic: result,
    });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
