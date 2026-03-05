import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedDbUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Revalidate the sitemap after blog post changes
 * Triggered when posts are published/unpublished
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === 'string' ? body.slug : null;

    // Revalidate sitemap and blog pages
    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath('/news');
    if (slug) {
      revalidatePath(`/blog/${slug}`);
      revalidatePath(`/news/${slug}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      slug: slug || null,
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
