import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are Alex, The NextGen Healthcare Marketing's friendly marketing assistant. You're helpful, human, and genuinely interested in helping healthcare providers grow their practices.

ABOUT THE COMPANY:
- The NextGen Healthcare Marketing: specialized digital healthcare marketing for providers
- Located at 3811 Turtle Creek Blvd, Suite 600, Dallas, TX 75219
- Email: info@thenextgenhealth.com
- We serve ERs, urgent care centers, MedSpas, wellness clinics, dental offices, and other healthcare providers
- Google Partner & Meta Certified with HIPAA-aware practices

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
- Starter: Starting at $1,500/mo — solo practitioners, includes SEO, GBP, basic social
- Growth: Starting at $3,500/mo — multi-location practices, adds PPC, content, email
- Enterprise: Custom pricing — hospital systems & large groups, full-service with dedicated team

OUR DASHBOARD:
- One unified dashboard with real data and real results
- Built for non-technical clients (no need to juggle multiple tools)
- Combines Google Ads, Meta, SEO, Google Business Profile, and patient metrics
- Real-time reporting and insights
- Mobile-friendly access
- Dramatically simplifies reporting and strategy decisions

KEY DIFFERENTIATORS:
- Proven results: 340%+ avg increase in patient inquiries
- Specialized exclusively in healthcare
- HIPAA-aware and compliant
- Bilingual support (English & Spanish)
- All analytics in one place — no more switching between tools

TONE & CONVERSATION STYLE:
- Be warm, conversational, and genuinely helpful
- Use simple, natural language — sound like a real person
- Ask follow-up questions to understand their needs (e.g., "What's your biggest marketing challenge right now?")
- Give substantive answers (NOT short robotic replies)
- When relevant, mention how our dashboard simplifies reporting and gives them one place for all data
- Promote the dashboard when discussing analytics, reporting, or multiple marketing channels
- Suggest booking a free strategy call for detailed recommendations
- Direct scheduling inquiries to /contact
- For interested prospects, recommend a demo of our dashboard

WHEN TO MENTION THE DASHBOARD:
- User asks about analytics or reporting
- User mentions using multiple tools or platforms
- User asks about getting visibility into marketing performance
- User seems interested in simplifying their marketing stack

