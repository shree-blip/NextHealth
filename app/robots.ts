import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/', '/news/'],
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/signup',
          '/profile/',
          '/applet/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/blog/', '/news/'],
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/signup',
          '/profile/',
          '/applet/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
