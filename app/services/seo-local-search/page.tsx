import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO & Local Search for Healthcare | Dominate Local Results',
  description: 'Experts in medical SEO and local search optimization. Rank #1 on Google Maps for your service area and drive organic patient traffic to your healthcare practice.',
  keywords: 'healthcare SEO, local search, medical SEO, Google Business Profile optimization, local SEO for doctors',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/services/seo-local-search',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SEO & Local Search",
  "description": "Experts in medical SEO and local search optimization. Rank #1 on Google Maps for your service area and drive organic patient traffic.",
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
  }
};

export default function SEOLocalSearchPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        In the healthcare industry, being found at the right moment is everything. When a patient searches "emergency room near me" or "urgent care 75038," they're ready to take action. If your clinic isn't in the top 3 results (the Local Pack), you're losing patients to competitors—even those geographically farther away.
      </p>
      <p>
        Our SEO & Local Search service is engineered to dominate your local market. We combine technical SEO excellence with hyperlocal optimization strategies specifically designed for healthcare providers. From optimizing your Google Business Profile to building authority through healthcare directory citations, we ensure your clinic becomes the default choice in your service area.
      </p>
      <p>
        Unlike generic SEO agencies, we specialize in medical markets and understand the unique challenges: HIPAA compliance, managing multiple locations, and competing against large health systems with massive marketing budgets.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📍',
      title: 'Google Business Profile Mastery',
      description: 'Complete optimization and weekly management to secure top Local Pack rankings and reviews.'
    },
    {
      icon: '🗺️',
      title: 'Local Citation Building',
      description: 'Strategic listings across 100+ healthcare directories with consistent NAP (Name, Address, Phone) data.'
    },
    {
      icon: '🎯',
      title: 'Hyperlocal Content',
      description: 'Programmatic landing pages targeting surrounding municipalities and patient demographics.'
    },
    {
      icon: '⭐',
      title: 'Review Generation & Management',
      description: 'Automated systems to proactively generate positive reviews and manage reputation.'
    },
    {
      icon: '🔗',
      title: 'Local Link Building',
      description: 'Healthcare authority backlinks from relevant local and medical sources.'
    },
    {
      icon: '📊',
      title: 'AEO & Voice Search',
      description: 'Answer Engine Optimization for AI results and emerging voice search technologies.'
    }
  ];

  const breakdown = [
    {
      title: 'On-Page Optimization',
      items: [
        'Comprehensive keyword research specific to healthcare and your service areas',
        'Title tags and meta descriptions optimized for CTR and medical authority',
        'Header structure and internal linking strategy for E-E-A-T signals',
        'Schema markup (FAQ, HowTo, Video) for rich snippet eligibility',
        'Page speed optimization and Core Web Vitals improvements',
        'Mobile-first indexing compliance and responsive design'
      ]
    },
    {
      title: 'Local Search Domination',
      items: [
        'Google Business Profile complete optimization with high-quality imagery',
        'Weekly GBP posts with appointment booking and call-to-action buttons',
        'Strategic Q&A seeding to capture common patient questions',
        'Review management and HIPAA-compliant response protocol',
        'Local directory citations (Healthgrades, Yelp, ZocDoc, etc.)',
        'NAP consistency audits across 150+ directories'
      ]
    },
    {
      title: 'Authority Building',
      items: [
        'Healthcare-specific link building from medical directories and local sources',
        'Content marketing that attracts organic backlinks naturally',
        'Press release distribution for newsworthy clinic milestones',
        'Relationship building with local health organizations and chambers',
        'EAT (Expertise, Authoritativeness, Trustworthiness) optimization',
        'YMYL (Your Money or Your Life) compliance for healthcare content'
      ]
    },
    {
      title: 'Advanced Strategies',
      items: [
        'Answer Engine Optimization for ChatGPT, Google Gemini, and Copilot',
        'Voice search optimization for "near me" and natural language queries',
        'Competitor analysis and rank tracking across 500+ keywords',
        'Local SEO reporting dashboards with actionable insights',
        'Multi-location optimization for healthcare groups and chains',
        'Seasonal campaign planning for patient acquisition peaks'
      ]
    }
  ];

  const benefits = [
    'Rank in the Google Local Pack within 90-180 days with measurable progress',
    'Drive organic patient traffic at 60-80% lower cost than paid advertising',
    'Build authority and credibility with review and citation accumulation',
    'Capture high-intent "near me" searches that convert at 3x+ higher rates',
    'Establish dominance before competitors can compete in your market',
    'Create a sustainable, evergreen traffic source that compounds over time',
    'Improve clinic visibility across Google Maps, Search, and Answer Engines'
  ];

  const faqs = [
    {
      q: 'How long does it take to see SEO results for my healthcare practice?',
      a: 'SEO is a long-term strategy, but you can typically see initial improvements within 30-60 days. True Local Pack dominance usually requires 3-6 months of consistent effort, depending on competition and your starting position. Google Business Profile optimizations often show faster results than organic search improvements.'
    },
    {
      q: 'What is the difference between SEO and Local SEO?',
      a: 'SEO (Search Engine Optimization) targets broad, national keywords and organic search visibility. Local SEO specifically targets location-based searches like "emergency room near me" or "pediatrician in [city]," and includes Google Maps rankings. For healthcare practices with a geographic service area, local SEO is typically more valuable than traditional SEO.'
    },
    {
      q: 'Why does my Google Business Profile ranking fluctuate?',
      a: 'Google continuously updates its ranking algorithm based on factors like review freshness, check-ins, photos, business type, location distance, user location, and review signals. Seasonal variations, competitor activity, and Google algorithm updates can also affect rankings. We monitor these signals daily and adjust strategy to maintain top rankings.'
    },
    {
      q: 'How many reviews do I need to rank in the Local Pack?',
      a: 'While reviews are important, they\'re only one of 15+ ranking factors. More important is review freshness (recent reviews matter more than older ones), review velocity (consistent new reviews), and review sentiment. A clinic with 50 recent 4.8-star reviews will typically outrank one with 200 older 3.5-star reviews. We focus on generating quality reviews consistently.'
    },
    {
      q: 'Should I use keywords in my Google Business Profile description?',
      a: 'Yes, but naturally. Include your primary service area and specialty (e.g., "Emergency room serving Irving, Arlington, and Grand Prairie"), but avoid keyword stuffing. Google prioritizes user experience. Your description should be compelling to patients while including relevant service and location information.'
    },
    {
      q: 'How do you ensure HIPAA compliance with SEO?',
      a: 'SEO compliance with HIPAA means we never use patient data, reviews, or testimonials in website content without consent. We optimize for keywords and topics without compromising patient privacy. All analytics data is anonymized, and we implement security best practices to protect your website and patient information.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="SEO & Local Search"
        excerpt="Dominate local search results and drive organic patient traffic to your healthcare practice. Rank #1 on Google Maps and establish your clinic as the default choice in your service area."
        image="/1.png"
        overview={content}
        coreFeatures={coreFeatures}
        breakdown={breakdown}
        faqs={faqs}
        benefits={benefits}
      />
      <Footer />
    </main>
  );
}
