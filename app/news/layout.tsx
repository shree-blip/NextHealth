import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing News & Industry Updates | NextGen Health',
  description:
    'Stay up to date with the latest healthcare marketing news, industry trends, and digital health updates from NextGen Health.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/news',
  },
  openGraph: {
    title: 'Healthcare Marketing News & Industry Updates | NextGen Health',
    description:
      'Stay up to date with the latest healthcare marketing news, industry trends, and digital health updates.',
    url: 'https://thenextgenhealth.com/news',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing News | NextGen Health',
    description:
      'Latest healthcare marketing news, industry trends, and digital health updates.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
