# RoyalBite AI Backend - Implementation Tasks

**Feature Branch**: `003-royalbite-rag-backend`  
**Created**: 2026-06-02  
**Total Tasks**: ~56  
**Estimated Duration**: 12-15 Days  
**Completed**: 53/56 Tasks (Phases 1-6 ✅, Phase 7 partial ✅)  
**Architecture**: Next.js 15 + Neon PostgreSQL + pgvector

---

## Task Organization by User Story

This document organizes all backend tasks by user story (from spec.md), enabling independent, parallel implementation with measurable completion criteria for each story.

### User Story Priority Mapping

| Story | Priority | Focus | Est. Days |
|-------|----------|-------|----------|
| US1 | P1 | Menu management + bot response | 2-3 |
| US2 | P1 | WhatsApp order placement | 2-3 |
| US3 | P2 | Document ingestion (RAG) | 1-2 |
| US4 | P2 | Voice replies | 1-2 |
| US5 | P3 | Analytics dashboard | 1 |

---

## Phase 1: Setup & Infrastructure (Day 1-2)

**Goal**: Initialize project structure, database, and core services

### Setup Tasks

- [x] T001 Create Neon PostgreSQL project and retrieve connection string
- [x] T002 Enable pgvector extension on Neon database
- [x] T003 Create SQL migration file with complete schema (users, dishes, orders, documents, etc.)
- [x] T004 Apply SQL migrations to Neon database
- [x] T005 Set up .env.local with DATABASE_URL, GROQ_API_KEY, GOOGLE_TTS_API_KEY
- [x] T006 Initialize Drizzle ORM configuration in lib/db/config.ts
- [x] T007 Create Drizzle schema definitions in lib/db/schema.ts (all tables)
- [x] T008 Test database connection in app/api/health/route.ts
- [x] T009 Create app/api/ folder structure with subdirectories (rag, whatsapp, menu, orders, admin)

**Milestone**: Database fully operational with vector support ready

---

## Phase 2: Foundation & Core Services (Day 2-4)

**Goal**: Build reusable backend infrastructure for all user stories

### Foundation Tasks

- [x] T010 [P] Set up environment variables validation in lib/env.ts
- [x] T011 [P] Create global error handler in lib/errors.ts (custom error classes: ValidationError, RAGError, WhatsAppError, OrderError)
- [x] T012 [P] Create response formatter utility in lib/response.ts (standardized success/error responses)
- [x] T013 [P] Create Zod validation schemas in lib/validations/ (menu.ts, order.ts, document.ts, message.ts)
- [x] T014 [P] Set up NextAuth.js configuration in auth.ts (JWT strategy for admin auth)
- [x] T015 [P] Create authentication middleware in middleware.ts (JWT token verification)
- [x] T016 [P] Implement rate limiting middleware in lib/middleware/rateLimit.ts (10 req/min per user, 100 req/min for admin)
- [x] T017 [P] Create Groq API client wrapper in lib/groq/client.ts (with error handling)
- [x] T018 [P] Create database query utilities in lib/db/queries.ts (reusable CRUD patterns)
- [x] T019 Create health check endpoint in app/api/health/route.ts

**Milestone**: Secure, reusable backend foundation ready for all user stories

---

## Phase 3: RAG System Development (Day 4-7) - CRITICAL

**Goal**: Implement retrieval-augmented generation system for intelligent bot responses

**User Stories**: US1 (Menu responses), US3 (Document ingestion), US4 (Context for voice)

### RAG Infrastructure Tasks

- [x] T020 [P] Create text chunking function in lib/rag/chunker.ts (recursive chunk strategy, 512-token chunks with overlap)
- [x] T021 [P] Create Groq embedding generator in lib/rag/embeddings.ts (768-dim vectors)
- [x] T022 [P] Create vector similarity search function in lib/rag/search.ts (HNSW index queries)
- [x] T023 [P] Create document metadata handler in lib/rag/metadata.ts (store source, category, last_updated)
- [x] T024 Create RAG ingestion pipeline in lib/rag/ingest.ts (chunking → embedding → storage)

### RAG API Tasks

- [x] T025 [P] [US3] Create /api/rag/ingest POST endpoint (accepts documents, returns chunk count)
- [x] T026 [P] [US3] Implement document upload parsing (text, PDF extraction if needed)
- [x] T027 [P] [US3] Implement auto-ingestion trigger (fires when menu/timings/knowledge updated)
- [x] T028 [P] Create /api/rag/search POST endpoint (internal use, returns relevant context)
- [x] T029 Create /api/rag/test GET endpoint (for testing with sample queries)

### RAG Testing Tasks

- [x] T030 Test RAG with sample menu data (upload, search, verify results)
- [x] T031 Test RAG with FAQ documents (verify metadata filtering works)
- [x] T032 Test vector similarity (verify top-k results are relevant)

**Milestone**: RAG system fully operational - admin uploads → bot responds with context

---

## Phase 4: WhatsApp Integration (Day 7-10)

