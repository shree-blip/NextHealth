import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics & Reporting for Healthcare Marketing | Real-Time Dashboards',
  description: 'Real-time marketing analytics dashboards for healthcare practices. Know exactly what\'s working—appointments booked, revenue driven, and patient acquisition cost.',
  keywords: 'healthcare marketing analytics, medical marketing reports, healthcare marketing ROI, patient acquisition tracking',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/analytics-reporting',
  }
};

export default function AnalyticsReportingPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        &ldquo;We&rsquo;re spending how much on marketing? Where does it go? How many appointments does it generate?&rdquo; These questions plague clinic managers overwhelmed with marketing data. Too many clinics operate on faith&mdash;hoping marketing works but unable to prove it.
      </p>
      <p>
        Our Analytics &amp; Reporting service transforms marketing mystery into measurable science. We implement comprehensive tracking from click to appointment booked, create real-time dashboards showing performance, and generate monthly reports translating data into actionable insights.
      </p>
      <p>
        You&rsquo;ll know exactly how much each channel&mdash;from <a href="/services/google-ads" className="text-emerald-600 underline hover:text-emerald-700">Google Ads</a> to <a href="/services/seo-local-search" className="text-emerald-600 underline hover:text-emerald-700">local SEO</a>&mdash;costs and how many appointments it generates. This data drives the optimization decisions behind your <a href="/services/strategy-planning" className="text-emerald-600 underline hover:text-emerald-700">strategic marketing roadmap</a> for maximum ROI.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📊',
      title: 'Real-Time Dashboards',
      description: 'Custom dashboards showing daily marketing performance, lead volume, and conversion metrics.'
    },
    {
      icon: '📈',
      title: 'Conversion Tracking',
      description: 'End-to-end tracking from ad click through website visit to appointment booked.'
    },
    {
      icon: '💰',
      title: 'ROI Attribution',
      description: 'Clear attribution showing which channels drive appointments and revenue.'
    },
    {
      icon: '📅',
      title: 'Monthly Reporting',
      description: 'Comprehensive monthly reports with performance analysis and recommendations.'
    },
    {
      icon: '🔍',
      title: 'Competitor Benchmarking',
      description: 'Your performance vs. industry benchmarks identifying areas for improvement.'
    },
    {
      icon: '🎯',
      title: 'Predictive Analytics',
      description: 'Forecasting and trend analysis enabling proactive strategy adjustments.'
    }
  ];

  const breakdown = [
    {
      title: 'Tracking Implementation',
      items: [
        'Google Analytics 4 setup with healthcare-compliant tracking',
        'Phone number tracking capturing calls and qualified leads',
        'Form submission tracking capturing email, contact info, and inquiries',
        'Appointment booking tracking tied to specific marketing channels and campaigns',
        'Revenue tracking (if available through Point of Sale system)',
        'Google Ads conversion tracking measuring clicks to appointments',
        'Meta Ads pixel implementation measuring social engagement and conversions',
        'Feature-level tracking: identifying which pages and content convert best'
      ]
    },
    {
      title: 'Dashboard & Real-Time Monitoring',
      items: [
        'Marketing metrics dashboard: clicks, impressions, CTR by channel',
        'Lead generation dashboard: lead volume, sources, conversion rates',
        'Appointment dashboard: appointments booked, CPA, by channel and time period',
        'Revenue dashboard: revenue driven, value per appointment, ROI by channel',
        'Channel comparison dashboard: side-by-side performance across SEO, Paid, Social, Email',
        'Trend visualization: week-over-week and month-over-month performance changes',
        'Date range filters: daily, weekly, monthly views enabling quick analysis'
      ]
    },
    {
      title: 'Monthly Reporting & Analysis',
      items: [
        'Executive summary: key metrics, winners, and concerns at-a-glance',
        'Channel performance: detailed metrics for each marketing channel',
        'Campaign analysis: which campaigns performed best and why',
        'Attribution analysis: how customers discover you (keyword, source, content)',
        'Trend analysis: what\'s improving/declining and why',
        'Competitor benchmarking: your metrics vs. healthcare industry averages',
        'Recommendations: specific optimization opportunities and next month priorities'
      ]
    },
    {
      title: 'Analytics Optimization & Enhancement',
      items: [
        'Custom event tracking for healthcare-specific actions and milestones',
        'Audience segmentation: analyzing performance by demographic, location, service',
        'Cohort analysis: comparing appointment quality and lifetime value by source',
        'Retention tracking: how many patients return for repeat appointments',
        'Quarterly business reviews: deep dives into strategic performance',
        'Predictive modeling: forecasting patient acquisition and revenue trends',
        'HIPAA-compliant data handling: patient data anonymized and securely stored'
      ]
    }
  ];

  const benefits = [
    'Know exactly which marketing channels drive appointments and revenue',
    'Make data-driven budget allocation decisions instead of guessing',
    'Identify optimization opportunities enabling continuous improvement',
    'Prove marketing ROI to clinic stakeholders and board members',
    'Spot trends early enabling proactive strategy adjustments',
    'Benchmark performance against industry standards',
    'Connect marketing efforts to actual patient acquisition and revenue impact'
  ];

  const faqs = [
    {
      q: 'How do we track phone calls?',
      a: 'We implement call tracking by assigning unique phone numbers to different marketing campaigns or channels. When someone calls, we capture caller info and which number they dialed, attributing the call to that marketing source. Advanced tracking can even record and transcribe calls. HIPAA compliance is maintained by not recording health information, only call details.'
    },
    {
      q: 'Can we track which Google searcher becomes an appointment?',
      a: "Not directly—Google Ads doesn't identify specific individuals. However, we can track aggregate performance: \"Google Ads drove 157 website visitors, 23 clicked the appointment form, 8 booked appointments, $2,000 revenue.\" We cannot say \"person X searched and booked.\"  We focus on aggregate channel performance rather than individual tracking."
    },
    {
      q: 'What is cost-per-acquisition (CPA)?',
      a: 'CPA is total marketing spend divided by appointments generated. Example: $5,000 spent on Google Ads generating 20 appointments = $250 CPA. If your average appointment revenue is $500+, that\'s profitable ($250 spend for $500 revenue = 2:1 ROI). CPA varies by service—emergency room CPA might be $100, specialty procedures $500+.'
    },
    {
      q: 'Should we track revenue or just appointments?',
      a: 'Both. Appointment count shows volume. Revenue shows quality. An expensive service generating many high-revenue appointments is more valuable than many low-revenue appointments. If possible, track appointment value by type (ER visit vs. cosmetic consultation) to compare true profitability by channel.'
    },
    {
      q: 'How can we improve conversion rate?',
      a: 'Common improvements: (1) Faster website load times, (2) Clearer call-to-action buttons, (3) Simplified appointment booking (fewer form fields), (4) Mobile optimization, (5) Relevant landing pages (ad-to-page matching), (6) Live chat for questions, (7) Phone number as direct call link. We test each systematically.'
    },
    {
      q: 'What if we can\'t attribute every appointment to a marketing channel?',
      a: 'Common reality—some patients find you through word-of-mouth or direct brand recall (not tied to specific campaigns). We track attributed appointments showing definite sources, then note the gap. The gap represents organic/word-of-mouth—usually a good sign of satisfied patients referring others. We focus on improving attributed channels while monitoring overall patient growth.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{"__html": JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Analytics & Reporting"})}} />
      <Navbar />
      <ServicePageTemplate
        title="Healthcare Analytics & Reporting"
        excerpt="Real-time dashboards showing exactly what's working. Know your cost-per-appointment and optimize marketing for maximum ROI."
        image="/11.png"
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
