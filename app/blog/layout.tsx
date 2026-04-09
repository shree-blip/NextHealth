import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Blog — Tips & Strategies | NextGen Health',
  description:
    'Expert healthcare marketing insights, SEO tips, and digital strategy guides for clinics and medical practices. Read the NextGen Health blog.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/blog',
  },
  openGraph: {
    title: 'Healthcare Marketing Blog — Tips & Strategies | NextGen Health',
    description:
      'Expert healthcare marketing insights, SEO tips, and digital strategy guides for clinics and medical practices.',
    url: 'https://thenextgenhealth.com/blog',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing Blog | NextGen Health',
    description:
      'Expert healthcare marketing insights, SEO tips, and digital strategy guides for clinics and medical practices.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
