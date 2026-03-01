'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Newspaper, Clock, ArrowRight, TrendingUp, Zap, ExternalLink } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  source: string | null;
  publishedAt: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function NewsPage() {
  const { theme, t, language } = useSitePreferences();
  const isDark = theme === 'dark';
  const dateLocale = language === 'es' ? 'es-US' : 'en-US';
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setArticles(data.filter((a: NewsArticle) => a.publishedAt));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
        <div className="absolute inset-0">
          <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} blur-[120px] rounded-full`} />
          <div className={`absolute bottom-0 left-1/3 w-[400px] h-[400px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} blur-[120px] rounded-full`} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              <Newspaper className="h-4 w-4" />
              {t('Healthcare News')}
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('Industry')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">{t('News & Updates')}</span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Stay informed with the latest healthcare industry news, regulatory changes, and technology breakthroughs that impact your practice.')}
            </p>
          </motion.div>

          {/* Animated stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { icon: TrendingUp, label: t('Latest Trends'), value: t('Real-Time') },
              { icon: Zap, label: t('Updates'), value: t('Weekly') },
              { icon: Newspaper, label: t('Sources'), value: t('Verified') },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <item.icon className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : articles.length === 0 ? (
            <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl">{t('No news articles yet. Check back soon!')}</p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="mb-16"
                >
                  <Link href={`/news/${featured.slug}`}>
                    <div className={`group relative rounded-3xl overflow-hidden border transition-all hover:shadow-2xl ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative h-64 lg:h-96 overflow-hidden">
                          <img
                            src={featured.coverImage || '/1.png'}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                          {featured.source && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                                {featured.source}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className={`inline-flex items-center gap-2 text-xs font-semibold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Zap className="h-3.5 w-3.5" />
                            {t('Featured Article')}
                          </div>
                          <h2 className={`text-xl lg:text-2xl font-extrabold mb-4 group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {featured.title}
                          </h2>
                          <p className={`text-base leading-relaxed mb-6 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {featured.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Clock className="h-4 w-4" />
                              {featured.publishedAt && new Date(featured.publishedAt).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <span className="inline-flex items-center gap-1 text-blue-500 font-semibold text-sm group-hover:gap-2 transition-all">
                              {t('Read More')} <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* News Grid */}
              {rest.length > 0 && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {rest.map((article, idx) => {
                    const fallbackImages = ['/2.png', '/3.png', '/4.png', '/5.png'];
                    const image = article.coverImage || fallbackImages[idx % fallbackImages.length];
                    return (
                      <motion.article
                        key={article.id}
                        variants={fadeUp}
                        custom={idx}
                        className={`group rounded-3xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                      >
                        <Link href={`/news/${article.slug}`} className="block">
                          <div className="relative h-52 overflow-hidden">
                            <img
                              src={image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            {article.source && (
                              <div className="absolute top-3 left-3">
                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full backdrop-blur-sm ${isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-600/90 text-white'}`}>
                                  {article.source}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className={`flex items-center gap-2 text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Clock className="h-3.5 w-3.5" />
                              {article.publishedAt && new Date(article.publishedAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <h3 className={`text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {article.title}
                            </h3>
                            <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {article.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-1 text-blue-500 font-semibold text-sm group-hover:gap-2 transition-all">
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

      {/* CTA Section */}
      <section className={`py-16 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('Want personalized healthcare marketing insights?')}
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Subscribe to our newsletter and get industry updates delivered to your inbox.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/blog"
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${isDark ? 'bg-white/5 text-white border border-white/10 hover:border-blue-500/30' : 'bg-slate-100 text-slate-800 border border-slate-200 hover:border-blue-300'}`}
              >
                <ExternalLink className="h-4 w-4" />
                {t('Read Our Blog')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                {t('Contact Us')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
