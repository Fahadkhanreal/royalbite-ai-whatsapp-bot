# 🔍 WATI Webhook Payload Structure Analysis

Based on logs, WATI sends payloads with these keys:

```
'id', 'created', 'whatsappMessageId', 'conversationId', 'ticketId', 
'text', 'type', 'data', 'sourceId', 'sourceUrl', 'timestamp', 
'owner', 'eventType', 'statusString', 'avatarUrl', 'assignedId', 
'operatorName', 'operatorEmail', 'waId', 'messageContact', 
'senderName', 'listReply', 'interactiveButtonReply', 'buttonReply', 
'replyContextId', 'sourceType', 'frequentlyForwarded', 'forwarded', 
'channelId', 'channelPhoneNumber'
```

## Key Fields:

- **waId**: Customer's WhatsApp number (e.g., `923482xxx`)
- **text**: The actual message text (this is what we need!)
- **eventType**: Type of event (e.g., `message`)
- **type**: Message type

## Environment Variables Needed:

### From WATI Dashboard (https://app.wati.io/):

1. **WHATSAPP_API_TOKEN** (Bearer token for API calls)
   - Go to: API Docs → Your API key
   - Format: Long alphanumeric string
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT token)

2. **WATI_BASE_URL**
   - Format: `https://live-mt-server.wati.io/YOUR_TENANT_ID`
   - From your token, tenant_id is: `10180462`
   - So: `https://live-mt-server.wati.io/10180462`

3. **WHATSAPP_WEBHOOK_VERIFY_TOKEN**
   - A custom string you set in WATI webhook config
   - Example: `royalbite_verify_2026`
   - Must match what you set in WATI dashboard

## Current Vercel Env Vars:

```bash
DATABASE_URL=postgresql://... ✅
GROQ_API_KEY=gsk_... ✅
WHATSAPP_API_TOKEN=<your_wati_bearer_token> ✅
WATI_BASE_URL=https://live-mt-server.wati.io/10180462 ✅
WHATSAPP_WEBHOOK_VERIFY_TOKEN=royalbite_verify_2026 ✅
```

## WATI Token Extraction:

Your JWT token decoded shows:
```json
{
  "email": "fahad.khan210900@gmail.com",
  "tenant_id": "10180462",
  "db_name": "mt-prod-Tenants",
  "role": "ADMINISTRATOR"
}
```

This means your WATI API token is the full JWT string.

## Fix Applied:

Updated parser to prioritize `body.text` field which WATI uses for message content.

## Testing After Deploy:

1. Send WhatsApp message: "test"
2. Check logs for: `[WEBHOOK] Raw payload analysis`
3. Should show: `hasBodyText: 'string'` and `bodyTextValue: 'test'`
