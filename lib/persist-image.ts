/**
 * Utility to persist AI-generated images (DALL-E 3) to permanent storage.
 *
 * DALL-E 3 returns temporary signed URLs that expire after ~1 hour.
 * This module downloads the image and uploads it to Vercel Blob Storage
 * for a permanent URL. Falls back to base64 data URL if Blob is not configured.
 *
 * To enable Vercel Blob: set BLOB_READ_WRITE_TOKEN in your environment variables.
 */

/**
 * Downloads an image from a temporary URL and uploads it to permanent storage.
 *
 * @param tempUrl - The temporary DALL-E image URL
 * @param filenamePrefix - Prefix for the stored filename (e.g., 'blog', 'news')
 * @returns The permanent image URL, or null if the process fails
 */
export async function persistImage(
  tempUrl: string,
  filenamePrefix: string = 'ai-image'
): Promise<string | null> {
  try {
    // Step 1: Download the image from the temporary URL
    const response = await fetch(tempUrl);
    if (!response.ok) {
      console.error(`Failed to download image: HTTP ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${filenamePrefix}-${timestamp}-${randomStr}.${extension}`;

    // Step 2: Try Vercel Blob Storage (preferred — permanent CDN URL)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const imageBuffer = await response.arrayBuffer();

        const blob = await put(filename, Buffer.from(imageBuffer), {
          contentType,
          access: 'public',
        });

        console.log(`Image persisted to Vercel Blob: ${blob.url}`);
        return blob.url;
      } catch (blobError) {
        console.error('Vercel Blob upload failed, falling back to base64:', blobError);
      }
    }

    // Step 3: Fallback — convert to base64 data URL
    // This works universally but increases DB storage size.
    // For production, configure BLOB_READ_WRITE_TOKEN for Vercel Blob.
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log(`Image persisted as base64 data URL (${Math.round(base64.length / 1024)}KB). For production, set BLOB_READ_WRITE_TOKEN.`);
    return dataUrl;
  } catch (error) {
    console.error('Failed to persist image:', error);
    return null;
  }
}
