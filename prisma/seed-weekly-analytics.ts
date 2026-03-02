// Seed script to populate dummy weekly analytics data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyWeeklyData = [
  // Nov Week 1-4, Dec Week 1-4, Jan Week 1-4, Feb Week 1-4 (total 16 weeks, but user provided 8 weeks of data)
  {
    weekLabel: 'Nov Week 1',
    year: 2025,
    month: 11,
    weekNumber: 1,
    blogsPublished: 4,
    avgRanking: 8,
    totalTraffic: 624,
    callsRequested: 35,
    websiteVisits: 32,
    directionClicks: 47,
    metaImpressions: 15000,
    metaClicks: 450,
    metaCTR: 3.0,
    metaConversions: 25,
    metaAdSpend: 1200,
    googleImpressions: 25000,
    googleClicks: 850,
    googleCTR: 3.4,
    googleCPC: 2.5,
    googleConversions: 45,
    googleCVR: 5.3,
    googleCostPerConversion: 47.22,
    googleTotalCost: 2125,
    socialPosts: 12,
    socialViews: 8500,
    patientCount: 145,
    digitalConversion: 0,
    conversionRate: 0,
    dailyPatientAvg: 20.7
  },
  {
    weekLabel: 'Nov Week 2',
    year: 2025,
    month: 11,
    weekNumber: 2,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 629,
    callsRequested: 16,
    websiteVisits: 24,
    directionClicks: 79,
    metaImpressions: 16200,
    metaClicks: 475,
    metaCTR: 2.9,
    metaConversions: 28,
    metaAdSpend: 1250,
    googleImpressions: 26500,
    googleClicks: 920,
    googleCTR: 3.5,
    googleCPC: 2.4,
    googleConversions: 48,
    googleCVR: 5.2,
    googleCostPerConversion: 46.25,
    googleTotalCost: 2220,
    socialPosts: 14,
    socialViews: 9200,
    patientCount: 152,
    digitalConversion: 0,
    conversionRate: 0,
    dailyPatientAvg: 21.7
  },
  {
    weekLabel: 'Dec Week 1',
    year: 2025,
    month: 12,
    weekNumber: 1,
    blogsPublished: 4,
    avgRanking: 7,
    totalTraffic: 644,
    callsRequested: 32,
    websiteVisits: 33,
    directionClicks: 100,
    metaImpressions: 17500,
    metaClicks: 510,
    metaCTR: 2.9,
    metaConversions: 32,
    metaAdSpend: 1300,
    googleImpressions: 28000,
    googleClicks: 980,
    googleCTR: 3.5,
    googleCPC: 2.3,
    googleConversions: 52,
    googleCVR: 5.3,
    googleCostPerConversion: 44.42,
    googleTotalCost: 2310,
    socialPosts: 15,
    socialViews: 10500,
    patientCount: 168,
    digitalConversion: 0,
    conversionRate: 0,
    dailyPatientAvg: 24.0
  },
  {
    weekLabel: 'Dec Week 2',
    year: 2025,
    month: 12,
    weekNumber: 2,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 502,
    callsRequested: 26,
    websiteVisits: 24,
    directionClicks: 89,
    metaImpressions: 14800,
    metaClicks: 445,
    metaCTR: 3.0,
    metaConversions: 26,
    metaAdSpend: 1180,
    googleImpressions: 24000,
    googleClicks: 840,
    googleCTR: 3.5,
    googleCPC: 2.5,
    googleConversions: 44,
    googleCVR: 5.2,
    googleCostPerConversion: 47.73,
    googleTotalCost: 2100,
    socialPosts: 13,
    socialViews: 8900,
    patientCount: 142,
    digitalConversion: 0,
    conversionRate: 0,
    dailyPatientAvg: 20.3
  },
  {
    weekLabel: 'Jan Week 1',
    year: 2026,
    month: 1,
    weekNumber: 1,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 223,
    callsRequested: 14,
    websiteVisits: 16,
    directionClicks: 46,
    metaImpressions: 12000,
    metaClicks: 360,
    metaCTR: 3.0,
    metaConversions: 20,
    metaAdSpend: 980,
    googleImpressions: 18000,
    googleClicks: 630,
    googleCTR: 3.5,
    googleCPC: 2.6,
    googleConversions: 35,
    googleCVR: 5.6,
    googleCostPerConversion: 46.86,
    googleTotalCost: 1640,
    socialPosts: 10,
    socialViews: 6500,
    patientCount: 95,
    digitalConversion: 28,
    conversionRate: 29.5,
    dailyPatientAvg: 13.6
  },
  {
    weekLabel: 'Jan Week 2',
    year: 2026,
    month: 1,
    weekNumber: 2,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 188,
    callsRequested: 16,
    websiteVisits: 22,
    directionClicks: 38,
    metaImpressions: 11500,
    metaClicks: 345,
    metaCTR: 3.0,
    metaConversions: 18,
    metaAdSpend: 950,
    googleImpressions: 17500,
    googleClicks: 595,
    googleCTR: 3.4,
    googleCPC: 2.7,
    googleConversions: 32,
    googleCVR: 5.4,
    googleCostPerConversion: 50.16,
    googleTotalCost: 1605,
    socialPosts: 11,
    socialViews: 7200,
    patientCount: 88,
    digitalConversion: 25,
    conversionRate: 28.4,
    dailyPatientAvg: 12.6
  },
  {
    weekLabel: 'Feb Week 1',
    year: 2026,
    month: 2,
    weekNumber: 1,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 285,
    callsRequested: 19,
    websiteVisits: 18,
    directionClicks: 42,
    metaImpressions: 13500,
    metaClicks: 405,
    metaCTR: 3.0,
    metaConversions: 22,
    metaAdSpend: 1050,
    googleImpressions: 20000,
    googleClicks: 700,
    googleCTR: 3.5,
    googleCPC: 2.5,
    googleConversions: 38,
    googleCVR: 5.4,
    googleCostPerConversion: 46.05,
    googleTotalCost: 1750,
    socialPosts: 12,
    socialViews: 7800,
    patientCount: 105,
    digitalConversion: 30,
    conversionRate: 28.6,
    dailyPatientAvg: 15.0
  },
  {
    weekLabel: 'Feb Week 2',
    year: 2026,
    month: 2,
    weekNumber: 2,
    blogsPublished: 5,
    avgRanking: 7,
    totalTraffic: 221,
    callsRequested: 13,
    websiteVisits: 21,
    directionClicks: 25,
    metaImpressions: 12200,
    metaClicks: 366,
    metaCTR: 3.0,
    metaConversions: 19,
    metaAdSpend: 980,
    googleImpressions: 18500,
    googleClicks: 647,
    googleCTR: 3.5,
    googleCPC: 2.6,
    googleConversions: 34,
    googleCVR: 5.3,
    googleCostPerConversion: 49.41,
    googleTotalCost: 1680,
    socialPosts: 11,
    socialViews: 7100,
    patientCount: 92,
    digitalConversion: 26,
    conversionRate: 28.3,
    dailyPatientAvg: 13.1
  }
];

