import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AutomationPageTemplate from '@/components/AutomationPageTemplate';
import { getAutomationBySlug, getAllAutomationSlugs } from '@/lib/automation-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllAutomationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getAutomationBySlug(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    keywords: [data.primaryKeyword, ...data.secondaryKeywords].join(', '),
    alternates: {
      canonical: `https://thenextgenhealth.com/automation/${data.slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://thenextgenhealth.com/automation/${data.slug}`,
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

export default async function AutomationPage({ params }: Props) {
  const { slug } = await params;
  const data = getAutomationBySlug(slug);
  if (!data) notFound();

  // HowTo schema for the workflow steps
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.h1,
    description: data.metaDescription,
    step: data.steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.title,
      text: step.description,
    })),
  };

  // FAQ schema
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

  // SoftwareApplication schema for the automation tool
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.h1,
    description: data.metaDescription,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Included with NextGen Health marketing plans',
    },
    provider: {
      '@type': 'Organization',
      name: 'NextGen Health',
      url: 'https://thenextgenhealth.com',
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <Navbar />
      <AutomationPageTemplate data={data} />
      <Footer />
    </main>
  );
}
