import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  
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
  return NextResponse.json(post);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.post.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
