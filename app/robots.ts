import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

export default function robots(): MetadataRoute.Robots {
  const commonDisallow = [
    '/dashboard/',
    '/api/',
    '/login',
    '/signup',
    '/profile/',
    '/applet/',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: commonDisallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
