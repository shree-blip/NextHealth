import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

const REPLY_PREFIX = '__replyTo:';

function encodeReplyContent(content: string, parentId?: number | null) {
  if (!parentId) return content;
  return `${REPLY_PREFIX}${parentId}__ ${content}`;
}

function decodeReplyContent(content: string) {
  const match = content.match(/^__replyTo:(\d+)__\s*/);
  if (!match) {
    return { parentId: null as number | null, content };
  }
  return {
    parentId: Number(match[1]),
    content: content.replace(/^__replyTo:\d+__\s*/, ''),
  };
}

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

  const approved = post.comments
    .filter((c) => c.approved)
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  const topLevel: Array<any> = [];
  const repliesByParent = new Map<number, any[]>();

  for (const comment of approved) {
    const decoded = decodeReplyContent(comment.content);
    const payload = {
      id: comment.id,
      author: comment.author,
      content: decoded.content,
      publishedAt: comment.publishedAt,
      replies: [],
    };

    if (decoded.parentId) {
      const replies = repliesByParent.get(decoded.parentId) || [];
      replies.push(payload);
      repliesByParent.set(decoded.parentId, replies);
      continue;
    }

    topLevel.push(payload);
  }

  for (const comment of topLevel) {
    comment.replies = repliesByParent.get(comment.id) || [];
  }

  return NextResponse.json(topLevel);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthenticatedDbUser(request);
  if (!user) {
    const appUrl = process.env.APP_URL || request.nextUrl.origin;
    return NextResponse.json(
      {
        error: 'Authentication required',
        requiresAuth: true,
        loginUrl: `${appUrl}/login`,
      },
      { status: 401 }
    );
  }

  const { slug } = await params;
  const body = await request.json();
  const { content, parentId } = body;

  if (!content || !String(content).trim()) {
    return NextResponse.json(
      { error: 'Content is required' },
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
      author: user.name,
      content: encodeReplyContent(String(content).trim(), typeof parentId === 'number' ? parentId : null),
      approved: true,
    },
  });

  const decoded = decodeReplyContent(comment.content);
  return NextResponse.json(
    {
      id: comment.id,
      author: comment.author,
      content: decoded.content,
      publishedAt: comment.publishedAt,
      parentId: decoded.parentId,
    },
    { status: 201 }
  );
}
