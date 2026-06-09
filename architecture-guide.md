# 🏗️ RoyalBite AI Backend - Architecture Guide

> **Purpose**: Yeh document pooray project ki architecture samjhata hai — kaise order flow kaam karta hai, RAG chatbot kaise reply karta hai, aur sab kuch kis tarah connected hai.
>
> **Language**: Roman Urdu + Simple English (for developers of all levels)

---

## 📋 Table of Contents

1. [Overall Architecture](#1-overall-architecture)
2. [Tech Stack](#2-tech-stack)
3. [File Structure](#3-file-structure)
4. [Order Flow (Detailed)](#4-order-flow)
5. [RAG Chatbot Flow (Detailed)](#5-rag-chatbot-flow)
6. [WhatsApp Message Flow](#6-whatsapp-message-flow)
7. [Admin API Flow](#7-admin-api-flow)
8. [Database Schema](#8-database-schema)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Environment Variables](#10-environment-variables)

---

## 1. Overall Architecture

```
                   🌐 INTERNET
                        │
                        ▼
            ┌───────────────────────┐
            │   Meta WhatsApp API   │
            │   (Cloud API)         │
            └──────────┬────────────┘
                       │ Webhook (POST/GET)
                       ▼
            ┌───────────────────────┐
            │   Next.js 16 App      │◄──── Frontend (Admin Panel)
            │   (API Routes)        │
            │                       │
            │  ┌─────────────────┐  │
            │  │  RAG System     │  │
            │  │  (AI Brain)     │  │
            │  └────────┬────────┘  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Neon PostgreSQL     │
            │   + pgvector          │
            │   (Database)          │
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Groq LLM API        │
            │   (llama-3.3-70b)     │
            └───────────────────────┘
```

### Simple Explanation:

- **WhatsApp se message aata hai** → Next.js API route mein
- **Bot samajhta hai ke kya chahiye** (menu, order, timing) → Intent Detection
- **RAG system database mein search karta hai** → Relevant info find karta hai
- **Groq AI response generate karta hai** → Natural reply banata hai
- **Reply WhatsApp pe bhejta hai** → Customer tak pohchta hai

---

## 2. Tech Stack

| Component | Technology | Kyun? (Why?) |
|-----------|-----------|-------------|
| **Framework** | Next.js 16 (App Router) | API routes + Frontend ek hi app mein |
| **Database** | Neon PostgreSQL | Serverless, free tier available |
| **Vector DB** | pgvector (extension) | Same DB mein RAG, extra service nahi |
| **ORM** | Drizzle ORM | Type-safe, lightweight |
| **LLM** | Groq (llama-3.3-70b) | Fast inference, free API key |
| **Auth** | NextAuth.js (JWT) | Admin panel ke liye secure login |
| **Validation** | Zod | Runtime type checking |
| **WhatsApp** | Meta Cloud API | Official WhatsApp Business API |
| **Voice** | Google Cloud TTS | Text-to-speech for order confirmations |

---

## 3. File Structure

```
📁 project-root/
│
├── 📁 app/api/                    # API Routes (backend)
│   ├── 📁 health/                 # Health check endpoint
│   ├── 📁 menu/                   # Menu CRUD
│   │   └── 📁 [id]/              # Single dish operations
│   ├── 📁 orders/                 # Orders CRUD
│   │   └── 📁 [id]/status/       # Order status update
│   ├── 📁 business-timings/      # Restaurant hours
│   ├── 📁 knowledge-base/        # FAQ / knowledge entries
│   ├── 📁 admin/analytics/       # Sales & order stats
│   ├── 📁 rag/
│   │   ├── 📁 ingest/            # Document upload API
│   │   ├── 📁 search/            # Vector search API
│   │   └── 📁 test/              # RAG testing API
│   └── 📁 whatsapp/webhook/      # WhatsApp webhook
│
├── 📁 lib/                       # Core logic
│   ├── 📁 db/
│   │   ├── schema.sql            # SQL schema
│   │   ├── schema.ts             # Drizzle definitions
│   │   ├── index.ts              # Database connection
│   │   └── queries.ts            # Reusable queries
│   ├── 📁 rag/                   # RAG system
│   │   ├── chunker.ts            # Text splitting
│   │   ├── embeddings.ts         # Vector generation
│   │   ├── search.ts             # Vector search
│   │   ├── metadata.ts           # Document metadata
│   │   ├── ingest.ts             # Ingestion pipeline
│   │   ├── parser.ts             # File parsing
│   │   ├── auto-ingest.ts        # Auto-trigger
│   │   ├── seed.ts               # Sample data
│   │   └── index.ts              # Barrel exports
│   ├── 📁 whatsapp/              # WhatsApp integration
│   │   ├── processor.ts          # Main processor
│   │   ├── intent.ts             # Intent detection
│   │   ├── client.ts             # API client
│   │   ├── respond.ts            # Response generation
│   │   ├── orderDetection.ts     # Order detection
│   │   ├── hybridReply.ts        # Text+Voice
│   │   ├── logger.ts             # Conversation log
│   │   └── index.ts              # Barrel exports
│   ├── 📁 voice/                 # Voice integration
│   │   ├── tts.ts                # Google TTS
│   │   └── convert.ts            # Audio format
│   ├── 📁 orders/                # Order logic
│   │   └── createFromWhatsApp.ts # WhatsApp order
│   ├── 📁 groq/                  # Groq LLM client
│   │   └── client.ts
│   ├── 📁 middleware/
│   │   ├── auth.ts               # Auth middleware
│   │   ├── adminOnly.ts          # Admin guard
│   │   └── rateLimit.ts          # Rate limiter
│   ├── 📁 validations/
│   │   └── schemas.ts            # Zod schemas
│   ├── env.ts                    # Env validation
│   ├── errors.ts                 # Error classes
│   ├── response.ts               # Response format
│   └── utils.ts                  # Utility functions
│
├── auth.ts                       # NextAuth config
├── drizzle.config.ts             # DB migration config
├── 📁 frontend/                  # Frontend (admin panel)
└── 📁 scripts/                   # Utility scripts
    ├── migrate.js                # DB migration
    ├── test-db.js                # DB tests
    └── test-api.js               # API tests
```

---

## 4. Order Flow

### Step-by-Step: WhatsApp se Order kaise place hota hai

```
Customer: "Mujhe ek Chicken Biryani chahiye"
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │  STEP 1: WhatsApp Webhook Receive   │
    │  /api/whatsapp/webhook POST         │
    │                                     │
    │  Meta se message aata hai:          │
    │  { from: "923001234567",            │
    │    text: "Mujhe ek Chicken Biryani" }│
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 2: Intent Detection           │
    │  lib/whatsapp/intent.ts             │
    │                                     │
    │  Message analyse hota hai:          │
    │  - Keywords check: "biryani" ✅     │
    │  - Action: "order"                  │
    │  - Confidence: 0.85                 │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 3: Order Detection            │
    │  lib/whatsapp/orderDetection.ts     │
    │                                     │
    │  Dish name extract hota hai:        │
    │  - "Chicken Biryani" matched ✅     │
    │  - Quantity: 1 (default)            │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 4: Database Query             │
    │  lib/orders/createFromWhatsApp.ts   │
    │                                     │
    │  Dish database mein search hota hai:│
    │  - "Chicken Biryani" → dish ID     │
    │  - Price Rs. 220                    │
    │  - Available: ✅                    │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 5: Order Creation             │
    │  INSERT INTO orders                 │
    │  INSERT INTO order_items            │
    │                                     │
    │  Order ID: uuid                     │
    │  Status: "pending"                  │
    │  Total: Rs. 220                     │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 6: Generate Confirmation      │
    │  lib/whatsapp/processor.ts          │
    │                                     │
    │  "🎉 Order Confirmed!              │
    │   ✅ Chicken Biryani x1             │
    │   Total: Rs. 220                    │
    │   We'll start preparing..."         │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 7: Send Reply (Text + Voice)  │
    │  lib/whatsapp/client.ts             │
    │  lib/whatsapp/hybridReply.ts        │
    │                                     │
    │  1. Text message bheja ✅           │
    │  2. Voice message bheja ✅ (TTS)    │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 8: Log Conversation           │
    │  lib/whatsapp/logger.ts             │
    │  INSERT INTO chat_logs              │
    └─────────────────────────────────────┘
```

### Order Status Lifecycle:

```
pending ──→ confirmed ──→ preparing ──→ delivered
    │                                           │
    └──→ cancelled (kisi bhi stage pe) ──────────┘
```

| Status | Meaning | Admin Action |
|--------|---------|-------------|
| `pending` | Order aya, dekha nahi gaya | Review order |
| `confirmed` | Admin ne confirm kiya | Update via API |
| `preparing` | Kitchen mein ban raha | Update via API |
| `delivered` | Customer tak pohch gaya | Update via API |
| `cancelled` | Order cancel ho gaya | Kisi bhi stage pe |

### Database Tables Involved:

```sql
-- Order table
orders (
  id UUID,
  phone_number VARCHAR,    -- Customer ka WhatsApp number
  total_price DECIMAL,     -- Total amount
  status order_status,     -- pending/confirmed/preparing/delivered/cancelled
  created_at TIMESTAMP,    -- Order time
  confirmed_at TIMESTAMP,  -- Confirm time
  delivered_at TIMESTAMP   -- Delivery time
)

-- Order items table
order_items (
  id UUID,
  order_id UUID → orders(id),   -- Parent order
  dish_id UUID → dishes(id),    -- Dish ordered
  quantity INTEGER,              -- Kitne plates
  price_at_order DECIMAL        -- Us waqt ka price
)
```

---

## 5. RAG Chatbot Flow

### RAG Kya Hai?

> **RAG** = Retrieval-Augmented Generation

Matalab: Jab customer kuch poochta hai, to bot pehle database mein relevant information search karta hai, **phir** woh info Groq AI ko deta hai, **phir** AI uss info ke basis par reply generate karta hai.

### Step-by-Step: Chatbot kaise reply karta hai

```
Customer: "Kya aapke paas biryani hai?"
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │  STEP 1: Message Receive            │
    │  /api/whatsapp/webhook              │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 2: Intent Detection           │
    │  lib/whatsapp/intent.ts             │
    │                                     │
    │  "biryani" keyword found!           │
    │  Intent: "menu_query"               │
    │  (Yeh biryani ke baare mein pooch  │
    │   raha hai)                         │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 3: RAG Search 🔍              │
    │  lib/rag/search.ts                  │
    │                                     │
    │  Query: "Kya aapke paas biryani?"   │
    │         ↓                           │
    │  Embedding generate (768-dim vector)│
    │         ↓                           │
    │  Database mein vector search:       │
    │  "Sindhi Biryani Rs.250..."         │
    │  "Chicken Biryani Rs.220..."        │
    │         ↓                           │
    │  Top 3 most similar results fetch   │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 4: Context Building           │
    │  lib/whatsapp/respond.ts            │
    │                                     │
    │  Groq ko bhejne se pehle context    │
    │  prepare hota hai:                  │
    │                                     │
    │  "You are RoyalBite assistant.      │
    │   Context: Sindhi Biryani - Rs.250 │
    │   Chicken Biryani - Rs.220          │
    │   Question: Kya aapke paas biryani?"│
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 5: Groq LLM Call             │
    │  lib/groq/client.ts                 │
    │                                     │
    │  Groq API ko bheja:                 │
    │  → llama-3.3-70b-versatile          │
    │  → Temperature: 0.7                 │
    │  → Max tokens: 300                  │
    │                                     │
    │  Groq response: "Ji! Humaare paas   │
    │  Sindhi Biryani Rs.250 aur Chicken  │
    │  Biryani Rs.220 available hai..."   │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  STEP 6: Reply Send                 │
    │  lib/whatsapp/client.ts             │
    │                                     │
    │  "Ji! Humaare paas Sindhi Biryani   │
    │  Rs.250 aur Chicken Biryani Rs.220  │
    │  available hai! 🍛"                 │
    │                                     │
    │  → WhatsApp API POST /messages      │
    └─────────────────────────────────────┘
```

### RAG Pipeline Diagram:

```
📄 Document Upload
   (Menu, FAQ, Policies)
         │
         ▼
   ┌─────────────┐
   │  Chunking   │ ← Text ko small pieces mein todna
   │  (512 tok)  │    Example: "Sindhi Biryani Rs.250"
   └──────┬──────┘
          ▼
   ┌─────────────┐
   │  Embedding  │ ← Text ko vector (number array) mein convert
   │  (768-dim)  │    Example: [0.23, -0.45, 0.12, ...]
   └──────┬──────┘
          ▼
   ┌─────────────┐
   │  Store in   │ ← PostgreSQL mein save (pgvector)
   │  Database   │    CREATE TABLE documents (
   └──────┬──────┘      embedding vector(768), content TEXT )
          │
          │    ──── Ingestion Complete ────
          │
          ▼
   ┌─────────────┐
   │  Search 🔍  │ ← Jab customer question aata hai:
   │             │    1. Question ka embedding banao
   │  Query:     │    2. Database mein similarity search
   │  "biryani?" │    3. Top 3 relevant results lao
   └──────┬──────┘
          ▼
   ┌─────────────┐
   │  Generate   │ ← Groq AI context ke saath reply generate
   │  Reply 🎯   │
   └─────────────┘
```

### Vector Search Explained (Simple):

```
Customer query embedding:
[0.23, -0.45, 0.67, 0.12, ...]   ← "biryani"

Database documents:
Doc 1: [0.25, -0.44, 0.65, 0.11, ...]  →  Similarity: 98%  ✅
   "Sindhi Biryani - Traditional Sindhi biryani Rs.250"

Doc 2: [0.10, 0.30, -0.20, 0.50, ...]  →  Similarity: 30%  ❌
   "Restaurant timings 11 AM to 10 PM"

Doc 3: [0.22, -0.40, 0.60, 0.15, ...]  →  Similarity: 95%  ✅
   "Chicken Biryani - Classic chicken biryani Rs.220"

→ Top 2 results Groq ko bheje → AI reply generate kare
```

### Intent Detection Categories:

| Intent | Example | Action |
|--------|---------|--------|
| `menu_query` | "Do you have biryani?" | RAG search → menu info |
| `order` | "I want Chicken Biryani" | Detect order → create in DB |
| `timing` | "Are you open now?" | RAG search → timings info |
| `greeting` | "Hello" | Welcome message |
| `thanks` | "Thank you" | You're welcome reply |
| `help` | "What can you do?" | Help menu show |
| `complaint` | "Food was cold" | Connect to staff |
| `fallback` | Random unknown | Friendly fallback |

---

## 6. WhatsApp Message Flow

### Complete Lifecycle:

```
┌──────────────────────────────────────────────────────────┐
│                   WHATSAPP FLOW                           │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Customer │───▶│  Meta    │───▶│  Our     │           │
│  │ WhatsApp │    │ WhatsApp │    │ Webhook  │           │
│  │ App      │    │ Cloud API│    │ /api/... │           │
│  └──────────┘    └──────────┘    └────┬─────┘           │
│                                        │                 │
│                                        ▼                 │
│                               ┌────────────────┐        │
│                               │ Rate Limiter   │        │
│                               │ (10 req/min)   │        │
│                               └──────┬─────────┘        │
│                                      │                   │
│                                      ▼                   │
│                               ┌────────────────┐        │
│                               │ Intent Detector│        │
│                               │ (menu/order/   │        │
│                               │  timing/etc)   │        │
│                               └──────┬─────────┘        │
│                                      │                   │
│                    ┌─────────────────┼──────┐           │
│                    ▼                 ▼      ▼           │
│             ┌──────────┐    ┌────────────┐  │           │
│             │ RAG      │    │ Order      │  │           │
│             │ Search   │    │ Detection  │  │           │
│             └────┬─────┘    └─────┬──────┘  │           │
│                  │                │         │           │
│                  ▼                ▼         │           │
│             ┌──────────┐    ┌────────────┐  │           │
│             │ Groq AI  │    │ Create     │  │           │
│             │ Response │    │ Order in DB│  │           │
│             └────┬─────┘    └─────┬──────┘  │           │
│                  │                │         │           │
│                  └──────┬─────────┘         │           │
│                         ▼                   │           │
│                  ┌──────────────┐           │           │
│                  │ Send Text    │           │           │
│                  │ (WhatsApp)   │           │           │
│                  └──────┬───────┘           │           │
│                         │                   │           │
│                         ▼                   │           │
│                  ┌──────────────┐           │           │
│                  │ Send Voice   │           │           │
│                  │ (If Order)   │           │           │
│                  └──────┬───────┘           │           │
│                         │                   │           │
│                         ▼                   │           │
│                  ┌──────────────┐           │           │
│                  │ Log to DB    │           │           │
│                  └──────┬───────┘           │           │
│                         │                   │           │
│                         ▼                   │           │
│                  ┌──────────────┐           │           │
│                  │ Response to  │           │           │
│                  │ Customer ✅  │           │           │
│                  └──────────────┘           │           │
└──────────────────────────────────────────────────────────┘
```

### Webhook Verification (GET):

```
Meta sends: GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=royalbite_verify_2026&hub.challenge=12345

Our server checks:
  - hub.mode == "subscribe" ✅
  - hub.verify_token == env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ✅

Response: 200 OK with hub.challenge = "12345"
→ Meta ko confirm ho jata hai ke yeh hamara webhook hai
```

---

## 7. Admin API Flow

### Admin Actions:

```
┌────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                               │
│                    (Frontend)                                │
└────────────────────────────────┬───────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────┐
│                    NEXT-AUTH JWT CHECK                       │
│                                                             │
│  Har API call se pehle:                                     │
│  1. Session check hoti hai (JWT token)                      │
│  2. Role "admin" hona chahiye                               │
│  3. Agar nahi → 401 Unauthorized                            │
└────────────────────────────────┬───────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Menu APIs      │   │  Orders APIs    │   │  Knowledge APIs │
│                 │   │                 │   │                 │
│ POST   /menu    │   │ GET    /orders  │   │ GET /knowledge  │
│ GET    /menu    │   │ POST   /orders  │   │ POST /knowledge │
│ PUT    /menu/id │   │ PUT    /order/  │   │                 │
│ DELETE /menu/id │   │        id/status│   │                 │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                      │
         │         ┌───────────┘                      │
         │         ▼                                  │
         │   ┌──────────────────────┐                 │
         │   │  Auto RAG Sync 🔄   │                 │
         │   │                     │                 │
         └──▶│ Menu update → RAG   │◀────────────────┘
             │ re-index            │
             │                     │
             │ Business timings    │
             │ update → RAG re-index│
             └─────────┬───────────┘
                       │
                       ▼
             ┌──────────────────────┐
             │  GROQ + VECTOR DB    │
             │  Updated ✨          │
             └──────────────────────┘
```

### Why Auto RAG Sync?

Jab bhi admin:
- **Naya dish add karta hai** → RAG automatically update ho jata hai
- **Dish update karta hai** → RAG re-index ho jata hai
- **Timings change karta hai** → RAG refresh ho jata hai

Iska matlab: Bot hamesha latest information ke saath reply karta hai! ✅

---

## 8. Database Schema

### Entity Relationship Diagram (Simple):

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  users   │──1:N──│  sessions    │       │  dishes  │
└──────────┘       └──────────────┘       └────┬─────┘
     │                                          │
     │ 1:N                                      │ 1:N
     ▼                                          ▼
┌──────────┐                              ┌──────────────┐
│documents │                              │  order_items  │
│(RAG)     │                              └──────┬───────┘
└──────────┘                                     │ N:1
                                                  ▼
                                           ┌──────────┐
                                           │  orders  │
                                           └──────────┘

┌──────────────────┐    ┌──────────────────┐
│ business_timings │    │ knowledge_base   │
└──────────────────┘    └──────────────────┘

┌──────────────────┐
│   chat_logs      │    ← WhatsApp conversations
└──────────────────┘
```

### Tables Summary:

| Table | Size | Purpose |
|-------|------|---------|
| `users` | Small | Admin logins |
| `dishes` | Small-Med | Menu items |
| `orders` | Growing | Customer orders |
| `order_items` | Growing | Order line items |
| `documents` | Growing | RAG vector store (embeddings) |
| `business_timings` | Small (7 rows) | Restaurant hours |
| `knowledge_base` | Small | FAQ + Policies |
| `chat_logs` | Growing | WhatsApp conversations |
| `sessions` | Small | Auth sessions |

---

## 9. API Endpoints Reference

### Public Endpoints (No Auth Needed):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | List all dishes |
| GET | `/api/business-timings` | Restaurant hours |
| GET | `/api/knowledge-base` | FAQ/knowledge list |

### WhatsApp Endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/whatsapp/webhook` | Webhook verification (Meta) |
| POST | `/api/whatsapp/webhook` | Receive messages (Meta) |

### RAG Endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/rag/ingest` | Upload document |
| POST | `/api/rag/search` | Search knowledge base |
| GET | `/api/rag/test` | Test RAG system |

### Admin Endpoints (Auth Required):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/menu` | Create dish |
| PUT | `/api/menu/[id]` | Update dish |
| DELETE | `/api/menu/[id]` | Delete dish |
| GET | `/api/orders` | List orders (with filters) |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/[id]/status` | Update order status |
| POST | `/api/business-timings` | Update timings |
| POST | `/api/knowledge-base` | Add knowledge entry |
| GET | `/api/admin/analytics` | Sales analytics |

---

## 10. Environment Variables

```env
# DATABASE
DATABASE_URL=postgresql://...           # Neon PostgreSQL URL

# GROQ AI
GROQ_API_KEY=gsk_...                     # Groq API key
GROQ_MODEL=llama-3.3-70b-versatile      # AI model

# GOOGLE TTS (Voice)
GOOGLE_TTS_API_KEY=...                   # Google Cloud TTS key

# WHATSAPP
WHATSAPP_BUSINESS_ACCOUNT_ID=...         # Meta Business ID
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=...    # WhatsApp phone ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...       # Webhook token
WHATSAPP_API_TOKEN=...                   # Meta API token

# AUTH
NEXTAUTH_SECRET=...                      # JWT secret (32+ chars)
NEXTAUTH_URL=http://localhost:3000      # App URL
```

---

## ⚡ Quick Summary (Roman Urdu)

### Order Kaise Hota Hai:

1. **Customer**: "Mujhe Chicken Biryani chahiye" → WhatsApp pe message
2. **Hamara server**: Message aaya → Intent detect kiya → "order"
3. **Order detection**: "Chicken Biryani" match kiya database se
4. **Database mein save kiya**: `orders` table mein entry banai
5. **Reply bheja**: "Order confirmed! Chicken Biryani ₹220"
6. **Voice bhi bheja**: TTS se audio generate karke

### Chatbot Kaise Reply Karta Hai:

1. **Customer**: "Kya biryani milti hai?" → WhatsApp message
2. **Intent detect**: "menu_query" → Biryani ke baare mein pooch raha
3. **RAG search**: Database mein biryani ka data dhoondta hai
4. **Vector similarity**: Query aur documents ka match dekhta hai
5. **Groq AI**: Relevant context ke saath reply generate karta hai
6. **Reply bhejta hai**: "Ji! Sindhi Biryani ₹250, Chicken Biryani ₹220"

### Admin Kya Kar Sakta Hai:

- **Menu add/edit/delete** → Auto RAG update
- **Orders dekhe** → Status change kare
- **Timings set kare** → Bot ko pata ho
- **FAQ add kare** → Bot automatically seekhe
- **Analytics dekhe** → Sales, revenue, popular items

### Important Points:

- ⚡ **Har menu update ke baad RAG auto-sync hota hai** — bot hamesha up-to-date
- 🛡️ **Admin APIs JWT-protected hain** — unauthorized access nahi ho sakta
- 🎯 **Intent detection keyword-based hai** — fast hai, AI call nahi lagta
- 🔊 **Voice sirf order confirmation ke liye** — baaki text-only
- 📊 **Sab kuch log hota hai** — chat_logs table mein
- 🔄 **RAG search mein vector + keyword hybrid approach** — agar vector fail ho to keyword fallback

---

> **Built with ❤️ for RoyalBite Restaurant**
> 
> Last updated: 2026-06-04