GUIDELINES:
- Be concise but substantive (2-4 sentences typical)
- Always be helpful and suggest next steps
- If someone asks something outside healthcare marketing, gently redirect to what you can help with
- Never make specific guarantees, but feel free to reference our 340%+ track record
- Use examples from healthcare (ERs, urgent care, MedSpas, dental, wellness) when helpful
- If unsure, suggest they contact the team or book a demo
- End with a natural follow-up question or CTA when appropriate`;

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
      ? 'Nuestros planes comienzan en $1,500/mes (Starter), $3,500/mes (Growth) y Enterprise personalizado. Cada plan crece contigo. ¿Qué tipo de centro tienes? Así veo cuál se adapta mejor.'
      : 'Our plans start at $1,500/mo (Starter), $3,500/mo (Growth), and custom Enterprise pricing. Each tier grows with you. What type of practice do you have? I can suggest the best fit.';
  }

  if (q.includes('service') || q.includes('offer') || q.includes('servicio')) {
    return isEs
      ? 'Ofrecemos SEO local, Google/Meta Ads, diseño web HIPAA, redes sociales, contenido, email marketing, automatización y un dashboard unificado. Especializados 100% en healthcare. ¿Cuál de estos es tu mayor reto ahora?'
      : 'We handle local SEO, Google/Meta Ads, HIPAA-compliant web design, social media, content, email campaigns, marketing automation, and our unified dashboard. We\'re 100% specialized in healthcare. What\'s your biggest challenge right now?';
  }

  if (q.includes('book') || q.includes('consult') || q.includes('schedule') || q.includes('consulta') || q.includes('agendar')) {
    return isEs
      ? 'Perfecto. Puedes agendar una consulta estratégica gratuita en /contact, o si prefieres ver primero nuestro dashboard, también podemos hacer una demo. ¿Qué te interesa más?'
      : 'Perfect! You can book a free strategy call at /contact, or if you\'d like to see our dashboard first, we can do a demo. What works better for you?';
  }

  if (q.includes('urgent care') || q.includes('er') || q.includes('medspa') || q.includes('clinic') || q.includes('dental') || q.includes('clínica')) {
    return isEs
      ? 'Sí, trabajamos con urgent cares, ERs, MedSpas, consultórios dentales, clínicas de bienestar. Adaptamos todo por especialidad. Muchos clientes nuestros pasaban de saltar entre 5-6 herramientas a usar nuestro dashboard. ¿Te gustaría ver cómo funciona?'
      : 'Yes, we work with urgent care centers, ERs, MedSpas, dental offices, wellness clinics — all healthcare specialties. Many of our clients went from juggling 5-6 marketing tools to using our all-in-one dashboard. Would that help you?';
  }

  // Dashboard & Analytics Keywords
  if (q.includes('dashboard') || q.includes('analytics') || q.includes('reporting') || q.includes('data')) {
    return isEs
      ? 'Exacto, ese es nuestro punto fuerte. 📊 Tenemos un dashboard unificado que te muestra datos reales de Google Ads, Meta, SEO y Google Business Profile todo en un lugar. No más saltar entre múltiples herramientas. ¿Te gustaría ver una demo?'
      : 'That\'s exactly where we shine! 📊 Our dashboard puts all your marketing data in one place — Google Ads, Meta, SEO, patient metrics, everything. No more juggling multiple tools. Would you like to see a demo?';
  }

  // Results & Performance Keywords
  if (q.includes('result') || q.includes('patient') || q.includes('inquir') || q.includes('growth')) {
    return isEs
      ? 'Nuestros clientes ven un aumento promedio del 340% en consultas de pacientes. Con nuestro dashboard, tienes total visibility en qué funciona y dónde enfocar presupuesto. ¿Tienes un objetivo de crecimiento específico?'
      : 'Our clients see an average 340%+ increase in patient inquiries. With our dashboard, you get complete visibility into what\'s working. Do you have a specific growth target in mind?';
  }

  return isEs
    ? 'Gracias por tu pregunta. Puedo ayudarte con servicios, precios, o cómo nuestro dashboard centraliza todo tu marketing. ¿Hay algo específico en lo que pueda asistirte?'
    : 'Thanks for reaching out! I can help with services, pricing, or how our dashboard puts all your marketing in one place. What matters most to you right now?';
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
      { role: 'model', parts: [{ text: 'Understood. I will act as The NextGen Healthcare Marketing\'s AI assistant and follow all the guidelines provided.' }] },
      ...recentMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    let reply = '';
    let usedFallback = false;

    // Check if API key is properly configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      console.error('[Chat API] GEMINI_API_KEY is not configured. Please set it in environment variables.');
      usedFallback = true;
      reply = fallbackReply(latestUserMessage, currentLanguage);
    } else {
      try {
        console.log('[Chat API] Calling Gemini API with', recentMessages.length, 'messages');
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
          console.error('[Chat API] Gemini API error:', response.status, errorText);
          usedFallback = true;
          reply = fallbackReply(latestUserMessage, currentLanguage);
        } else {
          const data = await response.json();
          console.log('[Chat API] Gemini API response received:', data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 100));
          
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!generatedText || generatedText.trim() === '') {
            console.warn('[Chat API] Gemini returned empty response, using fallback');
            usedFallback = true;
            reply = fallbackReply(latestUserMessage, currentLanguage);
          } else {
            reply = generatedText;
            console.log('[Chat API] Using Gemini-generated response');
          }
        }
      } catch (error) {
        console.error('[Chat API] Gemini API call failed:', error);
        usedFallback = true;
        reply = fallbackReply(latestUserMessage, currentLanguage);
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
