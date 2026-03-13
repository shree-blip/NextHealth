import prisma from '@/lib/prisma';

export interface MonthlyPeriod {
  reportYear: number;
  reportMonth: number;
  monthName: string;
  monthLabel: string;
  startDateUtc: Date;
  endDateUtcExclusive: Date;
}

export interface ClinicReportData {
  clinicId: string;
  clinicName: string;
  clinicType: string;
  location: string;
  recipients: { email: string; name: string }[];
  period: MonthlyPeriod;
  totals: {
    patientCount: number;
    callsRequested: number;
    websiteVisits: number;
    directionClicks: number;
    totalTraffic: number;
    googleClicks: number;
    googleImpressions: number;
    googleTotalCost: number;
    metaClicks: number;
    metaImpressions: number;
    metaAdSpend: number;
    socialViews: number;
    socialPosts: number;
    digitalConversion: number;
  };
  weeklyTrend: {
    weekLabel: string;
    patientCount: number;
    websiteVisits: number;
    callsRequested: number;
    totalTraffic: number;
  }[];
}

function getEasternDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value || 0);
  const month = Number(parts.find((part) => part.type === 'month')?.value || 1);
  const day = Number(parts.find((part) => part.type === 'day')?.value || 1);

  return { year, month, day };
}

export function shouldRunMonthlyReportsNow(now = new Date()) {
  const { day } = getEasternDateParts(now);
  return day >= 1 && day <= 7;
}

export function getLastMonthPeriod(now = new Date()): MonthlyPeriod {
  const { year, month } = getEasternDateParts(now);

  const currentMonthIndex = month - 1;
  const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const reportYear = currentMonthIndex === 0 ? year - 1 : year;
  const reportMonth = lastMonthIndex + 1;

  const monthDate = new Date(Date.UTC(reportYear, lastMonthIndex, 1));
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

  const startDateUtc = new Date(Date.UTC(reportYear, lastMonthIndex, 1, 0, 0, 0, 0));
  const endDateUtcExclusive = new Date(Date.UTC(reportYear, lastMonthIndex + 1, 1, 0, 0, 0, 0));

  return {
    reportYear,
    reportMonth,
    monthName,
    monthLabel: `${monthName} ${reportYear}`,
    startDateUtc,
    endDateUtcExclusive,
  };
}

