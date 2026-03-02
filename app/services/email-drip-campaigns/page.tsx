import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email & Drip Campaigns for Healthcare | Patient Nurturing & Retention',
  description: 'HIPAA-compliant email marketing and drip campaigns for healthcare. Nurture leads and keep patients coming back with strategic email automation.',
  keywords: 'healthcare email marketing, medical email campaigns, patient email automation, healthcare drip campaigns',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/services/email-drip-campaigns',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Email & Drip Campaigns",
  "description": "HIPAA-compliant email marketing and automated drip campaigns for healthcare patient nurturing."
};

export default function EmailDripCampaignsPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Email remains the highest-ROI marketing channel, returning $36-42 for every dollar spent. For healthcare practices, email is the perfect tool for patient retention, appointment reminders, educational nurturing, and staying top-of-mind.
      </p>
      <p>
        However, generic email marketing doesn't work in healthcare. HIPAA compliance is mandatory. Patients expect personalized, relevant communication—not mass blasts. And email must be integrated with your clinic workflow to feel natural and valuable rather than intrusive.
      </p>
      <p>
        Our Email & Drip Campaign service creates automated, HIPAA-compliant sequences that nurture leads into patients, keep existing patients engaged, encourage repeat visits, and ultimately increase patient lifetime value.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '✉️',
      title: 'HIPAA-Compliant Email Management',
      description: 'Secure email infrastructure with encryption, authentication, and compliance auditing.'
    },
    {
      icon: '🔄',
      title: 'Automated Drip Sequences',
      description: 'Intelligent automation based on patient behavior, appointments, and engagement patterns.'
    },
    {
      icon: '👤',
      title: 'Personalization & Segmentation',
      description: 'Dynamic content delivering right message to right patient at right time.'
    },
    {
      icon: '📅',
      title: 'Appointment Reminders & Follow-up',
      description: 'Automated appointment confirmations, reminders, and post-visit follow-up sequences.'
    },
    {
      icon: '📊',
      title: 'Performance Analytics',
      description: 'Track open rates, click rates, conversions, and patient engagement by sequence.'
    },
    {
      icon: '🔗',
      title: 'CRM Integration',
      description: 'Seamless integration with your EHR and patient management system.'
    }
  ];

  const breakdown = [
    {
      title: 'Email Infrastructure & Compliance',
      items: [
        'HIPAA-compliant email platform with end-to-end encryption',
        'Business Associate Agreement (BAA) with email service provider',
        'Authentication protocol implementation (SPF, DKIM, DMARC) for deliverability',
        'Secure unsubscribe and preference center for patient control',
        'Annual security audits and compliance certifications',
        'GDPR and CCPA compliance for broader patient privacy',
        'Data retention policies aligned with HIPAA requirements'
      ]
    },
    {
      title: 'Lead Nurturing Sequences',
      items: [
        'Welcome series introducing clinic, services, and value proposition',
        'Educational series addressing common patient questions and concerns',
        'Objection-handling sequences addressing barriers to appointment booking',
        'Social proof sequences featuring patient testimonials and case studies',
        'Service-specific sequences for specialty procedures or new services',
        'Seasonal campaigns promoting wellness services and preventive care',
        'Re-engagement sequences for inactive leads and past inquiries'
      ]
    },
    {
      title: 'Patient Retention Campaigns',
      items: [
        'Post-appointment follow-up emails with post-care instructions and surveys',
        'Appointment reminders reducing no-shows by 25-30%',
        'Prescription refill reminders and renewal notifications',
        'Preventive care and screening reminders aligned with clinical guidelines',
        'Seasonal health content relevant to patient demographics',
        'Loyalty and referral incentive campaigns',
        'Win-back campaigns for lapsed patients targeting increased engagement'
      ]
    },
    {
      title: 'Segmentation & Personalization',
      items: [
        'Demographic segmentation by age, gender, location, insurance type',
        'Behavioral segmentation based on appointment history and service usage',
        'Engagement segmentation separating active, inactive, and at-risk patients',
        'Dynamic content insertion with patient name, clinic location, provider info',
        'Send time optimization based on individual patient open patterns',
        'A/B testing of subject lines, content, and calls-to-action',
        'Automated list hygiene removing invalid emails and bounce management'
      ]
    }
  ];

  const benefits = [
    'Nurture leads automatically, converting inquiry to appointment at scale',
    'Reduce appointment no-shows by 25-30% with reminder sequences',
    'Increase patient lifetime value through retention and repeat visit promotion',
    'Build trust and authority through educational content delivery',
    'Maintain HIPAA compliance while delivering personalized communication',
    'Automate routine communications freeing up staff time',
    'Achieve 40-50x ROI on email marketing investment with proper sequences'
  ];

  const faqs = [
    {
      q: 'How often should we email patients?',
      a: 'It depends on the type of email. Appointment reminders: once 24 hours before. Educational content: 1-2x per week maximum. Promotional: 1-2x per month. The key is value—patients tolerate frequent emails if they\'re helpful and relevant. We monitor unsubscribe rates closely; high unsubscribes indicate too-frequent or irrelevant messaging.'
    },
    {
      q: 'Can we share appointment details via email?',
      a: 'Yes, but securely. Never share sensitive health information in email subject lines (which might be visible in previews). Include appointment time, date, location, and provider name. Avoid specific diagnoses, treatment plans, or test results in unencrypted email. For sensitive information, include a secure link to patient portal rather than attaching files.'
    },
    {
      q: 'What should we include in post-appointment follow-up emails?',
      a: 'Post-appointment emails should include: (1) Thank you for visiting, (2) Post-care instructions/medications if relevant, (3) When to expect results (if applicable), (4) How to contact clinic with questions, (5) Link to feedback survey, (6) Any follow-up appointment recommendations. Keep it brief and action-focused rather than overwhelming.'
    },
    {
      q: 'How do we handle unsubscribe requests?',
      a: 'All emails must include an unsubscribe link. When someone unsubscribes, honor it immediately—non-compliance violates CAN-SPAM and damages reputation. However, transactional emails (appointment confirmations, medical records) don\'t require unsubscribe options. We can often reach unsubscribed patients through other channels (SMS, phone) if they consent.'
    },
    {
      q: 'What is a good email open rate for healthcare?',
      a: 'Healthcare industry average is 20-25% for promotional emails. Appointment reminders and transactional emails often exceed 40% open rate. To improve, focus on clear subject lines (not clickbait), posting at optimal times, segmented relevant content, and a recognizable from address. We A/B test constantly to improve performance.'
    },
    {
      q: 'How do we measure email campaign ROI?',
      a: 'Track: (1) Click-through rate (how many clicked links), (2) Conversion rate (clicks to appointments booked), (3) Cost per acquisition (email cost vs. appointments generated), (4) Patient lifetime value from email-derived patients, (5) Retention rate (email subscribers vs. inactive patients). Appointment reminder ROI is easiest to measure—42% average reduction in no-shows directly increases clinic revenue.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Email & Drip Campaigns"
        excerpt="Automate patient nurturing and retention with HIPAA-compliant email marketing. Keep patients engaged, reduce no-shows, and drive repeat visits."
        image="/5.png"
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
