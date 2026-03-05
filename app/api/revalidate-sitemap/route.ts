import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedDbUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Revalidate the sitemap and relevant pages after blog/news post changes.
 * Triggered when posts are published, unpublished, or their publish date is changed.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === 'string' ? body.slug : null;
    const type = typeof body?.type === 'string' ? body.type : 'blog'; // 'blog' | 'news'

    // Always revalidate sitemap and the relevant list page
    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/news');

    // Revalidate the specific post/article page if a slug was provided
    if (slug) {
      revalidatePath(`/${type}/${slug}`);
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      slug: slug || null,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sitemap revalidation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate sitemap' },
      { status: 500 }
    );
  }
}
