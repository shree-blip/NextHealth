import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import FadeIn from '@/components/FadeIn';
import DashboardImages from '@/components/case-studies/DashboardImages';
import AnimatedStats from '@/components/case-studies/AnimatedStats';
import WhoWeServe from '@/components/landing/WhoWeServe';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Marketing Case Studies | Real Client Results',
  description: 'Explore real case studies from healthcare practices we have helped grow across Texas. See measurable results in patient acquisition, revenue growth, and local search rankings for ERs and clinics.',
  alternates: {
    canonical: 'https://thenextgenhealth.com/case-studies',
  }
};

type CaseStudyCategory = 'ER' | 'MedSpa' | 'UrgentCare';

export default async function CaseStudiesPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const category = resolvedSearchParams?.category;
  const caseStudies = [
    {
      category: 'ER' as CaseStudyCategory,
      title: 'Emergency Room - 45% Patient Increase',
      description: 'Freestanding ER in Dallas Metro',
      challenge: 'Limited local visibility competing against large hospital systems',
      solution: 'Local SEO dominance + Google Ads targeting high-acuity keywords',
      results: '45% increase in patient visits within 6 months, $800K+ additional annual revenue',
      icon: '🏥'
    },
    {
      category: 'UrgentCare' as CaseStudyCategory,
      title: 'Urgent Care - 3x Patient Acquisition',
      description: 'Multi-location urgent care in Houston',
      challenge: 'Brand not recognized, losing patients to competitors',
      solution: 'Comprehensive market strategy + location-specific campaigns',
      results: '3x increase in appointments, 60% reduction in cost-per-acquisition',
      icon: '⚡'
    },
    {
      category: 'MedSpa' as CaseStudyCategory,
      title: 'Cosmetic Surgery - 120% Lead Growth',
      description: 'Aesthetic clinic in Austin',
      challenge: 'Competing on price, needed premium positioning',
      solution: 'Brand identity + targeted social media for high-ticket procedures',
      results: '120% increase in qualified leads, 25% higher average transaction value',
      icon: '✨'
    },
    {
      category: 'UrgentCare' as CaseStudyCategory,
      title: 'Primary Care - 500% ROI from SEO',
      description: 'Family medicine practice in San Antonio',
      challenge: 'Invisible in search results for "doctor near me"',
      solution: 'Local SEO fundamentals + content marketing for patient education',
      results: '500%+ ROI, $300K+ annual additional revenue from organic traffic',
      icon: '👨‍⚕️'
    },
    {
      category: 'MedSpa' as CaseStudyCategory,
      title: 'Mental Health Clinic - 2x Patient Retention',
      description: 'Therapy practice in Dallas',
      challenge: 'High patient acquisition costs, poor retention',
      solution: 'Email automation + patient education content strategy',
      results: '2x patient retention rate, 40% reduction in marketing spend needed',
      icon: '🧠'
    },
    {
      category: 'ER' as CaseStudyCategory,
      title: 'Dental Practice - Local Pack #1',
      description: 'General dentistry in Irving',
      challenge: 'Not appearing in local search top 3',
      solution: 'Google Business Profile optimization + local citations',
      results: '#1 ranking in local pack, 70% increase in appointment bookings',
      icon: '😁'
    }
  ];

  const activeCategory = category === 'ER' || category === 'MedSpa' || category === 'UrgentCare' ? category : null;
  const filteredCaseStudies = activeCategory
    ? caseStudies.filter((study) => study.category === activeCategory)
    : caseStudies;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <Hero
        heading={<>Healthcare Marketing <span className="text-emerald-500">Case Studies</span></>}
        subheading="Real results from real healthcare practices. See how our marketing strategies have driven measurable growth in patient acquisition and revenue across Texas."
        primaryCTA={{ label: 'Get Similar Results', href: '/contact' }}
        secondaryCTA={{ label: 'Browse Case Studies', href: '#cases' }}
      />

      <DashboardImages />
      <WhoWeServe categoryLinks={true} />

      {/* Case Studies Grid */}
      <section id="cases" className="py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeCategory && (
            <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-800">
                Showing {activeCategory === 'ER' ? 'Emergency Room' : activeCategory === 'MedSpa' ? 'MedSpa' : 'Urgent Care'} case studies
              </p>
              <a href="/case-studies#cases" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">
                Clear Filter
              </a>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCaseStudies.map((study, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                  <div className="text-5xl mb-4">{study.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{study.title}</h3>
                  <p className="text-sm text-emerald-600 font-semibold mb-6">{study.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Challenge</p>
                      <p className="text-slate-700">{study.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Solution</p>
                      <p className="text-slate-700">{study.solution}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Results</p>
                      <p className="text-slate-900 font-bold text-lg">{study.results}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedStats />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-black text-white mb-6">
              Ready to Become a Success Story?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Let&apos;s discuss how we can help your practice achieve similar results.
            </p>
            <a
              href="/contact"
              className="inline-block px-10 py-5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all hover:scale-105"
            >
              Schedule Free Consultation
            </a>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
