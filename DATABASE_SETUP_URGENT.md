# 🚨 URGENT: Database Setup Required

## ❌ **Current Problem**

Your login is showing **"401: Invalid email or password"** because:

**DATABASE_URL environment variable is NOT SET on your server!**

Without a database connection, the app cannot:
- ✗ Check user credentials
- ✗ Store session data
- ✗ Access any application data

## ✅ **Quick Fix (Choose One)**

---

### **Option 1: Neon Database (Recommended - FREE)**

**Neon is a serverless Postgres database - perfect for this app.**

#### Step 1: Create Neon Database (2 minutes)

1. Go to: https://neon.tech
2. Sign up/Login (GitHub login available)
3. Click "Create Project"
4. Name: `probuild-erp`
5. Click "Create Project"

#### Step 2: Copy Connection String

After project is created:
1. Click "Connection Details"
2. Copy the connection string (looks like this):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/database?sslmode=require
   ```

#### Step 3: Set Environment Variable

**If deployed on Railway:**
```bash
1. Go to Railway dashboard
2. Select your service
3. Click "Variables" tab
4. Add variable:
   Name: DATABASE_URL
   Value: postgresql://username:password@ep-xxx...
5. Click "Deploy"
```

**If deployed on Render/Heroku/Other:**
```bash
1. Go to your dashboard
2. Find Environment Variables section
3. Add: DATABASE_URL = your_connection_string
4. Save and redeploy
```

**If running locally:**
```bash
# Create .env file
echo "DATABASE_URL=postgresql://username:password@ep-xxx..." > .env

# Or export temporarily
export DATABASE_URL="postgresql://username:password@ep-xxx..."
```

#### Step 4: Push Database Schema

```bash
cd /home/user/webapp
npm run db:push
```

#### Step 5: Seed Test Data

```bash
# Create a seed script in package.json first
npx tsx server/seed.ts
```

---

### **Option 2: Railway Postgres (If using Railway)**

#### Step 1: Add Postgres Service

1. Go to your Railway project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway automatically creates and sets DATABASE_URL ✅

#### Step 2: Wait for Database to Initialize (30 seconds)

#### Step 3: Push Schema & Seed

```bash
npm run db:push
npx tsx server/seed.ts
```

---

### **Option 3: Local Postgres (Development Only)**

#### Step 1: Install Postgres

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

#### Step 2: Create Database

```bash
# Login to postgres
psql postgres

# Create database
CREATE DATABASE probuild_erp;

# Create user
CREATE USER probuild WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE probuild_erp TO probuild;

# Exit
\q
```

#### Step 3: Set DATABASE_URL

```bash
export DATABASE_URL="postgresql://probuild:your_password@localhost:5432/probuild_erp"
```

---

## 📋 **After Database is Set Up**

### 1. Verify Connection

```bash
cd /home/user/webapp
npx tsx -e "import { pool } from './server/db'; pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message))"
```

### 2. Push Database Schema

```bash
npm run db:push
```

You should see output like:
```
✓ Applying migration...
✓ Migration complete
```

### 3. Seed Test Users

```bash
npx tsx server/seed.ts
```

You should see:
```
Seeding database...
Created users
Created fence styles
...
✅ Seed completed
```

### 4. Test Login

Go to your app URL and login with:
```
Email: vonnie@probuildpvc.com.au
Password: password123
```

**Should work now!** ✅

---

## 🔍 **Verify It's Working**

### Check Server Logs

After setting DATABASE_URL, restart your server and look for:

```
✅ DATABASE_URL is set, attempting to connect...
Database host: ep-xxx.us-east-2.aws.neon.tech
✅ Database connection successful!
```

If you see:
```
❌ CRITICAL ERROR: DATABASE_URL environment variable is not set!
```

The environment variable is not set correctly.

### Check Login Endpoint

Try login and check server logs for:
```
[LOGIN] Attempt from: <ip>
[LOGIN] Email: vonnie@probuildpvc.com.au
[LOGIN] Success for: vonnie@probuildpvc.com.au
```

---

## 🎯 **Complete Environment Variables Needed**

Here's EVERYTHING you need to set:

### **Required (Minimum):**
```bash
DATABASE_URL=postgresql://user:pass@host/database
SESSION_SECRET=generate-with-openssl-rand-base64-32
NODE_ENV=production
```

### **Optional (For Full Features):**
```bash
# Stripe payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio SMS/Voice
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaxxx

# Cookie settings (if needed)
COOKIE_SECURE=false
COOKIE_DOMAIN=.yourdomain.com
```

---

## 🚀 **Quick Command Reference**

### After DATABASE_URL is set:

```bash
# 1. Navigate to project
cd /home/user/webapp

# 2. Push schema to database
npm run db:push

# 3. Seed test data
npx tsx server/seed.ts

# 4. Start server (development)
npm run dev

# 5. Check if it works
curl http://localhost:5000/health
```

### To reset database (if needed):

```bash
# Drop all tables and re-seed
npx tsx server/seed.ts
```

---

## 📱 **Where to Find Your Current Deployment**

Based on your files, you might be deployed on:

1. **Railway**: https://railway.app → Projects → Your project → Variables
2. **Render**: https://render.com → Services → Your service → Environment
3. **Heroku**: https://heroku.com → Apps → Your app → Settings → Config Vars

Look for your deployment and **add the DATABASE_URL variable there**.

---

## 🆘 **Still Not Working?**

### Check These:

1. ✓ DATABASE_URL is set in environment?
   ```bash
   echo $DATABASE_URL
   ```

2. ✓ Database is accessible?
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. ✓ Schema is pushed?
   ```bash
   npm run db:push
   ```

4. ✓ Users are seeded?
   ```bash
   npx tsx server/seed.ts
   ```

5. ✓ Server restarted after env var change?

---

## 🎉 **Success Checklist**

- [ ] Database created (Neon/Railway/Local)
- [ ] DATABASE_URL set in environment
- [ ] Schema pushed (`npm run db:push`)
- [ ] Test data seeded (`npx tsx server/seed.ts`)
- [ ] Server restarted
- [ ] Login page loads
- [ ] Can login with: vonnie@probuildpvc.com.au / password123
- [ ] Redirects to dashboard after login

**Once all checked, your login will work!** ✅

---

## 📞 **Next Steps**

1. **RIGHT NOW**: Set up database using Option 1 (Neon - it's free!)
2. **Push schema**: `npm run db:push`
3. **Seed data**: `npx tsx server/seed.ts`
4. **Test login**: Use vonnie@probuildpvc.com.au / password123
5. **Deploy fix**: Merge the PR I created for the session fixes

**Both issues need to be fixed:**
1. ✅ Session/cookie configuration (PR #1 - already done)
2. ⏳ Database setup (this guide - do now!)

After both are done, login will work perfectly! 🎊