export async function getClinicMonthlyReports(period: MonthlyPeriod): Promise<ClinicReportData[]> {
  const clinics = await prisma.clinic.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      clientAssignments: {
        where: {
          user: {
            role: 'client',
          },
        },
        select: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      weeklyAnalytics: {
        where: {
          year: period.reportYear,
          month: period.reportMonth,
        },
        orderBy: {
          weekNumber: 'asc',
        },
      },
    },
  });

  return clinics
    .map((clinic) => {
      const recipientsMap = new Map<string, { email: string; name: string }>();
      for (const assignment of clinic.clientAssignments) {
        const email = assignment.user.email?.trim().toLowerCase();
        if (!email) continue;
        if (!recipientsMap.has(email)) {
          recipientsMap.set(email, {
            email,
            name: assignment.user.name || 'Client',
          });
        }
      }

      const recipients = Array.from(recipientsMap.values());

      const totals = clinic.weeklyAnalytics.reduce(
        (acc, row) => {
          acc.patientCount += row.patientCount || 0;
          acc.callsRequested += row.callsRequested || 0;
          acc.websiteVisits += row.websiteVisits || 0;
          acc.directionClicks += row.directionClicks || 0;
          acc.totalTraffic += row.totalTraffic || 0;
          acc.googleClicks += row.googleClicks || 0;
          acc.googleImpressions += row.googleImpressions || 0;
          acc.googleTotalCost += row.googleTotalCost || 0;
          acc.metaClicks += row.metaClicks || 0;
          acc.metaImpressions += row.metaImpressions || 0;
          acc.metaAdSpend += row.metaAdSpend || 0;
          acc.socialViews += row.socialViews || 0;
          acc.socialPosts += row.socialPosts || 0;
          acc.digitalConversion += row.digitalConversion || 0;
          return acc;
        },
        {
          patientCount: 0,
          callsRequested: 0,
          websiteVisits: 0,
          directionClicks: 0,
          totalTraffic: 0,
          googleClicks: 0,
          googleImpressions: 0,
          googleTotalCost: 0,
          metaClicks: 0,
          metaImpressions: 0,
          metaAdSpend: 0,
          socialViews: 0,
          socialPosts: 0,
          digitalConversion: 0,
        }
      );

      const weeklyTrend = clinic.weeklyAnalytics.map((row) => ({
        weekLabel: row.weekLabel,
        patientCount: row.patientCount || 0,
        websiteVisits: row.websiteVisits || 0,
        callsRequested: row.callsRequested || 0,
        totalTraffic: row.totalTraffic || 0,
      }));

      return {
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicType: clinic.type,
        location: clinic.location,
        recipients,
        period,
        totals,
        weeklyTrend,
      };
    });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildMonthlyReportEmailHtml(report: ClinicReportData) {
  const weeklyRows =
    report.weeklyTrend.length > 0
      ? report.weeklyTrend
          .map(
            (week) => `
              <tr>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${week.weekLabel}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatNumber(week.patientCount)}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatNumber(week.websiteVisits)}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatNumber(week.callsRequested)}</td>
                <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatNumber(week.totalTraffic)}</td>
              </tr>
            `
          )
          .join('')
      : `
          <tr>
            <td colspan="5" style="padding:10px;color:#6b7280;text-align:center;">No weekly analytics available for this month yet.</td>
          </tr>
        `;

  return `
  <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#ffffff;padding:18px 20px;">
        <h2 style="margin:0;font-size:22px;">${report.period.monthLabel} Dashboard Report</h2>
        <p style="margin:6px 0 0 0;font-size:14px;opacity:0.92;">${report.clinicName} • ${report.location}</p>
      </div>

      <div style="padding:20px;">
        <p style="margin-top:0;font-size:14px;line-height:1.6;">
          Here is your monthly performance snapshot for <strong>${report.period.monthLabel}</strong>.
          This includes patient growth, traffic trends, ad performance, and core digital conversion signals.
        </p>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0;">
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Total Patients</strong><br><span style="font-size:20px;">${formatNumber(report.totals.patientCount)}</span></div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Calls Requested</strong><br><span style="font-size:20px;">${formatNumber(report.totals.callsRequested)}</span></div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Website Visits</strong><br><span style="font-size:20px;">${formatNumber(report.totals.websiteVisits)}</span></div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Total Traffic</strong><br><span style="font-size:20px;">${formatNumber(report.totals.totalTraffic)}</span></div>
        </div>

        <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left;padding:10px;">Week</th>
              <th style="text-align:right;padding:10px;">Patients</th>
              <th style="text-align:right;padding:10px;">Website Visits</th>
              <th style="text-align:right;padding:10px;">Calls</th>
              <th style="text-align:right;padding:10px;">Traffic</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyRows}
          </tbody>
        </table>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Google Clicks / Impressions</strong><br>${formatNumber(report.totals.googleClicks)} / ${formatNumber(report.totals.googleImpressions)}</div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Google Ad Spend</strong><br>${formatCurrency(report.totals.googleTotalCost)}</div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Meta Clicks / Impressions</strong><br>${formatNumber(report.totals.metaClicks)} / ${formatNumber(report.totals.metaImpressions)}</div>
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;"><strong>Meta Ad Spend</strong><br>${formatCurrency(report.totals.metaAdSpend)}</div>
        </div>

        <p style="font-size:13px;color:#475569;margin-top:18px;">
          Need a deeper strategy breakdown? Reply to this email or book a review call at
          <a href="https://thenextgenhealth.com/contact">thenextgenhealth.com/contact</a>.
        </p>
      </div>
    </div>
  </div>
  `;
}
