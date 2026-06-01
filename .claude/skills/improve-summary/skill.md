---
name: "improve-summary"
description: "Use Gemini AI to create or improve Professional Summary section in ATS friendly way."
version: "1.0.0"
---

# Improve Summary Skill

## When to Use This Skill
- User says "improve my summary", "write professional summary", "make summary better"

## How This Skill Works
1. Take raw user input + current resume context
2. Call Gemini with optimized prompt
3. Get structured professional summary
4. Update resume and return before/after

## Output Format
```json
{
  "status": "improved",
  "original": "...",
  "improved": "Results-driven Full Stack Developer...",
  "keywords_added": ["Next.js", "TypeScript"]
}