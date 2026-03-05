import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SinglePostLayout from '@/components/post/SinglePostLayout';

// Cache news articles for 1 hour, then revalidate in background (ISR)
export const revalidate = 3600;
export const dynamicParams = true; // Allow SSR for new news articles

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

function normalizeArticleHtml(html: string): string {
  const withNormalizedLinks = html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (match, beforeHref, href, afterHref) => {
    const isExternal = /^https?:\/\//i.test(href) && !href.includes('thenextgenhealth.com');
    const isInternalAbsolute = /^https?:\/\//i.test(href) && href.includes('thenextgenhealth.com');

    let normalizedHref = href;
    if (isInternalAbsolute) {
      normalizedHref = href.replace(/^https?:\/\/[^/]+/i, '');
    }

    const attrsBefore = `${beforeHref || ''}href="${normalizedHref}"${afterHref || ''}`;
    const withoutTarget = attrsBefore
      .replace(/\s+target=["'][^"']*["']/gi, '')
      .replace(/\s+rel=["'][^"']*["']/gi, '');

    if (isExternal) {
      return `<a ${withoutTarget} target="_blank" rel="noopener noreferrer">`;
    }

    return `<a ${withoutTarget}>`;
  });

  return withNormalizedLinks.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (match, beforeSrc, src, afterSrc) => {
    let normalizedSrc = src.trim();

    if (normalizedSrc.startsWith('//')) {
      normalizedSrc = `https:${normalizedSrc}`;
    }

    if (/^https?:\/\/thenextgenhealth\.com\//i.test(normalizedSrc)) {
      normalizedSrc = normalizedSrc.replace(/^https?:\/\/thenextgenhealth\.com/i, '');
    }

    const attrs = `${beforeSrc || ''}src="${normalizedSrc}"${afterSrc || ''}`;
    const withDefaults = attrs
      .replace(/\s+loading=["'][^"']*["']/gi, '')
      .replace(/\s+decoding=["'][^"']*["']/gi, '')
      .replace(/\s+onerror=["'][^"']*["']/gi, '');

    return `<img ${withDefaults} loading="lazy" decoding="async" onerror="this.onerror=null;this.src='/4.png';" />`;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      select: { title: true, source: true, excerpt: true }
    });
    
    if (!article) {
      return {
        title: 'News | The NextGen Healthcare Marketing',
        description: 'Read our latest news article.',
      };
    }

    return {
      title: article.title,
      description: article.excerpt,
      alternates: {
        canonical: `${SITE_URL}/news/${slug}`,
      }
    };
  } catch (e) {
    return {
      title: 'News | The NextGen Healthcare Marketing',
      description: 'Read our latest news article.',
    };
  }
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
      take: 50
    });
    return articles.map(article => ({ slug: article.slug }));
  } catch (e) {
    return [];
  }
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = (await prisma.newsArticle.findUnique({ where: { slug } })) as any;
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
    image: article.coverImage
      ? (article.coverImage.startsWith('http') ? article.coverImage : `${SITE_URL}${article.coverImage}`)
      : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateCreated: article.sourceDate?.toISOString() || undefined,
    dateModified: article.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: article.publisher || 'The NextGen Healthcare Marketing',
      url: SITE_URL,
    },
    isBasedOn: article.sourceUrl || undefined,
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
    publisher: article.publisher,
    source: article.source,
    sourceUrl: article.sourceUrl,
    sourceDate: article.sourceDate?.toISOString() || null,
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

      <SinglePostLayout
        title={article.title}
        shareTitle={article.title}
        headerTop={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-full">
              Publisher: {article.publisher || 'The NextGen Healthcare Marketing'}
            </span>
            {article.source && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-bold rounded-full">
                Source: {article.source}
              </span>
            )}
          </div>
        }
        headerMeta={
          article.publishedAt ? (
            <time className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 font-medium text-sm">
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          ) : undefined
        }
        coverImage={article.coverImage}
        coverAlt={article.title}
      >
        <div className="space-y-5">
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-l-4 border-blue-500 dark:border-blue-400 pl-5 italic">
              {article.excerpt}
            </p>
          )}

          {(article.source || article.sourceUrl || article.sourceDate) && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <p><span className="font-semibold">Publisher:</span> {article.publisher || 'The NextGen Healthcare Marketing'}</p>
                {article.source && <p><span className="font-semibold">Source:</span> {article.source}</p>}
                {article.sourceDate && (
                  <p>
                    <span className="font-semibold">Source Publish Date:</span>{' '}
                    {new Date(article.sourceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {article.sourceUrl && (
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">
                    View Original Source
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-8 lg:p-10 min-w-0">
            <div
              data-article-content
              className="prose prose-slate prose-lg sm:prose-xl max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-li:text-base sm:prose-li:text-lg prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-code:text-slate-900 dark:prose-code:text-slate-100
                prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:overflow-x-auto
                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600
                prose-img:rounded-xl break-words"
              dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.content) }}
            />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link href="/news" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              ← Back to Healthcare News
            </Link>
          </div>
        </div>
      </SinglePostLayout>

      {serializedMore.length > 0 && (
        <section className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">More Healthcare News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serializedMore.map((news) => (
                <Link key={news.slug} href={`/news/${news.slug}`} className="group">
                  <article className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-slate-800 h-full">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={news.coverImage || '/4.png'}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      {news.source && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600/90 dark:bg-blue-500/90 text-white text-[11px] font-bold rounded-full">
                          {news.source}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                        {news.publishedAt && new Date(news.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
