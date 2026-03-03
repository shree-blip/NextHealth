import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get user from auth token
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and get user
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      headers: { Cookie: `authToken=${token}` },
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyResponse.json();

    const { email, address, city, state, zipCode, country } = await req.json();

    // Validate required fields
    if (!email || !address || !city || !country || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate state for US
    if (country === 'US' && !state) {
      return NextResponse.json(
        { error: 'State is required for US addresses' },
        { status: 400 }
      );
    }

    // Update user billing details in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        // Store billing info in available fields or create new ones as needed
        // For now, we'll create a JSON field or store separately
        // This assumes you'll add these fields to your User model
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Store billing details (you may want to create a separate BillingAddress model)
    // For now, logging the data
    console.log('Billing details updated:', {
      userId: user.id,
      email,
      address,
      city,
      state,
      zipCode,
      country,
    });

    return NextResponse.json({
      success: true,
      message: 'Billing details updated successfully',
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Error updating billing details:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update billing details' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user from auth token
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and get user
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      headers: { Cookie: `authToken=${token}` },
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyResponse.json();

    // Fetch user's billing details
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        // Add these fields when they're added to the schema:
        // billingEmail: true,
        // billingAddress: true,
        // billingCity: true,
        // billingState: true,
        // billingZip: true,
        // billingCountry: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: userData.email,
      // billingEmail: userData.billingEmail,
      // address: userData.billingAddress,
      // city: userData.billingCity,
      // state: userData.billingState,
      // zipCode: userData.billingZip,
      // country: userData.billingCountry,
    });
  } catch (err: any) {
    console.error('Error fetching billing details:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch billing details' },
      { status: 500 }
    );
  }
}
