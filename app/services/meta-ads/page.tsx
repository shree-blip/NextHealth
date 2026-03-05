import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meta Ads for Healthcare | Facebook & Instagram Advertising',
  description: 'Targeted Facebook and Instagram ads that convert scrollers into patients. Strategic Meta advertising campaigns designed specifically for healthcare practices.',
  keywords: 'Facebook ads for doctors, Instagram ads healthcare, Meta ads medical, healthcare social media advertising',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/meta-ads',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Meta Ads",
  "description": "Targeted Facebook and Instagram ads for healthcare practices that convert."
};

export default function MetaAdsPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        While <a href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Google Ads</a> capture high-intent patients actively searching, Meta (Facebook and Instagram) ads are equally powerful for reaching patients in discovery and research phases. Patients spend hours daily on social platforms, often researching health conditions, reading experiences, and deciding between provider options.
      </p>
      <p>
        Meta&rsquo;s targeting capabilities are unmatched. We can reach people by age, location, interests, behaviors, life events, and engagement patterns. For healthcare, this means reaching patients with specific health interests, recent medical milestones, or demographic profiles matching your ideal patient.
      </p>
      <p>
        Meta ads excel at building desire for elective services (cosmetic procedures, wellness, mental health), generating leads through educational content, and retargeting website visitors who didn&rsquo;t convert. Pair Meta campaigns with <a href="/services/social-media-marketing" className="text-emerald-600 underline hover:text-emerald-700">organic social media marketing</a> and track every dollar through our <a href="/services/analytics-reporting" className="text-emerald-600 underline hover:text-emerald-700">analytics dashboards</a> for a complete patient acquisition ecosystem.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '👥',
      title: 'Advanced Audience Targeting',
      description: 'Reach patients by location, health interests, life events, demographics, and behavioral signals.'
    },
    {
      icon: '🎨',
      title: 'Creative Video Production',
      description: 'Compelling patient testimonials, before/after transformations, and educational clinic content.'
    },
    {
      icon: '🔄',
      title: 'Strategic Retargeting',
      description: 'Re-engage website visitors and past patients with compelling follow-up ads driving conversions.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Strategy',
      description: 'Campaigns optimized for mobile where 95% of your audience spends their social time.'
    },
    {
      icon: '💬',
      title: 'Lead Magnet Campaigns',
      description: 'Lead generation ads collecting patient information for nurturing and appointment booking.'
    },
    {
      icon: '📊',
      title: 'Conversion Tracking & ROI',
      description: 'End-to-end tracking from ad click to appointment booked measuring true campaign performance.'
    }
  ];

  const breakdown = [
    {
      title: 'Audience Strategy & Targeting',
      items: [
        'Primary audience targeting by age, location, interests, and life events (new parent, recent mover, etc.)',
        'Lookalike audiences based on past patients and website visitors for expansion',
        'Custom audience targeting based on clinic-provided patient contact lists (with consent)',
        'Behavioral targeting reaching people interested in health and wellness categories',
        'Exclusion audiences preventing ads to existing patients (saving budget)',
        'A/B testing different audience segments to identify highest-converting groups',
        'Continuous audience refinement based on performance data'
      ]
    },
    {
      title: 'Creative Development & Testing',
      items: [
        'Patient testimonial videos showcasing real experiences and outcomes',
        'Educational content explaining procedures, conditions, and health topics',
        'Before/after imagery for cosmetic or aesthetic procedures',
        'Carousel ads showcasing multiple services or patient stories',
        'Interactive polls and questions driving engagement and conversation',
        'Seasonal content aligned with health observances and wellness trends',
        'Multiple ad variations tested to identify highest-performing creative'
      ]
    },
    {
      title: 'Lead Generation & Nurturing',
      items: [
        'Lead generation ads with pre-filled forms reducing friction',
        'Lead magnets (free guides, health assessments, webinars) capturing contact info',
        'Automated email sequences nurturing leads toward appointment booking',
        'Messenger chatbots answering common questions and qualifying leads',
        'Retargeting ads showing relevant information to engaged leads',
        'Phone number targeting enabling direct calls from ads',
        'Integration with CRM for seamless lead handoff to sales team'
      ]
    },
    {
      title: 'Campaign Optimization & Scaling',
      items: [
        'Daily budget optimization allocating spend to best-performing ad sets',
        'Bid strategy testing (CPC, CPL, CPA) identifying optimal approach',
        'Placement optimization across Facebook, Instagram, Audience Network, Messenger',
        'Time-of-day and day-of-week adjustments for patient behavior patterns',
        'Frequency caps preventing ad fatigue and declining performance',
        'Continuous creative refresh preventing audience saturation',
        'Monthly reporting with actionable insights and optimization recommendations'
      ]
    }
  ];

  const benefits = [
    'Reach patients during discovery phase before they actively search competitors',
    'Build brand awareness and credibility with massive engaged audience',
    'Target ideal patient demographics with surgical precision',
    'Generate leads and nurture them toward appointment booking systematically',
    'Retarget website visitors who didn\'t convert on first visit',
    'Create viral moments and organic reach amplifying paid budget',
    'Establish emotional connection through storytelling and patient testimonials'
  ];

  const faqs = [
    {
      q: 'What is the difference between Facebook and Instagram ads?',
      a: 'Facebook audience skews older (average age 40+) and is focused on text, news, and community. Instagram skews younger (average age 25-35) and is heavily visual and video-focused. Twitter is more news and current events. We typically run ads on both platforms but optimize creative and messaging for each audience. Instagram is generally more effective for aesthetic/cosmetic services, while Facebook works well for broader healthcare messaging.'
    },
    {
      q: 'How long should Meta ads run?',
      a: 'Minimum 2 weeks of continuous running is needed to gather meaningful data and let the Meta algorithm optimize. Most campaigns benefit from 4-12 weeks of continuous running with weekly optimization. We monitor performance daily and pause or scale winning ads within 48 hours. Consistent, long-term campaigns typically outperform stop-start approaches.'
    },
    {
      q: 'Can we collect patient data through Meta ads?',
      a: 'Yes, with proper HIPAA compliance. Lead generation ads can collect name, email, phone, and basic information. However, we cannot collect health information or medical history through Meta ads without specific consent and compliance measures. We use opt-in forms and clear data privacy statements. All collected data is stored securely and never shared with Facebook.'
    },
    {
      q: 'What video length works best on Meta platforms?',
      a: 'On Instagram Reels and TikTok: 15-60 seconds is optimal. Facebook Feed videos: 15-120 seconds work well. Stories: 15 seconds. The key is hook-in within the first 3 seconds—if you don\'t capture attention immediately while auto-playing with sound off, people scroll past. We create multiple video lengths and variations to test performance.'
    },
    {
      q: 'How do we prevent ads from appearing in controversial placements?',
      a: 'Meta has audience controls and brand safety filters. We set detailed inclusion/exclusion parameters defining where your ads appear (page and content type). We also monitor ads daily for inappropriate placements and pause/adjust within hours if needed. Healthcare practitioners generally want ads appearing near health content, wellness pages, and community groups—not controversial news or divisive topics.'
    },
    {
      q: 'What is the average ROI for healthcare Meta ads?',
      a: 'ROI varies significantly by service type. Lead generation campaigns for specials might achieve 3:1 to 5:1 ROAS (return on ad spend). Appointment booking campaigns typically see 1.5:1 to 3:1 ROAS depending on service price. Brand awareness campaigns are harder to measure directly. We recommend allocating at least 90 days before evaluating overall ROI, as Meta\'s algorithm improves over time.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Meta Ads for Healthcare"
        excerpt="Facebook & Instagram ads that convert scrollers into patients. Strategic social advertising designed to reach, engage, and convert your ideal patients."
        image="/4.png"
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
