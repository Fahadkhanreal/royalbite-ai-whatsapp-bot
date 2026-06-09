# RoyalBite AI Backend - Implementation Plan

**Feature Branch**: `003-royalbite-rag-backend`  
**Created**: 2026-06-02  
**Status**: In Planning  
**Version**: 1.0  
**Estimated Duration**: 10-14 Days  
**Architecture**: Next.js 15 API Routes + Neon PostgreSQL + pgvector

---

## Phase 0: Research & Technical Context

### Technology Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| ORM | Drizzle ORM | Type-safe, lightweight, excellent PostgreSQL support |
| Vector DB | pgvector (PostgreSQL) | Native PostgreSQL extension, no external dependency |
| Vector Dimension | 768 | Groq embedding standard, balanced size/quality |
| LLM Model | llama-3.3-70b-versatile | Fast inference, high quality responses for RAG |
| Vector Search | HNSW Index | Efficient similarity search for large document sets |
| Authentication | NextAuth.js (JWT) | Secure session management for admin users |
| Validation | Zod | Runtime type validation for all API inputs |
| Rate Limiting | Upstash Redis | Cloud-based rate limiting (or next/rate-limit) |
| Error Handling | Custom Error Classes | Consistent error responses across APIs |
| Logging | Console + Future Sentry | Development logging, production monitoring ready |

### API Design Patterns

**Base Response Format:**
```json
{
  "success": true,
  "data": { /* payload */ },
  "timestamp": "2026-06-02T21:00:00Z"
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "RAG_ERROR",
    "message": "User-friendly message",
    "details": { /* debug info */ }
  },
  "timestamp": "2026-06-02T21:00:00Z"
}
```

### Database Design Rationale

- **Dishes**: Menu items with categories for RAG filtering
- **Orders**: Main transaction record with phone number as customer identifier
- **OrderItems**: Allows flexible multi-item orders
- **Documents**: Stores RAG knowledge base with vector embeddings
- **BusinessTimings**: Restaurant hours for business logic
- **ChatLogs**: Optional analytics on customer interactions
- **Users/Sessions**: NextAuth tables for admin authentication

### Security Considerations

1. **Input Validation**: All APIs use Zod for schema validation
2. **WhatsApp Verification**: HMAC signature verification on all webhook calls
3. **JWT Authentication**: Admin-only endpoints require valid JWT token
4. **Rate Limiting**: 10 req/min per WhatsApp user, 100 req/min for admin
5. **Environment Variables**: All secrets (API keys, DB URLs) from .env
6. **SQL Injection Protection**: Drizzle ORM parameterized queries by default
7. **Error Messages**: No sensitive data in error responses

### Performance Targets

- WhatsApp response time: < 3 seconds (p95)
- RAG vector search: < 500ms
- Voice generation: < 2 seconds
- Database queries: < 100ms (with indexes)
- Connection pool: 5-10 active connections

### Known Unknowns Resolved

✅ All tech choices validated  
✅ API patterns defined  
✅ Security model established  
✅ Performance targets set  
✅ Database design finalized  

---

## Phase 1: Design & Data Model

### Entity Relationship Diagram

**Core Entities:**

1. **Dishes** (Menu Items)
   - id: UUID (PK)
   - name: string
   - description: string
   - price: decimal
   - category: string (biryani, curry, bread, etc.)
   - image_url: string
   - is_available: boolean
   - created_at, updated_at: timestamp

2. **Orders** (Customer Orders)
   - id: UUID (PK)
   - phone_number: string (WhatsApp ID)
   - dish_ids: UUID[] (order items)
   - total_price: decimal
   - status: enum (pending, confirmed, preparing, delivered, cancelled)
   - special_instructions: text
   - created_at, confirmed_at, delivered_at: timestamp

3. **Documents** (RAG Knowledge Base)
   - id: UUID (PK)
   - content: text (raw text or extracted from PDF)
   - embedding: vector(768) (pgvector)
   - metadata: json (type: menu/faq/policy, source, category)
   - created_by: string (admin user)
   - created_at, updated_at: timestamp
   - Index: HNSW on embedding for fast similarity search

