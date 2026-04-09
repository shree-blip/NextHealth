import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroNew from '@/components/landing/HeroNew';
import WhoWeServe from '@/components/landing/WhoWeServe';
import ServicesSection from '@/components/landing/ServicesSection';
import NexHealthApproach from '@/components/landing/NexHealthApproach';
import RealResults from '@/components/landing/RealResults';
import prisma from '@/lib/prisma';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Below-fold sections: code-split so they don't inflate the initial JS bundle.
// SSR stays enabled (default) so SEO-relevant text remains in the HTML.
const Testimonials   = dynamic(() => import('@/components/Testimonials'));
const TrustedBy      = dynamic(() => import('@/components/landing/TrustedBy'));
const PricingPlans   = dynamic(() => import('@/components/landing/PricingPlans'));
const BlogInsights   = dynamic(() => import('@/components/landing/BlogInsights'));
const NewsInsights   = dynamic(() => import('@/components/landing/NewsInsights'));
const FAQ            = dynamic(() => import('@/components/FAQ'));
const CtaContactForm = dynamic(() => import('@/components/landing/CtaContactForm'));
const MapSection     = dynamic(() => import('@/components/MapSection'));

// Revalidate homepage every 60 s so new posts appear quickly without a full rebuild
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Healthcare Marketing Agency | NextGen Health',
  description:
    'Full-service healthcare marketing agency in Irving, TX. We help clinics grow with SEO, Google Ads, social media, and HIPAA-compliant automation.',
  alternates: {
    canonical: 'https://thenextgenhealth.com',
  },
  openGraph: {
    title: 'Healthcare Marketing Agency | NextGen Health',
    description:
      'Full-service healthcare marketing agency in Irving, TX. We help clinics grow with SEO, Google Ads, social media, and HIPAA-compliant automation.',
    url: 'https://thenextgenhealth.com',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing Agency | NextGen Health',
    description:
      'Full-service healthcare marketing — SEO, Google Ads, social media, and HIPAA-compliant automation.',
  },
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
  "priceRange": "$$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  }
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
  const homeFaqs = [
    {q:'What types of healthcare practices do you work with?',a:'We specialize in emergency rooms, MedSpas, and urgent care centers. Our strategies are tailored specifically for healthcare providers who want to dominate their local market.'},
    {q:'How quickly will I see results?',a:'Most clients see measurable improvements within 30 days. We guarantee results within 30 days or we optimize your campaigns for free.'},
    {q:'Are your marketing practices HIPAA-compliant?',a:'Absolutely. We follow strict HIPAA-aware marketing practices to ensure patient data privacy and compliance with healthcare advertising regulations.'},
    {q:'Do you require long-term contracts?',a:'No contracts required. We believe in earning your business every month through results, not locking you into agreements.'},
    {q:'What makes The NextGen different from other agencies?',a:'We exclusively serve healthcare practices. Our team understands the unique challenges of medical marketing, from compliance requirements to patient acquisition strategies.'},
  ];

  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(homeFaqSchema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <HeroNew />
      
      {/* Who We Serve */}
      <WhoWeServe />
      
      {/* Our Services */}
      <ServicesSection />
      
      {/* The NextGen Approach */}
      <NexHealthApproach />

      {/* Why Healthcare Marketing Matters */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-6">Why Healthcare Marketing Requires a Specialist Agency</h2>
          <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
            <p>
              Healthcare is not a standard consumer vertical. When a patient searches &ldquo;emergency room near me&rdquo; at 2:00 AM, the intent is fundamentally different from someone browsing for a new pair of shoes. The stakes are higher, the compliance requirements are stricter, and the decision-making process is compressed. A generalist marketing agency—one that serves restaurants, e-commerce brands, and law firms alongside medical practices—simply cannot navigate the nuances of patient acquisition in the medical sector.
            </p>
            <p>
              At NextGen Health, we operate exclusively within the healthcare vertical. Every campaign we build, every landing page we design, and every automation workflow we deploy is purpose-built for the clinical environment. This means our copywriters understand <a href="/hipaa" className="text-emerald-600 underline hover:text-emerald-700">HIPAA advertising regulations</a>, our developers build <a href="/services/website-design-dev" className="text-emerald-600 underline hover:text-emerald-700">HIPAA-compliant websites</a> with encrypted patient intake forms, and our paid media team knows the difference between marketing a Freestanding ER versus a MedSpa.
            </p>
            <p>
              The modern healthcare marketing landscape demands more than just driving clicks. It requires an integrated system that connects digital patient acquisition with front-desk operational capacity. When your <a href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Google Ads campaigns</a> generate 200 calls per day, your front desk needs the AI automation infrastructure to handle that volume without burning out staff or losing patients to hold times. This is where our Clinic Growth OS separates us from every other agency in the market.
            </p>
          </div>
        </div>
      </section>

      {/* Our Methodology */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">The Clinic Growth OS: Our Methodology</h2>
          <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">We don&apos;t just generate leads — we build predictable patient acquisition systems that scale with your practice.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-emerald-500 mb-2">Phase 1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Discovery &amp; Technical Audit</h3>
              <p className="text-slate-600 leading-relaxed">We conduct a comprehensive audit of your existing digital infrastructure — website performance, <a href="/services/seo-local-search" className="text-emerald-600 underline hover:text-emerald-700">SEO health</a>, <a href="/services/google-business-profile" className="text-emerald-600 underline hover:text-emerald-700">Google Business Profile</a> optimization, paid media efficiency, and front-desk call handling capacity. This reveals exactly where patients are being lost in your funnel.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-emerald-500 mb-2">Phase 2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Strategy &amp; Infrastructure Build</h3>
              <p className="text-slate-600 leading-relaxed">We design your custom growth strategy mapping service-specific keywords, competitive positioning, and patient journey touchpoints. Simultaneously, our development team deploys the automation infrastructure — AI chatbots, digital intake forms, call tracking, and <a href="/services/analytics-reporting" className="text-emerald-600 underline hover:text-emerald-700">real-time analytics dashboards</a>.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-emerald-500 mb-2">Phase 3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Launch &amp; Accelerate</h3>
              <p className="text-slate-600 leading-relaxed">Within the first 30 days, we launch SEO optimizations, paid media campaigns across <a href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Google</a> and <a href="/services/meta-ads" className="text-emerald-600 underline hover:text-emerald-700">Meta</a>, <a href="/services/social-media-marketing" className="text-emerald-600 underline hover:text-emerald-700">social media content calendars</a>, and <a href="/services/content-copywriting" className="text-emerald-600 underline hover:text-emerald-700">healthcare content publishing</a>. You will see tangible operational changes in patient inquiry volume and front-desk efficiency from week one.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-emerald-500 mb-2">Phase 4</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Optimize &amp; Scale</h3>
              <p className="text-slate-600 leading-relaxed">Using live data from our <a href="/services/analytics-reporting" className="text-emerald-600 underline hover:text-emerald-700">analytics dashboards</a>, we continuously optimize campaign performance, reduce cost-per-acquisition, and scale what works. Monthly <a href="/services/strategy-planning" className="text-emerald-600 underline hover:text-emerald-700">strategy sessions</a> ensure your growth trajectory stays on track while adapting to seasonal patient demand patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve Overview */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Industries We Serve</h2>
          <p className="text-xl text-slate-600 text-center mb-10 max-w-3xl mx-auto">Specialized marketing for every type of healthcare facility — because an ER and a MedSpa require fundamentally different growth strategies.</p>
          <div className="prose prose-lg max-w-none text-slate-700 space-y-5">
            <p>
              Our team has deep operational experience across the full spectrum of healthcare facilities. We serve <a href="/industries/freestanding-emergency-rooms" className="text-emerald-600 underline hover:text-emerald-700">Freestanding Emergency Rooms</a> that require high-acuity, 24/7 patient acquisition campaigns.
              We help <a href="/industries/urgent-care-centers" className="text-emerald-600 underline hover:text-emerald-700">Urgent Care Centers</a> compete with large health systems for walk-in volume.
              We grow <a href="/industries/medspas-aesthetics" className="text-emerald-600 underline hover:text-emerald-700">MedSpas &amp; Aesthetics Clinics</a> through social media and targeted Meta campaigns.
              We support <a href="/industries/dental-practices" className="text-emerald-600 underline hover:text-emerald-700">Dental Practices</a>, <a href="/industries/chiropractic-clinics" className="text-emerald-600 underline hover:text-emerald-700">Chiropractic Clinics</a>, <a href="/industries/mental-health-practices" className="text-emerald-600 underline hover:text-emerald-700">Mental Health Practices</a>, <a href="/industries/primary-care-clinics" className="text-emerald-600 underline hover:text-emerald-700">Primary Care</a>, and <a href="/industries/pediatric-clinics" className="text-emerald-600 underline hover:text-emerald-700">Pediatric Clinics</a> with locally-optimized growth strategies tailored to their unique patient demographics and service areas.
            </p>
            <p>
              Each vertical has different patient acquisition costs, competitive dynamics, and compliance requirements. Our industry-specific playbooks ensure you are never paying for a generic strategy that was designed for a different type of practice. Whether you need to fill same-day appointment slots or build a 6-month elective procedure pipeline, our Clinic Growth OS adapts to your clinical reality.
            </p>
          </div>
        </div>
      </section>

      {/* Real Results */}
      <RealResults />

      {/* Client Testimonials */}
      <Testimonials />
      
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
          <FAQ faqs={homeFaqs} />
        </div>
      </section>

      {/* Markets & Locations */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Serving Healthcare Providers Across Texas</h2>
          <div className="prose prose-lg max-w-none text-slate-700 space-y-5">
            <p>
              While our headquarters is located in <a href="/locations/irving" className="text-emerald-600 underline hover:text-emerald-700">Irving, TX</a>,
              we serve healthcare providers across the entire state of Texas and beyond. Our local market expertise spans <a href="/locations/dallas" className="text-emerald-600 underline hover:text-emerald-700">Dallas</a>,
              <a href="/locations/houston" className="text-emerald-600 underline hover:text-emerald-700"> Houston</a>,
              <a href="/locations/austin" className="text-emerald-600 underline hover:text-emerald-700"> Austin</a>, and
              <a href="/locations/san-antonio" className="text-emerald-600 underline hover:text-emerald-700"> San Antonio</a> — the four largest healthcare markets in the state. Each metro area has distinct competitive dynamics, insurance landscapes, and patient demographics that directly impact marketing strategy.
            </p>
            <p>
              Our position in the DFW metroplex gives us a strategic advantage: we are embedded in one of the fastest-growing healthcare markets in the United States. The Dallas-Fort Worth area alone has seen a 15% increase in Freestanding ER permits over the past three years, creating fierce competition for patient volume. We help our clients not just compete in this environment — we help them dominate it.
            </p>
            <p>
              Ready to discuss how we can grow your healthcare practice? <a href="/contact" className="text-emerald-600 underline hover:text-emerald-700">Schedule a free consultation</a> or <a href="/book-a-demo" className="text-emerald-600 underline hover:text-emerald-700">book a demo</a> of our Clinic Growth OS. You can also explore our <a href="/case-studies" className="text-emerald-600 underline hover:text-emerald-700">case studies</a> to see the results we&apos;ve achieved for practices like yours, review our <a href="/pricing" className="text-emerald-600 underline hover:text-emerald-700">transparent pricing</a>, or learn more <a href="/about" className="text-emerald-600 underline hover:text-emerald-700">about our agency</a> and the <a href="/team" className="text-emerald-600 underline hover:text-emerald-700">team behind the results</a>.
            </p>
          </div>
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
