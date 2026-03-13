import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'On-Site Field Marketing for Healthcare | Street-Level Patient Acquisition',
  description: 'On-site field marketing for healthcare practices through local events and community activations. Drive qualified walk-ins and appointments with street-level patient acquisition campaigns.',
  keywords: 'on-site field marketing healthcare, community healthcare marketing, local patient acquisition, healthcare events marketing',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/on-site-field-marketing',
  }
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  'name': 'On-Site Field Marketing',
  'description': 'Street-level patient acquisition through local events, community activations, and healthcare outreach campaigns.'
};

export default function OnSiteFieldMarketingPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <h2 className="text-2xl font-bold text-slate-900">Street-Level Growth for Healthcare Providers</h2>
      <p>
        Digital channels are essential, but many clinics still win their highest-trust patients through face-to-face local outreach. Our on-site field marketing service helps your team show up where your community already gathers&mdash;local events, neighborhood partnerships, and high-footfall activations designed to convert awareness into booked visits.
      </p>
      <p>
        We connect offline outreach with your online acquisition stack. Community touchpoints are supported by <a href="/services/seo-local-search" className="text-emerald-600 underline hover:text-emerald-700">local SEO visibility</a>, retargeted through <a href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Google Ads campaigns</a>, and tracked in <a href="/services/analytics-reporting" className="text-emerald-600 underline hover:text-emerald-700">real-time reporting dashboards</a> so every event contributes to measurable pipeline growth.
      </p>
      <p>
        If your practice wants predictable in-market visibility and stronger local brand recall, we build and execute a field calendar that aligns with your service priorities and staffing capacity. When you are ready, you can <a href="/book-a-demo" className="text-emerald-600 underline hover:text-emerald-700">book a demo</a> to review activation strategy by location.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📍',
      title: 'Local Event Activation',
      description: 'Pop-up and booth execution at community events, business corridors, and high-traffic local venues.'
    },
    {
      icon: '🤝',
      title: 'Community Partnerships',
      description: 'Strategic collaboration with local businesses, schools, and organizations for trust-based referral lift.'
    },
    {
      icon: '📣',
      title: 'Street Team Messaging',
      description: 'Scripts, handouts, and offer positioning that translate outreach conversations into appointment intent.'
    },
    {
      icon: '📅',
      title: 'Campaign Calendar',
      description: 'Monthly on-site schedules aligned to seasonal demand spikes and service-line priorities.'
    },
    {
      icon: '🔁',
      title: 'Offline-to-Online Retargeting',
      description: 'QR and landing-page pathways that move event traffic into measurable digital remarketing flows.'
    },
    {
      icon: '📊',
      title: 'Attribution Reporting',
      description: 'Track scans, calls, form fills, and appointments tied back to each field activation.'
    }
  ];

  const breakdown = [
    {
      title: 'Market Mapping & Planning',
      items: [
        'Identify priority neighborhoods by patient demand and competitor density',
        'Build event and activation shortlist based on audience fit',
        'Define campaign goals by service line and location',
        'Create monthly outreach calendar with staffing and logistics',
        'Prepare scripts, collateral, and conversion pathways before launch',
        'Set baseline KPIs for lead volume, cost, and booked appointments'
      ]
    },
    {
      title: 'On-Site Execution',
      items: [
        'Run street-level outreach with trained promotional ambassadors',
        'Activate booth experiences and appointment-first calls to action',
        'Use QR-enabled assets for low-friction lead capture',
        'Collect compliant lead details and handoff notes for follow-up',
        'Coordinate real-time updates with front-desk and scheduling teams',
        'Maintain consistent brand standards across every location touchpoint'
      ]
    },
    {
      title: 'Follow-Up & Optimization',
      items: [
        'Launch post-event nurture and reminder sequences for warm leads',
        'Retarget outreach traffic with service-specific paid media',
        'Analyze performance by event type, neighborhood, and message angle',
        'Refine staffing and timing to improve conversion efficiency',
        'Reallocate budget toward highest-ROI activations monthly',
        'Document repeatable playbooks for scale across new markets'
      ]
    }
  ];

  const benefits = [
    'Increase local awareness through high-visibility community presence',
    'Generate qualified appointment demand beyond purely digital channels',
    'Build trust faster through in-person interaction with your brand',
    'Improve campaign efficiency by linking offline efforts to digital attribution',
    'Create repeatable community activation systems for multi-location growth',
    'Strengthen recall in neighborhoods where patients make fast care decisions'
  ];

  const faqs = [
    {
      q: 'What is on-site field marketing for healthcare?',
      a: 'It is structured in-person outreach executed in local communities to generate awareness and appointment demand. This includes event booths, neighborhood activations, partner placements, and direct lead capture tied to clinic booking workflows.'
    },
    {
      q: 'How do you measure ROI from local events?',
      a: 'We use campaign-specific QR links, call tracking, landing pages, and front-desk source tagging. That lets us map each activation to lead volume, appointments booked, and cost-per-acquisition in your reporting dashboard.'
    },
    {
      q: 'Does this replace SEO or paid ads?',
      a: 'No. Field marketing is strongest when combined with digital channels. We use outreach to create immediate community awareness, then reinforce recall through local SEO and paid search so patients can easily find and book later.'
    },
    {
      q: 'Can this work for multi-location healthcare groups?',
      a: 'Yes. We build location-specific calendars and messaging frameworks, then standardize execution and reporting so each clinic can run local activations without losing brand consistency or performance visibility.'
    },
    {
      q: 'How quickly can we launch?',
      a: 'Most campaigns can launch within 2-4 weeks depending on event access, staffing, and creative approvals. We prioritize fast pilot activations first, then scale based on measured performance.'
    },
    {
      q: 'Is this useful for urgent care and specialty clinics?',
      a: 'Yes. Urgent care benefits from neighborhood-level visibility and speed-to-book workflows, while specialty clinics benefit from targeted education-based events and partner networks that produce higher-intent referrals.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <ServicePageTemplate
        title="On-Site Field Marketing"
        excerpt="Street-level patient acquisition through local events and community activations. Turn in-person visibility into measurable appointments and long-term local brand equity."
        image="/17.png"
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
