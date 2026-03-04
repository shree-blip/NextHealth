import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import CategoriesTags from '@/components/CategoriesTags';
import SocialShare from '@/components/SocialShare';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import CommentsPlaceholder from '@/components/CommentsPlaceholder';
import BlogPostMeta from '@/components/BlogPostMeta';
import SinglePostLayout from '@/components/post/SinglePostLayout';

// Cache posts for 1 hour, then revalidate in background (ISR)
export const revalidate = 3600;
export const dynamicParams = true; // Allow SSR for new blog posts

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

// Fetch blog post metadata for dynamic rendering
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { title: true, metaDesc: true, excerpt: true, seoTitle: true }
    });
    
    if (!post) {
      return {
        title: 'Blog Post | The NextGen Healthcare Marketing',
        description: 'Read our latest blog post.',
      };
    }

    return {
      title: post.seoTitle || post.title || 'Blog Post | The NextGen Healthcare Marketing',
      description: post.metaDesc || post.excerpt || 'Read our latest blog post.',
      alternates: {
        canonical: `${SITE_URL}/blog/${slug}`,
      }
    };
  } catch (e) {
    return {
      title: 'Blog Post | The NextGen Healthcare Marketing',
      description: 'Read our latest blog post.',
    };
  }
}

// Pre-generate pages for known blog slugs at build time
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
      take: 50
    });
    return posts.map(post => ({ slug: post.slug }));
  } catch (e) {
    return [];
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  // Fetch data at runtime (SSR)
  const { slug } = await params;
  let post: any = null;
  let relatedPosts: { slug: string; title: string }[] = [];
  try {
    post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, categories: true, tags: true }
    });
    if (post) {
      relatedPosts = await prisma.post.findMany({
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
    }
  } catch (e) {
    // If DB is unreachable, show not found
    notFound();
  }
  if (!post) {
    notFound();
  }

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
      name: 'The NextGen Healthcare Marketing',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.map((t: { name: string }) => t.name).join(', '),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Navbar />
      <SinglePostLayout
        title={post.title}
        shareTitle={post.title}
        headerTop={<CategoriesTags categories={post.categories} tags={post.tags} />}
        headerMeta={<BlogPostMeta authorName={post.author?.name || null} publishedAt={post.publishedAt?.toISOString() || null} />}
        coverImage={post.coverImage}
        coverAlt={post.title}
      >
        <div className="space-y-5">
          <TableOfContents html={post.content} />

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-8 lg:p-10 min-w-0">
            <div
              data-article-content
              className="prose prose-slate prose-lg sm:prose-xl max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-base sm:prose-p:text-lg prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                prose-li:text-base sm:prose-li:text-lg prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300
                prose-code:text-slate-900 dark:prose-code:text-slate-100
                prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:overflow-x-auto
                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600
                prose-img:rounded-xl break-words"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <RelatedPosts posts={relatedPosts} />

          <CommentsPlaceholder />
        </div>
      </SinglePostLayout>
      <Footer />
    </main>
  );
}
