import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Design & Development for Healthcare | Conversion-Optimized Websites',
  description: 'Fast, beautiful, conversion-optimized websites for medical practices. HIPAA-compliant healthcare web design that turns visitors into appointments.',
  keywords: 'medical website design, healthcare web development, doctor website, clinic website design, HIPAA-compliant web design',
  alternates: {
    canonical: 'https://thenextgenhealth.com/services/website-design-dev',
  }
};

export default function WebsiteDesignDevPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Your website is your clinic's digital front door. When patients search for you online—and they do before calling—your website is their first impression. It must be professional, fast, mobile-friendly, and clearly communicate why they should choose your clinic.
      </p>
      <p>
        Healthcare websites have unique challenges: HIPAA compliance is mandatory, patients need specific information to make decisions, security must be bulletproof, and every element should drive appointment bookings. Many healthcare websites fail on all counts—slow, outdated, confusing, non-compliant.
      </p>
      <p>
        Our Website Design & Development service builds beautiful, fast, secure, conversion-optimized healthcare websites. We combine stunning design with healthcare-specific functionality, compliance, and SEO optimization. Every page is built to inform patients and drive them toward appointment booking.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '⚡',
      title: 'Lightning-Fast Performance',
      description: 'Sub-2-second load times with Core Web Vitals optimization for user experience and SEO.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Fully responsive design optimized for mobile patients on-the-go searching nearby clinics.'
    },
    {
      icon: '🔒',
      title: 'HIPAA Compliance',
      description: 'Secure infrastructure, encrypted data, Business Associate Agreements with all vendors.'
    },
    {
      icon: '📅',
      title: 'Appointment Booking Integration',
      description: 'Seamless integration with your scheduling system enabling direct online booking.'
    },
    {
      icon: '🎯',
      title: 'Conversion Optimization',
      description: 'Every page designed to guide visitors toward appointment booking action.'
    },
    {
      icon: '📊',
      title: 'Analytics & Tracking',
      description: 'Complete setup of goal tracking, conversion measurement, and performance dashboards.'
    }
  ];

  const breakdown = [
    {
      title: 'Website Architecture & Pages',
      items: [
        'Homepage: compelling headline, key services, provider bios, appointment CTA above fold',
        'Service pages: one per procedure/service explaining benefits, process, outcomes, pricing',
        'Provider bios: credentialed staff profiles building trust and patient-provider matching',
        'About/History: clinic story, mission, values, and founding narrative building connection',
        'Patient information: insurance, billing, privacy policy, HIPAA notices, FAQ',
        'Online appointment booking: integrated with scheduling system allowing 24/7 booking',
        'Blog/patient education: regularly updated content for SEO and patient education',
        'Contact: multiple contact methods (phone, email, contact form, chat, directions)'
      ]
    },
    {
      title: 'Design & User Experience',
      items: [
        'Professional, modern design reflecting clinic brand and building credibility',
        'Clear information hierarchy ensuring important info is scanned quickly',
        'Trust signals: credentials, reviews, awards, accreditations prominently displayed',
        'Patient journey optimization: guiding visitors from awareness to appointment booking',
        'Accessibility compliance: WCAG AA standard for people with disabilities to access site',
        'Speed optimization: Core Web Vitals passed, typically under 2-second load time',
        'Mobile optimization: touch-friendly buttons, readable fonts, minimal zooming needed'
      ]
    },
    {
      title: 'Security & Compliance',
      items: [
        'HTTPS SSL encryption for all data transmission',
        'HIPAA-compliant form handling with secure data encryption',
        'Business Associate Agreements with hosting and all service providers',
        'Regular security audits and vulnerability assessments',
        'Automated backups and disaster recovery planning',
        'Privacy policy and Terms of Service specific to healthcare',
        'Compliant patient consent forms for communications'
      ]
    },
    {
      title: 'Functionality & Integration',
      items: [
        'Appointment booking integration with your EHR/scheduling system',
        'Multiple appointment types customized for different services',
        'Patient portal for account creation, history, records access',
        'Live chat functionality for immediate patient questions',
        'Phone click-to-call conversion for mobile users',
        'Email capture and CRM integration for patient nurturing',
        'Payment processing integration for invoice viewing and online payment',
        'Google My Business and local SEO integration'
      ]
    }
  ];

  const benefits = [
    'Create professional first impression converting more online visitors to appointment inquiries',
    'Rank better in Google with fast, mobile-optimized, secure website architecture',
    'Reduce no-shows with online appointment booking and automated reminder systems',
    'Build patient trust through professional design conveying credibility and expertise',
    'Support 24/7 patient inquiries through online booking able to handle appointments any time',
    'Maintain HIPAA compliance protecting both patient data and clinic liability',
    'Gather analytics showing which pages convert best enabling continuous optimization'
  ];

  const faqs = [
    {
      q: 'How long does a website build take?',
      a: 'A typical healthcare website takes 8-12 weeks: 1-2 weeks planning, 4-6 weeks design, 2-3 weeks development, 1-2 weeks testing and launch. Timeline depends on complexity, integrations needed, and content availability. We can accelerate with prepared content and clear decision-making.'
    },
    {
      q: 'Can we keep our existing website and just update it?',
      a: 'Sometimes. If the existing site has good SEO authority and architecture, updating is cheaper than rebuilding. However, most healthcare websites are built on outdated platforms (WordPress, Wix) that are slow and hard to optimize. Modern platforms (Next.js, Gatsby) are faster and more secure. We assess existing site quality and recommend rebuild vs. refresh.'
    },
    {
      q: 'Can patients see medical records through the website?',
      a: 'Yes, patient portals are possible and HIPAA-compliant. Patients log in securely to view their medical records, appointment history, prescriptions, test results. This requires integration with your EHR system. Not all clinics implement patient portals, but they improve patient satisfaction and reduce administrative calls.'
    },
    {
      q: 'Should we collect patient information on the website?',
      a: 'Yes, strategically. Collect name, email, phone, and appointment request. Avoid collecting health information on-site unless you have secure mechanisms. Use intelligent forms that collect info over multiple pages (progressive profiling) rather than one overwhelming form. Every form field reduces completion rate by 3-5%.'
    },
    {
      q: 'How do we manage website updates?',
      a: 'We set up content management system (CMS) enabling you to update pages, blog posts, and appointments without coding. We train staff on content updates. For significant redesigns or technical changes, you\'ll want ongoing support. We offer maintenance retainers handling updates, security patches, and optimization.'
    },
    {
      q: 'What about SEO on the website?',
      a: 'SEO is built into website architecture from day one. We implement technical SEO (site speed, mobile optimization, structured data), on-page SEO (keywords, headers, meta tags), and local SEO (Google Business Profile integration, schema markup). Website is just the foundation—ongoing content and link building drive rankings. We include 3-6 months of SEO support.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{"__html": JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Website Design & Development"})}} />
      <Navbar />
      <ServicePageTemplate
        title="Website Design & Dev"
        excerpt="Fast, beautiful, conversion-optimized healthcare websites. HIPAA-compliant web design that turns visitors into booked appointments."
        image="/9.png"
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
