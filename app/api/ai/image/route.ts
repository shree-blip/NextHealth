import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { prisma } from '@/lib/prisma';
import { persistImage } from '@/lib/persist-image';
import { getAuthenticatedDbUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedDbUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in.' },
        { status: 401 }
      );
    }
    const userId = user.id;

    const body = await req.json();
    const { prompt, format } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Validate environment variable
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set in environment variables');
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Map format to aspect ratio for FLUX
    let aspect_ratio = '1:1';
    if (format === '16:9') {
      aspect_ratio = '16:9'; // Landscape
    }

    // Generate image using FLUX (black-forest-labs/flux-schnell)
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt: prompt,
        aspect_ratio: aspect_ratio,
        num_outputs: 1,
      },
    });

    // FLUX returns an array of file output URLs
    const outputArray = output as unknown as string[];
    const imageUrl = outputArray?.[0];

    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    // Persist the image to permanent storage (Replicate URLs are temporary)
    const permanentUrl = await persistImage(imageUrl, 'ai-image');
    const finalUrl = permanentUrl || imageUrl; // Fallback to temp URL if persistence fails

    // Save to database
    const aiHistory = await prisma.aiHistory.create({
      data: {
        userId,
        generatorType: 'image',
        prompt,
        settings: { format, aspect_ratio },
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
