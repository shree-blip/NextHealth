import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, categories: true, tags: true }
    });
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  }
  // List all posts (for admin panel)
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' }
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content,
      coverImage: body.coverImage || null,
      coverImageAlt: body.coverImageAlt || null,
      seoTitle: body.seoTitle || null,
      metaDesc: body.metaDesc || null,
      canonical: body.canonical || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    }
  });
  return NextResponse.json(post, { status: 201 });
}
