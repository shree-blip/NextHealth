import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const prisma = new PrismaClient();

const SYSTEM_PROMPT = `You are NextGen Healthcare Marketing's friendly 24/7 AI assistant. You help visitors with questions about the agency's services, pricing, and healthcare marketing.

ABOUT THE COMPANY:
- NextGen Healthcare Marketing is a specialized digital marketing agency for healthcare providers
- Located at 3811 Turtle Creek Blvd, Suite 600, Dallas, TX 75219
- Email: info@nextgenhealthcaremarketing.com
- We serve ERs, urgent care centers, MedSpas, wellness clinics, dental offices, and other healthcare providers

SERVICES WE OFFER:
- SEO & Local Search Optimization
- Google Ads (PPC) Management  
- Meta/Facebook & Instagram Ads
- Website Design & Development (HIPAA-aware)
- Social Media Marketing
- Content & Copywriting
- Email Drip Campaigns
- Google Business Profile Optimization
- Brand Identity & Logo Design
- Brochure & Print Design
- Analytics & Reporting
- Strategy & Planning
- Marketing Automation with AI

PRICING TIERS:
- Starter: Starting at $1,500/mo — ideal for solo practitioners, includes SEO, GBP, basic social
- Growth: Starting at $3,500/mo — multi-location practices, adds PPC, content, email campaigns
- Enterprise: Custom pricing — hospital systems & large groups, full-service with dedicated team

KEY DIFFERENTIATORS:
- Google Partner & Meta Certified
- HIPAA-aware marketing practices
- Proven results: 340%+ avg increase in patient inquiries
- Specialized exclusively in healthcare — we understand HIPAA, medical terminology, and patient acquisition
- AI-powered marketing automation
- Bilingual support (English & Spanish)

GUIDELINES:
- Be warm, professional, and concise (2-3 sentences when possible)
- Always be helpful and suggest booking a free strategy call for detailed pricing or custom solutions
- For scheduling, direct them to the /contact page
- If asked something outside healthcare marketing scope, politely redirect
- Never share internal processes, proprietary data, or make guarantees about specific results
- Use simple language, avoid jargon unless the visitor uses it first
- If unsure, suggest they contact the team via the contact page`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: Message[];
  sessionId?: string;
  visitorId?: string;
  language?: 'en' | 'es';
}

function fallbackReply(input: string, language: 'en' | 'es' = 'en'): string {
  const q = input.toLowerCase();
  const isEs = language === 'es' || /[¿¡]|\b(precio|servicio|consulta|clinica|urgencia)\b/.test(q);

  if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('precio')) {
    return isEs
      ? 'Nuestros planes comienzan en $1,500/mes (Starter), $3,500/mes (Growth) y Enterprise personalizado. Si desea una recomendación exacta para su clínica, puede agendar una consulta gratuita en /contact.'
      : 'Our plans start at $1,500/mo (Starter), $3,500/mo (Growth), and custom Enterprise pricing. For an exact recommendation for your clinic, book a free strategy call at /contact.';
  }

  if (q.includes('service') || q.includes('offer') || q.includes('servicio')) {
    return isEs
      ? 'Ofrecemos SEO local, Google/Meta Ads, diseño web, redes sociales, contenido, campañas de email y automatización de marketing para clínicas. Si me dice su tipo de centro, le sugiero el paquete ideal.'
      : 'We offer local SEO, Google/Meta Ads, website design, social media, content, email campaigns, and marketing automation for healthcare practices. If you share your clinic type, I can suggest the best package.';
  }

  if (q.includes('book') || q.includes('consult') || q.includes('schedule') || q.includes('consulta') || q.includes('agendar')) {
    return isEs
      ? 'Puede reservar una consulta estratégica gratuita en la página /contact. Si quiere, también le digo qué información preparar para aprovechar mejor la llamada.'
      : 'You can book a free strategy consultation on the /contact page. If you’d like, I can also tell you what info to prepare so the call is most useful.';
  }

  if (q.includes('urgent care') || q.includes('er') || q.includes('medspa') || q.includes('clinic') || q.includes('clínica')) {
    return isEs
      ? 'Sí, trabajamos con urgent care, ERs, MedSpas y otras clínicas de salud. Adaptamos la estrategia por especialidad, ubicación y objetivos de captación de pacientes.'
      : 'Yes, we work with urgent care centers, ERs, MedSpas, and other healthcare clinics. We tailor strategy by specialty, location, and patient acquisition goals.';
  }

  return isEs
    ? 'Gracias por su mensaje. Puedo ayudarle con servicios, precios y estrategia para su clínica. Para una recomendación personalizada, reserve una llamada gratuita en /contact.'
    : 'Thanks for your message. I can help with services, pricing, and strategy for your practice. For a tailored recommendation, book a free call at /contact.';
}

