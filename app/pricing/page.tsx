import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import dynamic from 'next/dynamic';
import PricingCard from '@/components/PricingCard';
import Link from 'next/link';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));
import { Check, BarChart, Clock, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Pricing & Plans | NextGen Health',
  description: 'Transparent pricing for healthcare marketing services. Choose from SEO, Google Ads, social media, and automation packages tailored for clinics.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/pricing',
  },
  openGraph: {
    title: 'Healthcare Marketing Pricing & Plans | NextGen Health',
    description: 'Transparent pricing for healthcare marketing services. Choose from SEO, Google Ads, social media, and automation packages tailored for clinics.',
    url: 'https://thenextgenhealth.com/pricing',
    siteName: 'NextGen Health',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing Pricing & Plans | NextGen Health',
    description: 'Transparent pricing for healthcare marketing services. Choose from SEO, Google Ads, social media, and automation packages tailored for clinics.',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Pricing - The NextGen Healthcare Marketing",
  "description": "Transparent pricing and retainer models for healthcare marketing and automation services.",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Starter Care",
        "price": "5000",
        "priceCurrency": "USD",
        "description": "Perfect for elective procedures and high-research patient journeys."
      },
      {
        "@type": "Offer",
        "name": "Growth Pro",
        "price": "10000",
        "priceCurrency": "USD",
        "description": "High-acuity, rapid-response systems for immediate-need facilities."
      }
    ]
  }
};

const plans = [
  {
    name: "Starter Care",
    price: "$5,000",
    period: "/ Month",
    description: "Perfect for elective procedures and high-research patient journeys.",
    features: [
      "Advanced SEO & Local Search Optimization",
      "Google My Business Management",
      "Targeted Google Ads & Meta Campaigns",
      "AI Chatbot & Call Tracking Setup",
      "Monthly Strategy & Performance Reports",
      "Content Creation & Social Media"
    ],
    variant: 'professional' as const
  },
  {
    name: "Growth Pro",
    price: "$10,000",
    period: "/ Month",
    description: "High-acuity, rapid-response systems for immediate-need facilities.",
    features: [
      "High-Budget Google Ads Management",
      "Advanced AI Call Handling & Triage",
      "Real-Time Insurance Verification Bots",
      "Priority Support & Rapid Response SLA",
      "Multi-Location Campaign Orchestration",
      "24/7 Performance Monitoring",
      "Dedicated Account Manager"
    ],
    variant: 'professional' as const,
    popular: true
  },
  {
    name: "Scale Elite",
    price: "Custom",
    period: "",
    description: "Comprehensive growth engine for large healthcare networks.",
    features: [
      "Custom Software Development",
      "HIPAA-Compliant API Integrations",
      "Multi-State Network Management",
      "Advanced Analytics & BI Dashboards",
      "Custom Automation Workflows",
      "White-Glove Onboarding",
      "Dedicated Development Team",
      "Enterprise SLA & Support"
    ],
    variant: 'premium' as const
  }
];

