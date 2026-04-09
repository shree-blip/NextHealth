import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CaseStudyPageTemplate from '@/components/CaseStudyPageTemplate';
import { getCaseStudyBySlug, getAllCaseStudySlugs } from '@/lib/case-study-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getCaseStudyBySlug(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://thenextgenhealth.com/case-studies/${data.slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://thenextgenhealth.com/case-studies/${data.slug}`,
      siteName: 'NextGen Health',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.metaDescription,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const data = getCaseStudyBySlug(slug);
  if (!data) notFound();

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.h1,
    description: data.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'NextGen Health',
      url: 'https://thenextgenhealth.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NextGen Health',
      url: 'https://thenextgenhealth.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thenextgenhealth.com/logo.png',
      },
    },
    mainEntityOfPage: `https://thenextgenhealth.com/case-studies/${data.slug}`,
    about: {
      '@type': 'Service',
      provider: {
        '@type': 'ProfessionalService',
        name: 'NextGen Health',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3001 Skyway Circle N',
          addressLocality: 'Irving',
          addressRegion: 'TX',
          postalCode: '75038',
          addressCountry: 'US',
        },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <CaseStudyPageTemplate data={data} />
      <Footer />
    </main>
  );
}
