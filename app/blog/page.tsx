export default async function BlogIndex() {
  // Fetch posts at runtime (SSR)
  let posts = [];
  try {
    posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' }
    });
  } catch (e) {
    // If DB is unreachable, show empty list
    posts = [];
  }
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
