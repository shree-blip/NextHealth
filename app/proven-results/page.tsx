import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProvenResultsContent from '@/components/proven-results/ProvenResultsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proven Results | Healthcare Marketing | The NextGen Healthcare Marketing',
  description: 'See real results from The NextGen Healthcare Marketing. Our healthcare clients achieve 100-300% growth in leads, revenue, and patient volume.',
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
