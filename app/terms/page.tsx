import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | The NextGen Healthcare Marketing',
  description: 'Review the terms of service for The NextGen Healthcare Marketing. These terms govern your use of our healthcare marketing platform, website, and professional services.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/terms',
  },
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <Hero
        heading="Terms of Service"
        subheading="The legal terms that govern use of our site and services."
        imageAlt="Document icon representing terms of service"
      />

      <section className="pt-12 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="h1 font-bold mb-8 tracking-tight">Terms of Service</h2>
          <div className="prose prose-slate max-w-none prose-emerald">
            <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-6">
              By accessing and using The NextGen Healthcare Marketing website (thenextgenhealth.com) and our services, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">2. Description of Service</h2>
            <p className="text-slate-600 mb-6">
              NexHealth Healthcare Marketing provides <a href="/services" className="text-emerald-600 underline hover:text-emerald-700">healthcare marketing and automation services</a>, including but not limited to <a href="/services/seo-local-search" className="text-emerald-600 underline hover:text-emerald-700">local SEO</a>, paid advertising management, and AI-driven patient intake <a href="/automation" className="text-emerald-600 underline hover:text-emerald-700">automation</a>. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">3. User Conduct</h2>
            <p className="text-slate-600 mb-6">
              You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else&apos;s use and enjoyment of the website. Prohibited behavior includes harassing or causing distress or inconvenience to any person, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our website.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">4. Intellectual Property</h2>
            <p className="text-slate-600 mb-6">
              The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary (including but not limited to intellectual property) rights. The copying, redistribution, use, or publication by you of any such matters or any part of the Site is strictly prohibited.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">5. Limitation of Liability</h2>
            <p className="text-slate-600 mb-6">
              NexHealth Healthcare Marketing shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the services and products offered on this site, or the performance of the services and products.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">6. Governing Law</h2>
            <p className="text-slate-600 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of the State of Texas and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
