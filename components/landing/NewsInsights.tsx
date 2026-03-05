'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  source: string | null;
  publishedAt: string | null;
}

interface NewsInsightsProps {
  articles: NewsArticle[];
}

export default function NewsInsights({ articles }: NewsInsightsProps) {
  const { t, theme, language } = useSitePreferences();
  const isDark = theme === 'dark';
  const dateLocale = language === 'es' ? 'es-US' : 'en-US';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className={`py-24 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-blue-500 rounded-full" />
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wide">{t('News')}</span>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Healthcare News')}</h2>
          <p className={`text-lg max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Latest news and updates in the healthcare industry.')}
          </p>
        </motion.div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isDark ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden bg-slate-300">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                      <TrendingUp className={`h-8 w-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Source Badge */}
                  {article.source && (
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{article.source}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-lg font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-3 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {article.excerpt}
                    </p>
                  )}

                  {/* Date */}
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                {/* Read More Link - positioned at bottom */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/news/${article.slug}`}
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all"
                  >
                    {t('Read More')}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('No news articles available.')}</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/news"
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
              isDark
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            {t('View All News')}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
