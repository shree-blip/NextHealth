import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return secret;
}
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/* ─── Auth helper ─── */
async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    return user;
  } catch {
    return null;
  }
}

/* ─── Fetch clinics assigned to user ─── */
async function getUserClinics(userId: string) {
  const assignments = await prisma.clientClinic.findMany({
    where: { userId },
    include: { clinic: true },
  });
  return assignments.map((a) => a.clinic);
}

/* ─── Fetch analytics for given clinic IDs ─── */
async function getAnalyticsForClinics(clinicIds: string[], year?: number) {
  const where: any = { clinicId: { in: clinicIds } };
  if (year) where.year = year;

  return prisma.weeklyAnalytics.findMany({
    where,
    orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }],
    include: { clinic: { select: { name: true, type: true, location: true } } },
  });
}

/* ─── Build summary data for AI context ─── */
function buildAnalyticsContext(
  clinics: { id: string; name: string; type: string; location: string }[],
  analytics: any[],
) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Group by clinic
  const byClinic: Record<string, any[]> = {};
  for (const row of analytics) {
    const cid = row.clinicId;
    if (!byClinic[cid]) byClinic[cid] = [];
    byClinic[cid].push(row);
  }

  const clinicSummaries: string[] = [];

  for (const clinic of clinics) {
    const rows = byClinic[clinic.id] || [];
    if (rows.length === 0) {
      clinicSummaries.push(`- ${clinic.name} (${clinic.type}, ${clinic.location}): No analytics data available.`);
      continue;
    }

    // Current year data
    const currentYearRows = rows.filter((r: any) => r.year === currentYear);
    // Last month data
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonth = lastMonth === 1 ? 12 : lastMonth - 1;
    const prevMonthYear = lastMonth === 1 ? lastMonthYear - 1 : lastMonthYear;

    const lastMonthRows = rows.filter((r: any) => r.year === lastMonthYear && r.month === lastMonth);
    const prevMonthRows = rows.filter((r: any) => r.year === prevMonthYear && r.month === prevMonth);

    // Aggregate
    const sum = (arr: any[], field: string) => arr.reduce((s: number, r: any) => s + (Number(r[field]) || 0), 0);
    const avg = (arr: any[], field: string) => {
      const vals = arr.map((r: any) => Number(r[field]) || 0).filter(v => v > 0);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    // Current year totals
    const ytdPatients = sum(currentYearRows, 'patientCount');
    const ytdTraffic = sum(currentYearRows, 'totalTraffic');
    const ytdCalls = sum(currentYearRows, 'callsRequested');
    const ytdWebVisits = sum(currentYearRows, 'websiteVisits');
    const ytdDirectionClicks = sum(currentYearRows, 'directionClicks');
    const ytdBlogs = sum(currentYearRows, 'blogsPublished');
    const ytdSocialPosts = sum(currentYearRows, 'socialPosts');
    const ytdSocialViews = sum(currentYearRows, 'socialViews');

    // Google Ads YTD
    const ytdGoogleImpressions = sum(currentYearRows, 'googleImpressions');
    const ytdGoogleClicks = sum(currentYearRows, 'googleClicks');
    const ytdGoogleConversions = sum(currentYearRows, 'googleConversions');
    const ytdGoogleCost = sum(currentYearRows, 'googleTotalCost');
    const ytdGoogleCTR = avg(currentYearRows, 'googleCTR');
    const ytdGoogleCPC = avg(currentYearRows, 'googleCPC');
    const ytdGoogleCVR = avg(currentYearRows, 'googleCVR');

    // Meta Ads YTD
    const ytdMetaImpressions = sum(currentYearRows, 'metaImpressions');
    const ytdMetaClicks = sum(currentYearRows, 'metaClicks');
    const ytdMetaConversions = sum(currentYearRows, 'metaConversions');
    const ytdMetaSpend = sum(currentYearRows, 'metaAdSpend');
    const ytdMetaCTR = avg(currentYearRows, 'metaCTR');
    const ytdMetaCPC = avg(currentYearRows, 'metaCPC');

    // Last month totals
    const lmPatients = sum(lastMonthRows, 'patientCount');
    const lmTraffic = sum(lastMonthRows, 'totalTraffic');
    const lmCalls = sum(lastMonthRows, 'callsRequested');
    // Previous month totals
    const pmPatients = sum(prevMonthRows, 'patientCount');
    const pmTraffic = sum(prevMonthRows, 'totalTraffic');
    const pmCalls = sum(prevMonthRows, 'callsRequested');

    const pct = (curr: number, prev: number) =>
      prev > 0 ? `${((curr - prev) / prev * 100).toFixed(1)}%` : curr > 0 ? '+100%' : '0%';

    const MONTH_NAMES: Record<number, string> = {
      1: 'January', 2: 'February', 3: 'March', 4: 'April',
      5: 'May', 6: 'June', 7: 'July', 8: 'August',
      9: 'September', 10: 'October', 11: 'November', 12: 'December',
    };

    // Most recent week
    const latestWeek = rows[rows.length - 1];

    clinicSummaries.push(`
📍 ${clinic.name} (${clinic.type}, ${clinic.location})
  Total data records: ${rows.length} weeks
  
  ── ${currentYear} Year-to-Date ──
  Patient Count: ${ytdPatients.toLocaleString()}
  Total Traffic: ${ytdTraffic.toLocaleString()}
  GMB Calls: ${ytdCalls.toLocaleString()}
  Website Visits: ${ytdWebVisits.toLocaleString()}
  Direction Clicks: ${ytdDirectionClicks.toLocaleString()}
  Blogs Published: ${ytdBlogs}
  Social Posts: ${ytdSocialPosts} | Social Views: ${ytdSocialViews.toLocaleString()}
  
  Google Ads: ${ytdGoogleImpressions.toLocaleString()} impressions, ${ytdGoogleClicks.toLocaleString()} clicks, ${ytdGoogleConversions} conversions, $${ytdGoogleCost.toFixed(2)} total cost, CTR ${ytdGoogleCTR.toFixed(2)}%, CPC $${ytdGoogleCPC.toFixed(2)}, CVR ${ytdGoogleCVR.toFixed(2)}%
  Meta Ads: ${ytdMetaImpressions.toLocaleString()} impressions, ${ytdMetaClicks.toLocaleString()} clicks, ${ytdMetaConversions} conversions, $${ytdMetaSpend.toFixed(2)} spend, CTR ${ytdMetaCTR.toFixed(2)}%, CPC $${ytdMetaCPC.toFixed(2)}
  
  ── Month-over-Month (${MONTH_NAMES[prevMonth]} → ${MONTH_NAMES[lastMonth]}) ──
  Patients: ${pmPatients} → ${lmPatients} (${pct(lmPatients, pmPatients)})
  Traffic: ${pmTraffic} → ${lmTraffic} (${pct(lmTraffic, pmTraffic)})
  GMB Calls: ${pmCalls} → ${lmCalls} (${pct(lmCalls, pmCalls)})
  
  ── Latest Week: ${latestWeek?.weekLabel || 'N/A'} ──
  Patients: ${latestWeek?.patientCount ?? 0} | Traffic: ${latestWeek?.totalTraffic ?? 0} | Calls: ${latestWeek?.callsRequested ?? 0}
  Google Ads Clicks: ${latestWeek?.googleClicks ?? 0} | Meta Clicks: ${latestWeek?.metaClicks ?? 0}
`);
  }

  // All-clinics aggregate
  const allYearRows = analytics.filter((r) => r.year === currentYear);
  const totalPatients = allYearRows.reduce((s, r) => s + (r.patientCount || 0), 0);
  const totalTraffic = allYearRows.reduce((s, r) => s + (r.totalTraffic || 0), 0);
  const totalCalls = allYearRows.reduce((s, r) => s + (r.callsRequested || 0), 0);

  return `
ANALYTICS DATA (from database — these are exact numbers):

Total Assigned Clinics: ${clinics.length}
All-Clinics ${currentYear} YTD Totals: ${totalPatients.toLocaleString()} patients, ${totalTraffic.toLocaleString()} traffic, ${totalCalls.toLocaleString()} GMB calls

PER-CLINIC BREAKDOWN:
${clinicSummaries.join('\n')}
`.trim();
}

