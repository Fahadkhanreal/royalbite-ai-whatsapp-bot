---
name: "create-resume"
description: "MCP tool to create a new resume for the authenticated user. Use when user wants to start building a new professional resume."
version: "1.0.0"
---

# Create Resume Skill

## When to Use This Skill
- User says "create new resume", "make a new CV", "start fresh resume", "build resume for frontend developer"
- User wants to initialize a new resume document

## How This Skill Works
1. Validate user_id from context
2. Accept title and optional template_id
3. Create new resume with default structure (Personal Info, Summary, Experience, Education, Skills)
4. Save to Neon DB with user ownership
5. Return resume_id and basic data

## Output Format
```json
{
  "resume_id": "uuid-string",
  "title": "Frontend Developer Resume",
  "template_id": "modern",
  "status": "created"
}