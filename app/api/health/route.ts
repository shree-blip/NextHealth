import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: String(error),
      env: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    }, { status: 500 });
  }
}
