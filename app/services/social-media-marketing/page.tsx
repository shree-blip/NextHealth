import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Media Marketing for Healthcare | Instagram, TikTok, Facebook',
  description: 'Strategic social media marketing for healthcare practices. We own every platform—Instagram, TikTok, Facebook, LinkedIn—building community trust and driving patient acquisition.',
  keywords: 'healthcare social media marketing, medical social media, doctor social media, healthcare content marketing',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/social-media-marketing',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Social Media Marketing",
  "description": "Strategic social media marketing for healthcare practices across Instagram, TikTok, Facebook, and LinkedIn.",
  "provider": {
    "@type": "ProfessionalService",
    "name": "The NextGen Healthcare Marketing"
  }
};

export default function SocialMediaMarketingPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Social media has become the primary communication channel for healthcare consumers. Patients research clinics, read reviews, learn about services, and make healthcare decisions on social platforms before ever picking up the phone.
      </p>
      <p>
        Our social media marketing service goes far beyond posting pretty pictures. We develop comprehensive social strategies across Instagram, TikTok, Facebook, and LinkedIn that build community, establish authority, and drive patient acquisition. Each platform has a distinct algorithm, audience demographic, and content format—we optimize for each.
      </p>
      <p>
        From patient education content to behind-the-scenes clinic culture, to targeted lead generation campaigns, we create a social presence that converts followers into patients and patients into loyal advocates.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📸',
      title: 'Content Creation & Strategy',
      description: 'Custom content calendars with patient-focused, education-driven posts that build authority and trust.'
    },
    {
      icon: '👥',
      title: 'Community Management',
      description: 'Proactive engagement, comment responses, and relationship building with your patient community.'
    },
    {
      icon: '🎥',
      title: 'Video Production',
      description: 'High-quality patient testimonials, clinic tours, educational explainers, and trending short-form content.'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Daily monitoring of engagement, reach, follower growth, and conversion metrics with optimization.'
    },
    {
      icon: '🎯',
      title: 'Paid Social Campaigns',
      description: 'Strategic ad spend across platforms targeting local patients and specific service interests.'
    },
    {
      icon: '🔗',
      title: 'Cross-Platform Integration',
      description: 'Consistent branding and messaging across all social channels to reinforce clinic identity.'
    }
  ];

  const breakdown = [
    {
      title: 'Content Strategy & Creation',
      items: [
        'Monthly content calendars aligned with clinic services and patient education goals',
        'Educational content addressing common patient questions and health concerns',
        'Behind-the-scenes content humanizing your clinic and building team credibility',
        'Patient testimonial videos and success stories (HIPAA-compliant)',
        'Trending audio, reels, and TikTok content to stay relevant with younger audiences',
        'Seasonal campaigns for wellness awareness and service promotions',
        'Live Q&A sessions and webinars to establish clinic as medical authority'
      ]
    },
    {
      title: 'Platform-Specific Optimization',
      items: [
        'Instagram: Reels, Stories, carousel posts, and educational graphics for community-building',
        'TikTok: Trending sounds, quick-hit patient education, and clinic culture for viral reach',
        'Facebook: In-depth articles, community groups, and targeted lead generation ads',
        'LinkedIn: Thought leadership content, industry news commentary, and B2B partnership development',
        'YouTube: Longer-form educational content, patient testimonials, and surgical procedure explanations',
        'Platform-native features and latest algorithm updates incorporated immediately'
      ]
    },
    {
      title: 'Engagement & Community Building',
      items: [
        'Daily monitoring and professional responses to all comments and DMs',
        'Community group management and moderation for patient support and feedback',
        'Relationship building with patient advocates and health influencers ',
        'Crisis management protocols for negative comments or reputation threats',
        'User-generated content campaigns to amplify patient voices',
        'Influencer partnerships with local health professionals and wellness personalities'
      ]
    },
    {
      title: 'Lead Generation & Conversion',
      items: [
        'Social landing pages optimized for appointment booking and patient intake',
        'Lead magnet campaigns (free guides, webinars) to build email lists',
        'Retargeting audiences who engaged with content but didn\'t convert',
        'Conversion tracking and attribution to measure ROI on social spend',
        'Social ads testing and optimization for lowest cost-per-acquisition (CPA)',
        'Scheduling and booking integration directly in social platforms'
      ]
    }
  ];

  const benefits = [
    'Build an engaged community of patients who actively follow and trust your clinic',
    'Establish authority and credibility in healthcare discussions and medical education',
    'Drive consistent website traffic from social platforms at lower acquisition costs',
    'Create viral moments and organic reach that extend far beyond paid advertising',
    'Generate user-generated content and testimonials that amplify your marketing message',
    'Stay connected with existing patients for retention and repeat service promotion',
    'Adapt quickly to trends and cultural moments relevant to your patient base'
  ];

  const faqs = [
    {
      q: 'How often should we post on social media?',
      a: 'Posting frequency depends on the platform. Instagram: 3-5 posts/week + daily Stories. TikTok: 3-7 videos/week if pursuing viral growth, or 1-3/week for consistent reach. Facebook: 5-7 posts/week. LinkedIn: 2-3 posts/week. We recommend consistency over volume—a predictable schedule that you can maintain long-term is better than sporadic bursts.'
    },
    {
      q: 'Can we share patient testimonials on social media?',
      a: 'Yes, but only with explicit HIPAA-compliant consent. We use authorization forms that grant permission for specific testimonials or general patient stories. We never use real patient names without consent and always anonymize medical details. Video testimonials are especially powerful but require the highest level of consent documentation.'
    },
    {
      q: 'How do we handle negative comments on social media?',
      a: 'We respond professionally and empathetically within 24 hours. If the comment is constructive criticism, we acknowledge it and take the conversation offline (via DM). If it\'s a false claim or complaint, we clarify facts respectfully. For serious complaints, we escalate to management. We never delete comments unless they violate community guidelines. Transparent, caring responses actually build trust.'
    },
    {
      q: 'What is the ROI of social media marketing?',
      a: 'Social media ROI is often indirect—it builds brand awareness and trust that leads to website visits and phone calls rather than direct conversions. We measure engagement rate, reach, website clicks, and attributed conversions. For lead generation campaigns, we track cost-per-lead and cost-per-appointment. Expect 3-6 months for significant measurable results.'
    },
    {
      q: 'Should we run paid ads on social media?',
      a: 'Yes, especially for growth-focused goals. Organic reach alone is insufficient in competitive markets. We recommend allocating 20-30% of your social budget to paid ads targeting local audiences for appointment bookings. Organic content builds community and credibility, while paid ads accelerate growth and drive conversions.'
    },
    {
      q: 'How do we measure social media success?',
      a: 'Key metrics include: engagement rate (likes, comments, shares), reach (how many people see your content), follower growth, website traffic from social, cost per click, and most importantly, cost per appointment booked. Vanity metrics like follower count matter less than actual business results. We provide weekly reports on all meaningful metrics.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Social Media Marketing"
        excerpt="Own every social platform—Instagram, TikTok, Facebook, LinkedIn. Build a thriving community of engaged patients while establishing your clinic as a trusted medical authority."
        image="/2.png"
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
