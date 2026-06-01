
---

### **4. generate-voice-reply**

```markdown
---
name: "generate-voice-reply"
description: "Convert text response to natural voice for WhatsApp using TTS."
version: "1.0.0"
---

# Generate Voice Reply Skill

## When to Use This Skill
- Hybrid mode on (Text + Voice)
- User asked for menu, order, or recommendation

## How This Skill Works
1. Take final text response
2. Call Google Cloud TTS (ur-PK accent)
3. Convert to OGG_OPUS format
4. Return audio buffer + text

## Output Format
```json
{
  "text": "...",
  "has_voice": true,
  "voice_ready": true
}