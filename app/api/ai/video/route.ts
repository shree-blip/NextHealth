import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedDbUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend timeout for video generation

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
    const { prompt } = body;

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
        { error: 'Video generation service is not configured' },
        { status: 500 }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Use a fast video generation model
    // zeroscope_v2_xl is a good choice for quick results
    const output = await replicate.run(
      'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
      {
        input: {
          prompt: prompt,
          num_frames: 24, // Short video for faster generation
          num_inference_steps: 20,
        },
      }
    );

    // Replicate returns a video URL or array of URLs
    let videoUrl: string;
    if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (typeof output === 'string') {
      videoUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    if (!videoUrl) {
      throw new Error('No video URL returned from Replicate');
    }

    // Save to database
    const aiHistory = await prisma.aiHistory.create({
      data: {
        userId,
        generatorType: 'video',
        prompt,
        settings: { model: 'zeroscope-v2-xl', num_frames: 24 },
        output: videoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl,
      historyId: aiHistory.id,
    });
  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate video',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
