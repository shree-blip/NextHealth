import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidateSitemap } from '@/lib/revalidate-sitemap';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { id: parseInt(id) },
  });
  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  const body = await request.json();

  // Fetch the OLD article before updating (to detect slug/publish status changes)
  const oldArticle = await prisma.newsArticle.findUnique({
    where: { id: parseInt(id) },
    select: { slug: true, publishedAt: true },
  });
  if (!oldArticle) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Build update data dynamically so partial updates work (e.g. toggle publish)
  const updateData: Record<string, any> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
  if (body.coverImageAlt !== undefined) updateData.coverImageAlt = body.coverImageAlt || null;
  if (body.publisher !== undefined) updateData.publisher = body.publisher || 'The NextGen Healthcare Marketing';
  if (body.source !== undefined) updateData.source = body.source || null;
  if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl || null;
  if (body.sourceDate !== undefined) updateData.sourceDate = body.sourceDate ? new Date(body.sourceDate) : null;
  if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
  if (body.metaDesc !== undefined) updateData.metaDesc = body.metaDesc || null;
  if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;

  const article = await prisma.newsArticle.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  // Revalidate sitemap if article is/was published or if slug changed
  const wasPublished = oldArticle.publishedAt !== null;
  const isPublished = article.publishedAt !== null;
  const slugChanged = oldArticle.slug !== article.slug;

  if (wasPublished || isPublished || slugChanged) {
    revalidateSitemap({
      type: 'news',
      slug: article.slug,
      oldSlug: slugChanged ? oldArticle.slug : null,
    });
  }

  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;

  // Fetch the article before deleting (to get slug for sitemap revalidation)
  const article = await prisma.newsArticle.findUnique({
    where: { id: parseInt(id) },
    select: { slug: true, publishedAt: true },
  });
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  await prisma.newsArticle.delete({ where: { id: parseInt(id) } });

  // Revalidate sitemap if the deleted article was published
  if (article.publishedAt !== null) {
    revalidateSitemap({
      type: 'news',
      slug: article.slug,
    });
  }

  return NextResponse.json({ success: true });
}
