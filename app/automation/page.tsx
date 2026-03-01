import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));
import { Bot, Zap, Clock, ShieldCheck, Database, Calendar, PhoneOff, Users } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Automation & AI Patient Intake | NextGen Marketing Agency',
  description: 'Streamline your clinic with AI chatbots, automated patient intake, and zero-hold-time call center agents. Reduce staff burnout and increase ROI in Texas.',
  alternates: {
    canonical: 'https://nextgenmarketing.agency/automation',
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Healthcare Automation",
  "provider": {
    "@type": "ProfessionalService",
    "name": "NextGen Marketing Agency",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3001 Skyway Cir N",
      "addressLocality": "Irving",
      "addressRegion": "TX",
      "postalCode": "75038",
      "addressCountry": "US"
    }
  },
  "description": "AI-driven patient intake, automated scheduling, and HIPAA-compliant chatbots for medical practices."
};

const faqs = [
  {
    q: "Will AI automation replace my front desk staff?",
    a: "No. Our automation systems are designed to augment your staff, not replace them. By handling repetitive, high-volume tasks like answering basic FAQs, verifying insurance, and scheduling routine appointments, we free your front desk to focus on high-value, empathetic patient care and complex administrative duties. It's about eliminating burnout, not jobs."
  },
  {
    q: "How does the AI chatbot handle complex medical questions?",
    a: "Our HIPAA-compliant AI agents are strictly programmed with guardrails. They are trained on your specific clinic's protocols and FAQs. If a patient asks a complex medical question or indicates a severe emergency, the AI is programmed to immediately escalate the conversation to a human staff member or direct the patient to call 911, ensuring absolute clinical safety."
  },
  {
    q: "Can your automation integrate with our existing EHR?",
    a: "Yes. We have experience integrating with major Electronic Health Record (EHR) systems including Epic, Cerner, Athenahealth, and specialized urgent care platforms like DocuTAP. We utilize secure, HIPAA-compliant APIs to ensure that appointment data, consent forms, and insurance information flow seamlessly from the digital front door directly into your patient charts."
  },
  {
    q: "What is the ROI of implementing clinical automation?",
    a: "The ROI is typically realized in three areas: 1) Recaptured Revenue: By eliminating missed calls and providing 24/7 booking, you capture patients who would have otherwise gone to a competitor. 2) Operational Efficiency: Reducing manual data entry saves an average of 15-20 staff hours per week. 3) Reduced No-Shows: Automated SMS and email reminders significantly decrease appointment no-show rates."
  },
  {
    q: "Is the automated patient intake process secure?",
    a: "Security is our highest priority. All data collected during the automated intake process—including digital consent forms, ID uploads, and insurance cards—is encrypted in transit and at rest. We utilize SOC 2 Type II compliant servers and sign Business Associate Agreements (BAAs) to guarantee strict adherence to HIPAA regulations."
  }
];

export default function AutomationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        heading={<>Solve the Front-Desk <span className="text-blue-500">Crisis</span></>}
        subheading="Stop losing patients to missed calls and administrative bottlenecks. Deploy our HIPAA-compliant AI agents to automate intake, scheduling, and triage 24/7."
        primaryCTA={{ label: 'See Automation Demos', href: '/demo' }}
        secondaryCTA={{ label: 'Contact Sales', href: '/contact' }}
        imageAlt="AI chatbot automating clinic intake"
      />

      {/* Deep Dive: The Operational Bottleneck */}
      <section className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl font-bold mb-6">The Cost of Administrative Bloat</h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  In modern healthcare, the most significant point of failure isn&apos;t clinical—it&apos;s operational. Clinics across Texas are spending thousands on marketing to drive patient volume, only to lose those patients at the front desk. When a patient calls an Urgent Care and is placed on hold for 5 minutes, they hang up and call the competitor down the street.
                </p>
                <p>
                  Front-desk staff are overwhelmed. They are simultaneously trying to check in physical patients, answer ringing phones, verify complex insurance plans, and manually enter data into the EHR. This environment breeds burnout, high turnover, and costly data entry errors.
                </p>
                <p>
                  NextGen Marketing Agency&apos;s automation suite acts as an invisible, infinitely scalable administrative team. We intercept digital inquiries, automate the mundane tasks, and deliver a fully vetted, scheduled patient directly to your clinical staff.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <PhoneOff className="h-8 w-8 text-red-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Missed Calls = Lost Revenue</h3>
                <p className="text-sm text-slate-600">The average clinic misses 20% of inbound calls. Our AI ensures zero missed opportunities.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Users className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Staff Burnout</h3>
                <p className="text-sm text-slate-600">Reduce the cognitive load on your team by automating repetitive Q&A and scheduling.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Database className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Data Entry Errors</h3>
                <p className="text-sm text-slate-600">Digital intake forms eliminate handwriting transcription errors and ensure clean EHR data.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-slate-200">
                <Clock className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">24/7 Availability</h3>
                <p className="text-sm text-slate-600">Patients get sick at 2 AM. Allow them to book appointments asynchronously, anytime.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Deep Dive: AI Agents & Workflows */}
      <section className="py-24 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Intelligent Workflows</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We deploy specialized AI agents designed specifically for the rigorous demands of healthcare environments.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.1} className="glass p-8 rounded-3xl border border-slate-200">
              <Bot className="h-10 w-10 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Conversational AI</h3>
              <p className="text-slate-600 leading-relaxed">
                Our chatbots utilize advanced Natural Language Processing (NLP) to understand patient intent. They can answer questions about operating hours, accepted insurances, and specific services. If a patient asks a complex medical question, the bot seamlessly routes the conversation to a human triage nurse.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="glass p-8 rounded-3xl border border-slate-200">
              <Calendar className="h-10 w-10 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Automated Scheduling</h3>
              <p className="text-slate-600 leading-relaxed">
                Patients can view real-time availability and book appointments directly through your website or via SMS. The system automatically sends calendar invites, pre-visit instructions, and automated reminders, drastically reducing your no-show rate and optimizing provider schedules.
              </p>
            </FadeIn>
            <FadeIn delay={0.3} className="glass p-8 rounded-3xl border border-slate-200">
              <ShieldCheck className="h-10 w-10 text-purple-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Digital Patient Intake</h3>
              <p className="text-slate-600 leading-relaxed">
                Eliminate the clipboard. Patients receive a secure link via SMS to complete their intake forms, upload their ID, and verify their insurance before they ever step foot in the clinic. This reduces waiting room times by up to 40% and improves the overall patient experience.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="h2 font-bold mb-6">Automation FAQ</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Common questions about implementing AI and automation in your medical practice.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <FAQ faqs={faqs} />
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
