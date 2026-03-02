'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const posts = [
  { title: 'HIPAA-Compliant Automation: Transforming Healthcare Workflows', date: 'Feb 15, 2026', category: 'Automation', image: '/1.png', slug: 'hipaa-compliant-automation-transforming-healthcare-workflows' },
  { title: 'Custom Software for Healthcare: Why Vibe Coding Delivers Better Results', date: 'Feb 20, 2026', category: 'Software', image: '/2.png', slug: 'custom-software-healthcare-vibe-coding' },
  { title: 'AI-Powered Patient Acquisition: The Future of Healthcare Marketing', date: 'Feb 28, 2026', category: 'AI', image: '/3.png', slug: 'ai-powered-patient-acquisition-future-healthcare-marketing' },
];

export default function BlogInsights() {
  const { t } = useSitePreferences();

  const localizedPosts = posts.map((post) => ({
    ...post,
    title: t(post.title),
    category: t(post.category),
  }));

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">{t('Insights')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {localizedPosts.map((p, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-lg shadow overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                decoding="async"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-emerald-500 uppercase">{p.category}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{p.date}</p>
                <Link href={`/blog/${p.slug}`} className="mt-3 inline-block text-emerald-600 hover:underline text-sm">{t('Read More →')}</Link>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <a href="/blog" className="text-emerald-500 hover:underline">{t('View All Insights')}</a>
        </div>
      </div>
    </section>
  );
}
