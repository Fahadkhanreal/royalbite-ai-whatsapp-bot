
---

### 4. add-education

```markdown
---
name: "add-education"
description: "Add education qualification to the resume."
version: "1.0.0"
---

# Add Education Skill

## When to Use This Skill
- User says "add my degree", "add education", "I studied at"

## How This Skill Works
1. Validate user and resume
2. Add degree, institution, year, GPA etc.
3. Save to education array

## Output Format
```json
{
  "status": "added",
  "education_id": "edu_uuid",
  "degree": "Bachelor of Computer Science",
  "institution": "NED University"
}