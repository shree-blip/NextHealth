# Vercel Deployment Guide

## Overview
Your app has been configured for serverless deployment on Vercel using:
- **Next.js** (frontend + API routes)
- **Supabase PostgreSQL** (database)
- **Vercel** (hosting)

## ✅ Changes Made

1. **Prisma Schema**: Updated from SQLite → PostgreSQL
2. **package.json**: Updated scripts to use Next.js (not Express server)
3. **Database**: Socket.io removed (not compatible with serverless)
4. **vercel.json**: Configuration for build and deployment

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and create account
2. Create a new project
3. Go to **Settings** → **Database** → Copy the **Connection String** (PostgreSQL)
   - Format: `postgresql://postgres:[PASSWORD]@db.[REFERENCE].supabase.co:5432/postgres?ssl=require`
4. Keep this safe - you'll need it for Vercel

### Step 2: Push Schema to Supabase

```bash
# Install dependencies
npm install

# Set DATABASE_URL temporarily for migration
export DATABASE_URL="your-supabase-connection-string"

# Push schema to Supabase
npx prisma db push

# Verify schema imported
npx prisma studio
```

### Step 3: Deploy to Vercel

1. Push code to GitHub (if not already done)
2. Go to [https://vercel.com](https://vercel.com) and sign in
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL` → Paste your Supabase connection string
   - `JWT_SECRET` → Generate a strong random string (e.g., using `openssl rand -base64 32`)
   - `STRIPE_SECRET_KEY` → Your Stripe key
   - `STRIPE_SILVER_PRICE_ID`, `STRIPE_GOLD_PRICE_ID`, `STRIPE_PLATINUM_PRICE_ID` → Your Stripe price IDs
6. Click **"Deploy"** → Done! 🎉

## 📝 Environment Variables Reference

| Variable | Source | Required |
|----------|--------|----------|
| `DATABASE_URL` | Supabase | ✅ |
| `JWT_SECRET` | Generate new | ✅ |
| `STRIPE_SECRET_KEY` | Stripe dashboard | ✅ |
| `STRIPE_*_PRICE_ID` | Stripe dashboard | ✅ |
| `NODE_ENV` | Set to `production` | ✅ |

### Monthly Client Report Email Automation

Add these environment variables in Vercel for monthly clinic report emails:

| Variable | Purpose | Required |
|----------|---------|----------|
| `CRON_SECRET` | Protects cron endpoints | ✅ |
| `REPORT_EMAIL_FROM` | Sender email address (e.g. `hello@thenextgenhealth.com`) | ✅ |
| `REPORT_GMAIL_USER` | Gmail account used for SMTP sending | ✅ |
| `REPORT_GMAIL_APP_PASSWORD` | Gmail app password for SMTP auth | ✅ |
| `MONTHLY_REPORT_SINGLE_RECIPIENT` | Single destination for all monthly clinic reports | ✅ |

Cron endpoint added: `/api/cron/monthly-client-reports`
- Scheduled daily via Vercel cron.
- Endpoint sends reports only during the **first week of the month** in `America/New_York` timezone.
- Sends **all clinic monthly reports to one recipient only** (`MONTHLY_REPORT_SINGLE_RECIPIENT`).
- Manual forced run: `GET /api/cron/monthly-client-reports?force=1` with `Authorization: Bearer <CRON_SECRET>`.

## ⚠️ Important Notes

### Socket.io Removed
- Real-time socket connections don't work on serverless Vercel
- Core functionality remains (just without real-time updates)
- Options to restore real-time:
  - Use Supabase Realtime
  - Use Pusher or similar service
  - Implement polling via Next.js

### Database Backups
It's recommended to enable Supabase automated backups:
1. Go to Supabase project → **Settings** → **Backups**
2. Enable daily automated backups

### Local Development
To continue developing locally with PostgreSQL:

```bash
# Use Supabase connection string
export DATABASE_URL="your-supabase-connection-string"

# Or keep a local PostgreSQL database for dev
# Then update .env.local with its URL

npm run dev
```

## 🔍 Troubleshooting

### Build fails with "DATABASE_URL not found"
→ Make sure the environment variable is set in Vercel project settings

### Prisma migration fails
→ Run `npx prisma migrate deploy` locally first, then deploy

### Schema mismatch errors
→ Run `npx prisma db push` to sync schema with database

## 📚 Next Steps

1. [Learn about Supabase](https://supabase.com/docs)
2. [Vercel deployment docs](https://vercel.com/docs)
3. [Prisma with PostgreSQL](https://www.prisma.io/docs/orm/overview/databases/postgresql)

## 💬 Support

If you want to add real-time features back:
- Consider Supabase Realtime (built-in, no extra cost)
- Or migrate to a different hosting solution that supports Node.js servers (Railway, Render, Fly.io)
