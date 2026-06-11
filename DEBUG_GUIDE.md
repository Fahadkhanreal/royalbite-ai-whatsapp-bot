# 🚀 WhatsApp RAG Bot - Deployment & Testing Guide

## 📋 New Debug Endpoints Added

### 1. **RAG Database Check**
```
GET https://your-app.vercel.app/api/rag/check
```
**Purpose**: Check if RAG database has documents  
**Response**: Document count by source

---

### 2. **Force RAG Sync**
```
GET/POST https://your-app.vercel.app/api/rag/sync-all
```
**Purpose**: Sync all menu/timings/knowledge to RAG  
**Use**: After adding new menu items

---

### 3. **Seed Sample Menu**
```
GET https://your-app.vercel.app/api/seed/menu
```
**Purpose**: Add 15 sample dishes + auto-sync to RAG  
**Use**: First-time setup or testing

---

### 4. **Full Pipeline Test**
```
GET https://your-app.vercel.app/api/debug/pipeline?msg=Do%20you%20have%20biryani
```
**Purpose**: Test entire flow (Intent → RAG → Groq → Reply)  
**Response**: Detailed status of each component

---

### 5. **Webhook Simulation**
```
GET https://your-app.vercel.app/api/debug/test-webhook?from=923001234567&msg=menu
```
**Purpose**: Test webhook without actual WhatsApp message  
**Use**: Local testing

---

## 🔧 Quick Fix Steps (Your Current Issue)

### **Problem**: User sends "Do you have biryani?" but bot doesn't reply

### **Solution** (5 minutes):

#### Step 1: Add Sample Menu Data
Visit in browser:
```
https://ai-powered-restaurant-system-git-main-fahadkhans-projects.vercel.app/api/seed/menu
```

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

#### Step 2: Verify RAG Has Data
Visit:
```
https://ai-powered-restaurant-system-git-main-fahadkhans-projects.vercel.app/api/rag/check
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 3,
    "bySource": [
      { "source": "menu_sync", "count": 3 }
    ]
  }
}
```

If `totalDocuments > 0`, RAG is ready! ✅

---

#### Step 3: Test Complete Pipeline
Visit:
```
https://ai-powered-restaurant-system-git-main-fahadkhans-projects.vercel.app/api/debug/pipeline?msg=Do%20you%20have%20biryani
```

**Look for:**
```json
{
  "ragSearch": {
    "success": true,
    "totalResults": 3  // Should be > 0
  },
  "groqGeneration": {
    "success": true,
    "reply": "Yes! We have Chicken Biryani..."
  },
  "summary": {
    "pipelineStatus": "✅ All systems operational"
  }
}
```

If all ✅, pipeline is working!

---

#### Step 4: Test Webhook Simulation
Visit:
```
https://ai-powered-restaurant-system-git-main-fahadkhans-projects.vercel.app/api/debug/test-webhook?from=923001234567&msg=Do%20you%20have%20biryani
```

**Expected:**
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

#### Step 5: Configure WATI Webhook (If Not Done)

1. Login to WATI: https://app.wati.io/
2. Go to: **Settings** → **Integrations** → **Webhooks**
3. Set Webhook URL:
   ```
   https://ai-powered-restaurant-system-git-main-fahadkhans-projects.vercel.app/api/whatsapp/webhook
   ```
4. Enable: ✅ `message.received`
5. Click **Save** and **Test Webhook**

---

#### Step 6: Test Real WhatsApp Message

1. Send to your WATI number: **"Do you have biryani?"**
2. Bot should reply with menu details!

---

## 🐛 If Still Not Working

### Check Vercel Logs:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Logs** tab
4. Filter by: `/api/whatsapp/webhook`
5. Look for these logs:
   ```
   [WEBHOOK] Message parsed: { hasFrom: true, hasMessage: true }
   [RAG] Search completed: { totalResults: 3 }
   [Groq] Response generated: { replyLength: 150 }
   [WEBHOOK] Message sent successfully
   ```

### Common Issues:

**"RAG returned 0 results"**
→ Run Step 1 again (`/api/seed/menu`)

**"Groq API error"**
→ Check `GROQ_API_KEY` in Vercel env vars

**"WATI send failed"**
→ Check `WHATSAPP_API_TOKEN` in Vercel env vars

**"Webhook not receiving"**
→ Verify WATI webhook URL is correct

---

## 📊 Environment Variables Checklist

Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://... ✅
GROQ_API_KEY=gsk_... ✅
WHATSAPP_API_TOKEN=... ✅
WATI_BASE_URL=https://live-mt-server.wati.io/10180462 ✅
```

After any changes: **Click "Redeploy"**

---

## ✅ Success Checklist

- [ ] `/api/seed/menu` returns success
- [ ] `/api/rag/check` shows documents > 0
- [ ] `/api/debug/pipeline` returns RAG results
- [ ] `/api/debug/test-webhook` works
- [ ] WATI webhook configured
- [ ] Real WhatsApp message tested
- [ ] Bot replies with menu info

---

## 📞 Need Help?

1. **Run all debug endpoints** and share responses
2. **Check Vercel logs** and share error messages
3. **Verify WATI webhook** is active

**Bot should work after Step 1!** 🎉
