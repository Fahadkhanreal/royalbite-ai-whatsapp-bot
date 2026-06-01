
---

### 2. update-resume

```markdown
---
name: "update-resume"
description: "MCP tool to update existing resume data including personal info, summary and other fields."
version: "1.0.0"
---

# Update Resume Skill

## When to Use This Skill
- User wants to update name, email, summary, location, or any resume field
- User says "update my resume", "change my summary", "add my phone number"

## How This Skill Works
1. Validate user_id and resume_id
2. Apply partial updates to resume JSON data
3. Save changes with updated timestamp
4. Return updated resume snapshot

## Output Format
```json
{
  "resume_id": "uuid",
  "status": "updated",
  "updated_fields": ["summary", "phone"],
  "message": "Resume updated successfully"
}