/* ─── SYSTEM PROMPT ─── */
function getSystemPrompt(analyticsContext: string, clinicNames: string[], userName?: string) {
  return `You are the Analytics AI assistant for The NextGen Healthcare Marketing dashboard. You help ${userName || 'the client'} understand their marketing performance using REAL data from their database.

PERSONALITY:
- Friendly, professional, and data-driven
- Address the user by their first name when natural
- Use clear formatting with headers, bullets, and bold numbers
- Be concise but thorough — focus on insights and actionable takeaways, not just restating raw numbers
- When you spot trends (positive or negative), proactively highlight them
- End responses with 1-2 clear next steps or recommendations when appropriate

IMPORTANT RULES:
1. ONLY use the numbers provided in the ANALYTICS DATA below. NEVER guess or make up numbers.
2. If the user asks about a metric not in the data, say you don't have that specific data point.
3. When presenting numbers, always match the exact values from the database.
4. Format large numbers with commas (e.g., 12,345). Format percentages to 1 decimal place.
5. Use emojis sparingly for section headers (📊 📈 🎯 etc.) to improve readability.

RESPONSE FORMAT (follow this structure):
📊 **Summary** — 1-2 sentence overview of what the data shows
📈 **Key Numbers** — bullet list of the most relevant metrics
🎯 **Next Steps** — 2-3 actionable recommendations based on the data

CLARIFICATION RULES:
- If the user asks a general analytics question without specifying a clinic and they have multiple clinics, ask: "Would you like to see data for all clinics combined, or a specific location? Your clinics: ${clinicNames.join(', ')}"
- If the user doesn't specify a time period, default to current year YTD data.
- Keep responses clear, professional, and data-driven.

CLINIC NAMES (for context):
${clinicNames.map((n) => `- ${n}`).join('\n')}

${analyticsContext}`;
}

