import { PrismaClient } from '@prisma/client';
import { getCanonicalWeekData } from '../lib/analytics-week';

const prisma = new PrismaClient();

type WeeklyRecord = {
  id: string;
  clinicId: string;
  year: number;
  month: number;
  weekNumber: number;
  weekLabel: string;
  updatedAt: Date;
};

async function main() {
  const records = await prisma.weeklyAnalytics.findMany({
    select: {
      id: true,
      clinicId: true,
      year: true,
      month: true,
      weekNumber: true,
      weekLabel: true,
      updatedAt: true,
    },
    orderBy: [{ clinicId: 'asc' }, { year: 'asc' }, { weekNumber: 'asc' }, { updatedAt: 'desc' }],
  }) as WeeklyRecord[];

  const grouped = new Map<string, WeeklyRecord[]>();
  for (const record of records) {
    const key = `${record.clinicId}::${record.year}::${record.weekNumber}`;
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(record);
    } else {
      grouped.set(key, [record]);
    }
  }

  let totalGroups = 0;
  let normalizedRows = 0;
  let deletedRows = 0;

  for (const [, group] of grouped) {
    totalGroups += 1;

    const sorted = [...group].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const keeper = sorted[0];
    const duplicates = sorted.slice(1);

    if (duplicates.length > 0) {
      await prisma.weeklyAnalytics.deleteMany({
        where: { id: { in: duplicates.map((d) => d.id) } },
      });
      deletedRows += duplicates.length;
    }

    const canonical = getCanonicalWeekData(keeper.year, keeper.weekNumber);

    if (keeper.weekLabel !== canonical.weekLabel || keeper.month !== canonical.month) {
      await prisma.weeklyAnalytics.update({
        where: { id: keeper.id },
        data: {
          weekLabel: canonical.weekLabel,
          month: canonical.month,
        },
      });
      normalizedRows += 1;
    }
  }

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'WeeklyAnalytics_clinicId_year_month_weekNumber_key'
      ) THEN
        DROP INDEX "WeeklyAnalytics_clinicId_year_month_weekNumber_key";
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyAnalytics_clinicId_year_weekNumber_key"
    ON "WeeklyAnalytics"("clinicId", "year", "weekNumber");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "WeeklyAnalytics_year_weekNumber_idx"
    ON "WeeklyAnalytics"("year", "weekNumber");
  `);

  console.log('✅ Weekly analytics normalization complete');
  console.log(`Groups processed: ${totalGroups}`);
  console.log(`Rows normalized: ${normalizedRows}`);
  console.log(`Duplicate rows deleted: ${deletedRows}`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to normalize weekly analytics:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });