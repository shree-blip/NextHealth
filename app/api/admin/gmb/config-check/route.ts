import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkGoogleApiHealth, clearApiErrorCache, type ApiHealthStatus } from '@/lib/google-api-core';

/**
 * Diagnostic endpoint to check Google API configuration + connectivity.
 * Tests each API endpoint and returns actionable status per API.
 *
 * Query params:
 *   clinicId  — optional, tests API health for a specific clinic's connection
 *   refresh   — if "1", clears negative cache before testing
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const refresh = req.nextUrl.searchParams.get('refresh') === '1';

    const issues: string[] = [];
    const config: Record<string, string | boolean> = {};

    // Check environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL;
    const adsToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    config['GOOGLE_CLIENT_ID'] = clientId ? '✓ Set' : '✗ Missing';
    config['GOOGLE_CLIENT_SECRET'] = clientSecret ? '✓ Set' : '✗ Missing';
    config['APP_URL'] = appUrl ? `✓ ${appUrl}` : '✗ Missing';
    config['GOOGLE_ADS_DEVELOPER_TOKEN'] = adsToken ? '✓ Set' : '✗ Not set (Google Ads sync will be skipped)';

    if (!clientId) issues.push('GOOGLE_CLIENT_ID environment variable is not set');
    if (!clientSecret) issues.push('GOOGLE_CLIENT_SECRET environment variable is not set');
    if (!appUrl) issues.push('APP_URL environment variable is not set');

    // Calculate redirect URI
    const redirectUri = appUrl
      ? `${appUrl}/api/admin/gmb/callback`
      : 'http://localhost:3000/api/admin/gmb/callback';

    config['Redirect URI'] = redirectUri;

    // ── API Health Check (if clinicId provided) ──────────────────
    let apiHealth: ApiHealthStatus[] | null = null;
    let connectionStatus: Record<string, any> | null = null;

    if (clinicId) {
      const connection = await prisma.gMBConnection.findUnique({ where: { clinicId } });

      if (connection) {
        connectionStatus = {
          connectionStatus: connection.connectionStatus,
          syncStatus: connection.syncStatus,
          lastSyncedAt: connection.lastSyncedAt,
          lastSyncError: connection.lastSyncError,
          googleEmail: connection.googleEmail,
          ga4PropertyId: connection.ga4PropertyId || null,
          searchConsoleSite: connection.searchConsoleSite || null,
          businessLocationId: connection.businessLocationId || null,
          googleAdsCustomerId: connection.googleAdsCustomerId || null,
        };

        // Clear negative cache if user wants a fresh test
        if (refresh) {
          await clearApiErrorCache();
        }

        // Test actual API connectivity
        apiHealth = await checkGoogleApiHealth(connection.id);

        const failedApis = apiHealth.filter(a => !a.enabled);
        if (failedApis.length > 0) {
          issues.push(
            ...failedApis.map(a => `${a.api}: ${a.error || 'Not accessible'}`)
          );
        }

        // Check for missing configuration
        if (!connection.ga4PropertyId) {
          issues.push('GA4 property not selected — GA4 data sync will not run. Select a property in the Google Connection setup.');
        }
        if (!connection.searchConsoleSite) {
          issues.push('Search Console site not selected — SC data sync will not run. Select a site in the Google Connection setup.');
        }
        if (!connection.businessLocationId) {
          issues.push('Business Profile location not selected — GMB data sync will not run. Select a location in the Google Connection setup.');
        }
      } else {
        issues.push('No Google connection found for this clinic. Connect a Google account first.');
      }
    }

    if (issues.length === 0) {
      issues.push('All configurations and APIs appear valid.');
    }

    return NextResponse.json({
      status: issues.some(i => i.includes('✗') || i.includes('not enabled') || i.includes('not set') || i.includes('not selected') || i.includes('Not accessible'))
        ? 'issues_found'
        : 'healthy',
      config,
      issues,
      redirectUri,
      connectionStatus,
      apiHealth,
      requiredApis: [
        { name: 'My Business Account Management API', purpose: 'List Google Business Profile accounts', required: true },
        { name: 'My Business Business Information API', purpose: 'List business locations', required: true },
        { name: 'Business Profile Performance API', purpose: 'Fetch GBP metrics (views, calls, clicks)', required: true },
        { name: 'Google Analytics Admin API', purpose: 'Discover GA4 properties', required: true },
        { name: 'Google Analytics Data API', purpose: 'Fetch GA4 metrics (users, sessions, pageviews)', required: true },
        { name: 'Google Search Console API', purpose: 'Fetch search performance data', required: true },
        { name: 'Google Ads API', purpose: 'Fetch ads performance (optional)', required: false },
      ],
    });
  } catch (error: any) {
    console.error('[GMB Config Check] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check configuration' },
      { status: 500 }
    );
  }
}
