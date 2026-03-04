import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  avatar: string;
  plan: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

async function seedUsers() {
  console.log('📥 Seeding users from CSV...');
  
  const csvPath = path.join(process.cwd(), 'users_final_importable_clean.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Users CSV not found at', csvPath);
    return;
  }

  const users: UserRow[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: UserRow) => {
        users.push(row);
      })
      .on('end', async () => {
        try {
          let importedCount = 0;
          for (const user of users) {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            if (!existingUser) {
              await prisma.user.create({
                data: {
                  id: user.id,
                  email: user.email,
                  password: user.password,
                  name: user.name,
                  role: user.role || 'client',
                  avatar: user.avatar || null,
                  plan: user.plan || null,
                  planId: user.planId || null,
                  stripeCustomerId: user.stripeCustomerId || null,
                  stripeSubscriptionId: user.stripeSubscriptionId || null,
                  subscriptionStatus: user.subscriptionStatus || null,
                },
              });
              importedCount++;
            }
          }
          console.log(`✅ Imported ${importedCount} users`);
          resolve(null);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function seedBlogPosts() {
  console.log('📝 Seeding blog posts...');

  const samplePosts = [
    {
      title: 'The Complete Guide to Healthcare SEO in 2026',
      slug: 'healthcare-seo-guide-2026',
      excerpt: 'Master the essentials of healthcare SEO with our comprehensive guide tailored for clinics and medical practices.',
      content: `# Healthcare SEO for Modern Practices

Healthcare SEO has evolved significantly. Here's what you need to know in 2026:

## 1. Local Search Dominance
Google My Business optimization is critical for local healthcare practices. Ensure your GMB profile is complete and updated regularly.

## 2. E-E-A-T Signals
Experience, Expertise, Authoritativeness, and Trustworthiness are now essential ranking factors for healthcare content.

## 3. Voice Search Optimization
With more patients using voice search for healthcare information, optimize for conversational queries.

## 4. Mobile-First Indexing
Most users search for healthcare services on mobile. Ensure your website is fully optimized for mobile devices.

## 5. Content Quality Over Quantity
Focus on creating in-depth, medically accurate content that addresses patient concerns comprehensively.`,
      seoTitle: 'Healthcare SEO Guide 2026 | Best Practices for Medical Practices',
      metaDesc: 'Learn healthcare SEO best practices for 2026. Optimize your medical practice for local search and attract more patients.',
      publishedAt: new Date('2026-02-15'),
    },
    {
      title: '5 Ways Google Ads is Transforming Patient Acquisition',
      slug: 'google-ads-patient-acquisition',
      excerpt: 'Discover how modern Google Ads strategies are helping healthcare providers acquire more qualified patients.',
      content: `# Google Ads for Patient Acquisition

Google Ads remains one of the most effective channels for acquiring new patients. Here are 5 key strategies:

## 1. Search Ads with Extensions
Use call extensions, location extensions, and promotion extensions to increase visibility and conversion rates.

## 2. Performance Max Campaigns
Let Google's machine learning optimize your ads across all channels for maximum conversions.

## 3. Smart Bidding Strategies
Implement target CPA or ROAS-based bidding to maximize your return on advertising spend.

## 4. Audience Segmentation
Target healthcare professionals, patients of specific conditions, and family members separately.

## 5. Landing Page Optimization
Ensure your landing pages are mobile-friendly, fast-loading, and focused on conversion.`,
      seoTitle: 'Google Ads for Healthcare | Patient Acquisition Strategies',
      metaDesc: 'Discover proven Google Ads strategies for healthcare providers to acquire more patients and reduce acquisition costs.',
      publishedAt: new Date('2026-02-20'),
    },
    {
      title: 'Why Your Healthcare Website Needs HIPAA Compliance',
      slug: 'hipaa-compliance-healthcare-websites',
      excerpt: 'Understanding HIPAA compliance for healthcare websites and why it matters for your practice.',
      content: `# HIPAA Compliance for Healthcare Websites

HIPAA compliance is not just a legal requirement—it's essential for patient trust and data security.

## Legal Requirements
All healthcare providers handling patient information must comply with HIPAA regulations. Violations can result in significant fines.

## Patient Data Protection
Implement SSL/TLS encryption, secure authentication, and regular security audits to protect patient data.

## Patient Privacy
Be transparent about how you collect, store, and use patient information. Provide clear privacy policies.

## Breach Notification
Have a plan in place to notify patients in case of a data breach within the required timeframe.

## Regular Security Audits
Conduct regular security assessments and penetration testing to identify and address vulnerabilities.`,
      seoTitle: 'HIPAA Compliance for Healthcare Websites | Best Practices',
      metaDesc: 'Learn why HIPAA compliance is critical for healthcare websites and how to implement it properly.',
      publishedAt: new Date('2026-02-25'),
    },
  ];

  let addedCount = 0;
  for (const post of samplePosts) {
    const existing = await prisma.post.findUnique({
      where: { slug: post.slug },
    });

    if (!existing) {
      await prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          seoTitle: post.seoTitle,
          metaDesc: post.metaDesc,
          publishedAt: post.publishedAt,
        },
      });
      addedCount++;
    }
  }

  console.log(`✅ Added ${addedCount} blog posts`);
}

