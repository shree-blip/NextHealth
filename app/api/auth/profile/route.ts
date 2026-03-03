import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sessions } from '@/lib/sessions';

export async function PATCH(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session')?.value;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = sessions.get(sessionId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, avatar } = body;

    // Validate inputs
    if (!name && !avatar && avatar !== undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update user in database
    try {
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
        },
      });

      // Update session
      sessions.set(sessionId, {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar || undefined,
      });

      return NextResponse.json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      // Fallback: update session only
      const updated = {
        ...currentUser,
        ...(name && { name }),
        ...(avatar !== undefined && { avatar }),
      };
      sessions.set(sessionId, updated);
      return NextResponse.json(updated, { status: 200 });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
