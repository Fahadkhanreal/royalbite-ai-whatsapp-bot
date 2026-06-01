
---

### **5. get-restaurant-context**

```markdown
---
name: "get-restaurant-context"
description: "Fetch relevant RAG context for any user query."
version: "1.0.0"
---

# Get Restaurant Context Skill

## When to Use This Skill
- Before sending query to LLM (Groq)

## Output Format
```json
{
  "relevant_chunks": [...],
  "context": "string",
  "sources": ["dishes", "timings", "offers"]
}