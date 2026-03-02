import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Ads & PPC for Healthcare | High-Converting Medical Campaigns',
  description: 'Expert Google Ads management for healthcare practices. High-converting PPC campaigns that fill your waiting room with qualified patients ready to book appointments.',
  keywords: 'Google Ads for doctors, healthcare PPC, medical lead generation, Google Ads management',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/services/google-ads',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Google Ads & Paid Search",
  "description": "Expert Google Ads management for healthcare practices with high-converting PPC campaigns."
};

export default function GoogleAdsPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        When a patient searches "emergency room near me" or "how much does an x-ray cost," they're ready to act. This moment of intent is the most valuable real estate in digital marketing. Google Ads puts your practice in front of these high-intent patients at the exact moment they need you.
      </p>
      <p>
        However, most healthcare practices either ignore paid search or mismanage it—burning budgets on irrelevant clicks while missing high-value appointments. Our Google Ads service is built specifically for medical markets. We understand healthcare cost-per-acquisition challenges, compliance requirements, and the nuanced keyword strategies that separate winners from budget-wasters.
      </p>
      <p>
        We don't optimize for clicks. We optimize for qualified appointments booked at sustainable cost-per-acquisition (CPA) rates.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '🎯',
      title: 'High-Intent Keyword Strategy',
      description: 'Bid on symptom-based, location-specific, and service keywords that indicate immediate patient need.'
    },
    {
      icon: '💰',
      title: 'Cost-Per-Acquisition Optimization',
      description: 'Focus on sustainable CPA rather than clickthrough rate, ensuring profitable patient acquisition.'
    },
    {
      icon: '📄',
      title: 'Conversion-Optimized Landing Pages',
      description: 'Custom healthcare landing pages with clear calls-to-action, appointment booking, and minimal friction.'
    },
    {
      icon: '📊',
      title: 'Advanced Tracking & Attribution',
      description: 'Full conversion tracking from click to appointment booked, measuring true ROI.'
    },
    {
      icon: '🔄',
      title: 'Continuous A/B Testing',
      description: 'Rigorous testing of ads, landing pages, and bidding strategies to maximize performance.'
    },
    {
      icon: '⚖️',
      title: 'Healthcare Compliance',
      description: 'Guaranteed HIPAA-compliant campaigns with proper disclaimer handling and data protection.'
    }
  ];

  const breakdown = [
    {
      title: 'Campaign Structure & Keywords',
      items: [
        'High-intent keyword research targeting symptoms, services, and procedures',
        'Negative keyword lists preventing wasteful clicks on non-local or unqualified searches',
        'Keyword match type strategy (exact, phrase, broad) customized by campaign goal',
        'Service-specific campaigns for each clinic service (ER, urgent care, specialty, etc.)',
        'Geotargeting to focus spend on your service area with radius targeting',
        'Mobile-specific bidding to optimize for "near me" searches on mobile devices',
        'Seasonal keyword adjustments based on patient search behavior patterns'
      ]
    },
    {
      title: 'Ad Creation & Optimization',
      items: [
        'Compelling headlines emphasizing urgency, specialty, and location signals',
        'Ad copy testing different value propositions and calls-to-action',
        'Call extensions with click-to-call functionality for mobile appointments',
        'Appointment scheduling extensions enabling direct booking from search results',
        'Location extensions displaying clinic address and distance from searcher',
        'Ad customizers dynamically inserting clinic name, location, and services',
        'Responsive search ads automatically tested across all ad copy variations'
      ]
    },
    {
      title: 'Landing Page Strategy',
      items: [
        'Custom healthcare landing pages with service-specific messaging',
        'Clear appointment booking buttons above-the-fold with minimal friction',
        'Mobile-optimized pages with click-to-call for immediate phone booking',
        'Trust signals including credentials, reviews, and compliance badges',
        'Fast load times (under 2 seconds) critical for mobile conversion',
        'HIPAA-compliant form handling with secure data encryption',
        'Remarketing pixel implementation for audience building'
      ]
    },
    {
      title: 'Bidding & Budget Management',
      items: [
        'Target CPA bidding strategy optimized for your specific cost-per-acquisition goal',
        'Smart bidding algorithms learning from conversion data over time',
        'Budget allocation across campaigns based on performance data',
        'Bid adjustments for mobile, location, time-of-day, and audience segments',
        'Seasonal budget adjustments for peak patient acquisition periods',
        'Daily monitoring and real-time optimization preventing wasted spend',
        'Monthly budget reviews and forecasting for predictable spend and results'
      ]
    }
  ];

  const benefits = [
    'Appear at the exact moment patients are searching for your services (high purchase intent)',
    'Fill your waiting room with qualified patients actively ready to book appointments',
    'Measure true ROI by tracking clicks all the way to appointment booked',
    'Scale quickly with predictable cost-per-acquisition for rapid growth',
    'Test messaging and services rapidly to identify highest-revenue opportunities',
    'Dominate search results immediately (unlike SEO which takes months)',
    'Create remarketing audiences to re-engage website visitors who didn\'t convert'
  ];

  const faqs = [
    {
      q: 'How much should I spend on Google Ads?',
      a: 'Budget depends on your location competitiveness, clinic size, and growth goals. A small urgent care might spend $1,000-3,000/month, while a larger or more competitive market might justify $5,000-15,000+/month. We recommend starting with monthly budgets around 20-30% of your desired patient acquisition revenue target, then scaling based on profitable ROI.'
    },
    {
      q: 'What is a good cost-per-appointment for healthcare?',
      a: 'This varies by service. Emergency room ads might be $15-40 per click but convert at 5-10% (CPA $150-400). Specialty services or wellness might be $20-100 per click with 2-5% conversion rates (CPA $400-5,000+). The key is comparing CPA to your patient lifetime value—if a patient worth $2,000 costs $500 to acquire, that\'s excellent ROI.'
    },
    {
      q: 'How long does it take to see results from Google Ads?',
      a: 'Google Ads deliver immediate results—you can see clicks and appointments within days. However, optimization requires 2-4 weeks of data before you can make confident decisions about scaling or pausing keywords. True campaign maturity and maximum efficiency typically requires 60-90 days of continuous optimization.'
    },
    {
      q: 'What is the difference between Google Search and Google Display ads?',
      a: 'Search ads appear when someone explicitly searches a keyword (high intent but higher cost). Display ads appear on websites relevant to your audience (lower cost but lower intent). For healthcare, we prioritize Search ads for appointments, then layer in Display campaigns for brand awareness and remarketing to previous website visitors.'
    },
    {
      q: 'Can Google Ads help with local appointment booking?',
      a: 'Absolutely. We implement Google\'s native appointment scheduling extensions that allow patients to book directly from search results. We also use call extensions with click-to-call functionality. These reduce friction significantly and can increase conversion rates by 30-50%. Integration with your EHR or scheduling system is critical.'
    },
    {
      q: 'How do you ensure HIPAA compliance with Google Ads?',
      a: 'We never use patient data in targeting or audience building. We don\'t track conditions or medical history in conversion data (only appointment bookings). All landing pages use HTTPS encryption. We implement proper disclaimer language about healthcare information. We sign Business Associate Agreements with Google if collecting health information, though most Google Ads work doesn\'t require this since we focus on appointment bookings, not health data.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Google Ads & Paid Search"
        excerpt="High-converting PPC campaigns that fill your waiting room with qualified patients. Capture high-intent searchers at the moment they need your healthcare services."
        image="/3.png"
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
