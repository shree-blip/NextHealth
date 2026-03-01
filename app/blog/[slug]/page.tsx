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

const prisma = new PrismaClient();
export const revalidate = 300; // 5 minutes

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return { title: 'Not found' };
  }
  return {
    title: post.seoTitle || post.title,
    description: post.metaDesc || post.excerpt || '',
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}` },
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

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <article className="prose prose-slate mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1>{post.title}</h1>
        {/* categories and tags (admin dashboard should allow editing these values) */}
        <CategoriesTags categories={post.categories} tags={post.tags} />
        {post.coverImage && (
          <div className="relative w-full h-96">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover rounded" />
          </div>
        )}
        <p className="text-slate-600">
          By {post.author?.name} &middot; {post.publishedAt?.toDateString()}
        </p>

        {/* social sharing buttons */}
        <SocialShare title={post.title} />

        {/* table of contents generated from HTML content */}
        <TableOfContents html={post.content} />

        <div dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* related posts */}
        <RelatedPosts posts={relatedPosts} />

        {/* comments placeholder */}
        <CommentsPlaceholder />
      </article>
      <Footer />
    </main>
  );
}
