import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | NextGen Health',
  description: 'NextGen Health is committed to digital accessibility. Learn about our accessibility standards, compliance efforts, and how to report accessibility issues.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/accessibility',
  },
  openGraph: {
    title: 'Accessibility Statement | NextGen Health',
    description: 'NextGen Health is committed to digital accessibility. Learn about our accessibility standards, compliance efforts, and how to report accessibility issues.',
    url: 'https://thenextgenhealth.com/accessibility',
    siteName: 'NextGen Health',
    type: 'website',
  },
};

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumbs />
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Accessibility Statement</h1>
          <p className="mt-4 text-lg text-slate-600">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-slate prose-lg max-w-none">

          <h2>Our Commitment</h2>
          <p>
            NextGen Health is committed to ensuring that our website and digital services are accessible to all individuals, including those with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level, which defines requirements for designers and developers to improve accessibility for people with disabilities.
          </p>

          <h2>Accessibility Features</h2>
          <p>We have taken the following steps to ensure accessibility on our website:</p>
          <ul>
            <li><strong>Semantic HTML:</strong> Our website uses proper heading structure, landmarks, and semantic elements to ensure screen readers can navigate content effectively.</li>
            <li><strong>Colour Contrast:</strong> We maintain sufficient colour contrast ratios throughout our design to ensure readability for users with visual impairments.</li>
            <li><strong>Keyboard Navigation:</strong> All interactive elements on our website are accessible via keyboard navigation.</li>
            <li><strong>Alt Text:</strong> Images include descriptive alternative text where appropriate.</li>
            <li><strong>Responsive Design:</strong> Our website adapts to different screen sizes and supports browser zoom up to 200% without loss of content or functionality.</li>
            <li><strong>Form Labels:</strong> All form fields include clear labels and instructions.</li>
            <li><strong>Focus Indicators:</strong> Visible focus indicators are provided for keyboard navigation.</li>
          </ul>

          <h2>Ongoing Efforts</h2>
          <p>
            Accessibility is an ongoing priority. We regularly audit our website using automated tools and manual testing to identify and address accessibility barriers. Our development team incorporates accessibility best practices into our workflow for all new features and content.
          </p>

          <h2>Third-Party Content</h2>
          <p>
            Our website may include third-party content or embedded services (such as scheduling widgets or video players) that may not fully conform to our accessibility standards. We work with our third-party providers to encourage improvements and provide alternative ways to access their content where possible.
          </p>

          <h2>Feedback and Contact</h2>
          <p>
            We welcome feedback on the accessibility of our website. If you encounter any barriers or have suggestions for improvement, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:hello@thenextgenhealth.com">hello@thenextgenhealth.com</a></li>
            <li><strong>Phone:</strong> Available upon request</li>
            <li><strong>Address:</strong> 3001 Skyway Circle N, Irving, TX 75038</li>
          </ul>
          <p>
            We aim to respond to accessibility feedback within 5 business days and to resolve issues as promptly as possible.
          </p>

          <h2>Compliance Status</h2>
          <p>
            We believe this website is partially conformant with WCAG 2.1 Level AA. &ldquo;Partially conformant&rdquo; means that some parts of the content do not fully conform to the accessibility standard. We are actively working to achieve full conformance.
          </p>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 not-prose">
            <p className="text-sm text-slate-600">
              This accessibility statement applies to <strong>thenextgenhealth.com</strong>. For questions about accessibility on our client dashboards or other platforms, please <Link href="/contact" className="text-emerald-600 underline hover:text-emerald-700">contact us directly</Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
