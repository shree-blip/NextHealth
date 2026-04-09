export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  longBio: string;
  credentials: string[];
  image: string;
  specialties: string[];
  linkedin?: string;
}

export const teamMembers: TeamMember[] = [
  {
    slug: 'shree-gauli',
    name: 'Shree Gauli',
    role: 'Sr Marketing Officer',
    bio: 'Senior Marketing Officer with 8+ years of experience driving healthcare growth and patient acquisition. Specialises in multi-channel marketing strategy, brand positioning, and ROI-driven campaign management for clinics across Texas.',
    longBio: 'Shree Gauli leads marketing strategy at NextGen Health with over eight years of hands-on experience driving measurable growth for healthcare organisations. From freestanding emergency rooms to multi-location dental groups, Shree has designed and executed patient-acquisition campaigns that consistently deliver 3–5× return on ad spend. His expertise spans the full marketing funnel — from brand positioning and competitive analysis to campaign buildout, conversion-rate optimisation, and retention marketing. Shree works directly with clinic leadership teams to align marketing outcomes with operational capacity, ensuring every new patient gained is a patient the practice can serve well.',
    credentials: ['Google Ads Certified', 'HubSpot Inbound Marketing', 'Healthcare Marketing Strategy'],
    image: '/shree-gauli.png',
    specialties: ['Multi-channel campaign strategy', 'Healthcare brand positioning', 'ROI tracking & attribution', 'Patient acquisition funnels', 'Market analysis & competitive intelligence'],
  },
  {
    slug: 'bikash-neupane',
    name: 'Bikash Neupane',
    role: 'Marketing / IT Project Manager',
    bio: 'Bridges the gap between marketing strategies and IT implementation for seamless clinic operations. 6+ years managing cross-functional teams, MarTech integrations, and HIPAA-compliant digital infrastructure projects.',
    longBio: 'Bikash Neupane serves as the operational backbone of NextGen Health, managing the intersection of marketing strategy and technical implementation. With six-plus years leading cross-functional teams, Bikash ensures every campaign, automation workflow, and website launch is delivered on time, within scope, and fully compliant with HIPAA regulations. He oversees MarTech stack integrations — connecting CRMs, EHR systems, call-tracking platforms, and analytics dashboards into unified ecosystems that give clinic owners a single source of truth. His project-management discipline ensures that creative ideas don\'t just stay on whiteboards; they ship.',
    credentials: ['PMP Certified', 'Agile Scrum Master', 'HIPAA Compliance Training'],
    image: '/bikash-neupane.png',
    specialties: ['Project management & delivery', 'MarTech stack integration', 'HIPAA-compliant infrastructure', 'Cross-functional team leadership', 'EHR & CRM integrations'],
  },
  {
    slug: 'sonu-sagar-dongol',
    name: 'Sonu Sagar Dongol',
    role: 'Paid Ads Specialist / Media Buyer',
    bio: 'Expert in managing high-ROI paid media campaigns across Google, Meta, and programmatic platforms. Has managed $2M+ in annual healthcare ad spend with an average 4.2x ROAS across 30+ medical practice accounts.',
    longBio: 'Sagar Dongol is the paid-media engine behind NextGen Health\'s client results, managing over $2 million in annual healthcare advertising spend across Google Ads, Meta Ads, and programmatic display. With a proven average ROAS of 4.2× across 30+ medical-practice accounts, Sagar combines granular keyword strategy with creative ad copy tailored to healthcare audiences. He specialises in geo-targeting for multi-location practices, call-only campaigns for urgent care, and conversion-tracking architectures that attribute real appointments (not just clicks) back to every dollar spent. His campaigns routinely fill waiting rooms while keeping cost-per-acquisition within profitable thresholds.',
    credentials: ['Google Ads Search Certified', 'Meta Blueprint Certified', 'Google Analytics 4'],
    image: '/sagar-dongol.png',
    specialties: ['Google Ads management', 'Meta & Facebook Ads', 'Healthcare PPC strategy', 'Conversion tracking & attribution', 'Budget optimisation & ROAS'],
  },
  {
    slug: 'bijesh-khadgi',
    name: 'Bijesh Khadgi',
    role: 'Social Media Manager',
    bio: 'Crafts engaging social media strategies to build brand awareness and patient trust. Manages social presence for 20+ healthcare practices with a focus on compliant content creation and community engagement.',
    longBio: 'Bijesh Khadgi manages social media strategy and execution for 20+ healthcare practices at NextGen Health. His approach balances creative storytelling with strict HIPAA compliance — every post, reel, and community interaction is designed to build patient trust while staying within medical-advertising regulations. Bijesh develops platform-specific content calendars, manages paid social campaigns, monitors online reputation, and trains clinic staff on social media best practices. His work has helped practices grow Instagram followings 400%+ and generate measurable patient inquiries directly from social platforms.',
    credentials: ['Meta Social Media Marketing', 'Hootsuite Certified', 'HIPAA Social Media Compliance'],
    image: '/bijesh-khadgi.png',
    specialties: ['Social media strategy', 'Content calendar management', 'HIPAA-compliant social content', 'Community engagement', 'Online reputation management'],
  },
  {
    slug: 'sumit-sharma',
    name: 'Sumit Sharma',
    role: 'SEO Manager',
    bio: 'Specialises in Local SEO and Answer Engine Optimisation to ensure top rankings for clinics. Has achieved 100+ first-page Google rankings for healthcare practices, with deep expertise in GBP optimisation and medical schema markup.',
    longBio: 'Sumit Sharma leads search engine optimisation at NextGen Health, where he has delivered 100+ first-page Google rankings for healthcare practices across Texas. His expertise spans technical SEO, content-driven keyword strategies, and local-search dominance — including Google Business Profile optimisation that routinely lands clients in the coveted Local Pack. Sumit also pioneered the firm\'s approach to Answer Engine Optimisation (AEO), ensuring client content surfaces in AI-generated answers, featured snippets, and voice-search results. He is the architect behind the medical schema-markup implementation that gives NextGen Health clients rich results in SERPs.',
    credentials: ['Google Analytics Certified', 'SEMrush SEO Toolkit', 'Local SEO & GBP Specialist'],
    image: '/sumit-sharma.png',
    specialties: ['Local SEO & Google Business Profile', 'Technical SEO audits', 'Medical schema markup', 'Answer Engine Optimisation (AEO)', 'Content strategy & keyword research'],
  },
  {
    slug: 'rahul-roy',
    name: 'Rahul Roy',
    role: 'Content Writer',
    bio: 'Creates authoritative, HIPAA-compliant medical content that drives engagement and SEO value. Produces 50K+ words of healthcare content monthly across blog posts, landing pages, and patient education materials.',
    longBio: 'Rahul Roy is the lead content strategist at NextGen Health, producing over 50,000 words of healthcare marketing content each month. From SEO-optimised blog posts and service-page copy to patient-education materials and email-nurture sequences, Rahul ensures every word is medically accurate, HIPAA-compliant, and written to convert. He collaborates closely with the SEO team to align content with keyword opportunities and with the design team to create visually engaging long-form guides. His writing has directly contributed to significant organic-traffic growth for clients across dental, urgent care, medspa, and mental-health verticals.',
    credentials: ['Medical Content Writing', 'HIPAA Compliance Certified', 'SEO Content Strategy'],
    image: '/rahul-roy.png',
    specialties: ['Healthcare blog & article writing', 'Service-page copywriting', 'Patient education materials', 'E-E-A-T content strategy', 'SEO content optimisation'],
  },
  {
    slug: 'bidhitsha-khadka',
    name: 'Bidhitsha Khadka',
    role: 'Graphics Designer',
    bio: 'Designs visually stunning and conversion-optimised assets for healthcare campaigns. Creates clinic brand identities, ad creatives, and print materials that meet medical advertising compliance standards.',
    longBio: 'Bidhitsha Khadka brings healthcare brands to life through strategic visual design. As the lead graphic designer at NextGen Health, she creates everything from full clinic brand identities and logo systems to digital ad creatives, social media assets, patient brochures, and website UI components. Every design she produces is optimised for conversion — balancing aesthetic appeal with clear calls-to-action, trust signals, and accessibility standards. Bidhitsha understands the unique requirements of medical advertising compliance and ensures all visual materials meet regulatory guidelines while standing out in competitive markets.',
    credentials: ['Adobe Creative Suite Expert', 'UI/UX Design', 'Healthcare Brand Identity'],
    image: '/bidhitsha-khadka.png',
    specialties: ['Healthcare brand identity', 'Ad creative design', 'Print & brochure design', 'UI/UX design', 'Conversion-optimised visuals'],
  },
  {
    slug: 'sagar-timalsina',
    name: 'Sagar Timalsina',
    role: 'Software Developer',
    bio: 'Develops robust, secure, and scalable automation tools and web applications for medical practices. Builds HIPAA-compliant platforms, patient portals, and marketing automation systems using modern technology stacks.',
    longBio: 'Sagar Timalsina is the technical architect behind NextGen Health\'s web platforms and marketing-automation systems. He builds HIPAA-compliant web applications, patient portals, AI chatbot integrations, and custom automation workflows using modern technology stacks including Next.js, React, Node.js, and N8N. Sagar\'s work extends from the frontend — creating fast, accessible, SEO-optimised websites — through to backend infrastructure, database design, API integrations, and cloud deployment on platforms like Vercel and AWS. He has implemented the end-to-end automation systems that allow NextGen Health clients to automate patient intake, appointment reminders, review collection, and marketing reporting.',
    credentials: ['Full-Stack Development', 'HIPAA-Compliant Architecture', 'Cloud & DevOps'],
    image: '/sagar-timalsina.png',
    specialties: ['Full-stack web development', 'HIPAA-compliant application architecture', 'Marketing automation (N8N)', 'AI chatbot integration', 'Cloud infrastructure & DevOps'],
  },
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return teamMembers.find((m) => m.slug === slug);
}

export function getAllTeamSlugs(): string[] {
  return teamMembers.map((m) => m.slug);
}
