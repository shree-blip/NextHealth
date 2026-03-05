import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProvenResultsContent from '@/components/proven-results/ProvenResultsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proven Results | Healthcare Marketing Growth Data',
  description: 'See proven results from The NextGen Healthcare Marketing. Our healthcare clients achieve 100-300% growth in qualified leads, revenue, and patient volume through data-driven strategies.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/proven-results',
  }
};

export default function ProvenResultsPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <ProvenResultsContent />
      <Footer />
    </main>
  );
}
