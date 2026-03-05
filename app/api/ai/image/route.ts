import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, format, userId } = body;

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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Map format to DALL-E 3 size
    // DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
    let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
    if (format === '16:9') {
      size = '1792x1024'; // Landscape
    } else {
      size = '1024x1024'; // Square
    }

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Persist the image to permanent storage (DALL-E URLs expire after ~1 hour)
    const permanentUrl = await persistImage(imageUrl, 'ai-image');
    const finalUrl = permanentUrl || imageUrl; // Fallback to temp URL if persistence fails

    // Save to database
    const aiHistory = await prisma.aiHistory.create({
      data: {
        userId,
        generatorType: 'image',
        prompt,
        settings: { format, size },
        output: finalUrl,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: finalUrl,
      historyId: aiHistory.id,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
