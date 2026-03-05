import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidateSitemap } from '@/lib/revalidate-sitemap';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { author: true, categories: true, tags: true }
  });
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  const body = await request.json();
  
  // Fetch the OLD post before updating (to detect slug/publish status changes)
  const oldPost = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    select: { slug: true, publishedAt: true },
  });
  if (!oldPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  // Build update data dynamically (allows partial updates)
  const updateData: any = {};
  
  if (body.title !== undefined) updateData.title = body.title;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
  if (body.coverImageAlt !== undefined) updateData.coverImageAlt = body.coverImageAlt || null;
  if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
  if (body.metaDesc !== undefined) updateData.metaDesc = body.metaDesc || null;
  if (body.canonical !== undefined) updateData.canonical = body.canonical || null;
  if (body.publishedAt !== undefined) {
    updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }
  
  const post = await prisma.post.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
  
  // Revalidate sitemap if post is/was published or if slug changed
  const wasPublished = oldPost.publishedAt !== null;
  const isPublished = post.publishedAt !== null;
  const slugChanged = oldPost.slug !== post.slug;
  
  if (wasPublished || isPublished || slugChanged) {
    revalidateSitemap({
      type: 'blog',
      slug: post.slug,
      oldSlug: slugChanged ? oldPost.slug : null,
    });
  }
  
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  
  // Fetch the post before deleting (to get slug for sitemap revalidation)
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    select: { slug: true, publishedAt: true },
  });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  await prisma.post.delete({ where: { id: parseInt(id) } });
  
  // Revalidate sitemap if the deleted post was published
  if (post.publishedAt !== null) {
    revalidateSitemap({
      type: 'blog',
      slug: post.slug,
    });
  }
  
  return NextResponse.json({ success: true });
}
