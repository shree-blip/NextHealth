import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Revalidate the sitemap after blog post changes
 * Triggered when posts are published/unpublished
 */
export async function POST(request: Request) {
  try {
    // Revalidate sitemap and blog pages
    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    
    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sitemap revalidation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate sitemap' },
      { status: 500 }
    );
  }
}
