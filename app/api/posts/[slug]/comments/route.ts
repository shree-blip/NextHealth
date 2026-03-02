import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { comments: true }
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const approved = post.comments.filter((c) => c.approved);
  return NextResponse.json(approved);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { author, content } = body;

  if (!author || !content) {
    return NextResponse.json(
      { error: 'Author and content are required' },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      author,
      content,
      approved: false, // default pending
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
