'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  metaDesc: string | null;
  publishedAt: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const { theme, t, language } = useSitePreferences();
  const dateLocale = language === 'es' ? 'es-US' : 'en-US';
  const isDark = theme === 'dark';

  const featured = posts[0];
  const rest = posts.slice(1);
  const fallbackImages = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png'];

  return (
    <>
      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-white via-emerald-50/30 to-white'}`}>
        <div className="absolute inset-0">
          <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} blur-[120px] rounded-full`} />
          <div className={`absolute bottom-0 right-1/3 w-[400px] h-[400px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} blur-[120px] rounded-full`} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <BookOpen className="h-4 w-4" />
              {t('Healthcare Marketing Insights')}
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('Expert')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">{t('Insights')}</span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Stay ahead with expert strategies, industry trends, and proven tactics to grow your medical practice.')}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { icon: BookOpen, label: t('Articles'), value: `${posts.length}+` },
              { icon: TrendingUp, label: t('Topics'), value: t('Healthcare') },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <item.icon className="h-5 w-5 text-emerald-500" />
                <div className="text-left">
                  <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog Content */}
      <section id="posts" className={`py-20 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl">{t('No blog posts yet. Check back soon!')}</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="mb-16"
                >
                  <Link href={`/blog/${featured.slug}`}>
                    <div className={`group relative rounded-3xl overflow-hidden border transition-all hover:shadow-2xl ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative h-64 lg:h-96 overflow-hidden">
                          <img
                            src={featured.coverImage || fallbackImages[0]}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className={`inline-flex items-center gap-2 text-xs font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            <TrendingUp className="h-3.5 w-3.5" />
                            {t('Featured Post')}
                          </div>
                            <h2 className={`text-xl lg:text-2xl font-extrabold mb-4 group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {featured.seoTitle || featured.title}
                          </h2>
                          <p className={`text-base leading-relaxed mb-6 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {featured.metaDesc || featured.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Clock className="h-4 w-4" />
                              {featured.publishedAt && new Date(featured.publishedAt).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-sm group-hover:gap-2 transition-all">
                              {t('Read More')} <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Post Grid */}
              {rest.length > 0 && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {rest.map((post, idx) => {
                    const image = post.coverImage || fallbackImages[(idx + 1) % fallbackImages.length];
                    return (
                      <motion.article
                        key={post.id}
                        variants={fadeUp}
                        custom={idx}
                        className={`group rounded-3xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                      >
                        <Link href={`/blog/${post.slug}`} className="block">
                          <div className="relative h-52 overflow-hidden">
                            <img
                              src={image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                          <div className="p-6">
                            <div className={`flex items-center gap-2 text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Clock className="h-3.5 w-3.5" />
                              {post.publishedAt && new Date(post.publishedAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <h3 className={`text-lg font-bold mb-3 line-clamp-2 group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {post.seoTitle || post.title}
                            </h3>
                            <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {post.metaDesc || post.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-sm group-hover:gap-2 transition-all">
                              {t('Read More')} <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
