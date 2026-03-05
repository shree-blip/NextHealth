/**
 * Re-import clinic data from the xlsx file into WeeklyAnalytics.
 * Matches existing clinics by name — never creates duplicates.
 * Dynamically detects row positions by label text, so sheets with
 * TikTok / Snapchat sections (shifted social-media rows) are handled.
 *
 * Usage:  npx tsx prisma/import-xlsx.ts
 */

import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

// ── helpers ───────────────────────────────────────────────────────────────────
function parseViews(v: any): number {
  if (v == null) return 0;
  const s = String(v).trim().toLowerCase();
  if (s.endsWith("k")) return Math.round(parseFloat(s) * 1000);
  if (s.endsWith("m")) return Math.round(parseFloat(s) * 1_000_000);
  return Math.round(Number(s)) || 0;
}

function num(v: any, fallback = 0): number {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ── week metadata ─────────────────────────────────────────────────────────────
// Columns 1‑16 map to Nov W1‑W4, Dec W1‑W4, Jan W1‑W4, Feb W1‑W4
const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface WeekMeta { month: number; weekNumber: number; year: number; weekLabel: string }

function buildWeekMeta(): WeekMeta[] {
  const months = [
    { month: 11, year: 2025 },
    { month: 12, year: 2025 },
    { month: 1,  year: 2026 },
    { month: 2,  year: 2026 },
  ];
  const result: WeekMeta[] = [];
  for (const m of months) {
    for (let w = 1; w <= 4; w++) {
      result.push({
        month: m.month,
        weekNumber: w,
        year: m.year,
        weekLabel: `${MONTH_NAMES[m.month]} Week ${w}`,
      });
    }
  }
  return result;
}

// ── dynamic row finder ────────────────────────────────────────────────────────
// Searches for section headers in col A and locates data rows relative to them.
// This handles sheets where TikTok/Snapchat sections push social media rows down.
interface RowMap {
  blogsPublished: number;
  avgRanking: number;
  totalTraffic: number;
  callsRequested: number;
  websiteVisits: number;
  directionClicks: number;
  metaImpressions: number;
  metaClicks: number;
  metaCTR: number;
  metaConversions: number;
  metaAdSpend: number;
  googleImpressions: number;
  googleClicks: number;
  googleCTR: number;
  googleCPC: number;
  googleConversions: number;
  googleCVR: number;
  googleCostPerConversion: number;
  googleTotalCost: number;
  socialPosts: number;
  socialViews: number;
  patientCount: number;
  digitalConversion: number;
  conversionRate: number;
  dailyPatientAvg: number;
}

function findRowMap(rows: any[][]): RowMap {
  let contentStart = -1, seoStart = -1, gmbStart = -1;
  let metaStart = -1, googleStart = -1, socialMetricRow = -1;

  for (let i = 0; i < rows.length; i++) {
    const label = String(rows[i]?.[0] ?? "").trim();
    if (label === "Content Writing Summary") contentStart = i;
    else if (label === "SEO Performance Summary") seoStart = i;
    else if (label === "GMB Summary") gmbStart = i;
    else if (label === "Meta Ads Summary") metaStart = i;
    else if (label === "Google Ads Summary") googleStart = i;
    // "Metric" row right before Total Posts — want the one AFTER Google Ads section
    else if (label === "Metric" && i > googleStart && googleStart > 0) {
      socialMetricRow = i;
    }
  }

  return {
    blogsPublished:         contentStart + 1,
    avgRanking:             seoStart + 1,
    totalTraffic:           seoStart + 2,
    callsRequested:         gmbStart + 1,
    websiteVisits:          gmbStart + 2,
    directionClicks:        gmbStart + 3,
    metaImpressions:        metaStart + 1,
    metaClicks:             metaStart + 2,
    metaCTR:                metaStart + 3,
    metaConversions:        metaStart + 4,
    metaAdSpend:            metaStart + 5,
    googleImpressions:      googleStart + 1,
    googleClicks:           googleStart + 2,
    googleCTR:              googleStart + 3,
    googleCPC:              googleStart + 4,
    googleConversions:      googleStart + 5,
    googleCVR:              googleStart + 6,
    googleCostPerConversion:googleStart + 7,
    googleTotalCost:        googleStart + 8,
    socialPosts:            socialMetricRow + 1,
    socialViews:            socialMetricRow + 2,
    patientCount:           socialMetricRow + 3,
    digitalConversion:      socialMetricRow + 4,
    conversionRate:         socialMetricRow + 5,
    dailyPatientAvg:        socialMetricRow + 6,
  };
}

const INT_FIELDS = new Set([
  "blogsPublished", "totalTraffic", "callsRequested", "websiteVisits",
  "directionClicks", "metaImpressions", "metaClicks", "metaConversions",
  "googleImpressions", "googleClicks", "googleConversions",
  "socialPosts", "socialViews", "patientCount", "digitalConversion",
]);

// ── sheet name → existing clinic name mapping ─────────────────────────────────
const SHEET_TO_CLINIC: Record<string, string> = {
  "ER of Irving":   "ER of Irving",
  "ER of Lufkin":   "ER of Lufkin",
  "Irving Med Spa": "Irving Med Spa",
  "Naperville":     "Naperville Med Spa",
};

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const xlsxPath = path.resolve(__dirname, "../public/Focus - Client Dashboard.xlsx");
  const wb = XLSX.readFile(xlsxPath);
  const weekMetas = buildWeekMeta();

  let totalUpserted = 0;

  for (const sheetName of wb.SheetNames) {
    const clinicName = SHEET_TO_CLINIC[sheetName] ?? sheetName;
    console.log(`\n── Processing sheet: "${sheetName}" → clinic: "${clinicName}" ──`);

    // Find existing clinic by name — NEVER create duplicates
    const clinic = await prisma.clinic.findFirst({ where: { name: clinicName } });
    if (!clinic) {
      console.log(`  ⚠ Clinic "${clinicName}" not found in DB — skipping.`);
      continue;
    }
    console.log(`  Found clinic: ${clinic.name} (${clinic.id})`);

    // Parse sheet
    const ws = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Dynamically find row positions
    const rowMap = findRowMap(rows);
    console.log(`  Row map: socialPosts=${rowMap.socialPosts} socialViews=${rowMap.socialViews} patientCount=${rowMap.patientCount}`);

    // Build 16 record objects (one per week column)
    const records: Record<string, any>[] = weekMetas.map((wm) => ({
      clinicId: clinic.id,
      year: wm.year,
      month: wm.month,
      weekNumber: wm.weekNumber,
      weekLabel: wm.weekLabel,
    }));

    // Fill fields from mapped rows
    for (const [field, rowIdx] of Object.entries(rowMap)) {
      const row = rows[rowIdx];
      if (!row) continue;

      for (let col = 1; col <= 16; col++) {
        let val: number;
        if (field === "socialViews") {
          val = parseViews(row[col]);
        } else if (INT_FIELDS.has(field)) {
          val = Math.round(num(row[col]));
        } else {
          val = num(row[col]);
        }
        records[col - 1][field] = val;
      }
    }

    // Upsert each week record
    for (const rec of records) {
      await prisma.weeklyAnalytics.upsert({
        where: {
          clinicId_year_weekNumber: {
            clinicId: rec.clinicId,
            year: rec.year,
            weekNumber: rec.weekNumber,
          },
        },
        create: rec as any,
        update: rec as any,
      });
      totalUpserted++;
    }
    console.log(`  Upserted 16 week records for ${clinicName}.`);
  }

  // Final verification
  console.log(`\n=== VERIFICATION ===`);
  const clinics = await prisma.clinic.findMany({ orderBy: { name: 'asc' } });
  for (const c of clinics) {
    const count = await prisma.weeklyAnalytics.count({ where: { clinicId: c.id } });
    console.log(`  ${c.name}: ${count} analytics records`);
  }
  console.log(`\nDone! Upserted ${totalUpserted} WeeklyAnalytics records total.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