4. **BusinessTimings** (Restaurant Hours)
   - id: UUID (PK)
   - day: enum (monday-sunday)
   - open_time: time
   - close_time: time
   - is_holiday: boolean

### API Contracts (Chunk 1 - Core Endpoints)

**POST /api/whatsapp/webhook** - Receive customer messages
```
Request Body:
{
  "messages": [{
    "from": "923001234567",
    "body": "Do you have biryani?"
  }]
}

Response:
{
  "success": true,
  "messages": [{
    "to": "923001234567",
    "body": "Yes! We have Sindhi biryani, Karachi nihari...",
    "media": [{ "type": "voice", "url": "..." }]
  }]
}
```

**GET /api/menu** - List all dishes
```
Response:
{
  "success": true,
  "data": {
    "dishes": [
      {
        "id": "uuid",
        "name": "Sindhi Biryani",
        "price": 250,
        "category": "biryani",
        "description": "..."
      }
    ]
  }
}
```

**POST /api/orders** - Create new order
```
Request Body:
{
  "phone_number": "923001234567",
  "dish_ids": ["uuid1", "uuid2"],
  "special_instructions": "No onions"
}

Response:
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "status": "pending",
    "total_price": 500,
    "created_at": "2026-06-02T21:00:00Z"
  }
}
```

**PUT /api/orders/:id/status** - Update order status (admin)
```
Request Body:
{
  "status": "confirmed"
}

Response:
{
  "success": true,
  "data": { "status": "confirmed", "updated_at": "..." }
}
```

**POST /api/rag/ingest** - Admin uploads documents
```
Request Body (multipart/form-data):
{
  "document": <file>,
  "type": "menu|faq|policy",
  "category": "offers"
}

Response:
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "chunks_created": 12,
    "embeddings_generated": true
  }
}
```

**POST /api/rag/search** - Search knowledge base (internal)
```
Request Body:
{
  "query": "Do you have desserts?",
  "limit": 3
}

Response:
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "We offer kheer, falooda...",
        "similarity": 0.89,
        "source": "menu"
      }
    ]
  }
}
```

---

## Phase 2: Implementation Roadmap

### Week 1: Foundation & RAG (Days 1-7)

**Days 1-2: Database & Drizzle Setup**
- [ ] Neon PostgreSQL project created
- [ ] pgvector extension enabled
- [ ] Drizzle schema defined (lib/db/schema.ts)
- [ ] Migration scripts ready
- [ ] Connection pooling configured
- [ ] Sample data seeded

**Days 2-3: Backend Foundation**
- [ ] Next.js API routes structure created
- [ ] Zod validation schemas (lib/validations/)
- [ ] Error handling classes (lib/errors/)
- [ ] Response formatters (lib/response.ts)
- [ ] Authentication middleware (middleware.ts)
- [ ] Rate limiting setup

**Days 4-7: RAG System (CRITICAL)**
- [ ] Text chunking function (lib/rag/chunker.ts)
- [ ] Groq embedding integration (lib/rag/embeddings.ts)
- [ ] Vector search function (lib/rag/search.ts)
- [ ] /api/rag/ingest endpoint (document upload + embedding)
- [ ] /api/rag/search endpoint (for internal use)
- [ ] Auto-trigger on menu/knowledge updates
- [ ] E2E test: Upload PDF → Search for content → Verify results

### Week 2: WhatsApp & Admin APIs (Days 8-14)

**Days 8-9: WhatsApp Integration**
- [ ] /api/whatsapp/webhook endpoint (POST for messages, GET for verification)
- [ ] Message intent detection logic
- [ ] RAG + Groq response generation
- [ ] Order detection & processing
- [ ] Text message sending via Meta API
- [ ] E2E test: Send "Menu" → Bot responds with dishes

