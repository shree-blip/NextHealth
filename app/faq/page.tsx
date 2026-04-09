import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Healthcare Marketing FAQ | NextGen Health',
  description: 'Answers to common questions about healthcare marketing, SEO, Google Ads, HIPAA compliance, and patient acquisition. NextGen Health helps clinics grow.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/faq',
  },
  openGraph: {
    title: 'Healthcare Marketing FAQ | NextGen Health',
    description: 'Answers to common questions about healthcare marketing, SEO, Google Ads, HIPAA compliance, and patient acquisition. NextGen Health helps clinics grow.',
    url: 'https://thenextgenhealth.com/faq',
    siteName: 'NextGen Health',
    type: 'website',
  },
};

const faqCategories = [
  {
    category: 'General',
    faqs: [
      { q: 'What does NextGen Health do?', a: 'NextGen Health is a full-service healthcare marketing agency based in Irving, TX. We help medical practices — ERs, urgent cares, dental offices, med spas, and more — grow their patient base through Local SEO, Google Ads, social media marketing, website design, and marketing automation.' },
      { q: 'What types of healthcare practices do you work with?', a: 'We work with freestanding emergency rooms, urgent care centres, dental practices, dermatology clinics, cosmetic surgery centres, mental health practices, primary care offices, chiropractic offices, veterinary clinics, and multi-speciality groups across Texas and beyond.' },
      { q: 'Where is NextGen Health located?', a: 'Our headquarters is at 3001 Skyway Circle N, Irving, TX 75038. While we are based in the Dallas–Fort Worth metroplex, we serve healthcare practices across Texas — including Dallas, Houston, Austin, San Antonio, and Fort Worth — as well as clinics nationwide.' },
      { q: 'How much does it cost to work with NextGen Health?', a: 'Our pricing is customised based on your practice size, services needed, and market competitiveness. We offer packages starting from basic Local SEO to comprehensive full-service marketing. Book a free demo to get a tailored quote.' },
      { q: 'Do you offer month-to-month contracts?', a: 'Yes. We believe in earning your business monthly. While we recommend a minimum 90-day commitment for SEO (since results take time), all our service agreements are month-to-month with no long-term lock-ins.' },
    ],
  },
  {
    category: 'SEO & Local Search',
    faqs: [
      { q: 'How long does SEO take to show results?', a: 'Most healthcare practices see meaningful improvements in local search rankings within 60–90 days. Competitive markets or new websites may take 4–6 months for top-3 Local Pack placement. SEO is a long-term strategy that compounds over time.' },
      { q: 'What is Google Business Profile optimisation?', a: 'Google Business Profile (GBP) is your clinic\'s listing on Google Maps and local search. We optimise your profile with accurate information, weekly posts, Q&A seeding, review management, and photo updates to improve your Local Pack rankings and drive more calls and direction requests.' },
      { q: 'Can you help us get more Google reviews?', a: 'Yes. We implement automated review generation systems that send timely, compliant review requests to patients after their visit. We also monitor and respond to reviews to maintain a strong online reputation.' },
      { q: 'What is the difference between SEO and Local SEO?', a: 'Traditional SEO focuses on ranking in organic search results (the blue links). Local SEO specifically targets the Google Local Pack (the map results) and Google Maps. For healthcare practices that serve a geographic area, Local SEO is typically more valuable because patients search for providers "near me."' },
    ],
  },
  {
    category: 'Google Ads & Paid Media',
    faqs: [
      { q: 'How much should a clinic spend on Google Ads?', a: 'We typically recommend a minimum of $2,000–$5,000 per month in ad spend for a single-location clinic, depending on the market. Multi-location networks may invest $10,000+ per month. The key metric is cost-per-acquisition (CPA), not total spend — we optimise to keep your CPA profitable.' },
      { q: 'What is the average cost-per-click for healthcare ads?', a: 'Healthcare CPCs vary significantly by speciality and market. Primary care keywords average $5–$15, urgent care $10–$25, emergency room $20–$50, and cosmetic procedures $8–$30. We use strategic targeting and quality score optimisation to lower your effective CPC.' },
      { q: 'Do you manage Meta (Facebook/Instagram) ads?', a: 'Yes. We run targeted Meta Ads campaigns for brand awareness, patient education, and lead generation. Meta is particularly effective for aesthetic practices, wellness services, and community-focused healthcare brands.' },
    ],
  },
  {
    category: 'HIPAA & Compliance',
    faqs: [
      { q: 'Is your marketing HIPAA compliant?', a: 'Absolutely. HIPAA compliance is built into every aspect of our work. We never use patient data in marketing without proper authorisation, our analytics tracking is configured to avoid capturing PHI, and all team members complete annual HIPAA training. Learn more on our HIPAA page.' },
      { q: 'Can we use patient testimonials in our marketing?', a: 'Yes, but with proper written consent. We provide HIPAA-compliant testimonial release forms and guide practices through the process. Patient testimonials are one of the most powerful marketing tools when done correctly and compliantly.' },
      { q: 'Do you sign a Business Associate Agreement (BAA)?', a: 'Yes. For any engagement where we may handle protected health information (PHI), we execute a HIPAA Business Associate Agreement. This ensures both parties are legally protected and compliant.' },
    ],
  },
  {
    category: 'Getting Started',
    faqs: [
      { q: 'How do I get started with NextGen Health?', a: 'Book a free 30-minute demo through our scheduling page. During the demo, we\'ll learn about your practice, perform a live audit of your current digital presence, and provide a customised growth roadmap — whether you work with us or not.' },
      { q: 'What information do you need to get started?', a: 'For the initial demo, we just need your practice name, website URL, and a brief description of your goals. Once you become a client, we\'ll need access to your Google Business Profile, Google Ads account (if any), analytics, and website CMS.' },
      { q: 'How quickly can you start working on our marketing?', a: 'We can begin onboarding within 48 hours of signing. Most clients see initial changes (GBP updates, ad campaigns live, website fixes) within the first 7–10 days of engagement.' },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = faqCategories.flatMap((cat) => cat.faqs);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <Breadcrumbs />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about working with NextGen Health. Can&rsquo;t find what you&rsquo;re looking for? <Link href="/contact" className="text-emerald-600 underline hover:text-emerald-700">Contact us</Link>.
          </p>
        </div>
      </section>

      {faqCategories.map((cat, ci) => (
        <section key={ci} className={`py-16 ${ci % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-t border-slate-200`}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{cat.category}</h2>
            <div className="space-y-6">
              {cat.faqs.map((faq, fi) => (
                <div key={fi} className="border-b border-slate-200 pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="py-16 bg-emerald-600 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Still Have Questions?</h2>
          <p className="text-emerald-100 text-lg mb-8">Book a free demo and we&rsquo;ll answer all your questions in person.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-a-demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
              Book a Free Demo
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
