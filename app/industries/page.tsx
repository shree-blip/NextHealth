import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import WhoWeServe from '@/components/landing/WhoWeServe';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));
import { HeartPulse, Stethoscope, Activity, ShieldPlus, Target, TrendingUp, Users, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Industry Marketing Solutions',
  description: 'Specialized marketing strategies for Freestanding ERs, Urgent Care centers, and Wellness & Longevity clinics across Texas. Dominate local search and acquire high-acuity patients.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/industries',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Healthcare Industry Marketing",
  "provider": {
    "@type": "ProfessionalService",
    "name": "The NextGen Healthcare Marketing",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  },
  "description": "Specialized marketing strategies for Freestanding ERs, Urgent Care centers, and Wellness & Longevity clinics across Texas."
};

const faqs = [
  {
    q: "How does marketing a Freestanding ER differ from an Urgent Care?",
    a: "Freestanding ER marketing requires a hyper-focus on high-acuity, immediate-need search terms (e.g., 'chest pain', 'severe laceration') and absolute dominance in the Google Local Pack. Urgent Care marketing is more volume-driven, focusing on convenience, wait times, and a broader range of minor ailments. We tailor our keyword bidding, ad copy, and landing pages specifically to the acuity level of your facility to ensure you attract the right patient at the right time."
  },
  {
    q: "Can you help our Wellness Clinic attract high-ticket cash-pay patients?",
    a: "Yes. Wellness and Longevity clinics operate differently than acute care facilities. The patient journey is longer and requires more education. We utilize Meta (Facebook/Instagram) ads, long-form educational content, and automated email nurture sequences to build trust and desire for elective, high-ticket services like IV therapy, hormone replacement, and advanced diagnostics."
  },
  {
    q: "Do you work with multi-location healthcare networks?",
    a: "Absolutely. We have extensive experience scaling marketing operations for multi-location networks across Texas. We build programmatic, location-specific landing pages, manage multiple Google Business Profiles centrally, and deploy geofencing strategies to ensure each individual clinic dominates its specific micro-market while maintaining cohesive brand authority."
  },
  {
    q: "How do you handle the competitive landscape in Texas?",
    a: "Texas is one of the most saturated healthcare markets in the country. We defeat the competition through hyper-local specialization. Instead of broad, expensive campaigns, we target specific high-growth suburban corridors (like Celina or Fulshear). We also utilize advanced competitor geofencing—serving ads to patients who are physically near a competitor's facility."
  },
  {
    q: "What metrics do you track for different industries?",
    a: "For ERs and Urgent Cares, we track Cost Per Acquisition (CPA), Local Pack visibility, and door swings. For Wellness clinics, we track Lead-to-Consultation conversion rates, Lifetime Value (LTV), and Return on Ad Spend (ROAS). Our dashboards provide transparent, industry-specific KPIs so you always know your exact ROI."
  }
];

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        heading={<>Acuity-Driven <span className="text-purple-500">Marketing</span></>}
        subheading="We don't use generic templates. We engineer bespoke acquisition systems tailored to the specific patient journey of Freestanding ERs, Urgent Cares, and Wellness Clinics."
        primaryCTA={{ label: 'Explore Industries', href: '/industries' }}
        secondaryCTA={{ label: 'Contact Us', href: '/contact' }}
        imageAlt="Graphic representing various healthcare industries"
      />

      <WhoWeServe />

      {/* Deep Dive: Freestanding ERs */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="glass p-4 rounded-2xl inline-block mb-6 border border-slate-200 bg-red-500/10">
                <Activity className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Freestanding ERs (FSEDs)</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  Marketing a Freestanding Emergency Room requires absolute precision. Patients searching for an ER are in a state of high distress; they are not comparison shopping. They need immediate, authoritative direction to the nearest capable facility.
                </p>
                <p>
                  Our strategy for FSEDs focuses heavily on zero-click search dominance. We optimize your Google Business Profile to ensure you appear in the top 3 map results for high-acuity keywords (e.g., &quot;chest pain&quot;, &quot;broken bone&quot;, &quot;24 hour ER&quot;). We deploy aggressive Google Ads campaigns with location extensions and call-only ads to capture immediate-need traffic.
                </p>
                <p>
                  Furthermore, we implement advanced geofencing around local urgent cares and community centers. If a patient is at an urgent care but requires higher acuity treatment, our targeted ads ensure your FSED is their immediate next stop.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="relative aspect-square rounded-3xl overflow-hidden glass border border-slate-200 p-8">
               <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
               <div className="relative h-full flex flex-col justify-center gap-6">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <MapPin className="h-8 w-8 text-red-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Zero-Click Maps</div>
                      <div className="text-sm text-slate-600">Dominating the Local Pack for immediate visibility.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <Target className="h-8 w-8 text-red-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">High-Acuity Keywords</div>
                      <div className="text-sm text-slate-600">Bidding on trauma and severe symptom searches.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <ShieldPlus className="h-8 w-8 text-red-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Competitor Geofencing</div>
                      <div className="text-sm text-slate-600">Capturing overflow from saturated urgent cares.</div>
                    </div>
                  </div>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Deep Dive: Urgent Care */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right" className="order-2 lg:order-1 relative aspect-square rounded-3xl overflow-hidden glass border border-slate-200 p-8">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
               <div className="relative h-full flex flex-col justify-center gap-6">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <TrendingUp className="h-8 w-8 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Volume Optimization</div>
                      <div className="text-sm text-slate-600">Scaling patient acquisition efficiently.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <Users className="h-8 w-8 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Reputation Management</div>
                      <div className="text-sm text-slate-600">Automated review generation to build trust.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <Activity className="h-8 w-8 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Wait-Time Marketing</div>
                      <div className="text-sm text-slate-600">Promoting transparency to win convenience-driven patients.</div>
                    </div>
                  </div>
               </div>
            </FadeIn>
            <FadeIn direction="left" className="order-1 lg:order-2">
              <div className="glass p-4 rounded-2xl inline-block mb-6 border border-slate-200 bg-blue-500/10">
                <Stethoscope className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Urgent Care &amp; Walk-in Clinics</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  The Urgent Care market is defined by convenience and volume. Patients are looking for the fastest, most reliable care for non-life-threatening issues. Your marketing must communicate speed, competence, and accessibility.
                </p>
                <p>
                  We build robust Local SEO campaigns that highlight your operating hours, wait times, and accepted insurances directly in the search results. Our Paid Media strategies target broad symptom keywords (e.g., &quot;flu test&quot;, &quot;sprained ankle&quot;, &quot;pediatric urgent care&quot;) while strictly controlling Cost Per Click (CPC) to ensure profitability on lower-acuity visits.
                </p>
                <p>
                  Crucially, we implement aggressive Reputation Management. In the Urgent Care space, a 4.8-star rating versus a 3.5-star rating is often the sole deciding factor for a patient. Our automated systems ensure a steady stream of positive reviews from satisfied patients.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Deep Dive: Wellness & Longevity */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="glass p-4 rounded-2xl inline-block mb-6 border border-slate-200 bg-emerald-500/10">
                <HeartPulse className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Wellness & Longevity Clinics</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  Unlike acute care, Wellness and Longevity services (IV therapy, HRT, medical weight loss) are elective. The patient journey is not driven by immediate distress, but by desire, education, and trust.
                </p>
                <p>
                  Our strategy for Wellness clinics shifts from immediate-capture to long-term nurture. We utilize visually compelling Meta (Facebook/Instagram) advertising to generate awareness and capture leads. We then deploy automated, multi-touch email and SMS nurture sequences that educate the prospect on the clinical benefits of your services.
                </p>
                <p>
                  We focus heavily on Answer Engine Optimization (AEO) and long-form content. By publishing authoritative, E-E-A-T compliant articles on complex topics like peptide therapy or bioidentical hormones, we position your clinic as the premier thought leader in your Texas market, justifying premium, cash-pay pricing.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="relative aspect-square rounded-3xl overflow-hidden glass border border-slate-200 p-8">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
               <div className="relative h-full flex flex-col justify-center gap-6">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <Target className="h-8 w-8 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Lead Generation</div>
                      <div className="text-sm text-slate-600">Capturing high-intent prospects via social media.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <Activity className="h-8 w-8 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Automated Nurture</div>
                      <div className="text-sm text-slate-600">Building trust through educational email sequences.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-100 border border-slate-200">
                    <TrendingUp className="h-8 w-8 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">LTV Maximization</div>
                      <div className="text-sm text-slate-600">Focusing on recurring revenue and patient retention.</div>
                    </div>
                  </div>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Industry FAQ</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Specific insights into our industry-tailored marketing approaches.
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
