'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const team = [
  {
    name: "Shree Gauli",
    role: "Sr Marketing Officer",
    bio: "Senior Marketing Officer with 8+ years of experience driving healthcare growth and patient acquisition. Specialises in multi-channel marketing strategy, brand positioning, and ROI-driven campaign management for clinics across Texas.",
    credentials: ["Google Ads Certified", "HubSpot Inbound Marketing", "Healthcare Marketing Strategy"],
    image: "/shree-gauli.png"
  },
  {
    name: "Bikash Neupane",
    role: "Marketing / IT Project Manager",
    bio: "Bridges the gap between marketing strategies and IT implementation for seamless clinic operations. 6+ years managing cross-functional teams, MarTech integrations, and HIPAA-compliant digital infrastructure projects.",
    credentials: ["PMP Certified", "Agile Scrum Master", "HIPAA Compliance Training"],
    image: "/bikash-neupane.png"
  },
  {
    name: "Sonu Sagar Dongol",
    role: "Paid Ads Specialist / Media Buyer",
    bio: "Expert in managing high-ROI paid media campaigns across Google, Meta, and programmatic platforms. Has managed $2M+ in annual healthcare ad spend with an average 4.2x ROAS across 30+ medical practice accounts.",
    credentials: ["Google Ads Search Certified", "Meta Blueprint Certified", "Google Analytics 4"],
    image: "/sagar-dongol.png"
  },
  {
    name: "Bijesh Khadgi",
    role: "Social Media Manager",
    bio: "Crafts engaging social media strategies to build brand awareness and patient trust. Manages social presence for 20+ healthcare practices with a focus on compliant content creation and community engagement.",
    credentials: ["Meta Social Media Marketing", "Hootsuite Certified", "HIPAA Social Media Compliance"],
    image: "/bijesh-khadgi.png"
  },
  {
    name: "Sumit Sharma",
    role: "SEO Manager",
    bio: "Specialises in Local SEO and Answer Engine Optimisation to ensure top rankings for clinics. Has achieved 100+ first-page Google rankings for healthcare practices, with deep expertise in GBP optimisation and medical schema markup.",
    credentials: ["Google Analytics Certified", "SEMrush SEO Toolkit", "Local SEO & GBP Specialist"],
    image: "/sumit-sharma.png"
  },
  {
    name: "Rahul Roy",
    role: "Content Writer",
    bio: "Creates authoritative, HIPAA-compliant medical content that drives engagement and SEO value. Produces 50K+ words of healthcare content monthly across blog posts, landing pages, and patient education materials.",
    credentials: ["Medical Content Writing", "HIPAA Compliance Certified", "SEO Content Strategy"],
    image: "/rahul-roy.png"
  },
  {
    name: "Bidhitsha Khadka",
    role: "Graphics Designer",
    bio: "Designs visually stunning and conversion-optimised assets for healthcare campaigns. Creates clinic brand identities, ad creatives, and print materials that meet medical advertising compliance standards.",
    credentials: ["Adobe Creative Suite Expert", "UI/UX Design", "Healthcare Brand Identity"],
    image: "/bidhitsha-khadka.png"
  },
  {
    name: "Sagar Timalsina",
    role: "Software Developer",
    bio: "Develops robust, secure, and scalable automation tools and web applications for medical practices. Builds HIPAA-compliant platforms, patient portals, and marketing automation systems using modern technology stacks.",
    credentials: ["Full-Stack Development", "HIPAA-Compliant Architecture", "Cloud & DevOps"],
    image: "/sagar-timalsina.png"
  }
];

export default function TeamPage() {
  const personSchema = team.map((member) => ({
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: `https://thenextgenhealth.com${member.image}`,
    worksFor: {
      '@type': 'Organization',
      name: 'The NextGen Healthcare Marketing',
      url: 'https://thenextgenhealth.com',
    },
    knowsAbout: member.credentials,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The NextGen Healthcare Marketing',
    url: 'https://thenextgenhealth.com',
    employee: personSchema,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <Breadcrumbs />
      <Hero
        heading={<>The <span className="text-emerald-500">Infrastructure</span></>}
        subheading="Meet the specialists engineering your clinical growth. We are more than a firm; we are your extended operations team."
        primaryCTA={{ label: 'Work With Us', href: '/contact' }}
        secondaryCTA={{ label: 'View Open Roles', href: '#careers' }}
      />
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 gap-4">
                    <Link href="#" className="text-white hover:text-emerald-400 transition-colors"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-white hover:text-emerald-400 transition-colors"><Linkedin className="h-5 w-5" /></Link>
                    <Link href="#" className="text-white hover:text-emerald-400 transition-colors"><Mail className="h-5 w-5" /></Link>
                  </div>
                </div>
                <Link href={`/team/${member.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{member.name}</h3>
                </Link>
                <div className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-4">{member.role}</div>
                <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                <Link href={`/team/${member.name.toLowerCase().replace(/\s+/g, '-')}`} className="inline-block mt-3 text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors">View Full Profile &rarr;</Link>
                {member.credentials && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.credentials.map((cred, i) => (
                      <span key={i} className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                        {cred}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div id="careers" className="mt-24 text-center py-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl">
            <h2 className="text-3xl font-black text-white mb-4">Join the Mission</h2>
            <p className="text-emerald-100 mb-8 max-w-xl mx-auto px-4">
              We&apos;re always looking for talented Ads Managers, SEO Specialists, and 
              Automation Engineers who want to redefine healthcare marketing.
            </p>
            <button className="rounded-full bg-slate-900 text-white px-8 py-4 font-bold hover:bg-slate-800 transition-all hover:scale-105">
              View Open Roles
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
