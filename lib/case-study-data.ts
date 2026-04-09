export interface CaseStudyData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  heroDescription: string;
  icon: string;
  industry: string;
  industrySlug: string;
  services: { slug: string; label: string }[];
  challenge: string;
  challengePoints: string[];
  strategy: string;
  strategyPoints: string[];
  execution: { title: string; description: string }[];
  results: { value: string; label: string }[];
  testimonial?: { quote: string; name: string; title: string };
  timeline: string;
  faqs: { q: string; a: string }[];
  relatedCaseStudies: { slug: string; label: string }[];
}

export const caseStudies: CaseStudyData[] = [
  {
    slug: 'er-network-patient-growth',
    title: 'Freestanding ER Network — 45% Patient Growth | NextGen Health Case Study',
    metaDescription: 'How we helped a freestanding ER network in Dallas achieve 45% patient growth through local SEO, Google Ads, and GBP optimisation. Read the full case study.',
    h1: 'Freestanding ER Network — 45% Patient Growth in 6 Months',
    heroDescription: 'A multi-location freestanding ER network in the Dallas–Fort Worth metroplex was losing market share to hospital systems. Our integrated digital strategy delivered a 45% increase in patient visits and $800K+ in additional annual revenue.',
    icon: '🏥',
    industry: 'Freestanding ERs',
    industrySlug: 'freestanding-ers',
    services: [
      { slug: 'seo-local-search', label: 'SEO & Local Search' },
      { slug: 'google-ads', label: 'Google Ads' },
      { slug: 'google-business-profile', label: 'Google Business Profile' },
    ],
    challenge: 'The ER network operated three locations in high-competition suburban corridors. Despite quality facilities and board-certified physicians, they were invisible in Google\'s Local Pack for high-acuity keywords. Hospital systems with massive marketing budgets dominated every search result.',
    challengePoints: [
      'Zero presence in Local Pack for "emergency room near me"',
      'Google Ads CPA exceeded $280 per patient visit',
      'Competitors outranked them on all high-acuity keywords',
      'No review generation strategy — average 3.2 stars across locations',
      'Website not optimised for mobile or speed',
    ],
    strategy: 'We deployed a three-pronged approach: dominate local search with aggressive GBP optimisation, capture immediate-need traffic with high-intent Google Ads, and build authority through healthcare-specific link building.',
    strategyPoints: [
      'Complete GBP overhaul for all 3 locations with weekly posts and Q&A seeding',
      'Google Ads restructured around high-acuity symptom keywords with location extensions',
      'Competitor geofencing campaigns targeting patients near rival urgent cares',
      'Automated review collection system to rebuild online reputation',
      'Technical SEO audit and Core Web Vitals optimisation on website',
    ],
    execution: [
      { title: 'Month 1: Foundation', description: 'Technical SEO audit, GBP claim and verification for all locations, review generation system deployment, website speed optimisation.' },
      { title: 'Month 2: Campaigns Live', description: 'Google Ads launched with call-only and location extension campaigns. Local citation building across 100+ directories. First GBP posts published.' },
      { title: 'Month 3–4: Optimisation', description: 'A/B testing ad copy and landing pages. Review count grew from 45 to 180+ across locations. Local Pack rankings began improving.' },
      { title: 'Month 5–6: Dominance', description: 'Top 3 Local Pack position secured for primary keywords. CPA reduced by 65%. Patient visits up 45% from baseline.' },
    ],
    results: [
      { value: '45%', label: 'Increase in Patient Visits' },
      { value: '$800K+', label: 'Additional Annual Revenue' },
      { value: '65%', label: 'Reduction in Cost per Acquisition' },
      { value: '4.7★', label: 'Average Google Rating (from 3.2)' },
    ],
    testimonial: {
      quote: 'NextGen Health transformed our digital presence. We went from being invisible online to dominating our local market in under six months. The ROI has been extraordinary.',
      name: 'Medical Director',
      title: 'DFW Freestanding ER Network',
    },
    timeline: '6 months',
    faqs: [
      { q: 'How quickly can an ER see results from digital marketing?', a: 'Google Ads can drive patient traffic within days of launch. Local SEO improvements typically take 60–90 days to show significant movement, but GBP optimisations can yield faster results within 30 days.' },
      { q: 'What is the typical ROI for ER marketing?', a: 'The average ER visit generates $800–$2,500 in revenue. With a CPA of $80–$150 (post-optimisation), the ROI is typically 5–15x the marketing investment.' },
      { q: 'How do you handle multi-location ER marketing?', a: 'We create location-specific GBP profiles, landing pages, and ad campaigns. Each location gets a tailored strategy based on its competitive landscape and patient demographics.' },
    ],
    relatedCaseStudies: [
      { slug: 'urgent-care-patient-acquisition', label: 'Urgent Care — 3x Patient Acquisition' },
      { slug: 'dental-practice-local-pack', label: 'Dental Practice — Local Pack #1' },
    ],
  },
  {
    slug: 'urgent-care-patient-acquisition',
    title: 'Urgent Care — 3x Patient Acquisition | NextGen Health Case Study',
    metaDescription: 'How a multi-location urgent care in Houston tripled patient acquisition and reduced CPA by 60% with comprehensive marketing. Read the case study.',
    h1: 'Urgent Care Network — 3x Patient Acquisition',
    heroDescription: 'A multi-location urgent care network in Houston was struggling with brand recognition and losing patients to competitors. Our comprehensive strategy tripled appointment bookings and reduced CPA by 60%.',
    icon: '⚡',
    industry: 'Urgent Care',
    industrySlug: 'urgent-care',
    services: [
      { slug: 'google-ads', label: 'Google Ads' },
      { slug: 'strategy-planning', label: 'Strategy & Planning' },
      { slug: 'social-media-marketing', label: 'Social Media Marketing' },
    ],
    challenge: 'Despite operating five locations across Houston, the urgent care brand was virtually unknown. Patients defaulted to competitors with stronger online presence and better reviews. Marketing spend was high but inefficient.',
    challengePoints: [
      'Brand not recognised in any of the five service areas',
      'Cost per acquisition exceeded $200 per patient',
      'No consistent social media presence or brand voice',
      'Appointment booking process was friction-heavy',
      'Reviews averaged 3.5 stars with many unanswered negative reviews',
    ],
    strategy: 'We combined paid media efficiency with brand building through social media and community engagement. Automated review management rebuilt trust while streamlined booking reduced conversion friction.',
    strategyPoints: [
      'Google Ads restructured with location-specific campaigns and dayparting',
      'Social media content calendar featuring staff spotlights and health tips',
      'Review response and generation system across all 5 locations',
      'Online booking integration with same-day appointment availability display',
      'Community partnership campaigns with local employers and schools',
    ],
    execution: [
      { title: 'Month 1: Audit & Setup', description: 'Comprehensive marketing audit, brand voice development, social media account overhaul, Google Ads account restructuring.' },
      { title: 'Month 2: Launch', description: 'New campaigns live across Google and Meta. Social media content publishing began at 5 posts per week. Review generation system activated.' },
      { title: 'Month 3–4: Scale', description: 'Expanded to Instagram Reels and TikTok. Google Ads CPA dropped to $80. Review scores climbing across all locations.' },
      { title: 'Month 5–6: Results', description: 'Appointment volume tripled. CPA stabilised at $75. Brand awareness measurably increased through organic social reach.' },
    ],
    results: [
      { value: '3x', label: 'Increase in Appointments' },
      { value: '60%', label: 'Reduction in CPA' },
      { value: '4.6★', label: 'Average Google Rating' },
      { value: '250%', label: 'Social Media Reach Growth' },
    ],
    testimonial: {
      quote: 'The team didn\'t just run ads — they built our brand from the ground up. Our clinics are busier than ever and patients actually recognise our name now.',
      name: 'Operations Director',
      title: 'Houston Urgent Care Network',
    },
    timeline: '6 months',
    faqs: [
      { q: 'How do you manage marketing for multiple urgent care locations?', a: 'Each location gets its own ad campaigns, GBP profile, and local SEO strategy. However, brand messaging and social media content are unified to build a cohesive brand across all locations.' },
      { q: 'What is a good CPA for urgent care marketing?', a: 'A well-optimised campaign should target $60–$120 CPA. Given average visit revenue of $200–$500, this delivers a healthy ROI of 2–5x per patient visit.' },
      { q: 'Can social media actually drive urgent care patients?', a: 'Yes. While paid search captures immediate-need patients, social media builds brand awareness so patients think of your clinics first. It also supports recruitment and community trust.' },
    ],
    relatedCaseStudies: [
      { slug: 'er-network-patient-growth', label: 'ER Network — 45% Patient Growth' },
      { slug: 'primary-care-seo-roi', label: 'Primary Care — 500% SEO ROI' },
    ],
  },
  {
    slug: 'cosmetic-surgery-lead-growth',
    title: 'Cosmetic Surgery Clinic — 120% Lead Growth | NextGen Health Case Study',
    metaDescription: 'How an aesthetic clinic in Austin achieved 120% lead growth and 25% higher transaction values through brand repositioning and social media marketing.',
    h1: 'Cosmetic Surgery Clinic — 120% Lead Growth',
    heroDescription: 'An aesthetic clinic in Austin was competing on price and losing premium clients. Our brand repositioning, social media strategy, and targeted Meta Ads delivered 120% more qualified leads and 25% higher average transaction values.',
    icon: '✨',
    industry: 'Med Spa / Cosmetic Surgery',
    industrySlug: 'medspa',
    services: [
      { slug: 'meta-ads', label: 'Meta & Facebook Ads' },
      { slug: 'social-media-marketing', label: 'Social Media Marketing' },
      { slug: 'brand-identity-design', label: 'Brand Identity Design' },
    ],
    challenge: 'The clinic offered premium cosmetic services but was positioning itself as a discount provider. Social media was inconsistent, and the patient journey from enquiry to booking was disjointed. High-ticket procedures weren\'t converting online.',
    challengePoints: [
      'Brand positioned as "affordable" rather than "premium" — attracting wrong audience',
      'Social media posting was sporadic with no visual consistency',
      'Meta Ads generated enquiries but few converted to consultations',
      'No email nurture for high-ticket procedure consideration periods',
      'Website lacked before/after galleries and social proof',
    ],
    strategy: 'We repositioned the brand as a premium aesthetic destination, created a visually stunning social media presence, and built a lead nurture funnel for high-ticket procedures.',
    strategyPoints: [
      'Complete brand identity refresh: logo, colour palette, photography style guide',
      'Instagram-first social strategy with Reels, Stories, and educational carousels',
      'Meta Ads targeting affluent demographics with lookalike audiences',
      'Email drip sequences for consultation-to-booking conversion',
      'Before/after gallery and patient testimonial video production',
    ],
    execution: [
      { title: 'Month 1: Brand Overhaul', description: 'New brand identity design, website visual refresh, social media content templates, photography shoot for before/after gallery.' },
      { title: 'Month 2: Content Engine', description: 'Social media calendar launched at 7 posts per week. Meta Ads campaigns started with new creative. Email nurture sequences built.' },
      { title: 'Month 3–4: Optimisation', description: 'Refined Meta Ads targeting based on conversion data. Instagram Reels driving organic reach. Email sequences converting consultations to bookings.' },
      { title: 'Month 5–6: Scale', description: 'Lead volume up 120%. Average transaction value increased 25% as brand attracted higher-intent patients. Organic social following grew 400%.' },
    ],
    results: [
      { value: '120%', label: 'Increase in Qualified Leads' },
      { value: '25%', label: 'Higher Average Transaction Value' },
      { value: '400%', label: 'Social Media Following Growth' },
      { value: '4.2x', label: 'Return on Ad Spend (ROAS)' },
    ],
    testimonial: {
      quote: 'They completely transformed our brand. We went from competing on price to being the aspirational choice in Austin. Our consultation bookings have never been higher.',
      name: 'Clinic Owner',
      title: 'Austin Aesthetic Clinic',
    },
    timeline: '6 months',
    faqs: [
      { q: 'How does brand positioning affect patient acquisition for medspas?', a: 'Premium positioning attracts patients willing to pay more for perceived quality. By investing in brand identity and social proof, you reduce price sensitivity and increase lifetime patient value.' },
      { q: 'What social media platforms work best for cosmetic practices?', a: 'Instagram and TikTok are the top platforms for aesthetic practices. Visual content showcasing results, behind-the-scenes, and educational content builds trust and drives consultations.' },
      { q: 'How long does a medspa marketing strategy take to show results?', a: 'Meta Ads can drive enquiries within the first week. Brand repositioning and organic social typically show measurable impact within 60–90 days. Full ROI realisation usually takes 4–6 months.' },
    ],
    relatedCaseStudies: [
      { slug: 'mental-health-patient-retention', label: 'Mental Health — 2x Patient Retention' },
      { slug: 'urgent-care-patient-acquisition', label: 'Urgent Care — 3x Patient Acquisition' },
    ],
  },
  {
    slug: 'primary-care-seo-roi',
    title: 'Primary Care Practice — 500% SEO ROI | NextGen Health Case Study',
    metaDescription: 'How a family medicine practice in San Antonio achieved 500%+ ROI from organic SEO, generating $300K+ in annual revenue from Google search alone.',
    h1: 'Primary Care Practice — 500% SEO ROI',
    heroDescription: 'A family medicine practice in San Antonio was invisible in search results. Our local SEO and content strategy generated $300K+ in additional annual revenue from organic traffic — a 500%+ return on investment.',
    icon: '👨‍⚕️',
    industry: 'Primary Care',
    industrySlug: 'primary-care',
    services: [
      { slug: 'seo-local-search', label: 'SEO & Local Search' },
      { slug: 'content-copywriting', label: 'Content & Copywriting' },
      { slug: 'google-business-profile', label: 'Google Business Profile' },
    ],
    challenge: 'The practice had been open for 5 years but had zero organic search visibility. They relied entirely on word-of-mouth referrals and expensive Google Ads. Their website was outdated and had no blog content.',
    challengePoints: [
      'Not ranking for any "doctor near me" or "family doctor" keywords',
      'Website was template-based with no SEO optimisation',
      'Zero blog content to capture informational queries',
      'Google Business Profile unclaimed and unoptimised',
      'No review generation — only 12 reviews total',
    ],
    strategy: 'We built a comprehensive organic presence from scratch: claimed and optimised GBP, rebuilt the website with SEO fundamentals, and launched a patient education blog to capture long-tail keywords.',
    strategyPoints: [
      'GBP claimed, verified, and fully optimised with photos and services',
      'Website restructured with location-specific service pages',
      'Blog content strategy targeting patient health questions',
      'Local citation building across 120+ medical directories',
      'Automated review collection tied to patient checkout flow',
    ],
    execution: [
      { title: 'Month 1: Technical Setup', description: 'GBP claimed and optimised, website SEO audit, citation submission to 120+ directories, review system deployment.' },
      { title: 'Month 2–3: Content Launch', description: 'Published 8 blog posts targeting high-volume patient questions. Service pages rewritten with location keywords.' },
      { title: 'Month 4–6: Growth', description: 'Blog posts ranking on page 1 for 25+ keywords. GBP appearing in Local Pack. Organic traffic up 340%.' },
      { title: 'Month 7–12: Scale', description: 'Continued blog cadence at 4 posts/month. Organic traffic became #1 new patient source. $300K+ in attributed annual revenue.' },
    ],
    results: [
      { value: '500%+', label: 'Return on SEO Investment' },
      { value: '$300K+', label: 'Additional Annual Revenue' },
      { value: '340%', label: 'Organic Traffic Growth' },
      { value: '78', label: 'Keywords in Google Top 10' },
    ],
    testimonial: {
      quote: 'SEO was always something we knew we should do but never had the expertise. NextGen Health made it effortless and the results speak for themselves. Google is now our #1 source of new patients.',
      name: 'Practice Owner, MD',
      title: 'San Antonio Family Medicine',
    },
    timeline: '12 months',
    faqs: [
      { q: 'How long does SEO take for a primary care practice?', a: 'Initial improvements typically appear within 2–3 months. Significant traffic and revenue growth usually requires 6–12 months of consistent effort. SEO is a long-term investment that compounds over time.' },
      { q: 'Can a small practice compete with large health systems in SEO?', a: 'Absolutely. Local SEO favours proximity and relevance over brand size. A well-optimised small practice can outrank large health systems for local searches in their immediate service area.' },
      { q: 'What kind of blog content should a primary care practice publish?', a: 'Focus on answering common patient questions: "when to see a doctor for...", preventive care guides, seasonal health tips, and explanations of common conditions. This content captures patients researching health concerns.' },
    ],
    relatedCaseStudies: [
      { slug: 'dental-practice-local-pack', label: 'Dental Practice — Local Pack #1' },
      { slug: 'er-network-patient-growth', label: 'ER Network — 45% Patient Growth' },
    ],
  },
  {
    slug: 'mental-health-patient-retention',
    title: 'Mental Health Clinic — 2x Patient Retention | NextGen Health Case Study',
    metaDescription: 'How a therapy practice in Dallas doubled patient retention and cut marketing spend 40% with email automation and content strategy.',
    h1: 'Mental Health Practice — 2x Patient Retention',
    heroDescription: 'A therapy practice in Dallas had high patient acquisition costs and poor retention. Our email automation and content strategy doubled patient retention rates and reduced overall marketing spend by 40%.',
    icon: '🧠',
    industry: 'Mental Health',
    industrySlug: 'mental-health',
    services: [
      { slug: 'email-drip-campaigns', label: 'Email & Drip Campaigns' },
      { slug: 'content-copywriting', label: 'Content & Copywriting' },
      { slug: 'social-media-marketing', label: 'Social Media Marketing' },
    ],
    challenge: 'Mental health practices face unique marketing challenges: stigma reduces direct-search volume, patient consideration periods are longer, and retention is critical for both clinical outcomes and revenue. This practice was losing patients after 3–4 sessions.',
    challengePoints: [
      'Patient dropout rate of 45% after initial consultation',
      'No follow-up system between appointments',
      'Content didn\'t address the stigma barrier to seeking help',
      'Social media was clinical and impersonal',
      'No differentiation from generic therapy directories',
    ],
    strategy: 'We built a nurture ecosystem that supported patients throughout their mental health journey — from first search to ongoing care. Content normalised seeking help, and automated follow-ups kept patients engaged between sessions.',
    strategyPoints: [
      'Email nurture sequences for new patients with educational content',
      'Between-session check-in emails with wellness tips and resources',
      'Blog content addressing stigma, self-care, and when to seek help',
      'Warm, personal social media voice featuring staff and patient stories (anonymised)',
      'Automated appointment reminders with session preparation tips',
    ],
    execution: [
      { title: 'Month 1: Empathy Mapping', description: 'Patient journey mapping, content voice development, email automation setup, social media strategy build.' },
      { title: 'Month 2: Launch', description: 'Email sequences activated. Blog content published bi-weekly. Social media shifted to warm, educational tone.' },
      { title: 'Month 3–4: Engagement', description: 'Between-session emails showing 62% open rates. Blog content ranking for "therapy near me" and "signs of anxiety" keywords.' },
      { title: 'Month 5–6: Results', description: 'Patient retention doubled. Marketing spend reduced as retained patients generated more revenue per patient. Referrals increased 30%.' },
    ],
    results: [
      { value: '2x', label: 'Patient Retention Rate' },
      { value: '40%', label: 'Reduction in Marketing Spend' },
      { value: '62%', label: 'Email Open Rate' },
      { value: '30%', label: 'Increase in Patient Referrals' },
    ],
    testimonial: {
      quote: 'What sets NextGen apart is they understand mental healthcare. They didn\'t just market our services — they helped us communicate with empathy and keep patients engaged in their care journey.',
      name: 'Clinical Director, LCSW',
      title: 'Dallas Therapy Practice',
    },
    timeline: '6 months',
    faqs: [
      { q: 'How do you market mental health services ethically?', a: 'We focus on education and normalisation rather than fear or urgency. Content addresses common concerns, reduces stigma, and emphasises hope and outcomes. All messaging is reviewed for clinical appropriateness.' },
      { q: 'Can email marketing work for therapy practices?', a: 'Yes — extremely well. Between-session emails with wellness tips, self-care resources, and gentle check-ins keep patients engaged and reduce dropout. Our campaigns consistently achieve 50-65% open rates.' },
      { q: 'How do mental health practices handle HIPAA in marketing?', a: 'We never reference specific patients, diagnoses, or treatment plans. All testimonials are anonymised and consent-based. Email systems are HIPAA-compliant with BAA agreements in place.' },
    ],
    relatedCaseStudies: [
      { slug: 'cosmetic-surgery-lead-growth', label: 'Cosmetic Surgery — 120% Lead Growth' },
      { slug: 'primary-care-seo-roi', label: 'Primary Care — 500% SEO ROI' },
    ],
  },
  {
    slug: 'dental-practice-local-pack',
    title: 'Dental Practice — Local Pack #1 Ranking | NextGen Health Case Study',
    metaDescription: 'How a general dentistry practice in Irving achieved #1 Local Pack ranking and 70% more bookings through GBP optimisation and local SEO.',
    h1: 'Dental Practice — #1 Local Pack Ranking',
    heroDescription: 'A general dentistry practice in Irving was not appearing in Google\'s top local results despite being established for over a decade. Our GBP optimisation and local SEO strategy secured the #1 Local Pack position and drove a 70% increase in appointment bookings.',
    icon: '🦷',
    industry: 'Dental',
    industrySlug: 'dental',
    services: [
      { slug: 'google-business-profile', label: 'Google Business Profile' },
      { slug: 'seo-local-search', label: 'SEO & Local Search' },
      { slug: 'analytics-reporting', label: 'Analytics & Reporting' },
    ],
    challenge: 'The practice had been operating for 12 years but had never invested in digital marketing. Their GBP was unclaimed, their website was outdated, and corporate dental chains were dominating local search results.',
    challengePoints: [
      'GBP unclaimed — no photos, posts, or Q&A',
      'Only 18 Google reviews (average 3.8 stars)',
      'Corporate chains spending 10x more on local ads',
      'Website not mobile-optimised — 70% of dental searches are mobile',
      'No local citations beyond basic directory listings',
    ],
    strategy: 'We focused on what independent dental practices do best — personal care and community trust — and amplified it digitally. GBP became the cornerstone of the strategy, supported by local SEO and reputation management.',
    strategyPoints: [
      'GBP claimed, fully optimised with professional photos and all services listed',
      'Weekly GBP posts highlighting treatments, team, and patient education',
      'Review generation system integrated with practice management software',
      'Local citation building targeting dental-specific directories',
      'Website redesign for mobile-first experience',
    ],
    execution: [
      { title: 'Month 1: GBP Foundation', description: 'GBP claim and verification, professional photography, service listing optimisation, review system setup.' },
      { title: 'Month 2: Local Authority', description: 'Citation building across 80+ directories. Weekly GBP posts started. First review campaign launched.' },
      { title: 'Month 3: Rankings Climb', description: 'GBP moved from not visible to position 5 in Local Pack. Reviews grew from 18 to 65. Website traffic up 150%.' },
      { title: 'Month 4–6: Dominance', description: '#1 Local Pack ranking secured. Reviews reached 120+ at 4.9 stars. Appointment bookings up 70%.' },
    ],
    results: [
      { value: '#1', label: 'Google Local Pack Ranking' },
      { value: '70%', label: 'Increase in Appointment Bookings' },
      { value: '4.9★', label: 'Google Rating (from 3.8)' },
      { value: '120+', label: 'Google Reviews (from 18)' },
    ],
    testimonial: {
      quote: 'I wish we had done this years ago. We went from being invisible to being the first result patients see. The phone hasn\'t stopped ringing since we hit #1.',
      name: 'Practice Owner, DDS',
      title: 'Irving General Dentistry',
    },
    timeline: '6 months',
    faqs: [
      { q: 'How does a dental practice get to #1 on Google Maps?', a: 'It requires a combination of GBP optimisation (complete profile, weekly posts, Q&A), consistent positive reviews, local citations, and website SEO. Proximity to searcher also plays a role, but a well-optimised profile can outperform closer competitors.' },
      { q: 'How many Google reviews does a dental practice need?', a: 'Quality and recency matter more than quantity. Aim for 50+ reviews with a consistent flow of new reviews weekly. A practice with 50 recent 4.8-star reviews will typically outrank one with 200 older reviews.' },
      { q: 'Can an independent dentist compete with corporate dental chains?', a: 'Yes. Local SEO levels the playing field. Google\'s algorithm favours relevance and proximity over advertising budget. An independently owned practice with strong local signals consistently outranks corporate chains in local search results.' },
    ],
    relatedCaseStudies: [
      { slug: 'primary-care-seo-roi', label: 'Primary Care — 500% SEO ROI' },
      { slug: 'er-network-patient-growth', label: 'ER Network — 45% Patient Growth' },
    ],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudyData | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((cs) => cs.slug);
}
