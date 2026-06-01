---
name: "rag-ingest-document"
description: "Ingest menu items, timings, offers or documents into RAG vector database."
version: "1.0.0"
---

# RAG Ingest Document Skill

## When to Use This Skill
- Admin adds new dish, updates timings, adds offer, or uploads PDF
- Need to update knowledge base for chatbot

## How This Skill Works
1. Take input data (dish, timing, text, etc.)
2. Convert to proper chunks
3. Generate embeddings using Groq
4. Store in Neon pgvector `documents` table with metadata
5. Return success with document count

## Output Format
```json
{
  "status": "ingested",
  "documents_ingested": 5,
  "chunks_created": 12,
  "message": "Menu updated successfully"
}