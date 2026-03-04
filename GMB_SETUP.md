# GMB (Google My Business) Connection Setup Guide

## If you're seeing "Access blocked: This app's request is invalid"

This error occurs when the OAuth credentials are not properly configured in Google Cloud Console. Follow these steps to fix it:

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. **IMPORTANT:** Use a project name matching your healthcare business for OAuth consent

### Step 2: Enable Required APIs

1. Go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google My Business API** (formerly Google Business Profile API)
   - **Google My Business Account Management API**
   - **Google Accounts API**

### Step 3: Set Up OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose application type: **Web application**
4. Add Authorized Redirect URIs:
   - For production: `https://yourdomain.com/api/admin/gmb/callback`
   - For development: `http://localhost:3000/api/admin/gmb/callback`

**IMPORTANT:** The redirect URI must exactly match what's configured in the environment variable `APP_URL`

5. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Environment Variables

Add these to your Vercel environment variables:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
APP_URL=https://yourdomain.com
```

For development `.env.local`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
APP_URL=http://localhost:3000
```

### Step 5: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose **External** (unless your company has Google Workspace)
3. Fill out the form:
   - App name: "Your Healthcare Clinic Manager"
   - User support email: your admin email
   - Developer contact: same email
4. Add scopes: Click "Add or Remove Scopes" and select:
   - `https://www.googleapis.com/auth/business.manage`
   - `email`
   - `profile`
   - `openid`
5. **Publish the app** (not in "Testing" mode)

### Step 6: Add Test Users

1. In OAuth consent screen, under "Test users"
2. Add the email address of the admin who will connect GMB
3. This gmail account will be used to authorize the connection

### Step 7: Verify Configuration (Optional)

Admin can check configuration at: `/api/admin/gmb/config-check`

This endpoint returns:
- Whether environment variables are set
- The redirect URI being used
- Common issues and fixes

### Step 8: Test the Connection

1. In admin dashboard, go to edit a clinic
2. Click ["Connect GMB" button
3. A popup should open with Google login
4. Login with the test account added in Step 6
5. Approve the permission request
6. You should see "Connected!" confirmation

### Troubleshooting

**"Popup blocked" error:**
- Your browser is blocking popups. Allow popups for this domain and try again

**"Invalid redirect URI" error:**
- The redirect URI in Google Cloud doesn't match `APP_URL` environment variable
- Check spelling and protocol (http vs https)
- Must rebuild/redeploy after changing env vars

**"Invalid OAuth request" error:**
- Confirm scopes are added correctly in OAuth consent screen
- Confirm app is published (not in testing)
- Check that test user email is added
- Clear browser cookies and try again

**Still getting errors?**
- Check Vercel deployment log for environment variable values
- Verify in Google Cloud that client ID/secret are correct
- Ensure APIs are enabled

### After Connecting GMB

1. Select your **Business Account** from the dropdown
2. Select your **Business Location** 
3. Click "Save Location"
4. GMB metrics will sync automatically within 1-2 hours
5. Check Analytics section to see metrics

## Real-Time GMB Sync

Once connected, your clinic's Google My Business data syncs automatically:

- **Website clicks** from Google Search and Maps
- **Phone call clicks** from your business profile
- **Direction requests** from your business profile
- **Views and impressions** from Google Search and Maps

Sync runs daily at 2 AM UTC and can be manually triggered in the clinic settings.

## Data Available After First Sync

Once connected and data syncs, admin can see:

- Daily performance metrics for the clinic
- 90-day historical data
- Real-time analytics dashboard
- Export capabilities

## Support

If you continue to have issues:

1. Take a screenshot of the error message
2. Check `/api/admin/gmb/config-check` for diagnostics
3. Review browser console for detailed error logs
4. Contact support with the screenshot and logs
