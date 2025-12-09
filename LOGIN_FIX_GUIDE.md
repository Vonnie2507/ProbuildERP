# Login 401 Error - Fix Guide

## Problem Summary
The `/api/auth/login` endpoint was returning 401 errors due to session/cookie configuration issues.

## Root Causes Identified

### 1. **Cookie Security Configuration**
- `secure: true` in production requires HTTPS
- If your deployment proxy/load balancer doesn't properly forward HTTPS headers, cookies won't be saved
- **Fix**: Added `COOKIE_SECURE` environment variable override

### 2. **Missing SameSite Attribute**
- Modern browsers require `sameSite` for cross-origin requests
- **Fix**: Added `sameSite: "none"` for production (with secure cookies)

### 3. **Proxy Trust Issues**
- Express wasn't configured to trust proxy headers
- **Fix**: Added `app.set("trust proxy", 1)` and `proxy: true` in session config

### 4. **Session Save Timing**
- Response was sent before session was saved to store
- **Fix**: Wrapped response in `req.session.save()` callback

## Changes Made

### `/home/user/webapp/server/index.ts`

1. **Added Trust Proxy Configuration** (Line 17-20):
```typescript
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

2. **Enhanced Session Cookie Configuration** (Line 40-45):
```typescript
cookie: {
  secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  domain: process.env.COOKIE_DOMAIN || undefined,
},
proxy: process.env.NODE_ENV === "production",
```

### `/home/user/webapp/server/routes.ts`

3. **Added Debug Logging and Session Save** (Login endpoint):
```typescript
// Force session save before responding
req.session.save((err) => {
  if (err) {
    console.error("[LOGIN] Session save error:", err);
    return res.status(500).json({ error: "Failed to save session" });
  }
  console.log("[LOGIN] Success for:", email, "SessionID:", req.sessionID);
  res.json({ user: sessionUser });
});
```

## Environment Variables to Set

Add these to your deployment environment:

```bash
# If your deployment doesn't support HTTPS or has proxy issues
COOKIE_SECURE=false

# Optional: Set specific cookie domain
COOKIE_DOMAIN=.yourdomain.com

# Session secret (IMPORTANT: Change this!)
SESSION_SECRET=your-very-secret-random-string-here
```

## Test Credentials

Use these credentials from the seed file:

```
Email: vonnie@probuildpvc.com.au
Password: password123
Role: admin

Email: dave@probuildpvc.com.au
Password: password123
Role: sales
```

## Debugging Steps

### 1. Check Server Logs
Look for these log messages:
```
[LOGIN] Attempt from: <ip>
[LOGIN] Email: <email>
[LOGIN] Success for: <email>
```

If you see "User not found" or "Invalid password", check database seeding.

### 2. Check Browser Console
Open DevTools → Network → Find `/api/auth/login` request
- Check Response Headers for `Set-Cookie`
- Verify cookie attributes: `HttpOnly`, `Secure`, `SameSite`

### 3. Check Cookie Storage
DevTools → Application → Cookies → Look for `connect.sid`
- If cookie exists: Session is being saved
- If cookie missing: Check HTTPS/proxy settings

### 4. Verify Session Persistence
After login, call `/api/auth/me`
- Should return 200 with user data
- Check logs for `[AUTH/ME] Success for: <email>`
- If 401: Session not persisting (check cookie issues)

## Deployment-Specific Fixes

### Railway/Render/Heroku
These platforms handle HTTPS termination at the load balancer:
```bash
# Set in environment
COOKIE_SECURE=false
# Or ensure proxy trust is working (already added)
```

### Cloudflare/Vercel
These platforms have special proxy requirements:
```bash
# May need specific domain configuration
COOKIE_DOMAIN=.yourdomain.com
```

### Docker/Custom Deployment
Ensure your reverse proxy (nginx, caddy, traefik) forwards these headers:
```
X-Forwarded-Proto
X-Forwarded-Host
X-Forwarded-For
```

## Quick Fixes if Still Not Working

### Option 1: Disable Secure Cookies Temporarily
```bash
COOKIE_SECURE=false
```

### Option 2: Use Lax SameSite Policy
Edit `/home/user/webapp/server/index.ts` line 44:
```typescript
sameSite: "lax", // Instead of "none"
```

### Option 3: Check Database Connection
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Run seed script to create test users
npm run db:push
npm run db:seed
```

## Monitoring

Check these logs after deployment:
```bash
# Watch for login attempts
grep "\[LOGIN\]" logs

# Check session creation
grep "\[AUTH/ME\]" logs

# Look for session errors
grep "Session save error" logs
```

## Security Notes

1. **Never use default SESSION_SECRET in production**
   - Generate: `openssl rand -base64 32`
   - Set in environment variables

2. **Enable HTTPS in production**
   - Set `COOKIE_SECURE=true` (default)
   - Ensure proper proxy configuration

3. **Consider Redis session store for production**
   - MemoryStore loses sessions on restart
   - Use `connect-redis` for distributed sessions

## Next Steps

1. Deploy the fixes
2. Test login with provided credentials
3. Check browser DevTools for cookie issues
4. Review server logs for error messages
5. Adjust environment variables as needed

## Support

If issues persist:
1. Share server logs (with sensitive data removed)
2. Check browser console errors
3. Verify database seeding completed
4. Confirm environment variables are set
