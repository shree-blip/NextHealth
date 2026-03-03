import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | The NextGen Healthcare Marketing',
  description: 'Privacy Policy for The NextGen Healthcare Marketing.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <Hero
        heading="Privacy Policy"
        subheading="A transparent look at how we collect, use, and safeguard your data."
        imageAlt="Lock icon signifying privacy"
      />
      
      <section className="pt-12 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="h1 font-bold mb-8 tracking-tight">Privacy Policy</h1>
          <div className="prose prose-slate max-w-none prose-emerald">
            <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">1. Introduction</h2>
            <p className="text-slate-600 mb-6">
              The NextGen Healthcare Marketing (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website thenextgenhealth.com (our &quot;Website&quot;) and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">2. Information We Collect</h2>
            <p className="text-slate-600 mb-6">
              We collect several types of information from and about users of our Website, including information:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li>By which you may be personally identified, such as name, postal address, e-mail address, telephone number, or any other identifier by which you may be contacted online or offline (&quot;personal information&quot;).</li>
              <li>That is about you but individually does not identify you.</li>
              <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">3. How We Use Your Information</h2>
            <p className="text-slate-600 mb-6">
              We use information that we collect about you or that you provide to us, including any personal information:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li>To present our Website and its contents to you.</li>
              <li>To provide you with information, products, or services that you request from us.</li>
              <li>To fulfill any other purpose for which you provide it.</li>
              <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
              <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">4. Disclosure of Your Information</h2>
            <p className="text-slate-600 mb-6">
              We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide as described in this privacy policy:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li>To our subsidiaries and affiliates.</li>
              <li>To contractors, service providers, and other third parties we use to support our business and who are bound by contractual obligations to keep personal information confidential and use it only for the purposes for which we disclose it to them.</li>
              <li>To fulfill the purpose for which you provide it.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">5. Data Security</h2>
            <p className="text-slate-600 mb-6">
              We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">6. Contact Information</h2>
            <p className="text-slate-600 mb-6">
              To ask questions or comment about this privacy policy and our privacy practices, contact us at:<br />
              hello@thenextgenhealth.com<br />
              3001 Skyway Cir N, Irving, TX 75038
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