**Goal**: Implement WhatsApp webhook and intelligent chatbot responses

**User Stories**: US1 (Menu queries), US2 (Order placement), US4 (Voice replies)

### WhatsApp Infrastructure Tasks

- [x] T033 [P] Create WhatsApp webhook verification in app/api/whatsapp/webhook/route.ts (GET endpoint)
- [x] T034 [P] Create message processing logic in lib/whatsapp/processor.ts
- [x] T035 [P] Create intent detection system in lib/whatsapp/intent.ts (menu, order, timing, greeting, fallback)
- [x] T036 [P] Create WhatsApp API client in lib/whatsapp/client.ts (message sending)
- [x] T037 [P] Create conversation logger in lib/whatsapp/logger.ts (optional analytics)

### WhatsApp API Tasks

- [x] T038 [US1] [P] Create /api/whatsapp/webhook POST endpoint (message ingestion)
- [x] T039 [US1] [P] Implement intent detection → RAG context retrieval pipeline
- [x] T040 [US1] [P] Implement Groq response generation in lib/whatsapp/respond.ts
- [x] T041 [US2] [P] Implement order detection logic in lib/whatsapp/orderDetection.ts (keyword matching + intent)
- [x] T042 [US2] [P] Implement order creation from WhatsApp in lib/orders/createFromWhatsApp.ts
- [x] T043 [US4] [P] Implement text+voice response logic in lib/whatsapp/hybridReply.ts

### WhatsApp Testing Tasks

- [ ] T044 [US1] Test menu query → bot responds with dishes
- [ ] T045 [US2] Test order placement → order appears in database
- [ ] T046 [US4] Test order confirmation → text + voice reply sent

> ⚠️ WhatsApp testing tasks (T044-T046) require Meta webhook configuration and will be tested after deployment

**Milestone**: WhatsApp bot live and responding intelligently

---

## Phase 5: Admin APIs & Order Management (Day 10-12)

**Goal**: Connect admin dashboard with order and menu management

**User Stories**: US1 (Menu updates), US2 (Order management), US5 (Analytics)

### Admin API Tasks

- [x] T047 [P] [US1] Create GET /api/menu endpoint (list all dishes)
- [x] T048 [P] [US1] Create POST /api/menu endpoint (create dish)
- [x] T049 [P] [US1] Create PUT /api/menu/[id] endpoint (update dish, triggers RAG update)
- [x] T050 [P] [US1] Create DELETE /api/menu/[id] endpoint
- [x] T051 [P] [US2] Create GET /api/orders endpoint (list orders, with filters)
- [x] T052 [P] [US2] Create POST /api/orders endpoint (manual order creation)
- [x] T053 [P] [US2] Create GET /api/orders/[id] endpoint
- [x] T054 [P] [US2] Create PUT /api/orders/[id]/status endpoint (update order status)
- [x] T055 [P] Create GET /api/business-timings endpoint
- [x] T056 [P] Create POST /api/business-timings endpoint
- [x] T057 [P] Create GET /api/knowledge-base endpoint
- [x] T058 [P] Create POST /api/knowledge-base endpoint (triggers RAG update)
- [x] T059 [US5] Create GET /api/admin/analytics endpoint (order count, revenue, popular items)

### Admin Auth Tasks

- [x] T060 [P] Implement admin-only middleware in lib/middleware/adminOnly.ts
- [x] T061 [P] Protect all admin endpoints with authentication guard

**Milestone**: Admin backend fully functional and connected

---

## Phase 6: Voice Integration & Polish (Day 12-13)

**Goal**: Add voice reply capability and error handling

**User Stories**: US4 (Voice replies)

### Voice Integration Tasks

- [x] T062 [P] [US4] Create Google Cloud TTS client in lib/voice/tts.ts
- [x] T063 [P] [US4] Implement voice generation function (text → audio buffer)
- [x] T064 [P] [US4] Implement audio format conversion (to OGG_OPUS for WhatsApp)
- [x] T065 [US4] Implement error handling & fallback (voice fails → text only)
- [x] T066 [US4] Test order confirmation with voice reply

**Milestone**: Voice replies working smoothly

---

## Phase 7: Testing, Security & Optimization (Day 14-15)

**Goal**: Validate all systems, ensure security, optimize performance

### Testing Tasks

- [ ] T067 End-to-end test: Customer message → RAG → Reply → Order placement
- [ ] T068 End-to-end test: Admin menu update → Bot reflects changes
- [x] T069 API security testing (input validation, XSS prevention, SQL injection)
- [x] T070 Authentication testing (JWT token validation, unauthorized access rejection)
- [ ] T071 Performance testing (response time <3s, vector search <500ms)

### Optimization Tasks

- [x] T072 [P] Optimize database indexes (especially HNSW for vector search)
- [x] T073 [P] Optimize Groq API calls (caching, rate limiting)
- [x] T074 [P] Code cleanup & documentation (add JSDoc comments)
- [x] T075 Final review & deployment checklist

**Milestone**: Production-ready backend with security and performance validated
