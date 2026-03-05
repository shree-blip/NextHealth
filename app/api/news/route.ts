import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  }
  const articles = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
  });
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('response' in auth) return auth.response;

  const body = await request.json();
  const article = await prisma.newsArticle.create({
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content ? sanitizeHtml(body.content) : '',
      coverImage: body.coverImage || null,
      coverImageAlt: body.coverImageAlt || null,
      publisher: body.publisher || 'The NextGen Healthcare Marketing',
      source: body.source || null,
      sourceUrl: body.sourceUrl || null,
      sourceDate: body.sourceDate ? new Date(body.sourceDate) : null,
      seoTitle: body.seoTitle || null,
      metaDesc: body.metaDesc || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