function summarizeConversation(messages: Message[], language: 'en' | 'es' = 'en') {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim()).filter(Boolean);
  const combined = userMessages.join(' ').toLowerCase();
  const intents: string[] = [];

  const has = (patterns: string[]) => patterns.some((pattern) => combined.includes(pattern));

  if (has(['price', 'pricing', 'cost', 'precio'])) intents.push('Pricing Inquiry');
  if (has(['service', 'offer', 'seo', 'ads', 'website', 'servicio'])) intents.push('Service Inquiry');
  if (has(['book', 'schedule', 'consult', 'contact', 'consulta', 'agendar'])) intents.push('Consultation Intent');
  if (has(['urgent care', 'er', 'medspa', 'dental', 'clinic', 'clínica'])) intents.push('Industry Fit Check');

  const leadSignal = has(['book', 'schedule', 'contact', 'quote', 'proposal', 'precio', 'agendar'])
    ? 'High'
    : userMessages.length >= 3
      ? 'Medium'
      : 'Low';

  const topQuestions = userMessages.slice(-3).join(' | ') || (language === 'es' ? 'Sin preguntas registradas' : 'No user questions captured');
  const intentText = intents.length > 0 ? intents.join(', ') : language === 'es' ? 'Consulta general' : 'General Inquiry';

  const summary = language === 'es'
    ? `Intereses: ${intentText}. Nivel de intención: ${leadSignal}. Últimas preguntas: ${topQuestions}`
    : `Interests: ${intentText}. Lead intent: ${leadSignal}. Latest questions: ${topQuestions}`;

  const report = language === 'es'
    ? `Reporte de visita: Usuario preguntó sobre ${intentText.toLowerCase()}. Señal de conversión: ${leadSignal}. Recomendación: seguimiento comercial con propuesta y llamada.`
    : `Visit report: User asked about ${intentText.toLowerCase()}. Conversion signal: ${leadSignal}. Recommendation: sales follow-up with proposal and strategy call.`;

  return { summary, report };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, visitorId, language } = (await req.json()) as ChatRequestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const currentLanguage: 'en' | 'es' = language === 'es' ? 'es' : 'en';
    const activeSessionKey = sessionId || `anon-${Date.now()}`;

    let session: { id: string } | null = null;
    try {
      session = await prisma.chatSession.upsert({
        where: { sessionKey: activeSessionKey },
        update: {
          visitorId: visitorId || undefined,
          language: currentLanguage,
        },
        create: {
          sessionKey: activeSessionKey,
          visitorId,
          language: currentLanguage,
        },
        select: { id: true },
      });
    } catch (dbError) {
      console.error('Chat session persistence skipped:', dbError);
    }

    const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    if (latestUserMessage && session) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'user',
            content: latestUserMessage,
          },
        });
      } catch (dbError) {
        console.error('User chat message persistence skipped:', dbError);
      }
    }

    // Keep only last 10 messages to control context length
    const recentMessages = messages.slice(-10);

    // Build Gemini conversation contents
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I will act as NextGen Healthcare Marketing\'s AI assistant and follow all the guidelines provided.' }] },
      ...recentMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    let reply = '';
    let usedFallback = false;

    if (!GEMINI_API_KEY) {
      usedFallback = true;
      reply = fallbackReply(latestUserMessage, currentLanguage);
    } else {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 512,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        usedFallback = true;
        reply = fallbackReply(latestUserMessage, currentLanguage);
      } else {
        const data = await response.json();
        reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          fallbackReply(latestUserMessage, currentLanguage);
      }
    }

    if (session) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'assistant',
            content: reply,
          },
        });
      } catch (dbError) {
        console.error('Assistant chat message persistence skipped:', dbError);
      }
    }

    const fullConversation: Message[] = [...messages, { role: 'assistant', content: reply } as Message];
    const { summary, report } = summarizeConversation(fullConversation, currentLanguage);

    if (session) {
      try {
        await prisma.chatSession.update({
          where: { id: session.id },
          data: { summary, report, language: currentLanguage },
        });
      } catch (dbError) {
        console.error('Chat session summary update skipped:', dbError);
      }
    }

    return NextResponse.json({ reply, fallback: usedFallback });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: 'Sorry, I had a temporary issue. Please try again, or contact us via /contact.' });
  }
}
