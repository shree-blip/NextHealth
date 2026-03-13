import nodemailer from 'nodemailer';

const REPORT_EMAIL_FROM = process.env.REPORT_EMAIL_FROM || 'hello@thenextgenhealth.com';
const REPORT_GMAIL_USER = process.env.REPORT_GMAIL_USER || '';
const REPORT_GMAIL_APP_PASSWORD = process.env.REPORT_GMAIL_APP_PASSWORD || '';

export function isReportMailerConfigured() {
  return Boolean(REPORT_GMAIL_USER && REPORT_GMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!isReportMailerConfigured()) {
    throw new Error('Report mailer is not configured. Missing REPORT_GMAIL_USER or REPORT_GMAIL_APP_PASSWORD.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: REPORT_GMAIL_USER,
      pass: REPORT_GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendReportEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = getTransporter();

  return transporter.sendMail({
    from: REPORT_EMAIL_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
}
