export default function LocalBusinessSchema() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexhealthmarketing.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: 'NexHealth Healthcare Marketing',
    alternateName: 'NexHealth Healthcare Marketing',
    description:
      'Specialized digital healthcare marketing firm for healthcare providers — ERs, urgent care, MedSpas, and wellness clinics. Services include SEO, Google Ads, Meta Ads, web design, and AI-powered marketing automation.',
    url: SITE_URL,
    logo: `${SITE_URL}/Client-review-image/nexhealth_logo.png`,
    image: `${SITE_URL}/Client-review-image/nexhealth_logo.png`,
    email: 'info@nexhealthmarketing.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3811 Turtle Creek Blvd, Suite 600',
      addressLocality: 'Dallas',
      addressRegion: 'TX',
      postalCode: '75219',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.8085,
      longitude: -96.8029,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'State', name: 'Texas' },
    ],
    serviceType: [
      'Healthcare Marketing',
      'Medical SEO',
      'Google Ads Management',
      'Meta Ads Management',
      'Healthcare Website Design',
      'Social Media Marketing',
      'Content Marketing',
      'Email Marketing',
      'Marketing Automation',
    ],
    sameAs: [
      'https://www.facebook.com/nexhealthmarketing',
      'https://www.instagram.com/nexhealthmarketing',
      'https://www.linkedin.com/company/nexhealthmarketing',
      'https://twitter.com/nexhealth',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Healthcare Marketing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SEO & Local Search',
            description: 'Dominate local search results and attract more patients to your practice.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Google Ads',
            description: 'Drive high-intent patient traffic with optimized Google Ads campaigns.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Website Design & Development',
            description: 'HIPAA-aware, conversion-optimized healthcare websites.',
          },
        },
      ],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NexHealth Healthcare Marketing',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