async function seedNewsArticles() {
  console.log('📰 Seeding news articles...');

  const sampleNews = [
    {
      title: 'New Healthcare Marketing Trends for Q1 2026',
      slug: 'healthcare-marketing-trends-q1-2026',
      excerpt: 'The latest trends shaping healthcare marketing in the first quarter of 2026.',
      content: `# Healthcare Marketing Trends Q1 2026

## AI-Powered Personalization
Healthcare marketers are increasingly using AI to deliver personalized patient experiences. From email marketing to website content, personalization is key.

## Patient Education Content
Patients want to understand their conditions and treatment options. Educational content is driving engagement and trust.

## Omnichannel Strategies
Successful healthcare practices are meeting patients where they are—across web, mobile, social, and email.

## Community Building
Building online communities around patient support groups and wellness programs is creating strong brand loyalty.

## Regulatory Compliance First
With evolving privacy regulations, healthcare marketers must prioritize compliance in all their initiatives.`,
      source: 'Healthcare Marketing Institute',
      publishedAt: new Date('2026-03-01'),
    },
    {
      title: 'Patient Data Privacy Regulations Update January 2026',
      slug: 'patient-data-privacy-update-jan-2026',
      excerpt: 'Key updates to patient data privacy regulations affecting healthcare providers.',
      content: `# Patient Data Privacy Regulations Update

## New HIPAA Amendments
The HHS has released new guidance on HIPAA compliance requirements for telemedicine providers.

## State-Level Regulations
Several states have introduced stricter data privacy laws that healthcare providers must adhere to.

## GDPR-Like Requirements
Some regions are adopting GDPR-like requirements for handling patient data.

## Documentation Requirements
Healthcare providers must maintain detailed documentation of their privacy practices and data handling procedures.

## Vendor Agreements
Ensure all third-party vendors handling patient data have signed BAA (Business Associate Agreements).`,
      source: 'Healthcare Compliance News',
      publishedAt: new Date('2026-02-28'),
    },
    {
      title: 'Summer 2026 Healthcare Marketing Strategies',
      slug: 'summer-healthcare-marketing-2026',
      excerpt: 'Prepare your healthcare marketing strategy for the busy summer season.',
      content: `# Summer 2026 Healthcare Marketing Strategy

## Seasonal Campaigns
Summer brings increased demand for certain healthcare services. Plan campaigns targeting seasonal health concerns.

## Preventive Care Focus
Use summer to promote preventive care and wellness programs to attract health-conscious patients.

## Social Media Engagement
Increase social media activity during summer months when engagement is typically higher.

## Patient Testimonials
Summer is a great time to collect patient testimonials and success stories for your marketing materials.

## Team Expansion Planning
If planning to hire additional staff, start recruitment campaigns now for summer onboarding.`,
      source: 'Healthcare Marketing Journal',
      publishedAt: new Date('2026-02-20'),
    },
  ];

  let addedCount = 0;
  for (const article of sampleNews) {
    const existing = await prisma.newsArticle.findUnique({
      where: { slug: article.slug },
    });

    if (!existing) {
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          source: article.source,
          publishedAt: article.publishedAt,
        },
      });
      addedCount++;
    }
  }

  console.log(`✅ Added ${addedCount} news articles`);
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');

    await seedUsers();
    await seedBlogPosts();
    await seedNewsArticles();

    console.log('\n✨ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
