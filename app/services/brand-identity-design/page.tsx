import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePageTemplate from '@/components/ServicePageTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Identity Design for Healthcare | Logos & Medical Branding',
  description: 'Professional brand identity design for healthcare practices. Creating logos and brands that build instant patient trust and differentiate you from competitors.',
  keywords: 'medical logo design, healthcare branding, clinic brand identity, doctor branding, medical practice logo',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/services/brand-identity-design',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Brand Identity Design",
  "description": "Professional brand identity and logo design for healthcare practices."
};

export default function BrandIdentityDesignPage() {
  const content = (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      <p>
        When a patient enters your clinic or sees your logo online, they form immediate impressions of competence, trustworthiness, and professionalism based on visual branding. A weak, generic, or outdated brand says "we don't invest in quality." A strong, cohesive brand says "you're in good hands."
      </p>
      <p>
        Brand identity is far more than a logo. It's color psychology, typography choices, visual consistency, tone of voice, and the entire patient experience. Healthcare patients are making vulnerable, important health decisions. Your brand must project competence, empathy, professionalism, and trust.
      </p>
      <p>
        Our Brand Identity Design service develops comprehensive brand systems for healthcare practices: custom logos, color palettes, typography, imagery style, and brand guidelines ensuring visual consistency across all touchpoints from website to business cards to signage to social media.
      </p>
    </div>
  );

  const coreFeatures = [
    {
      icon: '🎨',
      title: 'Custom Logo Design',
      description: 'Professionally designed logos conveying medical expertise, trust, and clinic personality.'
    },
    {
      icon: '🌈',
      title: 'Color & Typography System',
      description: 'Psychological color selection and brand-appropriate font families ensuring consistency.'
    },
    {
      icon: '📋',
      title: 'Brand Guidelines',
      description: 'Comprehensive documentation on logo usage, colors, fonts, imagery, and tone of voice.'
    },
    {
      icon: '📸',
      title: 'Photography & Imagery Style',
      description: 'Guidelines for professional clinic photography conveying warmth, professionalism, and accessibility.'
    },
    {
      icon: '🎯',
      title: 'Brand Strategy',
      description: 'Positioning strategy, messaging pillars, and brand personality aligned with target patients.'
    },
    {
      icon: '🖨️',
      title: 'Brand Collateral',
      description: 'Business cards, letterhead, templates, and digital assets maintaining consistent brand.'
    }
  ];

  const breakdown = [
    {
      title: 'Discovery & Strategy',
      items: [
        'Deep-dive brand audit: current brand, perception, competitive position',
        'Target patient interviews understanding how brand influences decisions',
        'Competitive analysis: visual branding strategies of competing clinics',
        'Brand personality development: defining clinic voice, values, and character',
        'Positioning strategy: unique value proposition and brand differentiation',
        'Messaging framework: key brand messages and communication pillars',
        'Mood boarding: visual inspiration and aesthetic direction'
      ]
    },
    {
      title: 'Visual Identity Design',
      items: [
        'Logo design (3-5 concepts refined through feedback iterations)',
        'Logo variations: full, horizontal, vertical, and icon-only versions',
        'Color palette selection (primary, secondary, accent, neutral colors)',
        'Color psychology ensuring brand colors convey appropriate healthcare message',
        'Typography pairing: primary heading font + body text font + accent font',
        'Icon system and graphic patterns for consistent visual language',
        'Photography style guide: color grading, composition, tone for clinic imagery'
      ]
    },
    {
      title: 'Brand Guidelines & Documentation',
      items: [
        'Comprehensive brand guidelines document (30-50 pages typically)',
        'Logo usage: clear space, minimum sizes, color variations, misuse examples',
        'Color specifications: hex codes, RGB values, CMYK for print',
        'Typography: font names, sizes, weights, line spacing, usage rules',
        'Imagery guidelines: photography style, composition, color treatment',
        'Tone of voice: writing style, terminology, patient communication principles',
        'Application examples: website, social media, print, signage mockups'
      ]
    },
    {
      title: 'Brand Implementation & Collateral',
      items: [
        'Business card design featuring brand identity',
        'Letterhead and envelope templates for professional correspondence',
        'Email signature templates with brand logo and contact information',
        'Microsoft Office templates (Word, PowerPoint, Excel) with brand styling',
        'Social media templates: profile headers, post templates, story templates',
        'Presentation templates for patient education and staff training materials',
        'Signage and environmental design: lobby signage, door decals, etc.'
      ]
    }
  ];

  const benefits = [
    'Create instant professional credibility and patient trust through strong visual branding',
    'Differentiate from competitors through distinctive, memorable brand identity',
    'Maintain consistent experience across all patient touchpoints (digital and physical)',
    'Establish emotional connection through strategic brand personality and messaging',
    'Communicate clinic values and specialties through thoughtful visual design',
    'Enable easy brand implementation for staff through clear guidelines',
    'Build brand equity over time creating increasing patient loyalty and recognition'
  ];

  const faqs = [
    {
      q: 'Why should we invest in professional brand design?',
      a: 'Weak branding costs more in lost patients than professional design costs. Patients perceive professional branding as indicator of clinical quality. Studies show strong branding increases perceived value by 20-30%, can justify higher pricing, and improves patient retention. It\'s an investment that pays dividends in patient acquisition and loyalty.'
    },
    {
      q: 'How do we involve staff in brand development?',
      a: 'We conduct staff interviews to understand internal culture and values. We present concepts and gather feedback. Strong brands are authentic—reflecting clinic reality, not just external marketing. Staff should see themselves in the final brand identity. We recommend involving clinic leadership and a sample of front-desk and clinical staff.'
    },
    {
      q: 'Can we keep our existing logo but update branding?',
      a: 'Sometimes yes, if the logo is strong and patients recognize it. However, dated logos actually harm perception. Most clinics benefit from a fresh logo design. We analyze existing logo effectiveness—if it\'s working, we might refresh it. If it\'s dated or poorly designed, starting fresh delivers better results.'
    },
    {
      q: 'How many logo concepts should we see?',
      a: 'We typically present 3-5 distinct concepts representing different strategic directions. This gives options without overwhelming decision-making. Each concept is explained strategically showing why that direction aligns with brand positioning. We then refine the preferred direction through 2-3 revision rounds.'
    },
    {
      q: 'Who owns the brand identity after completion?',
      a: 'You do. All brand files and guidelines belong to your clinic. We provide high-resolution logos in all formats (AI, PNG, SVG, PDF), color specifications, font files, and complete documented brand guidelines. You can use these with any vendor—internal staff, future agencies, printers, web developers. It\'s yours to implement.'
    },
    {
      q: 'How often should we rebrand?',
      a: 'Strong brands last 10-20 years. Minor refreshes every 5-7 years keep branding current without confusing patients. Major overhauls should be rare—only when clinic positioning fundamentally changes. Over-branding wastes money and confuses patients. Stability and consistency matter more than newness.'
    }
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      <ServicePageTemplate
        title="Brand Identity Design"
        excerpt="Logos and brands that make patients trust you instantly. Comprehensive brand identity design creating visual consistency across all clinic touchpoints."
        image="/7.png"
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
