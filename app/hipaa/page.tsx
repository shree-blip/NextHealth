import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HIPAA Compliance | NextGen Marketing Agency',
  description: 'HIPAA Compliance Statement for NextGen Marketing Agency.',
};

export default function HIPAACompliance() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <Hero
        heading="HIPAA Compliance Statement"
        subheading="Our commitment to protecting patient information through industry-leading security and governance."
        imageAlt="Shield icon representing compliance"
      />
      
      <section className="pt-12 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none prose-emerald">
            <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Our Commitment to Security</h2>
            <p className="text-slate-600 mb-6">
              At NextGen Marketing Agency, we understand that protecting patient data is not just a regulatory requirement, but a fundamental trust between healthcare providers and their patients. We are fully committed to complying with the Health Insurance Portability and Accountability Act (HIPAA) and the Health Information Technology for Economic and Clinical Health (HITECH) Act.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Business Associate Agreements (BAA)</h2>
            <p className="text-slate-600 mb-6">
              As a marketing and automation partner for healthcare facilities, NextGen Marketing Agency acts as a Business Associate. We execute comprehensive Business Associate Agreements (BAAs) with all our covered entity clients before handling any Protected Health Information (PHI).
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Technical Safeguards</h2>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li><strong>Encryption:</strong> All PHI is encrypted both in transit (using TLS 1.2 or higher) and at rest (using AES-256 encryption).</li>
              <li><strong>Access Controls:</strong> We employ strict role-based access controls (RBAC) and multi-factor authentication (MFA) to ensure that only authorized personnel can access systems containing PHI.</li>
              <li><strong>Audit Logs:</strong> Comprehensive audit trails are maintained for all access to and modifications of PHI.</li>
              <li><strong>Secure Infrastructure:</strong> Our applications are hosted on HIPAA-compliant cloud infrastructure with dedicated security perimeters.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Administrative Safeguards</h2>
            <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
              <li><strong>Employee Training:</strong> All NextGen Marketing Agency employees undergo mandatory, rigorous HIPAA compliance training upon hire and annually thereafter.</li>
              <li><strong>Policies and Procedures:</strong> We maintain documented security policies and procedures that are regularly reviewed and updated.</li>
              <li><strong>Incident Response:</strong> We have a formal incident response plan in place to rapidly address and report any potential security breaches.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Physical Safeguards</h2>
            <p className="text-slate-600 mb-6">
              While our operations are primarily digital, we ensure that any physical locations where our staff operate have appropriate security measures, including restricted access, clean desk policies, and secure disposal of any physical media.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-900">Contact Our Privacy Officer</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about our HIPAA compliance program or need to report a security concern, please contact our Privacy Officer at:<br />
              privacy@nextgenmarketing.agency<br />
              3001 Skyway Cir N, Irving, TX 75038
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