async function seedWeeklyAnalytics() {
  try {
    console.log('Seeding weekly analytics data...');

    // Get client user for assignments
    let clientUser = await prisma.user.findFirst({
      where: { role: 'client' }
    });

    if (!clientUser) {
      console.log('⚠️  No client user found. Creating default client user...');
      clientUser = await prisma.user.create({
        data: {
          email: 'jaya.r.dahal@focusyourfinance.com',
          password: 'Hello@123',
          name: 'Jaya R. Dahal',
          role: 'client',
        }
      });
      console.log(`✓ Created client user: ${clientUser.email}`);
    }

    // Get all clinics
    let clinics = await prisma.clinic.findMany();
    
    // Create additional clinics if needed to reach 7
    if (clinics.length < 7) {
      const clinicsToCreate = [
        { name: 'Dallas Urgent Care', type: 'Urgent Care', location: 'Dallas, TX' },
        { name: 'Austin Wellness Center', type: 'Wellness', location: 'Austin, TX' },
        { name: 'Houston Med Spa', type: 'MedSpa', location: 'Houston, TX' },
        { name: 'San Antonio ER', type: 'ER', location: 'San Antonio, TX' },
        { name: 'Fort Worth Urgent Care', type: 'Urgent Care', location: 'Fort Worth, TX' },
      ];

      for (let i = clinics.length; i < 7; i++) {
        const clinicData = clinicsToCreate[i - clinics.length] || {
          name: `Clinic ${i + 1}`,
          type: 'General',
          location: 'TX'
        };
        
        const newClinic = await prisma.clinic.create({
          data: clinicData
        });
        console.log(`✓ Created clinic: ${newClinic.name}`);
      }
      
      // Refresh clinics list
      clinics = await prisma.clinic.findMany();
    }

    // Assign all clinics to the client user
    console.log(`\nAssigning clinics to ${clientUser.email}...`);
    for (const clinic of clinics) {
      await prisma.clientClinic.upsert({
        where: {
          userId_clinicId: { userId: clientUser.id, clinicId: clinic.id }
        },
        update: {},
        create: {
          userId: clientUser.id,
          clinicId: clinic.id
        }
      });
      console.log(`  ✓ Assigned: ${clinic.name}`);
    }

    console.log(`\nSeeding data for ${clinics.length} clinics...\n`);

    // Seed data for all clinics
    for (const clinic of clinics) {
      console.log(`\n📍 ${clinic.name}:`);
      
      for (const weekData of dummyWeeklyData) {
        // Add some variance to each clinic's data (10-30% variation)
        const variance = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const variedData = {
          ...weekData,
          blogsPublished: Math.round(weekData.blogsPublished * variance),
          avgRanking: Number((weekData.avgRanking * (0.9 + Math.random() * 0.2)).toFixed(1)),
          totalTraffic: Math.round(weekData.totalTraffic * variance),
          callsRequested: Math.round(weekData.callsRequested * variance),
          websiteVisits: Math.round(weekData.websiteVisits * variance),
          directionClicks: Math.round(weekData.directionClicks * variance),
          metaImpressions: Math.round(weekData.metaImpressions * variance),
          metaClicks: Math.round(weekData.metaClicks * variance),
          metaCTR: Number((weekData.metaCTR * variance).toFixed(1)),
          metaConversions: Math.round(weekData.metaConversions * variance),
          metaAdSpend: Number((weekData.metaAdSpend * variance).toFixed(2)),
          googleImpressions: Math.round(weekData.googleImpressions * variance),
          googleClicks: Math.round(weekData.googleClicks * variance),
          googleCTR: Number((weekData.googleCTR * variance).toFixed(1)),
          googleCPC: Number((weekData.googleCPC * variance).toFixed(2)),
          googleConversions: Math.round(weekData.googleConversions * variance),
          googleCVR: Number((weekData.googleCVR * variance).toFixed(1)),
          googleCostPerConversion: Number((weekData.googleCostPerConversion * variance).toFixed(2)),
          googleTotalCost: Number((weekData.googleTotalCost * variance).toFixed(2)),
          socialPosts: Math.round(weekData.socialPosts * variance),
          socialViews: Math.round(weekData.socialViews * variance),
          patientCount: Math.round(weekData.patientCount * variance),
          digitalConversion: Math.round(weekData.digitalConversion * variance),
          conversionRate: Number((weekData.conversionRate * variance).toFixed(1)),
          dailyPatientAvg: Number((weekData.dailyPatientAvg * variance).toFixed(1)),
        };

        // @ts-ignore
        await prisma.weeklyAnalytics.upsert({
          where: {
            clinicId_year_month_weekNumber: {
              clinicId: clinic.id,
              year: variedData.year,
              month: variedData.month,
              weekNumber: variedData.weekNumber
            }
          },
          update: variedData,
          create: {
            id: Math.random().toString(36).substring(7),
            clinicId: clinic.id,
            ...variedData,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      console.log(`  ✓ Seeded ${dummyWeeklyData.length} weeks of data`);
    }

    console.log('\n✅ Weekly analytics data seeded successfully for all clinics!');
  } catch (error) {
    console.error('Error seeding weekly analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedWeeklyAnalytics();
