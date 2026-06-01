
---

### **2. whatsapp-send-reply**

```markdown
---
name: "whatsapp-send-reply"
description: "Send text or voice reply to WhatsApp user via Cloud API."
version: "1.0.0"
---

# WhatsApp Send Reply Skill

## When to Use This Skill
- After RAG + LLM generates response
- Need to send final reply to customer

## How This Skill Works
1. Take message + optional audio buffer
2. Format according to WhatsApp API
3. Send text or voice note (OGG_OPUS)
4. Log the interaction

## Output Format
```json
{
  "status": "sent",
  "message_id": "wamid.12345",
  "type": "text" | "voice",
  "to": "923001234567"
}