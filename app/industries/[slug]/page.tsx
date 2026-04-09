import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustryPageTemplate from '@/components/IndustryPageTemplate';
import { getIndustryBySlug, getAllIndustrySlugs } from '@/lib/industry-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getIndustryBySlug(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    keywords: [data.primaryKeyword, ...data.secondaryKeywords].join(', '),
    alternates: {
      canonical: `https://thenextgenhealth.com/industries/${data.slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://thenextgenhealth.com/industries/${data.slug}`,
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

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const data = getIndustryBySlug(slug);
  if (!data) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.h1,
    description: data.metaDescription,
    serviceType: data.primaryKeyword,
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
      '@type': 'State',
      name: 'Texas',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <IndustryPageTemplate data={data} />
      <Footer />
    </main>
  );
}
