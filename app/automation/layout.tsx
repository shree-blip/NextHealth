import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Automation & Free N8N Templates | NextGen Health',
  description:
    'HIPAA-compliant marketing automation for healthcare. AI chatbots, patient intake, review collection, appointment reminders, and free N8N workflow templates for clinics.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/automation',
  },
  openGraph: {
    title: 'Healthcare Marketing Automation | NextGen Health',
    description:
      'HIPAA-compliant marketing automation for healthcare — AI chatbots, patient intake, review collection, and free N8N templates.',
    url: 'https://thenextgenhealth.com/automation',
    siteName: 'NextGen Health',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Marketing Automation | NextGen Health',
    description: 'HIPAA-compliant automation for healthcare practices.',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Healthcare Automation",
  "provider": {
    "@type": "ProfessionalService",
    "name": "The NextGen Healthcare Marketing",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  },
  "description": "AI-driven patient intake, automated scheduling, HIPAA-compliant chatbots, and free N8N workflow templates for medical practices."
};

export default function AutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