**Days 10-11: Admin APIs & Order System**
- [ ] /api/menu (GET, POST, PUT, DELETE)
- [ ] /api/orders (GET all, POST create, GET by ID, PUT status)
- [ ] /api/business-timings CRUD
- [ ] /api/knowledge-base CRUD
- [ ] /api/admin/analytics (optional - order metrics)
- [ ] Admin authentication guard on all endpoints

**Days 12-13: Voice & Polish**
- [ ] Google Cloud TTS integration (lib/voice/tts.ts)
- [ ] Voice reply generation for order confirmation
- [ ] Audio format conversion (OGG_OPUS for WhatsApp)
- [ ] Hybrid text + voice sending
- [ ] Error handling & retry logic

**Day 14: Testing & Optimization**
- [ ] End-to-end test flow (message → order → delivery)
- [ ] Security testing (SQL injection, XSS, auth bypass)
- [ ] Performance testing (load test with concurrent users)
- [ ] Code cleanup & documentation
- [ ] Deployment checklist ready

### Critical Path Dependencies

```
Database Setup (Days 1-2)
    ↓
Backend Foundation (Days 2-3)
    ├→ RAG System (Days 4-7) [CRITICAL]
    │   ├→ WhatsApp Integration (Days 8-9)
    │   └→ Order Processing
    ├→ Admin APIs (Days 10-11)
    └→ Voice Integration (Days 12-13)
         ↓
    Testing & Optimization (Day 14)
```

### Milestone Success Criteria

| Milestone | Criteria | Target |
|-----------|----------|--------|
| DB Ready | Tables created, indexes optimized, data seeded | Day 2 EOD |
| Backend Foundation | All middleware, validation, error handling working | Day 3 EOD |
| RAG Working | Upload document → Search → Get relevant results | Day 7 EOD |
| WhatsApp Bot Live | Send message → Get intelligent reply via RAG | Day 9 EOD |
| Admin APIs Complete | All CRUD operations working with auth | Day 11 EOD |
| Voice Enabled | Order confirmation with text + voice | Day 13 EOD |
| Production Ready | All tests pass, security validated, docs complete | Day 14 EOD |

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Groq API rate limits | Bot becomes slow | Implement request queuing, cache common queries |
| Large RAG dataset | Vector search becomes slow | HNSW index tuning, query optimization |
| WhatsApp webhook timeouts | Messages not processed | Implement async job queue (Bull/BullMQ) |
| Concurrent order processing | Race conditions | Transactional order creation with locks |
| Voice generation delays | Poor UX | Pre-generate voice during order confirmation workflow |

---

## Phase 3: File Structure & Quick Start

### Directory Structure
```
app/
├── api/
│   ├── auth/[...nextauth]/
│   ├── whatsapp/
│   │   └── webhook/route.ts
│   ├── rag/
│   │   ├── ingest/route.ts
│   │   └── search/route.ts
│   ├── menu/route.ts
│   ├── orders/route.ts
│   ├── business-timings/route.ts
│   └── admin/analytics/route.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── rag/
│   │   ├── chunker.ts
│   │   ├── embeddings.ts
│   │   └── search.ts
│   ├── voice/
│   │   └── tts.ts
│   ├── validations/
│   │   ├── menu.ts
│   │   ├── order.ts
│   │   └── document.ts
│   ├── errors.ts
│   ├── response.ts
│   └── auth.ts
└── middleware.ts
```

### Environment Variables Required
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
GOOGLE_TTS_API_KEY=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### Quick Start Commands
```bash
# Setup
npm install
npm run db:push       # Create schema
npm run db:seed       # Load sample data

# Development
npm run dev           # Start dev server

# Testing
npm run test          # Run all tests
npm run test:e2e      # End-to-end tests
```

---

## Success Definition

✅ All 7 phases complete and tested  
✅ All 5 user stories fully implemented  
✅ < 3 second response time on WhatsApp  
✅ RAG search accuracy > 80%  
✅ 100+ concurrent user support  
✅ Zero production security issues  
✅ Documentation complete
