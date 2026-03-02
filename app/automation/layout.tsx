import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Automation & Free N8N Templates | NexHealth Healthcare Marketing',
  description: 'Download free, HIPAA-ready N8N automation templates for healthcare practices. Patient intake, appointment reminders, review collection, insurance verification, AI chatbots, and more.',
  alternates: {
    canonical: 'https://nexhealthmarketing.com/automation',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Healthcare Automation",
  "provider": {
    "@type": "ProfessionalService",
    "name": "NexHealth Healthcare Marketing",
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
