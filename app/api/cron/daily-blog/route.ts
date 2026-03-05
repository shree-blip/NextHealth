import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Daily Blog Cron Job
 * 
 * Triggered by Vercel Cron at 8:00 AM CST every day.
 * Generates a complete blog post with image and publishes it automatically.
 * 
 * Security: Protected by CRON_SECRET header verification.
 */
export async function GET(request: Request) {
  try {
    // ── Verify cron secret (Vercel sends this automatically) ──────────
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Call the blog generation endpoint ─────────────────────────────
    const baseUrl = process.env.APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/ai/generate-blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ autoPublish: true }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Blog generation failed: ${errData.error || response.statusText}`);
    }

    const result = await response.json();

    console.log(`[CRON] Daily blog published: "${result.post?.title}" (${result.post?.slug})`);

    return NextResponse.json({
      success: true,
      message: 'Daily blog post generated and published',
      post: result.post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Daily blog generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
