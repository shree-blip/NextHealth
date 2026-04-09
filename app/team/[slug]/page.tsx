import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import { getTeamMemberBySlug, getAllTeamSlugs } from '@/lib/team-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTeamSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member) return {};

  const title = `${member.name} — ${member.role} | NextGen Health`;
  const description = member.bio;

  return {
    title,
    description,
    alternates: {
      canonical: `https://thenextgenhealth.com/team/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://thenextgenhealth.com/team/${slug}`,
      siteName: 'NextGen Health',
      type: 'profile',
      images: [{ url: `https://thenextgenhealth.com${member.image}`, width: 400, height: 400 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member) notFound();

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.longBio,
    image: `https://thenextgenhealth.com${member.image}`,
    url: `https://thenextgenhealth.com/team/${member.slug}`,
    worksFor: {
      '@type': 'Organization',
      name: 'The NextGen Healthcare Marketing',
      url: 'https://thenextgenhealth.com',
    },
    knowsAbout: [...member.credentials, ...member.specialties],
    ...(member.linkedin ? { sameAs: [member.linkedin] } : {}),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Navbar />
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-emerald-500/30 shadow-2xl flex-shrink-0">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{member.name}</h1>
              <p className="text-emerald-400 text-lg font-bold uppercase tracking-widest mb-4">{member.role}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {member.credentials.map((cred, i) => (
                  <span key={i} className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">About {member.name.split(' ')[0]}</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">{member.longBio}</p>

          {/* Specialties */}
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Areas of Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {member.specialties.map((spec, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium">{spec}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-10">
            <h3 className="text-2xl font-bold text-white mb-3">
              Work with {member.name.split(' ')[0]} &amp; the NextGen Health Team
            </h3>
            <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
              Ready to grow your healthcare practice? Book a free consultation and see how our team can help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-a-demo"
                className="inline-block rounded-full bg-white text-emerald-700 px-8 py-3 font-bold hover:bg-emerald-50 transition-colors"
              >
                Book a Free Demo
              </Link>
              <Link
                href="/team"
                className="inline-block rounded-full border-2 border-white/40 text-white px-8 py-3 font-bold hover:bg-white/10 transition-colors"
              >
                Meet the Full Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
