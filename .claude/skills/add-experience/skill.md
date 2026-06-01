
---

### 3. add-experience

```markdown
---
name: "add-experience"
description: "Add a new work experience entry to the user's resume."
version: "1.0.0"
---

# Add Experience Skill

## When to Use This Skill
- User wants to add job experience ("add my experience at ABC Company")
- User says "I worked at", "add job", "previous role"

## How This Skill Works
1. Validate user_id and resume_id
2. Extract company, role, dates, and bullet points
3. Append to experience array
4. Save updated resume

## Output Format
```json
{
  "status": "added",
  "experience_id": "exp_uuid",
  "role": "Frontend Developer",
  "company": "ABC Tech"
}