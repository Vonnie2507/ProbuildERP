# Railway Quick Start - Probuild ERP

## What Was Fixed

Your application had these issues preventing Railway deployment:

1. ❌ **No Railway configuration files** → ✅ Added `railway.json`, `nixpacks.toml`, `Procfile`
2. ❌ **Build memory issues** → ✅ Increased Node.js heap to 4GB
3. ❌ **No deployment documentation** → ✅ Created comprehensive guide

## Deploy Right Now (5 Minutes)

### Step 1: Go to Railway
Visit: https://railway.app → Login → Click "New Project"

### Step 2: Connect GitHub
1. Choose "Deploy from GitHub repo"
2. Select `Probuild-ERP-Replit`
3. Railway auto-detects configuration ✅

### Step 3: Set Environment Variables
Click your service → "Variables" tab → Add these:

**Critical (Required):**
```
DATABASE_URL=your_neon_postgres_connection_string
SESSION_SECRET=generate_with_openssl_rand_base64_32
NODE_ENV=production
```

**Stripe (if using payments):**
```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Twilio (if using SMS):**
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

**Google Maps:**
```
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### Step 4: Deploy
Click "Deploy" button → Wait 3-5 minutes → Done! 🎉

Your app will be live at: `https://your-app.up.railway.app`

## Common Issues

### ❌ Build Fails - Out of Memory
**Solution**: Railway free tier has limits. The config uses 4GB memory optimization.
- Upgrade to paid plan if needed ($5/month)
- Or deploy to Render/Heroku alternatives

### ❌ Application Crashes
**Check**: 
1. All environment variables set? ✅
2. DATABASE_URL correct and accessible? ✅
3. Neon database allows connections? ✅

### ❌ Can't Connect to Database
**Fix**: Ensure your Neon connection string includes `?sslmode=require`

## What's Configured

✅ **Build Process**: Vite frontend + esbuild backend  
✅ **Memory**: 4GB heap for large React app  
✅ **Start Command**: Production-optimized server  
✅ **Port**: Automatic (Railway manages)  
✅ **Health Checks**: Automatic  

## Files Added

- `railway.json` - Railway settings
- `nixpacks.toml` - Build system config
- `Procfile` - Start command
- `.railwayignore` - Exclude large files
- `RAILWAY_DEPLOYMENT.md` - Full guide (read this for details!)

## After Deployment

1. ✅ Test your application at the Railway URL
2. ✅ Set up Stripe webhooks: `https://your-app.up.railway.app/api/stripe/webhook`
3. ✅ Set up Basiq webhooks: `https://your-app.up.railway.app/api/basiq/webhook`
4. ✅ Add custom domain (optional)
5. ✅ Create your first admin user

## Need Help?

1. Check Railway logs: Dashboard → Your Service → Deployments → Click deployment → View logs
2. Read full guide: `RAILWAY_DEPLOYMENT.md`
3. Check application logs in Railway dashboard

## Alternative: If Railway Doesn't Work

Try these alternatives (same configuration files work):
- **Render**: https://render.com (free tier available)
- **Fly.io**: https://fly.io (free tier available)
- **Heroku**: https://heroku.com ($7/month minimum)

All use similar buildpacks and will work with the existing configuration!

---

**Your changes are committed and pushed to GitHub!** 🚀  
Ready to deploy on Railway now.
