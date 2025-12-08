# Render.com Deployment Guide - Alternative to Railway

## Why Render?

- ✅ **Free Tier**: 750 hours/month free (enough for one service)
- ✅ **No Credit Card Required**: Start immediately
- ✅ **Auto-Deploy**: Pushes to GitHub trigger deploys
- ✅ **PostgreSQL**: Free 90-day PostgreSQL database included
- ✅ **Reliable**: Better uptime than Railway free tier

## Quick Deploy (5 Minutes)

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your `Probuild-ERP-Replit` repository
3. Render will auto-detect the configuration

### Step 3: Configure Build Settings

**Basic Settings:**
- **Name**: `probuild-erp` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: Node
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

### Step 4: Set Environment Variables

Click "Advanced" → Add these environment variables:

```bash
# Database (REQUIRED)
DATABASE_URL=your_neon_postgresql_connection_string

# Session Security (REQUIRED) - Render can auto-generate this
SESSION_SECRET=click_generate_button

# Node Environment (REQUIRED)
NODE_ENV=production

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (if using SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Basiq (if using Open Banking)
BASIQ_API_KEY=...
BASIQ_WEBHOOK_SECRET=...
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first build
3. Your app will be live at `https://probuild-erp.onrender.com`

## Free Tier Limitations

⚠️ **Important to Know:**
- Services **spin down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (one service running 24/7)
- Enough for development/testing

**To keep it always on:**
- Upgrade to paid plan ($7/month)
- Or use a ping service to keep it active

## Differences from Railway

| Feature | Railway | Render |
|---------|---------|--------|
| Free Tier | Requires credit card | No credit card |
| Sleep Policy | No sleep | Sleeps after 15min |
| Build Time | 3-5 minutes | 5-10 minutes |
| Custom Domain | Easy | Easy |
| Auto Deploy | Yes | Yes |

## After Deployment

### 1. Update Webhooks

**Stripe Webhooks:**
- URL: `https://your-app.onrender.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

**Basiq Webhooks:**
- URL: `https://your-app.onrender.com/api/basiq/webhook`

### 2. Custom Domain (Optional)
1. Go to your service → Settings → Custom Domain
2. Add your domain
3. Update DNS records as shown
4. Free SSL certificate included!

### 3. Monitor Your App
- View logs in real-time
- Check build and deploy history
- Monitor metrics (CPU, Memory, Bandwidth)

## Troubleshooting

### ❌ Build Fails - Out of Memory
**Solution**: Render free tier has 512MB RAM limit during build
- Your app uses 4GB memory optimization in package.json
- This is fine - Render will use swap space
- Build just takes longer (8-10 minutes instead of 5)

### ❌ App Crashes on Start
**Check**:
1. Environment variables set correctly? ✅
2. DATABASE_URL accessible? ✅
3. Check logs for specific error

### ❌ Slow First Load
**Expected**: Free tier spins down after 15 minutes inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid tier to prevent sleeping

## Keeping Your App Awake (Free)

Use a ping service to prevent sleeping:

### Option 1: Cron-job.org
1. Go to https://cron-job.org
2. Create free account
3. Add job: `https://your-app.onrender.com` every 10 minutes

### Option 2: UptimeRobot
1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor: `https://your-app.onrender.com` every 5 minutes

## Render vs Railway Decision

**Choose Render if:**
- ✅ You want truly free hosting (no credit card)
- ✅ You're okay with 15-minute sleep
- ✅ You want better free tier reliability
- ✅ You need free PostgreSQL database

**Choose Railway if:**
- ✅ You have a credit card
- ✅ You need instant always-on
- ✅ You're okay with metered pricing
- ✅ You prefer faster builds

## Both Platforms Work!

Your repository is configured for both:
- `railway.json` + `nixpacks.toml` → Railway
- `render.yaml` → Render
- Both use same build/start commands

## Migration Path

Already on Railway and want to try Render?
1. Deploy on Render (follow steps above)
2. Test it works
3. Update DNS/webhooks to Render
4. Delete Railway project if satisfied

---

**Your code is ready for Render!** Just sign up and deploy. 🚀
