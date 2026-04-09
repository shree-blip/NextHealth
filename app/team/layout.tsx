import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team — Healthcare Marketing Professionals | NextGen Health',
  description:
    'Meet the NextGen Health team. Experienced healthcare marketing professionals specialising in SEO, PPC, content strategy, and medical practice growth across Texas.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/team',
  },
  openGraph: {
    title: 'Our Team — Healthcare Marketing Professionals | NextGen Health',
    description:
      'Meet the NextGen Health team — experienced healthcare marketing professionals.',
    url: 'https://thenextgenhealth.com/team',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Team | NextGen Health',
    description:
      'Meet the expert healthcare marketing team at NextGen Health.',
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