const faqs = [
  {
    q: "Are there any hidden fees or setup costs?",
    a: "No. We believe in absolute financial clarity. Our retainers cover all professional services, software access, and management fees. The only additional cost is your actual advertising spend (paid directly to Google/Meta) and any third-party API costs if you require highly customized EHR integrations. We explicitly differentiate between what you pay in ad spend versus what the retainer includes."
  },
  {
    q: "Do you require long-term contracts?",
    a: "We operate on a month-to-month basis after an initial 90-day launch sprint. We believe that if our Clinic Growth OS is delivering a 300%+ ROI, you won't want to leave. We do not lock medical practices into restrictive annual contracts. You stay because the system works, not because you are legally obligated to."
  },
  {
    q: "What is the '30-Day Launch Sprint'?",
    a: "The first month of our partnership is highly structured to neutralize the common administrative fear of onboarding delays. During the 30-Day Launch Sprint, we execute a Technical SEO Audit, integrate your CRM/EHR, set up HIPAA-compliant call tracking, build the initial AI chatbot logic, and launch the first wave of Paid Media campaigns. You will see tangible operational changes within the first 30 days."
  },
  {
    q: "Why is the ER & Urgent Care plan more expensive?",
    a: "Marketing a Freestanding ER or Urgent Care requires a significantly more aggressive, high-velocity approach. It involves managing complex, high-budget Google Ads campaigns targeting expensive, high-acuity keywords. It also requires the deployment of our most advanced AI call handling and insurance verification bots to manage the high volume of immediate-need patient inquiries. The operational load and required SLA response times are much higher."
  },
  {
    q: "Can we add custom software development to our retainer?",
    a: "Yes. For our Enterprise clients, or as an add-on to our standard tiers, our in-house development team can build custom, HIPAA-compliant software solutions. This includes bespoke patient portals, custom API bridges between legacy medical software, or specialized triage algorithms."
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <Breadcrumbs />
      
      {/* Hero Section */}
      <Hero
        heading={<>Healthcare Marketing <span className="text-emerald-500">Pricing</span></>}
        subheading="No hidden fees. No complex contracts. Predictable growth systems engineered for healthcare providers. We transition your marketing from a discretionary expense to a critical operational asset."
        primaryCTA={{ label: 'Schedule a Consultation', href: '/contact' }}
        secondaryCTA={{ label: 'View Our Services', href: '/services' }}
        imageAlt="Transparent healthcare marketing pricing and plans"
      />

      {/* Pricing Cards */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                cta="Get started"
                ctaHref="/signup"
                popular={plan.popular}
                variant={plan.variant}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Detailed Feature Comparison</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">See exactly what&apos;s included in each plan so you can choose the right fit for your practice.</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-sm font-bold text-slate-900 border-b border-slate-200">Feature</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center border-b border-slate-200">Starter Care</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center border-b border-slate-200 bg-emerald-50">Growth Pro</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center border-b border-slate-200">Scale Elite</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {[
                    ['SEO & Local Search', true, true, true],
                    ['Google My Business Management', true, true, true],
                    ['Google Ads Management', true, true, true],
                    ['Meta / Facebook Ads', true, true, true],
                    ['Social Media Content', true, true, true],
                    ['Content & Copywriting', true, true, true],
                    ['AI Chatbot Setup', true, true, true],
                    ['Monthly Strategy Reports', true, true, true],
                    ['Advanced AI Call Handling', false, true, true],
                    ['Insurance Verification Bots', false, true, true],
                    ['Multi-Location Campaigns', false, true, true],
                    ['24/7 Performance Monitoring', false, true, true],
                    ['Dedicated Account Manager', false, true, true],
                    ['Priority SLA Response', false, true, true],
                    ['Custom Software Development', false, false, true],
                    ['HIPAA-Compliant API Integrations', false, false, true],
                    ['Multi-State Network Management', false, false, true],
                    ['Advanced BI Dashboards', false, false, true],
                    ['Dedicated Development Team', false, false, true],
                    ['White-Glove Onboarding', false, false, true],
                  ].map(([feature, starter, growth, elite], idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-6 py-3 font-medium border-b border-slate-100">{feature as string}</td>
                      <td className="px-6 py-3 text-center border-b border-slate-100">
                        {starter ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3 text-center border-b border-slate-100 bg-emerald-50/30">
                        {growth ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3 text-center border-b border-slate-100">
                        {elite ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What Your Investment Includes */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Your Investment Includes</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Unlike traditional agencies, our retainers cover a full-stack growth team — not just isolated services.</p>
          </FadeIn>
          <div className="prose prose-lg max-w-none text-slate-700 space-y-5">
            <p>
              When you invest in a NextGen Health retainer, you are integrating an entire department of specialized medical growth experts into your clinic. This includes a dedicated <Link href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Ads Manager</Link>, an <Link href="/services/seo-local-search" className="text-emerald-600 underline hover:text-emerald-700">SEO Strategist</Link>, a <Link href="/services/content-copywriting" className="text-emerald-600 underline hover:text-emerald-700">Medical Content Writer</Link>, a <Link href="/services/social-media-marketing" className="text-emerald-600 underline hover:text-emerald-700">Social Media Manager</Link>, and access to our development and <Link href="/services/analytics-reporting" className="text-emerald-600 underline hover:text-emerald-700">analytics</Link> infrastructure.
            </p>
            <p>
              Every retainer includes our 30-Day Launch Sprint — a structured onboarding process that includes a comprehensive technical audit, CRM/EHR integration, HIPAA-compliant <Link href="/automation/call-tracking" className="text-emerald-600 underline hover:text-emerald-700">call tracking</Link> setup, initial <Link href="/automation/ai-chatbots" className="text-emerald-600 underline hover:text-emerald-700">AI chatbot</Link> deployment, and the first wave of campaign launches. You will see tangible operational improvements within the first 30 days.
            </p>
            <p>
              All <Link href="/hipaa" className="text-emerald-600 underline hover:text-emerald-700">HIPAA compliance</Link> infrastructure is included — we sign BAAs, utilize encrypted servers, and implement secure data routing. There are no hidden fees for compliance. Review our <Link href="/case-studies" className="text-emerald-600 underline hover:text-emerald-700">case studies</Link> to see results from practices similar to yours, or <Link href="/contact" className="text-emerald-600 underline hover:text-emerald-700">schedule a consultation</Link> to discuss your specific needs.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Dive: The Value of Automation */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Quantifying the ROI of Automation</h2>
              <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                <p>
                  When evaluating our retainers, it is critical to look beyond the cost of standard marketing services (SEO, PPC) and factor in the operational savings generated by our AI automation suite.
                </p>
                <p>
                  Consider the cost of front-desk turnover, the revenue lost to missed calls during peak hours, and the administrative hours spent manually verifying insurance and transcribing intake forms. Our Clinic Growth OS eliminates these inefficiencies.
                </p>
                <p>
                  By quantifying this automation ROI—proving that our software saves 15+ staff hours weekly and recovers tens of thousands of dollars in lost revenue from missed appointments—our retainer effectively pays for itself, rendering traditional SEO/PPC agencies fundamentally obsolete.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Clock className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-slate-900 text-lg mb-2">15+ Hours Saved</h3>
                <p className="text-sm text-slate-700">Weekly administrative time saved per staff member via automated intake.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <BarChart className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="font-bold text-slate-900 text-lg mb-2">300% Net ROI</h3>
                <p className="text-sm text-slate-700">Average return generated by our AI scheduling assistants.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Users className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Reduced Turnover</h3>
                <p className="text-sm text-slate-700">Lower front-desk burnout by eliminating repetitive, high-stress tasks.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <ShieldCheck className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Clean Claims</h3>
                <p className="text-sm text-slate-700">Massive improvements in clean claims rates due to digital insurance verification.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold text-slate-900 mb-6">Pricing & Contract FAQ</h2>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              Clear answers regarding our retainers, onboarding, and financial structure.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <FAQ faqs={faqs} />
          </FadeIn>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="p-12 rounded-[3rem] border border-slate-200 bg-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />
            <h3 className="text-2xl font-bold mb-4">Need a Custom Enterprise Solution?</h3>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              We build bespoke automation workflows for large hospital groups, multi-state networks, and specialized surgical centers. Let&apos;s discuss your specific operational requirements and API integration needs.
            </p>
            <button className="rounded-full bg-white text-black px-8 py-4 font-bold hover:bg-zinc-200 transition-colors">
              Contact Enterprise Sales
            </button>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
