import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

/**
 * Diagnostic endpoint to check GMB OAuth configuration
 * Returns configuration status and potential issues
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const issues: string[] = [];
    const config: Record<string, string | boolean> = {};

    // Check environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL;

    config['GOOGLE_CLIENT_ID'] = clientId ? '✓ Set' : '✗ Missing';
    config['GOOGLE_CLIENT_SECRET'] = clientSecret ? '✓ Set' : '✗ Missing';
    config['APP_URL'] = appUrl ? `✓ ${appUrl}` : '✗ Missing';

    if (!clientId) issues.push('GOOGLE_CLIENT_ID environment variable is not set');
    if (!clientSecret) issues.push('GOOGLE_CLIENT_SECRET environment variable is not set');
    if (!appUrl) issues.push('APP_URL environment variable is not set');

    // Calculate redirect URI
    const redirectUri = appUrl 
      ? `${appUrl}/api/admin/gmb/callback`
      : 'http://localhost:3000/api/admin/gmb/callback';

    config['Redirect URI'] = redirectUri;
    config['Expected Redirect URI'] = redirectUri;

    if (issues.length === 0) {
      issues.push('Configuration appears valid. If you still see "Access blocked" errors:');
      issues.push('1. Verify the redirect URI is registered in Google Cloud Console');
      issues.push('2. Check that OAuth consent screen is published');
      issues.push('3. Ensure the user is added as a test user in OAuth consent settings');
      issues.push('4. Clear browser cookies and try again');
    }

    return NextResponse.json({
      status: issues.length === 0 ? 'configured' : 'issues_found',
      config,
      issues,
      redirectUri,
    });
  } catch (error: any) {
    console.error('[GMB Config Check] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check configuration' },
      { status: 500 }
    );
  }
}
