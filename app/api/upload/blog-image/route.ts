import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const alt = (formData.get('alt') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB max for blog images)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    try {
      // Try Vercel Blob first (if BLOB_READ_WRITE_TOKEN is set)
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import('@vercel/blob');
        
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `blog-${timestamp}-${randomStr}.${extension}`;
        
        const blob = await put(filename, file, {
          contentType: file.type,
          access: 'public',
        });

        return NextResponse.json({
          url: blob.url,
          alt: alt || file.name,
          success: true,
        });
      }
    } catch (blobError) {
      console.warn('Vercel Blob not configured, falling back to data URL:', blobError);
    }

    // Fallback: Create data URL for temporary display
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      alt: alt || file.name,
      success: true,
      warning: 'Image stored as data URL. For production, configure Vercel Blob storage.',
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to upload image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
