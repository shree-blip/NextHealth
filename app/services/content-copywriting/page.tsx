import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content & Copywriting for Healthcare | Patient Education Content',
  description: 'Healthcare content and copywriting that educates, engages, and converts. E-E-A-T optimized medical content building trust and authority.',
  keywords: 'healthcare content marketing, medical copywriting, patient education content, healthcare blog, doctor content strategy',
  alternates: {
    canonical: 'https://nextgenmarketing.agency/services/content-copywriting',
  }
};

export default function ContentCopywritingPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        Content is how you answer patient questions, establish authority, build trust, and drive search engine rankings. Patients research healthcare decisions online—they're reading about conditions, comparing providers, looking for reassurance before appointments.
      </p>
      <p>
        However, healthcare content has unique challenges: medical accuracy is non-negotiable, regulatory compliance (FDA, FTC) applies, E-E-A-T signals (Expertise, Experience, Authoritativeness, Trustworthiness) are critical for Google rankings, and tone must balance professionalism with empathy.
      </p>
      <p>
        Our Content & Copywriting service combines medical accuracy with compelling, conversion-focused writing. Every piece of content is optimized for search engines, written for patient understanding (avoiding jargon), and designed to convert readers into patients.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '✍️',
      title: 'Medical Content Writing',
      description: 'Accurate, patient-friendly content explaining conditions, treatments, and procedures.'
    },
    {
      icon: '🔍',
      title: 'SEO-Optimized Content',
      description: 'Content designed for Google ranking on medical keywords your target patients search.'
    },
    {
      icon: '📚',
      title: 'Patient Education',
      description: 'Comprehensive educational content building confidence and informed decision-making.'
    },
    {
      icon: '💬',
      title: 'Conversion Copywriting',
      description: 'Persuasive copy addressing patient concerns and calling them toward booking.'
    },
    {
      icon: '📰',
      title: 'Blog & News Strategy',
      description: 'Regular blog content keeping site fresh for SEO and providing patient value.'
    },
    {
      icon: '🎯',
      title: 'E-E-A-T Authority',
      description: 'Content demonstrating expertise, experience, authoritativeness, and trustworthiness.'
    }
  ];

  const breakdown = [
    {
      title: 'Service Page Copywriting',
      items: [
        'Benefits-focused headlines addressing patient pain points and desires',
        'What-is-it-and-why-you-care open: explaining service and its relevance',
        'Process walkthrough: demystifying procedure and reducing anxiety',
        'Success stories and outcomes: patient testimonials and result data',
        'Provider credentials: qualifications, board certifications, experience',
        'Safety and aftercare: addressing patient concerns proactively',
        'Call-to-action copy: compelling language encouraging appointment booking'
      ]
    },
    {
      title: 'Patient Education Content',
      items: [
        'Condition overview pages: explaining what condition is, prevalence, causes',
        'Treatment comparison guides: pros/cons of different treatment options',
        'Pre-procedure guides: how to prepare, what to expect, what to bring',
        'Post-procedure care: recovery timeline, activity restrictions, warning signs',
        'Medication guides: common medications, side effects, interactions',
        'Wellness and prevention: lifestyle changes supporting health outcomes',
        'FAQ pages: answering common patient questions comprehensively'
      ]
    },
    {
      title: 'SEO & Blog Content Strategy',
      items: [
        'Keyword research identifying high-value search terms for your services',
        'Content calendar: strategic topics aligned with patient search behavior',
        'Long-form blog posts: 2,000+ words ranking for competitive keywords',
        'Topic clusters: related content interconnected for SEO authority',
        'Seasonal content: timely topics (flu season, allergies, etc.) driving traffic',
        'Local content: city/area-specific information attracting local patients',
        'Technical SEO in content: proper headers, metadata, link structure'
      ]
    },
    {
      title: 'E-E-A-T & Medical Accuracy',
      items: [
        'Medical accuracy: content reviewed by clinical staff for accuracy',
        'Credential display: author bios showing medical credentials and experience',
        'Source citations: linking to medical research and authoritative sources',
        'Regulatory compliance: FDA/FTC disclaimers and healthcare regulations',
        'YMYL expertise: content demonstrating healthcare knowledge and authority',
        'Updating old content: keeping medical information current and relevant',
        'Fact-checking: verifying claims against current medical evidence'
      ]
    }
  ];

  const benefits = [
    'Attract patients through search for health-related topics with educational content',
    'Build trust and credibility by demonstrating medical expertise and authority',
    'Reduce patient anxiety through clear, thorough explanations',
    'Enable patient decision-making by comparing treatment options',
    'Support appointment booking through persuasive copy addressing objections',
    'Rank better in Google with comprehensive, authoritative medical content',
    'Reduce appointments prep time as informed patients need less education'
  ];

  const faqs = [
    {
      q: 'Can we use medical information from other websites or resources?',
      a: 'No—copying is plagiarism and harms SEO (Google penalizes duplicated content). We write original content inspired by research but written from scratch. We properly cite sources using links rather than copying text. Original, well-written content ranks better anyway.'
    },
    {
      q: 'Who should review content for medical accuracy?',
      a: 'A clinical staff member (provider, nurse, clinical coordinator) should review content. They verify medical accuracy and appropriateness of patient-facing messaging. We provide draft content, clinic reviews and corrects, we finalize. This collaborative process ensures accuracy and clinic alignment.'
    },
    {
      q: 'How long should blog posts be?',
      a: 'Longer content typically ranks better: 2,000+ words for competitive keywords. However, readability matters—2,000 words of filler ranks poorly. We write comprehensive content of appropriate length to thoroughly cover topics. Some topics need 500 words; others need 3,000. Quality and completeness matter more than word count.'
    },
    {
      q: 'Should we feature provider bios prominently?',
      a: 'Yes. Provider credentials and experience build trust. E-E-A-T signals include author expertise, so bylines should include provider names and credentials. Include "About [Provider]: [credentials and background]." Photos also help. Real people with verifiable credentials build more trust than anonymous clinic voices.'
    },
    {
      q: 'How often should we publish new blog content?',
      a: 'Google rewards active, regularly updated sites. We recommend 1 blog post every 1-2 weeks (bi-weekly minimum). Less frequent publishing (monthly) still helps but misses SEO momentum. Quality trumps quantity—one excellent piece beats four mediocre ones. Focus on sustainable publishing schedule you can maintain long-term.'
    },
    {
      q: 'Can we reuse content across multiple pages?',
      a: 'No—Google penalizes duplicate content, hurting SEO. Each page needs unique content. However, you can reference and link between related pages. Write unique content for each page, then link them together contextually. This creates content depth for readers and helps Google understand topic relationships.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{"__html": JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Content & Copywriting"})}} />
      <Navbar />
      <ServicePageTemplate
        title="Content & Copywriting"
        excerpt="Healthcare content that educates, engages, and converts. E-E-A-T optimized medical content that ranks in Google and builds patient trust."
        image="/12.png"
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
