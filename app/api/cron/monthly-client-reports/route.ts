import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  buildMonthlyReportEmailHtml,
  getClinicMonthlyReports,
  getLastMonthPeriod,
  type MonthlyPeriod,
  shouldRunMonthlyReportsNow,
} from '@/lib/monthly-report';
import { isReportMailerConfigured, sendReportEmail } from '@/lib/report-mailer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const DEFAULT_SINGLE_RECIPIENT = 'shree@focusyourfinance.com';

export async function GET(request: Request) {
  const started = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === '1';
    const overrideRecipient = (url.searchParams.get('recipient') || '').trim().toLowerCase();
    const queryYear = Number(url.searchParams.get('year') || 0);
    const queryMonth = Number(url.searchParams.get('month') || 0);
    const singleRecipient = (
      overrideRecipient ||
      process.env.MONTHLY_REPORT_SINGLE_RECIPIENT ||
      DEFAULT_SINGLE_RECIPIENT
    )
      .trim()
      .toLowerCase();

    if (!force && !shouldRunMonthlyReportsNow()) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Outside first week of month in America/New_York timezone.',
        timestamp: new Date().toISOString(),
      });
    }

    if (!isReportMailerConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'REPORT_GMAIL_USER / REPORT_GMAIL_APP_PASSWORD not configured.',
        },
        { status: 500 }
      );
    }

    let period: MonthlyPeriod = getLastMonthPeriod();

    if (queryYear >= 2000 && queryMonth >= 1 && queryMonth <= 12) {
      const monthDate = new Date(Date.UTC(queryYear, queryMonth - 1, 1));
      const monthName = monthDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
      period = {
        reportYear: queryYear,
        reportMonth: queryMonth,
        monthName,
        monthLabel: `${monthName} ${queryYear}`,
        startDateUtc: new Date(Date.UTC(queryYear, queryMonth - 1, 1, 0, 0, 0, 0)),
        endDateUtcExclusive: new Date(Date.UTC(queryYear, queryMonth, 1, 0, 0, 0, 0)),
      };
    }

    const clinicReports = await getClinicMonthlyReports(period);

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    let processedClinics = 0;

    const details: Array<{
      clinicId: string;
      clinicName: string;
      recipientEmail: string;
      status: 'sent' | 'skipped' | 'failed';
      reason?: string;
    }> = [];

    for (const report of clinicReports) {
      processedClinics += 1;
      const emailHtml = buildMonthlyReportEmailHtml(report);
      const subject = `${report.period.monthLabel} Report • ${report.clinicName}`;

      const recipientsToSend = [{ email: singleRecipient, name: 'Monthly Owner Recipient' }];

      for (const recipient of recipientsToSend) {
        const where = {
          clinicId_recipientEmail_reportYear_reportMonth: {
            clinicId: report.clinicId,
            recipientEmail: recipient.email,
            reportYear: report.period.reportYear,
            reportMonth: report.period.reportMonth,
          },
        } as const;

        const existing = await prisma.monthlyClinicReportEmail.findUnique({ where });

        if (existing?.status === 'sent') {
          skipped += 1;
          details.push({
            clinicId: report.clinicId,
            clinicName: report.clinicName,
            recipientEmail: recipient.email,
            status: 'skipped',
            reason: 'Already sent for this clinic and month.',
          });
          continue;
        }

        try {
          await sendReportEmail({
            to: recipient.email,
            subject,
            html: emailHtml,
          });

          await prisma.monthlyClinicReportEmail.upsert({
            where,
            create: {
              clinicId: report.clinicId,
              recipientEmail: recipient.email,
              reportYear: report.period.reportYear,
              reportMonth: report.period.reportMonth,
              status: 'sent',
              sentAt: new Date(),
            },
            update: {
              status: 'sent',
              sentAt: new Date(),
              error: null,
            },
          });

          sent += 1;
          details.push({
            clinicId: report.clinicId,
            clinicName: report.clinicName,
            recipientEmail: recipient.email,
            status: 'sent',
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown send error';

          await prisma.monthlyClinicReportEmail.upsert({
            where,
            create: {
              clinicId: report.clinicId,
              recipientEmail: recipient.email,
              reportYear: report.period.reportYear,
              reportMonth: report.period.reportMonth,
              status: 'failed',
              error: message.slice(0, 1000),
            },
            update: {
              status: 'failed',
              error: message.slice(0, 1000),
            },
          });

          failed += 1;
          details.push({
            clinicId: report.clinicId,
            clinicName: report.clinicName,
            recipientEmail: recipient.email,
            status: 'failed',
            reason: message,
          });
        }
      }
    }

    const elapsedSeconds = Number(((Date.now() - started) / 1000).toFixed(1));

    return NextResponse.json({
      success: true,
      period: {
        reportYear: period.reportYear,
        reportMonth: period.reportMonth,
        monthLabel: period.monthLabel,
      },
      recipientMode: 'single',
      singleRecipient,
      processedClinics,
      totalRecipients: sent + skipped + failed,
      sent,
      skipped,
      failed,
      elapsedSeconds,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const elapsedSeconds = Number(((Date.now() - started) / 1000).toFixed(1));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Monthly report cron failed',
        elapsedSeconds,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
