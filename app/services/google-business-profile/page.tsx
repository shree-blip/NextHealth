import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Business Profile Optimization | Local Search Dominance',
  description: 'Expert Google Business Profile optimization for healthcare practices. Dominate your local market and be the top choice patients find on Google Maps.',
  keywords: 'Google Business Profile optimization, Google My Business for doctors, local search optimization, healthcare GBP',
  alternates: {
    canonical: 'https://nextgenmarketing.agency/services/google-business-profile',
  }
};

export default function GoogleBusinessProfilePage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Google Business Profile (formerly Google My Business) is foundational to local search success. When patients search "emergency room near me," Google shows a map with the Local Pack—three businesses ranked by relevance, distance, and 15+ ranking factors. Your profile optimization is mission-critical.
      </p>
      <p>
        Many clinics underestimate Google Business Profile. An abandoned profile with poor information ranks poorly. A well-optimized profile with fresh content, quality reviews, and regular updates dominates the Local Pack consistently.
      </p>
      <p>
        Our Google Business Profile service includes complete optimization, weekly content management, review management, and performance monitoring. We ensure your clinic is the first choice patients find in local search.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📍',
      title: 'Complete Profile Optimization',
      description: 'Full information audit ensuring complete, accurate, keyword-optimized profile data.'
    },
    {
      icon: '📸',
      title: 'Professional Imagery Management',
      description: 'High-quality photos of clinic, staff, services updated regularly for engagement.'
    },
    {
      icon: '📝',
      title: 'Weekly Content Posting',
      description: 'Regular posts with offers, events, updates, and calls-to-action driving engagement.'
    },
    {
      icon: '⭐',
      title: 'Review Management',
      description: 'Review generation strategies and professional responses building reputation.'
    },
    {
      icon: '💬',
      title: 'Q&A Management',
      description: 'Strategic Q&A seeding and response ensuring common patient questions are answered.'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Daily monitoring of clicks, calls, directions, reviews, and performance trends.'
    }
  ];

  const breakdown = [
    {
      title: 'Profile Setup & Optimization',
      items: [
        'Business name optimization with location identifier if multi-location',
        'Complete category selection (primary + 9 secondary categories)',
        'Description rewrite emphasizing services, specialties, and unique value',
        'Keyword inclusion in service lists and description (without keyword stuffing)',
        'Hours of operation: regular hours + special hours for holidays',
        'Contact information: phone number, website, appointment link',
        'Service areas: defining geographic market and patient coverage',
        'Attributes: marking services like "accepts new patients," "online booking," etc.'
      ]
    },
    {
      title: 'Imagery & Visual Content',
      items: [
        'Professional clinic interior and exterior photography',
        'Staff photos humanizing clinic and building patient connection',
        'Service and procedure photography (if appropriate and compliant)',
        'Technology and equipment photos showcasing modern capabilities',
        'Weekly photo uploads keeping profile fresh and engaging',
        'Image optimization: high resolution, proper orientation, metadata',
        'Video uploads: clinic tours, provider introductions, patient testimonials'
      ]
    },
    {
      title: 'Content & Posting Strategy',
      items: [
        'Weekly posts (1-2 per week) keeping profile active and engaging',
        'Service highlight posts: "Flu vaccination now available," etc.',
        'Educational posts: "5 reasons for an annual wellness exam," etc.',
        'Event announcements: health screenings, community events, clinic milestones',
        'Special offers and promotions (if applicable to healthcare practice)',
        'Holiday and seasonal content: "Preparing for flu season," etc.',
        'Call-to-action buttons on every post directing to website or appointment booking'
      ]
    },
    {
      title: 'Review & Q&A Management',
      items: [
        'Review generation: automated systems requesting reviews after appointments',
        'Review responses: professional, empathetic responses to all reviews (positive and negative)',
        'Response protocol: addressing concerns, offering to resolve offline if needed',
        'Q&A monitoring: answering common questions patients ask',
        'Q&A strategy: asking ourselves common questions and answering them preemptively',
        'Review analytics: tracking review volume, sentiment, and improvements over time',
        'Multi-location coordination: managing separate profiles for multiple clinics'
      ]
    }
  ];

  const benefits = [
    'Rank in the Google Local Pack with optimized, complete profile information',
    'Drive immediate clicks to website and phone calls from Google searches',
    'Build trust and credibility through latest photos, content, and positive reviews',
    'Provide complete information (hours, address, phone) preventing patient confusion',
    'Generate appointment booking leads through integrated calls-to-action',
    "Monitor performance with daily analytics understanding what's working",
    'Establish defensible local search position before competitors optimize'
  ];

  const faqs = [
    {
      q: 'Does Google Business Profile rank higher than organic search?',
      a: 'Priority differs by search intent. "Emergency room near me" shows Local Pack prominently. "Emergency room procedures and costs" shows organic results. Most local medical searches show Local Pack either above or beside organic results. Typically, Local Pack positions are worth more clicks than organic position #3-5, so optimization is crucial.'
    },
    {
      q: 'How often should we post on Google Business Profile?',
      a: 'Google rewards active profiles. We recommend 1-2 posts per week for consistent ranking boost. Less frequent posting (monthly) still helps but misses engagement opportunities. More than 3/week is excessive. Consistency matters more than volume—a reliable 1/week schedule beats sporadic bursts.'
    },
    {
      q: 'Should specific providers have separate profiles?',
      a: 'No. Healthcare clinics should have one location profile per physical location (not one per provider). Multiple clinic locations need separate profiles. Providers should be listed in team section of main clinic profile. This consolidates authority and avoids duplicate profile issues.'
    },
    {
      q: 'Can we run promotions on Google Business Profile?',
      a: 'Yes, periodically. Healthcare practices can highlight services, new technology, seasonal offers. Use promotions strategically (quarterly, not constantly) for best engagement. Avoid aggressive sales tactics; focus on value and patient benefit. Healthcare regulations still apply to any promotions.'
    },
    {
      q: 'How do negative reviews affect ranking?',
      a: 'Review sentiment influences ranking moderately. One negative review among many positive reviews has minimal impact. Multiple negative reviews without responses signals abandonment and hurts ranking. Professional responses to negative reviews actually improves credibility and ranking. Respond to all reviews—positive and negative.'
    },
    {
      q: 'Can we hide specific reviews?',
      a: 'You cannot delete reviews (unless they violate policies). You can flag inappropriate reviews to Google, but you cannot hide reviews you disagree with. Focus instead on generating more positive reviews and responding professionally to negative ones. Transparency and accountability actually build trust.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{"__html": JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Google Business Profile"})}} />
      <Navbar />
      <ServicePageTemplate
        title="Google Business Profile"
        excerpt="Optimize your Google Business Profile to be the top choice in your local area. Dominate Google Maps and drive local patient traffic."
        image="/10.png"
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
