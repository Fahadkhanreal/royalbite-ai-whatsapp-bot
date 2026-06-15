# 🚀 Green API Setup Guide — RoyalBite WhatsApp Bot

**Complete step-by-step guide to connect your WhatsApp bot with Green API (FREE!)**

---

## 📋 Step 1: Green API Account Setup (5 minutes)

### 1.1 Create Account
1. Go to: **https://green-api.com/**
2. Click **"Sign Up"** or **"Get Started"**
3. Enter email and create password
4. Verify email

### 1.2 Create Instance (FREE Tier)
1. Login to Dashboard: **https://console.green-api.com/**
2. Click **"Create Instance"** button
3. Select **"Developer"** plan (FREE - 300 messages/day)
4. Instance will be created in 1-2 minutes
5. Copy your credentials:
   - **Instance ID** (looks like: `7103123456`)
   - **API Token** (long string like: `d1f234abc567...`)

---

## 📱 Step 2: Connect WhatsApp (QR Code - NO Number Transfer!)

### 2.1 Link Your WhatsApp
1. In Green API Dashboard, go to your instance
2. You'll see a **QR Code** displayed
3. Open **WhatsApp** on your phone
4. Go to: **Settings → Linked Devices → Link a Device**
5. Scan the QR code shown in Green API Dashboard
6. ✅ Done! Your WhatsApp is now connected!

**Important:**
- ✅ Your WhatsApp number stays on your phone
- ✅ No transfer or verification needed
- ✅ Works like WhatsApp Web
- ✅ You can unlink anytime from phone settings

---

## 🔧 Step 3: Configure Environment Variables

### 3.1 Local Environment (.env.local)
File location: `frontend/.env.local`

**Update these lines:**
```bash
# Green API Configuration
GREEN_API_INSTANCE_ID=7103123456          # ← Your Instance ID here
GREEN_API_TOKEN=d1f234abc567...           # ← Your API Token here
```

**Keep these lines (already set):**
```bash
AUTH_SECRET="your_auth_secret_here"
AUTH_URL="/"
NEXT_PUBLIC_WHATSAPP_NUMBER="+923482240731"
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

WHATSAPP_WEBHOOK_VERIFY_TOKEN=royalbite_verify_2026

NEXT_PUBLIC_EMAILJS_SERVICE_ID="your_service_id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your_template_id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your_public_key"
```

**Note:** Use your existing values from your current `.env.local` file - don't change them!

### 3.2 Vercel Environment Variables
1. Go to: **https://vercel.com/dashboard**
2. Select your project: **ai-business-restaurant**
3. Go to: **Settings → Environment Variables**
4. Add these TWO new variables:

**Variable 1:**
- Key: `GREEN_API_INSTANCE_ID`
- Value: `7103123456` (your Instance ID)
- Environment: Production, Preview, Development (select all)

**Variable 2:**
- Key: `GREEN_API_TOKEN`
- Value: `d1f234abc567...` (your API Token)
- Environment: Production, Preview, Development (select all)

5. Click **"Save"**
6. **Redeploy** your app (Settings → Deployments → Redeploy latest)

---

## 🌐 Step 4: Setup Webhook in Green API

### 4.1 Configure Webhook URL
1. In Green API Dashboard, go to your instance
2. Click **"Settings"** or **"API"** tab
3. Find **"Webhook URL"** field
4. Enter your Vercel webhook URL:
   ```
   https://your-app-name.vercel.app/api/whatsapp/webhook-v3
   ```
   **Example:**
   ```
   https://ai-business-restaurant.vercel.app/api/whatsapp/webhook-v3
   ```

5. **Webhook Type:** Select **"Webhook"** (not WebSocket)
6. Click **"Save"** or **"Update"**

### 4.2 Verify Webhook
1. Send a test message to your WhatsApp number from another phone
2. Check Green API Dashboard → **"Logs"** or **"Incoming"**
3. You should see the webhook being triggered
4. Check Vercel logs for bot response

---

## ✅ Step 5: Test Your Bot!

### 5.1 Send Test Message
From **any phone**, send a WhatsApp message to your bot number:

**Test Messages:**
```
Hi
Menu dikhao
What are your timings?
I want to make a reservation
```

### 5.2 Check Logs
**Vercel Logs:**
1. Go to: Vercel Dashboard → Your Project → Logs
2. You should see:
   - `[WEBHOOK-V3] Green API webhook received`
   - `[WEBHOOK-V3] Intent detected`
   - `[GROQ] Generating response`
   - `[GREEN-API] Message sent successfully`

**Green API Logs:**
1. Green API Dashboard → Your Instance → Logs
2. Check for successful `sendMessage` calls

---

## 🎯 What Changed from WATI?

| Feature | WATI (Old) | Green API (New) |
|---------|-----------|----------------|
| **Setup** | Number verification issues | QR code scan (instant!) |
| **Session** | 24-hour window limit | No session limits |
| **Cost** | $49-99/month | FREE (300 msgs/day) |
| **Chat Assignment** | Bot vs API Token confusion | No assignment needed |
| **Errors** | "message text can not be empty" | Clear error messages |
| **Code Changes** | - | Only 2 files changed |

---

## 🔍 Troubleshooting

### Issue 1: "Instance ID or Token not set"
**Solution:** Check Vercel environment variables are saved and redeployed

### Issue 2: "No webhook received"
**Solution:** 
1. Verify webhook URL is correct in Green API Dashboard
2. Test webhook manually: `GET https://your-app.vercel.app/api/whatsapp/webhook-v3`
3. Should return: `{"status":"ok","message":"RoyalBite WhatsApp Webhook v3 (Green API)"}`

### Issue 3: Bot not replying
**Solution:**
1. Check Vercel logs for errors
2. Verify WhatsApp is still linked (check phone → Linked Devices)
3. Check Green API instance status (should be green/active)

### Issue 4: "QR Code expired"
**Solution:** Refresh Green API Dashboard page, new QR code will appear

---

## 📞 Support

**Green API Documentation:**
- https://green-api.com/en/docs/

**Green API Support:**
- Email: support@green-api.com
- Telegram: @greenapi_support

**Your Bot Status:**
- Vercel: https://vercel.com/dashboard
- Green API: https://console.green-api.com/

---

## 🎉 Success Checklist

- [ ] Green API account created
- [ ] Instance created (Developer/FREE plan)
- [ ] WhatsApp linked via QR code
- [ ] `.env.local` updated with Instance ID and Token
- [ ] Vercel environment variables added
- [ ] Webhook URL configured in Green API
- [ ] Test message sent and bot replied
- [ ] Logs show successful flow

**Once all checked, your bot is LIVE! 🚀**

---

## 💡 Next Steps (Optional)

1. **Upgrade Plan:** If you need more than 300 messages/day
2. **Add More Features:** Media messages, buttons, templates
3. **Monitor Usage:** Check Green API dashboard for message count
4. **Backup Instance:** Save your Instance ID and Token securely

---

**Bot is ready! Test karo aur enjoy! 🎊**
