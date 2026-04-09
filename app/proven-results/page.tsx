import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProvenResultsContent from '@/components/proven-results/ProvenResultsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proven Results — Healthcare Marketing | NextGen Health',
  description: 'Verified results from NextGen Health clients. See real data on traffic growth, lead generation, and ROI from our healthcare marketing campaigns.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/proven-results',
  },
  openGraph: {
    title: 'Proven Results — Healthcare Marketing | NextGen Health',
    description: 'Verified results from NextGen Health clients. See real data on traffic growth, lead generation, and ROI from our healthcare marketing campaigns.',
    url: 'https://thenextgenhealth.com/proven-results',
    siteName: 'NextGen Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proven Results — Healthcare Marketing | NextGen Health',
    description: 'Verified results from NextGen Health clients. See real data on traffic growth, lead generation, and ROI from our healthcare marketing campaigns.',
  },
};

export default function ProvenResultsPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <Breadcrumbs />
      <ProvenResultsContent />
      <Footer />
    </main>
  );
}
