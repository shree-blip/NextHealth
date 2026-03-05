import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team | Healthcare Marketing Specialists in Texas',
  description: 'Meet the team behind The NextGen Healthcare Marketing. Our healthcare marketing specialists combine medical industry expertise with proven digital growth strategies for clinics across Texas.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/team',
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
