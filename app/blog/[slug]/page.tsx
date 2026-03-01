import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import CategoriesTags from '@/components/CategoriesTags';
import SocialShare from '@/components/SocialShare';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import CommentsPlaceholder from '@/components/CommentsPlaceholder';
import BlogPostMeta from '@/components/BlogPostMeta';

const prisma = new PrismaClient();
export const revalidate = 300; // 5 minutes

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nextgenhealthcaremarketing.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return { title: 'Not found' };
  }
  return {
    title: post.seoTitle || post.title,
    description: post.metaDesc || post.excerpt || '',
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, categories: true, tags: true }
  });
  if (!post) {
    notFound();
  }

  // fetch related posts based on shared categories or tags
  const relatedPosts = await prisma.post.findMany({
    where: {
      AND: [
        { id: { not: post.id } },
        {
          OR: [
            { categories: { some: { id: { in: post.categories.map((c: { id: number }) => c.id) } } } },
            { tags: { some: { id: { in: post.tags.map((t: { id: number }) => t.id) } } } }
          ]
        }
      ]
    },
    select: { slug: true, title: true }
  });

  // JSON-LD BlogPosting Schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDesc || post.excerpt || '',
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.author ? {
      '@type': 'Person',
      name: post.author.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'NextGen Healthcare Marketing',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.map((t: { name: string }) => t.name).join(', '),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Navbar />
      <article className="mx-auto max-w-5xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="mt-6">
            <CategoriesTags categories={post.categories} tags={post.tags} />
          </div>

          <div className="mt-5">
            <BlogPostMeta authorName={post.author?.name || null} publishedAt={post.publishedAt?.toISOString() || null} />
          </div>
        </header>

        {post.coverImage && (
          <div className="relative w-full h-64 sm:h-80 lg:h-[28rem] mt-8 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <div className="mt-8">
          <SocialShare title={post.title} />
        </div>

        <div className="mt-6">
          <TableOfContents html={post.content} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-10">
          <div
            data-article-content
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-li:text-slate-700
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <RelatedPosts posts={relatedPosts} />

        <CommentsPlaceholder />
      </article>
      <Footer />
    </main>
  );
}
