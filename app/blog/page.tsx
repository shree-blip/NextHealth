import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogGrid from '@/components/BlogGrid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const revalidate = 300;

export default async function BlogIndex() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' }
  });

  // Serialize dates for the client component
  const serializedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    seoTitle: post.seoTitle,
    metaDesc: post.metaDesc,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return (
    <main className="min-h-screen">
      <Navbar />
      <BlogGrid posts={serializedPosts} />
      <Footer />
    </main>
  );
}
