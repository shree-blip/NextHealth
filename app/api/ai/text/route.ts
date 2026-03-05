import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, tone, userId } = body;

    // TODO: Replace this with your actual authentication logic
    // Currently accepting userId from the request body
    // In production, extract userId from JWT token or session
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please authenticate.' },
        { status: 401 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Validate environment variable
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Build the system prompt based on tone
    let systemPrompt = 'You are a helpful AI assistant that generates high-quality content.';
    if (tone === 'professional') {
      systemPrompt += ' Use a professional and formal tone.';
    } else if (tone === 'casual') {
      systemPrompt += ' Use a casual and friendly tone.';
    } else if (tone === 'creative') {
      systemPrompt += ' Use a creative and engaging tone with vivid language.';
    }

    // Generate text using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    });

    // Save to database
    const aiHistory = await prisma.aiHistory.create({
      data: {
        userId,
        generatorType: 'text',
        prompt,
        settings: { tone },
        output: text,
      },
    });

    return NextResponse.json({
      success: true,
      text,
      historyId: aiHistory.id,
    });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate text',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
