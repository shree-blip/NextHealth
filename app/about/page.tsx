import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import MapSection from '@/components/MapSection';
import dynamic from 'next/dynamic';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));
import { ShieldCheck, Target, Zap, CheckCircle2, Building, Users, Lock, Award } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About NexHealth Healthcare Marketing | Healthcare Marketing Experts in TX',
  description: 'Learn about NexHealth Healthcare Marketing, the premier healthcare marketing and automation firm in Irving, TX. We specialize in HIPAA-compliant growth systems for medical practices.',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/about',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "ProfessionalService",
    "name": "NexHealth Healthcare Marketing",
    "description": "Healthcare marketing and automation firm based in Irving, Texas.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  }
};

const faqs = [
  {
    q: "What makes NexHealth Healthcare Marketing different from other marketing firms?",
    a: "Most marketing agencies operate as vendors; they drive clicks and send you a monthly report. We operate as operational integrators. We recognized that driving raw leads to an overwhelmed front desk actually harms a clinic. Therefore, we built the 'Clinic Growth OS'—a system that not only generates high-acuity patient traffic through SEO and Paid Media but also provides the AI automation infrastructure required to intake, schedule, and process those patients without human intervention."
  },
  {
    q: "Are you exclusively focused on the healthcare industry?",
    a: "Yes. We are a 100% healthcare-exclusive firm. The medical sector requires a profound understanding of patient acuity, complex insurance routing, and strict federal compliance (HIPAA). A generalist firm cannot navigate the nuances of marketing a Freestanding ER versus a Wellness Clinic. Our entire team—from copywriters to developers—is trained specifically in medical marketing."
  },
  {
    q: "What is a Business Associate Agreement (BAA) and do you sign them?",
    a: "A Business Associate Agreement (BAA) is a legally binding contract required by HIPAA. It dictates that any third-party vendor (like a healthcare marketing firm) that handles Protected Health Information (PHI) is legally responsible for safeguarding that data. Yes, we sign BAAs with all of our clients. We utilize secure, encrypted servers and compliant software stacks to ensure your clinic is never exposed to regulatory risk."
  },
  {
    q: "Where is your team located?",
    a: "Our headquarters is located at 3001 Skyway Cir N, Irving, TX 75038. We are strategically positioned in the Dallas-Fort Worth metroplex to serve the rapidly expanding healthcare markets across Texas. While we serve clients nationally, our core expertise lies in dominating the highly competitive Texas medical landscape."
  },
  {
    q: "What are your Service Level Agreements (SLAs)?",
    a: "In the medical sector, rapid response is a clinical necessity. If your website goes down or an ad campaign malfunctions, it directly impacts patient care. We provide documented SLAs for all our clients. This includes guaranteed response times (e.g., under 4 hours for critical web updates), 24/7 uptime monitoring for your digital assets, and dedicated account managers available for immediate strategic pivots."
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        heading={<>Mission: Healthcare-Only <br/><span className="text-emerald-500">Growth + Automation</span></>}
        subheading="We are not a standard boutique firm. We are a clinical growth operating system. We bridge the gap between digital patient acquisition and front-desk operational capacity."
        primaryCTA={{ label: 'Our Philosophy', href: '/about' }}
        secondaryCTA={{ label: 'Get in Touch', href: '/contact' }}
        imageAlt="Team collaborating on healthcare marketing"
      />

      {/* Deep Dive: The Agency Philosophy */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl font-bold mb-6">Transcending the Vendor Relationship</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  The genesis of NexHealth Healthcare Marketing was rooted in a singular observation: traditional marketing agencies were actively harming high-volume clinics. By successfully driving thousands of digital inquiries and phone calls to Freestanding ERs and Urgent Cares, these agencies were inadvertently crushing the administrative staff.
                </p>
                <p>
                  Front desks became overwhelmed. Hold times skyrocketed. Patient satisfaction plummeted. The marketing was &quot;working,&quot; but the clinic was failing to process the volume.
                </p>
                <p>
                  We realized that in the modern healthcare landscape, marketing and operations cannot exist in silos. We pivoted our entire model to become operational integrators. We don&apos;t just build Google Ads campaigns; we build the AI chatbots that answer the inquiries generated by those ads. We don&apos;t just do Local SEO; we build the automated digital intake forms that process the patients who find you on Google Maps.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Target className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">100% Healthcare</h3>
                <p className="text-sm text-slate-600">We do not take on e-commerce, real estate, or local service clients. We only scale medical practices.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Lock className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">HIPAA Native</h3>
                <p className="text-sm text-slate-600">Compliance isn&apos;t an afterthought; it is the foundational architecture of every system we build.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Users className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Clinical Empathy</h3>
                <p className="text-sm text-slate-600">Our strategies are designed to reduce staff burnout and improve the actual patient experience.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Award className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Data Verified</h3>
                <p className="text-sm text-slate-600">We operate on strict, transparent ROI reporting. No vanity metrics, only Cost Per Acquisition.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Infrastructure Grid */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">The Infrastructure You Hire</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              When you partner with us, you aren&apos;t getting a single freelancer. You are integrating an entire department of specialized medical growth experts into your clinic.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.1} className="glass p-10 rounded-[2.5rem] border border-slate-200">
              <Target className="h-12 w-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">The Growth Team</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Dedicated specialists focused entirely on driving qualified patient volume to your facility.</p>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" /> Dedicated Ads Manager</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" /> SEO &amp; AEO Strategist</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" /> Medical Content Writer</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" /> Social Media Manager</li>
              </ul>
            </FadeIn>

            <FadeIn delay={0.2} className="glass p-10 rounded-[2.5rem] border border-slate-200">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Compliance Protocol</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                We understand the severe regulatory environment of healthcare. Our infrastructure is built around data security.
              </p>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> BAA Readiness & Execution</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Strict HIPAA Data Routing</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Encrypted Patient Intake</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Secure Cloud Architecture</li>
              </ul>
            </FadeIn>

            <FadeIn delay={0.3} className="glass p-10 rounded-[2.5rem] border border-slate-200">
              <Zap className="h-12 w-12 text-purple-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Service Level Agreements</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                In the medical sector, rapid response is a clinical necessity. We document guaranteed SLA response times.
              </p>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" /> Under 4 Hours for Critical Updates</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" /> 24/7 Uptime Monitoring</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" /> Real-time Dashboard Access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" /> Weekly Performance Syncs</li>
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Analytics Dashboards (Search Console + GMB) */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Analytics & Dashboards</h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Snapshots from Search Console and Google Business Profile demonstrating our tracking and local visibility improvements.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl overflow-hidden shadow-sm">
              <img src="/Search_console_dahbord.png" alt="Search Console dashboard example" className="w-full h-auto block" loading="lazy" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm">
              <img src="/GMB-Dashboard.png" alt="Google My Business dashboard example" className="w-full h-auto block" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">About Us FAQ</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Learn more about our company structure, compliance, and operations.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <FAQ faqs={faqs} />
          </FadeIn>
        </div>
      </section>

      {/* Map highlighting our location */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Find Us</h2>
          <MapSection address="3001 Skyway Cir N, Irving, TX 75038" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
