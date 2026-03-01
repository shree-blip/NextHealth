import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const revalidate = 300;

export default async function BlogIndex() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero
        heading={<>Healthcare Marketing <span className="text-emerald-500">Insights</span></>}
        subheading="Stay ahead with expert strategies, industry trends, and proven tactics to grow your medical practice."
        primaryCTA={{ label: 'Subscribe to Updates', href: '/contact' }}
        secondaryCTA={{ label: 'View All Posts', href: '#posts' }}
      />
      <div id="posts" className="mx-auto max-w-6xl py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => {
            const fallbackImages = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png'];
            const image = post.coverImage && post.coverImage.startsWith('/') && !post.coverImage.includes('/blog/') ? post.coverImage : fallbackImages[idx % fallbackImages.length];
            return (
              <article key={post.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-emerald-600 font-semibold mb-2">{post.publishedAt?.toDateString()}</p>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="text-xl font-bold text-slate-900 hover:text-emerald-600 transition-colors mb-3 line-clamp-2">
                      {post.seoTitle || post.title}
                    </h2>
                  </Link>
                  <p className="text-slate-600 text-sm line-clamp-3">{post.metaDesc || post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 mt-4 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                    Read More →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
