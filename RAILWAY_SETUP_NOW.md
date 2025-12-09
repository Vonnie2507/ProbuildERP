# 🚂 Railway Setup - Final Steps

## ✅ **What You Have:**

- ✅ Postgres database running
- ✅ ProbuildERP web service deployed
- ✅ DATABASE_URL configured: `postgresql://postgres:...@postgres.railway.internal:5432/railway`

## 🚀 **What to Do Now:**

### **Step 1: Merge the PR** ⭐ **DO THIS FIRST**

Go to: **https://github.com/Vonnie2507/ProbuildERP/pull/1**

Click **"Merge pull request"** → **"Confirm merge"**

This fixes:
- ✅ SSL connection issues with Postgres
- ✅ Session/cookie configuration for login
- ✅ Proxy trust for Railway
- ✅ Debug logging

**Wait 3-5 minutes for Railway to rebuild and redeploy.**

---

### **Step 2: Initialize the Database**

After deployment finishes, you need to create tables and seed test users.

#### **Option A: Using Railway CLI (Recommended)**

**Install Railway CLI:**
```bash
# Mac/Linux
curl -fsSL https://railway.app/install.sh | sh

# Or with npm
npm install -g @railway/cli
```

**Then run:**
```bash
# Login to Railway
railway login

# Link to your project
railway link

# Run database setup
railway run npm run db:setup
```

This will:
- Push database schema (create tables)
- Seed test users
- Show you the login credentials

#### **Option B: Using Railway Dashboard**

1. Go to Railway Dashboard
2. Click **"ProbuildERP"** service
3. Click **"Settings"** tab
4. Scroll to **"Deploy"** section
5. Find **"Custom Start Command"** or **"One-off Commands"**
6. Run these commands in order:

**First command:**
```bash
npm run db:push
```

**Second command:**
```bash
npm run db:seed
```

#### **Option C: From Railway Shell**

1. Railway Dashboard → ProbuildERP service
2. Look for **"Shell"** or **"Console"** tab
3. Run:
```bash
npm run db:setup
```

---

### **Step 3: Get Your App URL**

In Railway Dashboard:
1. Click **"ProbuildERP"** service
2. Look for the **public URL** (should be displayed prominently)
3. It looks like: `https://probuilderp-production.up.railway.app`
4. Copy this URL

---

### **Step 4: Test Login** 🎉

Go to your app URL and login with:

```
Email: vonnie@probuildpvc.com.au
Password: password123
```

**Should work now!** ✅

---

## 🔍 **What Each Command Does:**

### `npm run db:push`
- Connects to your Railway Postgres database
- Creates all tables (users, clients, leads, jobs, etc.)
- Sets up schema from your code

### `npm run db:seed`
- Creates test users (Vonnie, Dave, Craig, etc.)
- Creates sample fence styles
- Creates sample products
- All with password: `password123`

### `npm run db:setup`
- Runs both commands above in sequence
- Gives you a success message with login info

---

## 📊 **Test Users Created:**

After seeding, you can login as any of these:

**Admin (Full Access):**
```
Email: vonnie@probuildpvc.com.au
Password: password123
```

**Sales:**
```
Email: dave@probuildpvc.com.au
Password: password123
```

**Scheduler:**
```
Email: craig@probuildpvc.com.au
Password: password123
```

**Production Manager:**
```
Email: david.turner@probuildpvc.com.au
Password: password123
```

**Warehouse:**
```
Email: george@probuildpvc.com.au
Password: password123
```

**Installers:**
```
Email: jake@probuildpvc.com.au
Password: password123

Email: jarrad@probuildpvc.com.au
Password: password123
```

---

## 🆘 **If Database Setup Fails:**

### **Check Logs:**

Railway Dashboard → ProbuildERP → Deployments → Click latest deployment → View logs

Look for:
```
✅ DATABASE_URL is set, attempting to connect...
✅ Database connection successful!
```

### **If You See SSL Errors:**

The PR I created should fix this. Make sure you merged it!

### **If Tables Already Exist:**

The seed script clears existing data. It's safe to run multiple times.

### **Manual Database Access:**

You can connect to your database directly:

1. Get the **PUBLIC** connection string from Railway:
   - Postgres service → Connect tab
   - Copy the external connection string
   - It will look like: `postgresql://postgres:...@hopper-proxy.rwy.net:22230/railway`

2. Use a database tool (TablePlus, pgAdmin, or CLI):
```bash
psql "postgresql://postgres:MWAiPFRdCaVHzNBlQmitfozpSHELSQvR@hopper-proxy.rwy.net:22230/railway"
```

---

## ✅ **Complete Checklist:**

- [ ] 1. Merge PR #1: https://github.com/Vonnie2507/ProbuildERP/pull/1
- [ ] 2. Wait for Railway deployment (3-5 min)
- [ ] 3. Check deployment logs show "Database connection successful!"
- [ ] 4. Run `railway run npm run db:setup` (or via dashboard)
- [ ] 5. Get your app's public URL from Railway
- [ ] 6. Go to the URL in your browser
- [ ] 7. Login with: vonnie@probuildpvc.com.au / password123
- [ ] 8. Should see the dashboard! 🎉

---

## 🎯 **Quick Commands Reference:**

```bash
# Login to Railway CLI
railway login

# Link to project
railway link

# Setup database (creates tables + seeds users)
railway run npm run db:setup

# Or run individually
railway run npm run db:push   # Create tables
railway run npm run db:seed   # Seed test data

# Check if server is running
railway run npm run check

# View logs
railway logs
```

---

## 📞 **After Everything Works:**

Your app will be live at your Railway URL!

**Next steps:**
1. ✅ Change admin password (security!)
2. ✅ Set up custom domain (optional)
3. ✅ Configure Stripe/Twilio if needed
4. ✅ Invite your team

---

**Pull Request:** https://github.com/Vonnie2507/ProbuildERP/pull/1

**Login:** vonnie@probuildpvc.com.au / password123

**Let's get this deployed!** 🚀
