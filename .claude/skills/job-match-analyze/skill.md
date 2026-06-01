
---

### 9. job-match-analyze

```markdown
---
name: "job_match_analyze"
description: "Compare resume with Job Description and return match percentage + missing keywords."
version: "1.0.0"
---

# Job Match Analyze Skill

## When to Use This Skill
- User pastes Job Description
- "How much does my resume match this job?"

## Output Format
```json
{
  "match_percentage": 78,
  "missing_keywords": ["Redux", "Jest", "Tailwind"],
  "suggestions": [...]
}
