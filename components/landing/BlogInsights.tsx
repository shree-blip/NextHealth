'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowUpRight, BookOpen } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

interface BlogInsightsProps {
  posts: BlogPost[];
}

export default function BlogInsights({ posts }: BlogInsightsProps) {
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
    <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-emerald-500 rounded-full" />
            <span className="text-emerald-600 text-sm font-bold uppercase tracking-wide">{t('Blog')}</span>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Healthcare Insights')}</h2>
          <p className={`text-lg max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('Stay updated with industry trends, marketing strategies, and healthcare innovations.')}
          </p>
        </motion.div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p, idx) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden bg-slate-200">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <BookOpen className={`h-10 w-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className={`text-lg font-bold leading-snug mb-3 group-hover:text-emerald-600 transition-colors line-clamp-3 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {p.title}
                  </h3>

                  {/* Excerpt */}
                  {p.excerpt && (
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {p.excerpt}
                    </p>
                  )}

                  {/* Date */}
                  <div className={`flex items-center gap-2 mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Calendar className="h-4 w-4" />
                    {formatDate(p.publishedAt)}
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${p.slug}`}
                    className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all"
                  >
                    {t('Read More')}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('No blog posts available yet.')}</p>
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
            href="/blog"
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
              isDark
                ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {t('View All Insights')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
