import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { id: parseInt(id) },
  });
  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

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
  return NextResponse.json(article);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.newsArticle.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
