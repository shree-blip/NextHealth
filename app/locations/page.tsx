import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));
import { MapPin, ArrowRight, Building2, TrendingUp, Navigation, Target } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Texas Healthcare Marketing Locations | NexHealth Healthcare Marketing',
  description: 'We provide hyper-local SEO and patient acquisition strategies for medical clinics across Texas, including Dallas, Houston, Austin, and high-growth suburbs.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/locations',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Local Healthcare SEO & Marketing",
  "provider": {
    "@type": "ProfessionalService",
    "name": "NexHealth Healthcare Marketing",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  },
  "areaServed": [
    {"@type": "City", "name": "Dallas"},
    {"@type": "City", "name": "Houston"},
    {"@type": "City", "name": "Austin"},
    {"@type": "City", "name": "San Antonio"},
    {"@type": "City", "name": "Fulshear"},
    {"@type": "City", "name": "Celina"}
  ],
  "description": "Hyper-local SEO and patient acquisition strategies for medical clinics across Texas."
};

const locations = [
  { rank: 1, city: "Fulshear", region: "Houston", growth: "210.1%", rationale: "Explosive growth demands immediate pediatric urgent care and high-end wellness clinic marketing." },
  { rank: 2, city: "Celina", region: "Dallas", growth: "190.0%", rationale: "Recent introduction of major medical centers necessitates independent clinics to compete aggressively for digital visibility." },
  { rank: 3, city: "Princeton", region: "Dallas", growth: "> 100.0%", rationale: "Population doubling creates severe demand for immediate care alternatives to distant urban hospital networks." },
  { rank: 4, city: "Royse City", region: "Dallas", growth: "10.69%", rationale: "High-density housing developments driving consistent demand for localized family medicine and freestanding ER services." },
  { rank: 5, city: "Melissa", region: "Dallas", growth: "10.17%", rationale: "Rapid infrastructural expansion attracting specialized medical groups and aesthetic practices." },
  { rank: 6, city: "Anna", region: "Dallas", growth: "> 80.0%", rationale: "Continued northward migration from the DFW core, creating vast new healthcare service vacuums." },
  { rank: 7, city: "Forney", region: "Dallas", growth: "61.3%", rationale: "Massive influx of young families prioritizing modern, digitally accessible healthcare facilities." },
  { rank: 8, city: "Liberty Hill", region: "Austin", growth: "14.72%", rationale: "Rapid expansion in the Austin corridor requiring tailored marketing for holistic and longevity wellness clinics." }
];

