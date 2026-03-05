import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brochure & Print Design for Healthcare | Premium Medical Materials',
  description: 'Professional brochure and print design for medical practices. Premium materials that elevate your practice and extend your digital branding to offline touchpoints.',
  keywords: 'healthcare brochure design, medical print design, clinic flyers, patient education materials, healthcare collateral',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/brochure-print-design',
  }
};

export default function BrochurePrintDesignPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        In an increasingly digital world, physical print materials remain powerful touchpoints. A well-designed brochure in the waiting room educates patients about services. A premium business card leaves a lasting impression. Patient education materials reinforce treatment information. Print materials extend your <a href="/services/brand-identity-design" className="text-emerald-600 underline hover:text-emerald-700">brand identity</a> beyond the screen.
      </p>
      <p>
        However, print design needs different thinking than digital. Physical materials must work without internet, be read at various distances, and often serve multiple purposes. Healthcare print must be accessible, credible, and professionally executed&mdash;cheap-looking materials undermine clinic credibility.
      </p>
      <p>
        Our Brochure &amp; Print Design service creates comprehensive print collateral aligned with your brand and marketing goals. From waiting room brochures backed by expert <a href="/services/content-copywriting" className="text-emerald-600 underline hover:text-emerald-700">healthcare copywriting</a> to patient education handouts, we design materials that inform, engage, and reinforce the same visual identity patients see on your <a href="/services/website-design-dev" className="text-emerald-600 underline hover:text-emerald-700">website</a>.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '📖',
      title: 'Brochure Design',
      description: 'Tri-fold, bi-fold, or custom brochures showcasing clinic services and benefits.'
    },
    {
      icon: '🎯',
      title: 'Patient Education Materials',
      description: 'Handouts and guides explaining procedures, conditions, and post-care instructions.'
    },
    {
      icon: '🖨️',
      title: 'Marketing Collateral',
      description: 'Business cards, flyers, postcards, and promotional materials driving patient action.'
    },
    {
      icon: '📋',
      title: 'Forms & Templates',
      description: 'Patient intake, consent, and informational forms maintaining brand consistency.'
    },
    {
      icon: '📸',
      title: 'Print Production Management',
      description: 'Vendor selection, proofing, and quality assurance ensuring professional printing.'
    },
    {
      icon: '♿',
      title: 'Accessibility & Compliance',
      description: 'ADA-compliant readable fonts and healthcare messaging compliance.'
    }
  ];

  const breakdown = [
    {
      title: 'Brochure Design & Messaging',
      items: [
        'Service-specific brochures (one per major service or procedure offered)',
        'Clinic overview brochure introducing practice, providers, and facilities',
        'New patient welcome brochure with appointment information and introduction',
        'Compelling copywriting highlighting benefits and addressing patient concerns',
        'Professional photography or illustration aligned with brand visual identity',
        'Clear information hierarchy ensuring key information stands out',
        'Call-to-action buttons directing readers to website or encouraging appointment booking'
      ]
    },
    {
      title: 'Patient Education & Care',
      items: [
        'Pre-procedure education guides: what to expect, how to prepare, what to bring',
        'Post-procedure care instructions with timeline and symptom monitoring',
        'Condition-specific educational materials explaining diagnosis and treatment options',
        'Medication and side effect information sheets in patient-friendly language',
        'Lifestyle and wellness guides supporting long-term health outcomes',
        'Treatment comparison guides (e.g., surgical vs. non-surgical options)',
        'Insurance and billing information guides explaining costs and payment options'
      ]
    },
    {
      title: 'Marketing & Promotional Materials',
      items: [
        'Business cards with clinic logo, provider info, and appointment scheduling method',
        'Flyers promoting new services, special offers, or seasonal wellness campaigns',
        'Postcards for direct mail campaigns targeting potential patients',
        'Door hangers for community outreach and clinic promotion',
        'Banners and signage for waiting room and clinic exterior',
        'Raffle prize tickets and promotional giveaways with clinic branding',
        'Event materials: program booklets, tickets, schedules for clinic sponsorships'
      ]
    },
    {
      title: 'Forms & Administrative Materials',
      items: [
        'Patient intake forms with clinic branding and organized field layouts',
        'HIPAA privacy notice and consent forms in accessible format',
        'Medical history and health questionnaire forms',
        'Appointment reminder postcards and thank-you cards',
        'Staff uniforms, badges, and identification with consistent branding',
        'Stationery: letterhead, envelopes, prescription pads, notepads',
        'Chart labels, folder tabs, and record keeping materials'
      ]
    }
  ];

  const benefits = [
    'Extend brand identity into physical spaces reinforcing consistent messaging',
    'Educate patients with professionally designed materials building confidence',
    'Create tangible reminders of clinic experience patients take home',
    'Differentiate from competitors through premium print quality',
    'Support patient retention through helpful educational materials',
    'Enable staff to share information professionally without memorization',
    'Track marketing effectiveness through printed call-to-action codes'
  ];

  const faqs = [
    {
      q: 'How many copies should we print?',
      a: 'Print volume depends on distribution. Waiting room brochures: 500-2,000 every 3-6 months depending on patient volume. Business cards: 1,000-2,000 annually. Patient education: 100-500 per type. Print in sizes aligned with distribution frequency—over-printing wastes money, under-printing creates stockouts. We recommend starting smaller and reprinting frequently to keep content current.'
    },
    {
      q: 'What format works best for patient education?',
      a: 'Single-page (front/back) handouts are optimal—patients actually read short materials (1,000-1,500 words). Multi-page booklets risk ending up in trash unread. Use headers, bullet points, and white space for readability. Include clinic logo and contact info so handouts continue marketing after leaving clinic.'
    },
    {
      q: 'Should print materials direct to your website?',
      a: 'Yes. Include QR codes linking to digital versions or more information. Include your website URL and clinic phone. Print should direct patients to digital touchpoints where you can capture contact info. This bridges offline and online marketing creating integrated patient journeys.'
    },
    {
      q: 'How often should we update printed materials?',
      a: 'Service and pricing information: annually or when changes occur. Educational materials: every 2-3 years or when clinical guidelines change. Branding/design materials: every 5-7 years for major refreshes. Don\'t reprint old designs—print costs are low enough to refresh frequently. Outdated materials harm clinic credibility.'
    },
    {
      q: 'What paper stock should we use?',
      a: 'For brochures: 100-120 lb cardstock for durability. For handouts: 80-100 lb text weight. For business cards: 16 pt thick cardstock. Higher weight feels premium but costs more. Matt finish is most professional for healthcare; glossy can feel salesy. We recommend quality paper—cheap paper immediately signals poor practice quality.'
    },
    {
      q: 'Can we handle printing ourselves?',
      a: 'Small quantity printing (100-200 copies) can be done in-office. However, professional print vendors produce higher quality at lower per-unit cost for larger quantities. They handle color management, paper quality, binding, and finishing professionally. For marketing materials, professional printing is worth the investment.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{"__html": JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Brochure & Print Design"})}} />
      <Navbar />
      <ServicePageTemplate
        title="Healthcare Brochure & Print Design"
        excerpt="Premium print materials that elevate your practice. Professional brochures and patient education materials that extend your brand into physical spaces."
        image="/8.png"
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
