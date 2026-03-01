import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import FAQ from '@/components/FAQ';
import Services from '@/components/Services';
import { Search, Megaphone, ShieldCheck, Globe, MessageSquare, Activity, MapPin, Target, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical SEO & Healthcare Marketing Services | NextGen Marketing Agency',
  description: 'Comprehensive healthcare marketing services including Local SEO, Google Ads, Reputation Management, and HIPAA-compliant web design for Texas clinics.',
  alternates: {
    canonical: 'https://nextgenmarketing.agency/services',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Healthcare Marketing and SEO",
  "provider": {
    "@type": "ProfessionalService",
    "name": "NextGen Marketing Agency",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  },
  "areaServed": ["Dallas", "Houston", "Austin", "San Antonio", "Irving", "Texas"],
  "description": "Comprehensive healthcare marketing services including Local SEO, Google Ads, Reputation Management, and HIPAA-compliant web design for Texas clinics."
};

const faqs = [
  {
    q: "How long does it take to see results from Local SEO?",
    a: "Local SEO is a foundational strategy. While initial optimizations to your Google Business Profile and technical on-page SEO can yield improvements within 30-60 days, establishing true dominance in competitive Texas markets like Dallas or Houston typically requires 3-6 months of sustained effort. This involves building authoritative local citations, generating consistent patient reviews, and publishing high-quality, E-E-A-T compliant medical content."
  },
  {
    q: "What makes your Paid Media strategies different from a general agency?",
    a: "General marketing agencies bid on broad keywords that drain your budget. As a specialized healthcare agency, we utilize hyper-targeted, high-acuity keyword strategies. For an ER, we bid on 'chest pain near me' rather than 'doctor'. We also deploy advanced geofencing around competitor clinics and utilize HIPAA-compliant tracking to measure actual patient acquisition cost (CAC), not just clicks."
  },
  {
    q: "Why is HIPAA compliance necessary for a clinic's website?",
    a: "If your website collects any patient information—even a simple contact form or appointment request—it must be HIPAA compliant. Non-compliance can result in severe federal fines. We build our websites on secure, encrypted architectures, utilize compliant form builders, and sign Business Associate Agreements (BAAs) to ensure your digital front door is legally protected."
  },
  {
    q: "How do you handle negative patient reviews?",
    a: "Our Reputation Management system intercepts negative feedback before it reaches public platforms. We deploy automated SMS and email surveys post-visit. If a patient indicates a negative experience, the system routes their feedback internally to your clinic manager for immediate resolution. Positive experiences are automatically directed to Google, Yelp, or Healthgrades to boost your local SEO rankings."
  },
  {
    q: "Do you offer Answer Engine Optimization (AEO)?",
    a: "Yes. With the rise of AI search tools like ChatGPT and Google's AI Overviews, traditional SEO is evolving. We structure your website's content using advanced Schema markup (JSON-LD) and natural language processing techniques so that AI engines recognize your clinic as the definitive answer to local medical queries."
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      


      {/* Hero Section */}
      <Hero
        heading={<>Clinical Growth <span className="text-emerald-500">Engineered</span></>}
        subheading={
          "We don't just run ads. We deploy a comprehensive, HIPAA-compliant marketing ecosystem designed to dominate local search, acquire high-acuity patients, and automate your front desk."
        }
        primaryCTA={{ label: 'Get Your Growth Plan', href: '/contact' }}
        secondaryCTA={{ label: 'View Case Studies', href: '/case-studies' }}
        imageAlt="Illustration of digital marketing services"
      />

      {/* Services Section with Images */}
      <Services compact={false} />

      {/* Deep Dive: Local SEO & AEO */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6">
                <MapPin className="h-4 w-4" /> Local SEO Dominance
              </div>
              <h2 className="text-3xl font-bold mb-6">Winning the &quot;Near Me&quot; Battle in Texas</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  For Urgent Cares and Freestanding ERs, proximity is the primary driver of patient acquisition. When a medical need arises, patients turn to Google Maps. If your clinic isn&apos;t in the top 3 results (the Local Pack), you are losing patients to competitors who are physically further away but digitally more prominent.
                </p>
                <p>
                  Our Local SEO strategy goes far beyond basic keyword insertion. We conduct a comprehensive audit of your digital footprint, ensuring absolute NAP (Name, Address, Phone) consistency across hundreds of healthcare directories. We optimize your Google Business Profile with high-resolution imagery, weekly posts, and strategic Q&amp;A seeding.
                </p>
                <p>
                  Furthermore, we are pioneers in Answer Engine Optimization (AEO). As patients increasingly use voice search and AI assistants, we structure your content using advanced Schema markup (JSON-LD) so that your clinic is the definitive, authoritative answer provided by these emerging technologies.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Search className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Google Business Profile</h3>
                <p className="text-sm text-slate-600">Complete optimization and weekly management of your GBP to secure Local Pack rankings.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Globe className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Citation Building</h3>
                <p className="text-sm text-slate-600">Establishing authoritative backlinks and consistent NAP data across healthcare directories.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Target className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Hyper-Local Content</h3>
                <p className="text-sm text-slate-600">Creating programmatic landing pages for surrounding Texas municipalities and suburbs.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Activity className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">AEO & Schema</h3>
                <p className="text-sm text-slate-600">Structuring data for AI Overviews and voice search dominance in the medical sector.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Deep Dive: Paid Media & Acquisition */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right" className="order-2 lg:order-1 relative aspect-square rounded-3xl overflow-hidden glass border border-slate-200 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
              <div className="relative h-full flex flex-col justify-center gap-6">
                <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Google Ads (PPC)</span>
                    <span className="text-emerald-500 font-bold">High Intent</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[90%]"></div>
                  </div>
                  <p className="text-sm text-slate-600">Capturing immediate-need searches like &quot;ER near me&quot;.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Meta Ads (Social)</span>
                    <span className="text-blue-500 font-bold">Brand Awareness</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[75%]"></div>
                  </div>
                  <p className="text-sm text-slate-600">Building community trust and promoting elective wellness services.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Geofencing</span>
                    <span className="text-purple-500 font-bold">Hyper-Targeted</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-purple-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                  <p className="text-sm text-slate-600">Targeting competitor locations and high-traffic community centers.</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-6">
                <Megaphone className="h-4 w-4" /> Paid Media Strategies
              </div>
              <h2 className="text-3xl font-bold mb-6">Precision Patient Acquisition</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  In the highly competitive Texas healthcare market, relying solely on organic traffic is a slow path to growth. Our Paid Media strategies are engineered for immediate impact and measurable ROI. We manage millions in ad spend specifically for medical facilities, giving us unparalleled data on what converts.
                </p>
                <p>
                  We don&apos;t bid on vanity metrics. We focus entirely on Cost Per Acquisition (CPA). For an Urgent Care clinic, we deploy high-intent Google Search campaigns targeting specific symptoms and immediate needs. For a Wellness clinic offering IV therapy or hormone replacement, we utilize visually engaging Meta (Facebook/Instagram) campaigns to build desire and educate the local community.
                </p>
                <p>
                  Every campaign is routed through highly optimized, HIPAA-compliant landing pages designed strictly for conversion. We utilize dynamic keyword insertion, clear calls-to-action, and integrated scheduling widgets to turn clicks into booked appointments instantly.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Custom Software & Automation (Vibe Coding) */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden glass border border-slate-200 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent" />
              <div className="relative h-full flex flex-col justify-center gap-6">
                <h2 className="text-3xl font-bold mb-4">Custom Software & Vibe Coding</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  We build tailored, HIPAA‑compliant software using our "vibe" coding approach — fast, maintainable, and designed around user workflows. From intake systems to full EHR integrations, our engineering team ships secure solutions that scale with your clinic.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-2">Custom Patient Portals</h3>
                    <p className="text-sm text-slate-600">Secure portals for intake, records, and telehealth.</p>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold mb-2">Integrations & APIs</h3>
                    <p className="text-sm text-slate-600">EHR, billing, and analytics integrations via secure APIs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative h-80 bg-gray-100 rounded-2xl overflow-hidden">
                <img src="/16.png" alt="custom software mock" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automation & AI (Clinical Workflows) */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-1">
              <h2 className="text-3xl font-bold mb-4">Automation & AI for Clinical Workflows</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Deploy HIPAA‑compliant automation and AI agents to streamline intake, triage and scheduling. Our systems reduce missed calls, automate verification, and hand off complex cases to clinicians.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold mb-2">AI Intake Automation</h3>
                  <p className="text-sm text-slate-600">Secure, conversational intake that verifies insurance and obtains consent.</p>
                </div>
                <div className="glass p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold mb-2">Automated Scheduling</h3>
                  <p className="text-sm text-slate-600">Real-time availability and reminders to reduce no-shows.</p>
                </div>
              </div>
            </div>
            <div className="order-2">
              <div className="relative h-72 bg-gray-100 rounded-2xl overflow-hidden">
                <img src="/Search_console_dahbord.png" alt="automation mock" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive: Reputation & Web Design */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Trust & Infrastructure</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Your digital presence must convey the same level of clinical excellence and security as your physical facility.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={0.1} className="glass p-10 rounded-3xl border border-slate-200">
              <MessageSquare className="h-12 w-12 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Reputation Management</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  In healthcare, your online reputation is your most valuable asset. A single 1-star review can cost a clinic thousands in lost revenue. We deploy automated, HIPAA-compliant review generation systems that integrate with your EHR.
                </p>
                <p>
                  Post-visit, patients receive an automated SMS or email. Positive experiences are seamlessly routed to Google or Yelp, rapidly building your local authority. Negative feedback is intercepted internally, allowing your clinic manager to resolve the issue privately before it damages your public profile.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} className="glass p-10 rounded-3xl border border-slate-200">
              <ShieldCheck className="h-12 w-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold Mb-4">HIPAA-Compliant Web Design</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  A beautiful website is useless if it exposes your clinic to federal fines. We build high-performance, conversion-optimized websites on secure architectures. Every form, booking widget, and data transfer protocol is rigorously tested for HIPAA compliance.
                </p>
                <p>
                  Beyond security, our websites are engineered for speed. A 1-second delay in page load time can reduce conversions by 7%. We utilize Next.js and edge computing to ensure your site loads instantly, providing a frictionless experience for patients in distress.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <img src="/shree-gauli.png" alt="Shree Gauli" className="mx-auto h-32 w-32 rounded-full object-cover" />
              <div className="mt-4 font-bold">Shree Gauli</div>
              <div className="text-sm text-slate-600">Chief Marketing Officer</div>
            </div>
            <div className="text-center">
              <img src="/sumit-sharma.png" alt="Sumit Sharma" className="mx-auto h-32 w-32 rounded-full object-cover" />
              <div className="mt-4 font-bold">Sumit Sharma</div>
              <div className="text-sm text-slate-600">Head of Engineering</div>
            </div>
            <div className="text-center">
              <img src="/bidhitsha-khadka.png" alt="Biditsha Khadka" className="mx-auto h-32 w-32 rounded-full object-cover" />
              <div className="mt-4 font-bold">Biditsha Khadka</div>
              <div className="text-sm text-slate-600">Design Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* We’ve never quit Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="h2 mb-6">We’ve never quit</h2>
          <h3 className="h3 mb-4">One of the first AI healthcare startups, founded 2018 & still here.</h3>
          <h4 className="h4 max-w-3xl mx-auto">
            We’ve weathered the hype cycles and regulatory shifts to keep building tools that actually move the needle for clinics.
          </h4>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Services FAQ</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Detailed answers regarding our healthcare marketing methodologies.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <FAQ faqs={faqs} />
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