const faqs = [
  {
    q: "Why do you focus so heavily on Texas suburbs?",
    a: "Texas is experiencing unprecedented interstate population migration. This demographic explosion is highly concentrated in suburban, master-planned communities surrounding the Dallas-Fort Worth multiplex and the greater Houston area. Traditional acute care hospitals require 3-4 years to build, creating a massive void in healthcare infrastructure. Independent Urgent Cares and Freestanding ERs can be deployed in 18 months. We target these suburbs because they represent the highest ROI opportunity for new clinic growth."
  },
  {
    q: "How does a 'Location Page' strategy work for SEO?",
    a: "A programmatic location page strategy involves creating highly specific, unique landing pages for every municipality your clinic serves (e.g., 'Urgent Care in Fulshear, TX', 'Freestanding ER in Celina, TX'). These pages are optimized with local schema markup, geo-specific keywords, and localized content. This allows your clinic to capture 'near me' search traffic from surrounding towns, effectively expanding your digital footprint beyond your physical address."
  },
  {
    q: "Do you only work with clinics in Texas?",
    a: "While our headquarters is in Irving, TX, and we possess deep, proprietary data on the Texas healthcare market, our Clinic Growth OS and automation systems are highly effective nationwide. However, our hyper-local SEO and geofencing strategies are currently optimized for the unique competitive dynamics of the Texas medical landscape."
  },
  {
    q: "How do you handle marketing for multi-location clinic networks?",
    a: "For multi-location networks, we deploy a 'Hub and Spoke' digital architecture. We build a central, highly authoritative domain (the Hub) and create dedicated, fully optimized sub-folders for each physical location (the Spokes). We manage individual Google Business Profiles for each site, ensuring that a patient in Houston sees the Houston clinic, while a patient in Dallas sees the Dallas clinic, all while aggregating domain authority to the parent brand."
  },
  {
    q: "What is competitor geofencing?",
    a: "Geofencing is a highly advanced paid media tactic where we draw a virtual perimeter around a specific geographic location—often a competing hospital or a high-traffic community center. When a prospective patient enters that perimeter with their smartphone, we can serve them targeted ads for your clinic. This is particularly effective for Freestanding ERs looking to capture overflow traffic from crowded hospital waiting rooms."
  }
];

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        heading={<>The Texas <span className="text-blue-500">Expansion Engine</span></>}
        subheading="Texas represents one of the most lucrative healthcare markets globally. We deploy a programmatic, location-page rollout strategy targeting the fastest-growing micro-markets in the state to establish localized monopolies."
        primaryCTA={{ label: 'View Locations', href: '/locations' }}
        secondaryCTA={{ label: 'Get Started', href: '/contact' }}
        imageAlt="Map of Texas with expansion highlights"
      />

      {/* Deep Dive: The Suburban Sprawl */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl font-bold mb-6">Capitalizing on the Healthcare Void</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  The state of Texas is currently experiencing an unprecedented demographic shift. Massive corporate relocations and interstate migration are driving explosive population growth. Crucially, this expansion is not occurring uniformly across historical urban centers like downtown Dallas or Houston; it is highly concentrated in suburban, master-planned communities.
                </p>
                <p>
                  This rapid suburban sprawl creates immediate, severe geographical voids in healthcare infrastructure. Traditional acute care hospitals require three to four years for design, permitting, and construction. In contrast, Freestanding Emergency Departments (FSEDs) and independent Urgent Care clinics can be rapidly deployed within 18 months.
                </p>
                <p>
                  Our digital marketing strategy is engineered to capitalize on this exact dynamic. We don&apos;t just target the saturated core cities; we aggressively target the periphery. By establishing digital dominance in these boomtowns before major health systems arrive, we secure a highly lucrative, rapidly expanding patient base for our clients.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Building2 className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Infrastructure Lag</h3>
                <p className="text-sm text-slate-600">Exploiting the 3-year gap between population growth and hospital construction.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Target className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Micro-Market Targeting</h3>
                <p className="text-sm text-slate-600">Focusing ad spend on specific zip codes with high influxes of new residents.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Navigation className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Commuter Routing</h3>
                <p className="text-sm text-slate-600">Optimizing Google Maps to capture patients commuting between suburbs and city centers.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <TrendingUp className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">First-Mover Advantage</h3>
                <p className="text-sm text-slate-600">Establishing unshakeable domain authority before corporate competitors enter the market.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Data Table Section */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Top 20 Texas Municipalities for Clinic Expansion</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The following matrix outlines our strategic rollout hierarchy, prioritizing municipalities based on recent Census Bureau population growth metrics and corresponding healthcare infrastructure demands.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="glass rounded-[3rem] border border-slate-200 overflow-hidden mb-16">
            <div className="p-8 border-b border-slate-200 bg-slate-100">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <MapPin className="h-6 w-6 text-blue-500" /> Hyper-Growth Corridors Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 bg-slate-50/50">
                    <th className="px-8 py-6">Rank</th>
                    <th className="px-8 py-6">Municipality</th>
                    <th className="px-8 py-6">Metro Region</th>
                    <th className="px-8 py-6">Annual Growth</th>
                    <th className="px-8 py-6">Strategic Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc, i) => (
                    <tr key={i} className="hover:bg-slate-100 transition-colors">
                      <td className="px-8 py-6 font-mono text-blue-500">{loc.rank}</td>
                      <td className="px-8 py-6 font-bold text-lg">{loc.city}</td>
                      <td className="px-8 py-6 text-slate-600">{loc.region}</td>
                      <td className="px-8 py-6 font-mono text-emerald-500">{loc.growth}</td>
                      <td className="px-8 py-6 text-sm text-slate-600 max-w-xs leading-relaxed">{loc.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.3} className="text-center">
            <h3 className="text-3xl font-bold mb-6">Ready to dominate your local market?</h3>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-lg font-bold text-black hover:bg-blue-400 transition-all">
              Claim Your Territory <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Locations FAQ</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Understanding our geographic targeting and local SEO methodologies.
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
