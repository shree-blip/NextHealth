'use client';

import { useSitePreferences } from '@/components/SitePreferencesProvider';
import Link from 'next/link';

interface MoreNewsItem {
  slug: string;
  title: string;
  coverImage: string | null;
  source: string | null;
  publishedAt: string | null;
  excerpt: string | null;
}

interface NewsArticleContentProps {
  article: {
    title: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    source: string | null;
    publishedAt: string | null;
  };
  moreNews: MoreNewsItem[];
}

export default function NewsArticleContent({ article, moreNews }: NewsArticleContentProps) {
  const { t, language } = useSitePreferences();
  const dateLocale = language === 'es' ? 'es-US' : 'en-US';

  return (
    <>
      {/* Article Content */}
      <article className="mx-auto max-w-5xl py-2 pb-12 px-4 sm:px-6 lg:px-8">
        {!article.coverImage && (
          <header className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-10">
            {article.source && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4">
                {article.source}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 mb-8 text-slate-500 text-sm">
              {article.publishedAt && (
                <time>{new Date(article.publishedAt).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}</time>
              )}
            </div>
          </header>
        )}

        {article.excerpt && (
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mt-8 mb-8 font-medium border-l-4 border-blue-500 pl-6 italic">
            {article.excerpt}
          </p>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-10">
          <div
          data-article-content
          className="prose prose-slate prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:text-slate-700
            prose-li:text-slate-700
            prose-strong:text-slate-900
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Back to News */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <Link href="/news" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            ← {t('Back to Healthcare News')}
          </Link>
        </div>
      </article>

      {/* More News */}
      {moreNews.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-8">{t('More Healthcare News')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {moreNews.map((news) => (
                <Link key={news.slug} href={`/news/${news.slug}`} className="group">
                  <article className="rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 bg-white">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={news.coverImage || '/4.png'}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {news.source && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600/90 text-white text-[11px] font-bold rounded-full">
                          {news.source}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-slate-400 mb-2">
                        {news.publishedAt && new Date(news.publishedAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
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
    </>
  );
}
