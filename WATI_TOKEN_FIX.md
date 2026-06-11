# 🔑 WATI API Token - Step by Step Guide

## Issue: WATI API returning 401 Unauthorized

**Error in logs:**
```
Invalid WATI response with status 401
```

**Root Cause:** WHATSAPP_API_TOKEN expired or invalid

---

## ✅ How to Get Fresh WATI API Token

### Step 1: Login to WATI Dashboard
Go to: https://app.wati.io/login

### Step 2: Get API Access Token
1. Click on your profile icon (top right)
2. Go to: **Settings** → **API Docs** → **Authentication**
3. OR directly go to: https://app.wati.io/api-docs
4. Look for **"API Access Token"** section
5. Click **"Generate New Token"** or copy existing token

**Token Format:** Long string like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZjdlYWQ4My0yNGY2LTRkNDYtYWI0MC04MzE5OGZkOWY5ZGEiLCJ1bmlxdWVfbmFtZSI6ImZhaGFkLmtoYW4yMTAwOTAwQGdtYWlsLmNvbSIsIm5hbWVpZCI6ImZhaGFkLmtoYW4yMTAwOTAwQGdtYWlsLmNvbSIsImVtYWlsIjoiZmFoYWQua2hhbjIxMDA5MDBAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDYvMTEvMjAyNiAyMzoxMjozOSIsInRlbmFudF9pZCI6IjEwMTgwNDYyIiwiZGJfbmFtZSI6Im10LXByb2QtVGVuYW50cyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFETUlOSVNUUkFUT1IiLCJleHAiOjI1MzQwMjMwMDgwMCwiaXNzIjoiQ2xhcmVfQUkiLCJhdWQiOiJDbGFyZV9BSSJ9.LQmMfOFofDvvSiCteNVA7FfMpAqVZua8RIbWHkvfiFo
```

### Step 3: Update in Vercel
1. Go to: https://vercel.com/dashboard
2. Select project: **ai-powered-restaurant-system**
3. Go to: **Settings** → **Environment Variables**
4. Find: `WHATSAPP_API_TOKEN`
5. Click **Edit**
6. Paste the **new token** (full token, copy carefully!)
7. Click **Save**

### Step 4: Redeploy
1. Go to: **Deployments** tab
2. Click on latest deployment
3. Click **"Redeploy"** button
4. Wait 2-3 minutes

### Step 5: Test Again
Send WhatsApp message: "test"

---

## 🔍 How to Verify Token is Working

After redeploying, test WATI API directly:

```bash
curl -X POST "https://live-mt-server.wati.io/10180462/api/v1/sendSessionMessage/923001234567" \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageText": "Test from API"}'
```

**Expected Response:**
```json
{
  "result": true,
  "info": "Message sent successfully"
}
```

**If 401:**
- Token is still wrong
- Copy full token carefully (no spaces, no line breaks)
- Make sure you're copying from the right place in WATI dashboard

---

## 📋 Complete Environment Variables Checklist

Ensure all these are set in Vercel:

```bash
# Database (Required)
DATABASE_URL=postgresql://neondb_owner:...

# Groq AI (Required)
GROQ_API_KEY=gsk_xxxxx

# WATI/WhatsApp (Required)
WHATSAPP_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← NEW FRESH TOKEN
WATI_BASE_URL=https://live-mt-server.wati.io/10180462
WHATSAPP_WEBHOOK_VERIFY_TOKEN=royalbite_verify_2026

# Auth (Required)
NEXTAUTH_SECRET=b6cc16414b54a3d95ce7b9c41cc9b27f...
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## ✅ Success Signs

After fixing token, logs should show:

```
[WEBHOOK] Message parsed: { hasMessage: true, msgTextPreview: 'test' }
[RAG] Search completed: { totalResults: 3 }
[Groq] Response generated
[WEBHOOK] Message sent successfully to: 923482xxx  ← This line!
```

No more 401 errors!

---

## 🐛 Still Getting 401?

### Common Issues:

1. **Token copied wrong**
   - Should be ONE long line
   - No spaces, no line breaks
   - Copy entire token from WATI

2. **Token expired**
   - WATI tokens can expire
   - Generate a completely new one

3. **Wrong API endpoint**
   - Check tenant_id: Should be `10180462`
   - Base URL: `https://live-mt-server.wati.io/10180462`

4. **Account issues**
   - Verify WATI account is active
   - Check if API access is enabled in your plan

---

## 🎯 Quick Test Command

After updating token in Vercel, test immediately:

```
https://your-app.vercel.app/api/debug/pipeline?msg=test&phone=923001234567&send=true
```

This will test the entire pipeline including WATI send!
