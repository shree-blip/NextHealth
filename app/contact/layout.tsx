import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact NextGen Health — Healthcare Marketing Expert',
  description:
    'Get in touch with NextGen Health. Book a free consultation to discuss SEO, Google Ads, website design, and marketing automation for your healthcare practice.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/contact',
  },
  openGraph: {
    title: 'Contact NextGen Health — Healthcare Marketing Expert',
    description:
      'Book a free consultation to discuss healthcare marketing — SEO, Google Ads, website design, and automation.',
    url: 'https://thenextgenhealth.com/contact',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact NextGen Health',
    description:
      'Speak to a healthcare marketing expert. Book a free consultation today.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