/* ─── Call AI (Gemini primary, OpenAI fallback) ─── */
async function callAI(systemPrompt: string, messages: Message[]): Promise<string> {
  // Try Gemini first
  if (GEMINI_API_KEY) {
    try {
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will act as the Premium Analytics AI assistant and only use the real data provided. I will never guess or fabricate numbers.' }] },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.3,
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text?.trim()) return text;
      }
    } catch (err) {
      console.error('[Analytics Chat] Gemini error:', err);
    }
  }

  // Fallback to OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text?.trim()) return text;
      }
    } catch (err) {
      console.error('[Analytics Chat] OpenAI error:', err);
    }
  }

  return 'Sorry, the AI service is temporarily unavailable. Please try again in a moment.';
}

/* ─── POST handler ─── */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check premium plan
    const planId = (user.planId || user.plan || '').toLowerCase();
    const isPremium =
      planId === 'premium' ||
      planId === 'scale elite' ||
      planId === 'platinum';

    if (!isPremium) {
      return NextResponse.json(
        { error: 'This feature is available exclusively for Scale Elite (Premium) plan members.' },
        { status: 403 },
      );
    }

    // 3. Parse request
    const { messages } = (await req.json()) as { messages: Message[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 4. Fetch clinics and analytics
    const clinics = await getUserClinics(user.id);
    if (clinics.length === 0) {
      return NextResponse.json({
        reply: 'You don\'t have any clinics assigned yet. Please contact your account manager to get started.',
      });
    }

    const clinicIds = clinics.map((c) => c.id);
    const analytics = await getAnalyticsForClinics(clinicIds);

    // 5. Build context and call AI
    const clinicNames = clinics.map((c) => c.name);
    const analyticsContext = buildAnalyticsContext(clinics, analytics);
    const userName = user.name || undefined;
    const systemPrompt = getSystemPrompt(analyticsContext, clinicNames, userName);
    const reply = await callAI(systemPrompt, messages.slice(-10));

    return NextResponse.json({ reply, userName: user.name, clinicNames });
  } catch (error) {
    console.error('[Analytics Chat] Error:', error);
    return NextResponse.json(
      { reply: 'Sorry, something went wrong while processing your request. Please try again.' },
      { status: 500 },
    );
  }
}

/* ─── GET handler — returns clinic list for the authenticated user ─── */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planId = (user.planId || user.plan || '').toLowerCase();
    const isPremium =
      planId === 'premium' ||
      planId === 'scale elite' ||
      planId === 'platinum';

    const clinics = await getUserClinics(user.id);

    return NextResponse.json({
      isPremium,
      planId: user.planId || user.plan || null,
      clinics: clinics.map((c) => ({ id: c.id, name: c.name, type: c.type, location: c.location })),
    });
  } catch (error) {
    console.error('[Analytics Chat GET] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
