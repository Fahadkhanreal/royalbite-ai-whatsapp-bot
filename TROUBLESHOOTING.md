# 🔧 WhatsApp RAG Bot - Quick Fix Guide

**Issue**: User WhatsApp se "Do you have biryani?" bhejta hai but bot reply nahi karta

---

## ✅ Quick Fix Steps (Follow in Order)

### Step 1: Check if Database Has Menu Data
Visit: `https://your-app.vercel.app/api/rag/check`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 10,
    "bySource": [
      { "source": "menu_sync", "count": 5 }
    ]
  }
}
```

**If `totalDocuments: 0`** → Go to Step 2

---

### Step 2: Add Sample Menu Data
Visit: `https://your-app.vercel.app/api/seed/menu`

This will:
- Add 15 sample dishes (Biryani, Karahi, Kebabs, etc.)
- Auto-sync to RAG database

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "dishesCreated": 15,
    "ragSync": {
      "itemsSynced": 15,
      "chunksCreated": 3
    }
  }
}
```

---

### Step 3: Verify RAG is Working
Visit: `https://your-app.vercel.app/api/debug/pipeline?msg=Do you have biryani`

**Expected Response:**
```json
{
  "ragSearch": {
    "success": true,
    "totalResults": 3
  },
  "groqGeneration": {
    "success": true,
    "reply": "Yes! We have Chicken Biryani (Rs. 350)..."
  },
  "summary": {
    "pipelineStatus": "✅ All systems operational"
  }
}
```

**If RAG returns 0 results** → Repeat Step 2

---

### Step 4: Test Webhook Simulation
Visit: `https://your-app.vercel.app/api/debug/test-webhook?from=923001234567&msg=menu`

**Expected Response:**
```json
{
  "success": true,
  "webhookResponse": {
    "status": "ok",
    "reply_sent": true
  }
}
```

---

### Step 5: Configure WATI Webhook

1. **Login to WATI Dashboard**: https://app.wati.io/
2. **Go to**: Settings → Integrations → Webhooks
3. **Set Webhook URL**:
   ```
   https://your-app.vercel.app/api/whatsapp/webhook
   ```
4. **Enable Events**:
   - ✅ message.received
   - ✅ message.sent
5. **Click "Test Webhook"** - Should show success

---

### Step 6: Test Real WhatsApp Message

1. Send message to your WATI number: "Do you have biryani?"
2. **Check Vercel Logs** (Dashboard → Your Project → Logs):
   ```
   WhatsApp webhook parsed: { hasFrom: true, hasMessage: true }
   WhatsApp RAG search completed: { totalResults: 3 }
   WATI message sent: { to: '923xxx', status: 200 }
   ```

---

## 🐛 Common Issues & Solutions

### Issue: "RAG search returned 0 results"
**Cause**: Database empty  
**Fix**: Run Step 2 (`/api/seed/menu`)

### Issue: "Groq API error: 401"
**Cause**: Invalid GROQ_API_KEY  
**Fix**: 
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check `GROQ_API_KEY` is set correctly
3. Get new key from: https://console.groq.com/keys
4. Redeploy

### Issue: "WATI send failed: 401"
**Cause**: Invalid WHATSAPP_API_TOKEN  
**Fix**:
1. Get new token from WATI Dashboard → API Docs
2. Update in Vercel env vars
3. Redeploy

### Issue: "Webhook receives message but no reply"
**Cause**: Message parsing failed  
**Fix**: Check Vercel logs for exact error

### Issue: "Database connection failed"
**Cause**: DATABASE_URL wrong  
**Fix**: Verify Neon connection string in env vars

---

## 📊 Required Environment Variables (Vercel)

Go to: Vercel Dashboard → Settings → Environment Variables

```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db

# Groq AI (Required)
GROQ_API_KEY=gsk_xxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# WhatsApp/WATI (Required)
WHATSAPP_API_TOKEN=your_wati_api_token
WATI_BASE_URL=https://live-mt-server.wati.io/10180462
WHATSAPP_WEBHOOK_VERIFY_TOKEN=royalbite_verify_2026

# Auth (Required)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-app.vercel.app
```

**After adding/updating**: Click "Redeploy" in Vercel

---

## 🚀 Complete Setup Checklist

- [ ] Database has menu data (`/api/rag/check`)
- [ ] RAG returns results (`/api/debug/pipeline`)
- [ ] All env vars set in Vercel
- [ ] WATI webhook configured
- [ ] Test webhook works (`/api/debug/test-webhook`)
- [ ] Real WhatsApp message tested
- [ ] Vercel logs show no errors

---

## 🆘 Still Not Working?

1. **Check Vercel Logs** (last 100 requests):
   - Filter by `/api/whatsapp/webhook`
   - Look for error messages

2. **Test Each Component**:
   - Database: `/api/rag/check`
   - RAG Search: `/api/debug/pipeline`
   - Webhook: `/api/debug/test-webhook`

3. **Common Mistakes**:
   - ❌ Forgot to redeploy after env var changes
   - ❌ WATI webhook URL has typo
   - ❌ Database doesn't have pgvector extension
   - ❌ GROQ_API_KEY expired

---

**Need Help?** Check Vercel logs and share the exact error message.
