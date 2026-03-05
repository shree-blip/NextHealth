import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Daily News Cron Job
 * 
 * Triggered by Vercel Cron at 2:00 PM CST every day.
 * Generates a complete news article with image and publishes it automatically.
 * 
 * Security: Protected by CRON_SECRET header verification.
 */
export async function GET(request: Request) {
  try {
    // ── Verify cron secret (Vercel sends this automatically) ──────────
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Call the news generation endpoint ─────────────────────────────
    const baseUrl = process.env.APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/ai/generate-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoPublish: true }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`News generation failed: ${errData.error || response.statusText}`);
    }

    const result = await response.json();

    console.log(`[CRON] Daily news published: "${result.article?.title}" (${result.article?.slug})`);

    return NextResponse.json({
      success: true,
      message: 'Daily news article generated and published',
      article: result.article,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Daily news generation failed:', error);
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
