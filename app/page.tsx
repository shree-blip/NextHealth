import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroNew from '@/components/landing/HeroNew';
import WhoWeServe from '@/components/landing/WhoWeServe';
import ServicesSection from '@/components/landing/ServicesSection';
import NexHealthApproach from '@/components/landing/NexHealthApproach';
import RealResults from '@/components/landing/RealResults';
import TrustedBy from '@/components/landing/TrustedBy';
import PricingPlans from '@/components/landing/PricingPlans';
import CtaContactForm from '@/components/landing/CtaContactForm';
import BlogInsights from '@/components/landing/BlogInsights';
import NewsInsights from '@/components/landing/NewsInsights';
import FAQ from '@/components/FAQ';
import MapSection from '@/components/MapSection';
import prisma from '@/lib/prisma';

import { Metadata } from 'next';

// Revalidate homepage every 60 s so new posts appear quickly without a full rebuild
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Healthcare Marketing Agency in Irving, TX | The NextGen Healthcare Marketing',
  description: 'The NextGen Healthcare Marketing is a top-rated healthcare marketing agency in Irving, TX specializing in local SEO, Google Ads, AI automation, and custom software for ERs, urgent cares, and clinics.',
  alternates: {
    canonical: 'https://thenextgenhealth.com',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "The NextGen Healthcare Marketing",
  "image": "https://thenextgenhealth.com/logo.png",
  "description": "Integrated Clinical Growth and Automation OS for Healthcare Providers in Texas. We engineer predictable patient acquisition systems.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3001 Skyway Circle N",
    "addressLocality": "Irving",
    "addressRegion": "TX",
    "postalCode": "75038",
    "addressCountry": "US"
  },
  "telephone": "972-848-1153",
  "url": "https://thenextgenhealth.com",
  "areaServed": ["Dallas", "Houston", "Austin", "San Antonio", "Irving", "Texas"],
  "priceRange": "$$$"
};



export default async function Home() {
  // Fetch the 3 latest published blog posts and news articles at SSR time.
  // This means the homepage always shows live DB data and re-renders whenever
  // revalidatePath('/') is called (e.g. after AI generation or publish toggle).
  let latestPosts: { title: string; slug: string; excerpt: string | null; coverImage: string | null; publishedAt: Date | null }[] = [];
  let latestNews: { id: number; title: string; slug: string; excerpt: string | null; coverImage: string | null; source: string | null; publishedAt: Date | null }[] = [];

  try {
    [latestPosts, latestNews] = await Promise.all([
      prisma.post.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
      }),
      (prisma.newsArticle as any).findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, source: true, publishedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable — sections will fall back to their empty-state UI
  }

  // Serialize dates so they're safe to pass as props to client components
  const serializedPosts = latestPosts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
  }));
  const serializedNews = latestNews.map((a: any) => ({
    ...a,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
  }));
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <HeroNew />
      
      {/* Who We Serve */}
      <WhoWeServe />
      
      {/* Our Services */}
      <ServicesSection />
      
      {/* The NextGen Approach */}
      <NexHealthApproach />
      
      {/* Real Results */}
      <RealResults />
      
      {/* Trusted by Healthcare Leaders */}
      <TrustedBy />
      
      {/* Pricing Plans */}
      <PricingPlans />
      
      {/* Blog Insights */}
      <BlogInsights posts={serializedPosts} />
      
      {/* News Insights */}
      <NewsInsights articles={serializedNews} />
      
      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-600 text-center mb-12">Everything you need to know about working with us.</p>
          <FAQ faqs={[
            {q:'What types of healthcare practices do you work with?',a:'We specialize in emergency rooms, MedSpas, and urgent care centers. Our strategies are tailored specifically for healthcare providers who want to dominate their local market.'},
            {q:'How quickly will I see results?',a:'Most clients see measurable improvements within 30 days. We guarantee results within 30 days or we optimize your campaigns for free.'},
            {q:'Are your marketing practices HIPAA-compliant?',a:'Absolutely. We follow strict HIPAA-aware marketing practices to ensure patient data privacy and compliance with healthcare advertising regulations.'},
            {q:'Do you require long-term contracts?',a:'No contracts required. We believe in earning your business every month through results, not locking you into agreements.'},
            {q:'What makes The NextGen different from other agencies?',a:'We exclusively serve healthcare practices. Our team understands the unique challenges of medical marketing, from compliance requirements to patient acquisition strategies.'},
          ]} />
        </div>
      </section>
      
      {/* Location Map */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Visit Us</h2>
          <p className="text-xl text-slate-600 text-center mb-12">Our headquarters in Irving, TX</p>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <MapSection address="3001 Skyway Circle N, Irving, TX 75038" />
          </div>
        </div>
      </section>
      
      {/* CTA & Contact Form */}
      <CtaContactForm />
      
      <Footer />
    </main>
  );
}
