
---

### 8. analyze-ats-score

```markdown
---
name: "analyze_ats_score"
description: "Analyze resume and return ATS compatibility score with detailed suggestions."
version: "1.0.0"
---

# Analyze ATS Score Skill

## When to Use This Skill
- User says "check ATS score", "how ATS friendly is my resume"

## Output Format
```json
{
  "ats_score": 87,
  "status": "analyzed",
  "strengths": [...],
  "weaknesses": [...],
  "suggestions": ["Add React keyword", "Quantify achievements"]
}