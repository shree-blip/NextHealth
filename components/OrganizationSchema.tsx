export default function OrganizationSchema() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://thenextgenhealth.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'NextGen Health',
    legalName: 'The NextGen Healthcare Marketing',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/Client-review-image/nexhealth_logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'Full-service healthcare marketing agency specialising in SEO, Google Ads, social media, website design, and HIPAA-compliant marketing automation for clinics and medical practices.',
    email: 'hello@thenextgenhealth.com',
    telephone: '+1-972-848-1153',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3001 Skyway Circle N',
      addressLocality: 'Irving',
      addressRegion: 'TX',
      postalCode: '75038',
      addressCountry: 'US',
    },
    sameAs: [
      'https://www.facebook.com/nexhealthmarketing',
      'https://www.instagram.com/nexhealthmarketing',
      'https://www.linkedin.com/company/nexhealthmarketing',
      'https://twitter.com/nexhealth',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-972-848-1153',
        contactType: 'customer service',
        email: 'hello@thenextgenhealth.com',
        availableLanguage: ['English', 'Spanish'],
        areaServed: 'US',
      },
    ],
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Irving',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
    knowsAbout: [
      'Healthcare Marketing',
      'Medical SEO',
      'Healthcare Google Ads',
      'Healthcare Website Design',
      'HIPAA Compliance',
      'Marketing Automation',
      'Patient Acquisition',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
