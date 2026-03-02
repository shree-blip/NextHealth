import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users, clinics & sample analytics...\n');

  // ─── 1. Admin User ───
  const admin = await prisma.user.upsert({
    where: { email: 'shree@focusyourfinance.com' },
    update: { password: 'Hello@123', role: 'admin', name: 'Shree' },
    create: {
      email: 'shree@focusyourfinance.com',
      password: 'Hello@123',
      name: 'Shree',
      role: 'admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email} (id: ${admin.id})`);

  // ─── 2. Client User ───
  const client = await prisma.user.upsert({
    where: { email: 'jaya.r.dahal@focusyourfinance.com' },
    update: { password: 'Hello@123', role: 'client', name: 'Jaya R. Dahal' },
    create: {
      email: 'jaya.r.dahal@focusyourfinance.com',
      password: 'Hello@123',
      name: 'Jaya R. Dahal',
      role: 'client',
    },
  });
  console.log(`✅ Client created: ${client.email} (id: ${client.id})`);

  // ─── 3. Create sample clinics ───
  const clinicData = [
    { name: 'Houston ER & Hospital', type: 'ER', location: 'Houston, TX' },
    { name: 'Dallas Urgent Care', type: 'Urgent Care', location: 'Dallas, TX' },
    { name: 'Austin Wellness Center', type: 'Wellness', location: 'Austin, TX' },
  ];

  const clinics = [];
  for (const c of clinicData) {
    const clinic = await prisma.clinic.upsert({
      where: { id: `seed-${c.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: { name: c.name, type: c.type, location: c.location },
      create: {
        id: `seed-${c.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: c.name,
        type: c.type,
        location: c.location,
        leads: Math.floor(Math.random() * 80) + 20,
        appointments: Math.floor(Math.random() * 40) + 10,
      },
    });
    clinics.push(clinic);
    console.log(`✅ Clinic created: ${clinic.name} (id: ${clinic.id})`);
  }

  // ─── 4. Assign all clinics to the client ───
  for (const clinic of clinics) {
    await prisma.clientClinic.upsert({
      where: {
        userId_clinicId: { userId: client.id, clinicId: clinic.id },
      },
      update: {},
      create: {
        userId: client.id,
        clinicId: clinic.id,
      },
    });
    console.log(`  🔗 Assigned "${clinic.name}" → ${client.email}`);
  }

  // ─── 5. Seed sample Analytics data for the client (per clinic) ───
  const today = new Date();
  for (const clinic of clinics) {
    // Check if data already exists
    const existing = await prisma.analyticsData.count({
      where: { userId: client.id, clinicId: clinic.id },
    });
    if (existing > 0) {
      console.log(`  📊 Analytics already exist for ${clinic.name}, skipping...`);
      continue;
    }

    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // Generate realistic-looking data with some variance per clinic
      const base = clinics.indexOf(clinic);
      const trend = (30 - daysAgo) / 30; // trending up over time

      await prisma.analyticsData.create({
        data: {
          userId: client.id,
          clinicId: clinic.id,
          date,
          gscClicks: Math.floor((40 + base * 15) * (0.7 + trend * 0.6) + Math.random() * 20),
          gscImpressions: Math.floor((800 + base * 200) * (0.7 + trend * 0.6) + Math.random() * 200),
          gscCtr: parseFloat((2.5 + base * 0.5 + trend * 1.5 + Math.random() * 1).toFixed(2)),
          gscAvgPosition: parseFloat((12 - trend * 4 - base * 1.5 + Math.random() * 3).toFixed(1)),
          gmbPhoneCalls: Math.floor((8 + base * 3) * (0.6 + trend * 0.8) + Math.random() * 5),
          gmbWebsiteClicks: Math.floor((15 + base * 5) * (0.6 + trend * 0.8) + Math.random() * 8),
          gmbDirectionRequests: Math.floor((5 + base * 2) * (0.6 + trend * 0.8) + Math.random() * 4),
          gmbActions: Math.floor((30 + base * 10) * (0.6 + trend * 0.8) + Math.random() * 10),
          gmbProfileViews: Math.floor((100 + base * 30) * (0.6 + trend * 0.8) + Math.random() * 40),
          gmbReviewCount: Math.floor(base * 2 + trend * 3 + Math.random() * 2),
        },
      });
    }
    console.log(`  📊 Seeded 31 days of analytics for ${clinic.name}`);
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('─── Login Credentials ───');
  console.log('Admin:  shree@focusyourfinance.com / Hello@123');
  console.log('Client: jaya.r.dahal@focusyourfinance.com / Hello@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
