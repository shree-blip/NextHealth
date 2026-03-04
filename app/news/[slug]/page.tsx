import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import SocialShare from '@/components/SocialShare';
import NewsArticleContent from '@/components/NewsArticleContent';

// Cache news articles for 1 hour, then revalidate in background (ISR)
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'News | The NextGen Healthcare Marketing',
    description: 'Read our latest news article.',
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article) notFound();

  // Get other news for "More News" section
  const moreNews = await prisma.newsArticle.findMany({
    where: { id: { not: article.id }, publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { slug: true, title: true, coverImage: true, source: true, publishedAt: true, excerpt: true },
  });

  // JSON-LD NewsArticle Schema
  const newsSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.coverImage ? `${SITE_URL}${article.coverImage}` : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'The NextGen Healthcare Marketing',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${article.slug}`,
    },
  };

  // Serialize dates for client component
  const serializedArticle = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    source: article.source,
    publishedAt: article.publishedAt?.toISOString() || null,
  };
  const serializedMore = moreNews.map((n) => ({
    ...n,
    publishedAt: n.publishedAt?.toISOString() || null,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <Navbar />

      {/* Hero / Cover Image */}
      {article.coverImage && (
        <div className="relative w-full h-[300px] sm:h-[420px] lg:h-[500px]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent dark:from-slate-950/90 dark:via-slate-950/50" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
            <div className="mx-auto max-w-4xl">
              {article.source && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-600/90 dark:bg-blue-500/90 text-white text-xs font-bold rounded-full mb-4 backdrop-blur-sm">
                  {article.source}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                {article.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <SocialShare title={article.title} />
      </section>
      <NewsArticleContent article={serializedArticle} moreNews={serializedMore} />

      <Footer />
    </main>
  );
}
