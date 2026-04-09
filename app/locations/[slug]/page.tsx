import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LocationPageTemplate from '@/components/LocationPageTemplate';
import { getLocationBySlug, getAllLocationSlugs } from '@/lib/location-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getLocationBySlug(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://thenextgenhealth.com/locations/${data.slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://thenextgenhealth.com/locations/${data.slug}`,
      siteName: 'NextGen Health',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.metaDescription,
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const data = getLocationBySlug(slug);
  if (!data) notFound();

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Healthcare Marketing in ${data.city}, TX`,
    description: data.metaDescription,
    serviceType: 'Healthcare Digital Marketing',
    provider: {
      '@type': 'ProfessionalService',
      name: 'NextGen Health',
      url: 'https://thenextgenhealth.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3001 Skyway Circle N',
        addressLocality: 'Irving',
        addressRegion: 'TX',
        postalCode: '75038',
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'City',
      name: data.city,
      containedInPlace: {
        '@type': 'State',
        name: 'Texas',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <LocationPageTemplate data={data} />
      <Footer />
    </main>
  );
}
