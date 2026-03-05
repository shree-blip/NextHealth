import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

// Never cache the sitemap at the CDN level — revalidatePath('/sitemap.xml') will
// flush it whenever a post is published or unpublished.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/services/seo-local-search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/google-ads`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/meta-ads`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/website-design-dev`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/social-media-marketing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/content-copywriting`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/email-drip-campaigns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/google-business-profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/brand-identity-design`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/brochure-print-design`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/analytics-reporting`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/strategy-planning`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/proven-results`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/industries`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/automation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/hipaa`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamically add published blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    
    blogPosts = posts.map((post, index) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: index < 10 ? 0.8 : 0.7,
    }));
  } catch (error) {
    console.error('Sitemap blog posts fetch error:', error);
  }

  // Dynamically add published news articles
  let newsArticles: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    
    newsArticles = articles.map((article: any, index: number) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: index < 10 ? 0.8 : 0.7,
    }));
  } catch (error) {
    console.error('Sitemap news articles fetch error:', error);
  }

  return [...staticPages, ...blogPosts, ...newsArticles];
}
