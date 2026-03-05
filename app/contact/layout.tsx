import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | The NextGen Healthcare Marketing',
  description: 'Get in touch with The NextGen Healthcare Marketing in Irving, TX. Schedule a free consultation to discuss SEO, Google Ads, automation, and growth strategies for your healthcare practice.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
