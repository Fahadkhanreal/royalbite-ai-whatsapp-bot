# Feature Specification: RoyalBite AI Backend - RAG WhatsApp Chatbot & Admin Dashboard

**Feature Branch**: `003-royalbite-rag-backend`  
**Created**: 2026-06-02  
**Status**: Draft  
**Version**: 1.0

## User Scenarios & Testing

### User Story 1 - Restaurant Admin Updates Menu & Bot Responds (Priority: P1)

Restaurant admin adds new dishes to the menu via Admin Dashboard. The bot should immediately reflect these changes when customers ask about menu items.

**Why this priority**: Core value delivery - admins need easy menu management and customers expect current information.

**Independent Test**: Admin updates menu → Customer asks "What's new?" → Bot returns updated dishes with descriptions.

**Acceptance Scenarios**:

1. **Given** admin is logged into Admin Dashboard, **When** admin adds a new dish (name, description, price, image), **Then** the dish appears in the menu database within 2 seconds
2. **Given** dish exists in database, **When** customer asks "Do you have biryani?", **Then** bot responds with dish details from RAG within 3 seconds
3. **Given** admin updates existing dish price, **When** customer asks about pricing, **Then** bot returns the updated price

---

### User Story 2 - Customer Places Order via WhatsApp (Priority: P1)

Customer interacts with WhatsApp chatbot to browse menu, place order, and receive confirmation with estimated delivery time.

**Why this priority**: Core revenue stream - WhatsApp is primary sales channel for restaurant.

**Independent Test**: Customer sends menu request → Bot responds with options → Customer places order → Order appears in Admin Dashboard.

**Acceptance Scenarios**:

1. **Given** customer sends "Menu", **When** bot classifies as menu request, **Then** bot returns categorized menu items via RAG within 3 seconds
2. **Given** customer sends "Order biryani", **When** bot detects order intent, **Then** bot confirms order and creates order record in database
3. **Given** order is created, **When** admin views dashboard, **Then** order appears instantly with customer WhatsApp number

---

### User Story 3 - Admin Ingests Knowledge Base Documents (Priority: P2)

Admin uploads restaurant policies, FAQs, and special offers via Admin Dashboard. RAG system processes and indexes these for bot responses.

**Why this priority**: Enables personalized responses and customer service automation.

**Independent Test**: Admin uploads PDF with offers → Bot answers "What discounts do you have?" → Bot cites knowledge base.

**Acceptance Scenarios**:

1. **Given** admin uploads document (PDF/text), **When** system processes it, **Then** document is chunked and embedded within 5 seconds
2. **Given** embedded document exists, **When** customer asks related question, **Then** RAG retrieves relevant context and bot cites source

---

### User Story 4 - Bot Sends Voice Reply with Order Confirmation (Priority: P2)

After order placement, bot sends text + voice message confirming order details and delivery time.

**Why this priority**: Improves UX and reduces misunderstandings.

**Independent Test**: Order placed → Bot sends text confirmation + voice note → Customer receives both.

**Acceptance Scenarios**:

1. **Given** order is confirmed, **When** bot generates text response, **Then** system generates voice note via Google TTS
2. **Given** voice note is generated, **When** bot sends WhatsApp message, **Then** voice note is attached and delivered

---

### User Story 5 - Admin Views Real-Time Order Analytics (Priority: P3)

Admin dashboard shows order metrics, popular items, and revenue.

**Why this priority**: Operational insights and business intelligence.

**Independent Test**: Orders placed → Admin views dashboard → Analytics updated.

**Acceptance Scenarios**:

1. **Given** orders exist in database, **When** admin opens analytics page, **Then** dashboard shows total orders, revenue, popular items
2. **Given** new order is placed, **When** dashboard is refreshed, **Then** metrics reflect the new order

---

### Edge Cases

- What happens when customer sends invalid menu request (gibberish text)?
- How does system handle duplicate orders in quick succession?
- What happens if RAG finds no relevant context for customer question?
- How does bot handle orders during restaurant closed hours?
- What if WhatsApp webhook fails to verify (security)?
- How does system handle concurrent admin uploads?
- What happens when database connection fails?

## Requirements

### Functional Requirements

- **FR-001**: WhatsApp webhook MUST verify incoming requests using Meta's signature validation
- **FR-002**: System MUST classify customer messages into categories: Menu, Order, Timing, FAQ, General
- **FR-003**: RAG system MUST retrieve relevant context for menu/FAQ questions from document vectors
- **FR-004**: System MUST create orders with status tracking: Pending → Confirmed → Preparing → Delivered
- **FR-005**: System MUST generate text response and voice note for each order confirmation
- **FR-006**: Admin MUST be able to upload documents (menu updates, policies, FAQs) via dashboard
- **FR-007**: System MUST automatically chunk and embed admin-uploaded documents into pgvector
- **FR-008**: Admin dashboard MUST display real-time order list with customer details and status
- **FR-009**: System MUST persist chat history for analytics (optional but recommended)
- **FR-010**: All customer/admin data MUST be encrypted at rest and in transit (HTTPS)

### Non-Functional Requirements

- **NFR-001**: WhatsApp bot response latency MUST be < 3 seconds (p95)
- **NFR-002**: RAG search MUST complete within 500ms
- **NFR-003**: Voice generation and delivery MUST complete within 2 seconds
- **NFR-004**: System MUST support 100+ concurrent WhatsApp users
- **NFR-005**: Admin operations (upload, CRUD) MUST respond within 1 second
- **NFR-006**: Database connection pooling MUST maintain 5-10 active connections
- **NFR-007**: All APIs MUST return proper HTTP status codes (200, 400, 401, 404, 500)
- **NFR-008**: Rate limiting: Max 10 requests/minute per WhatsApp user, 100/minute for admin

### Key Entities

- **Dishes**: id, name, description, price, category, image_url, created_at, updated_at
- **Orders**: id, phone_number, dish_ids[], total_price, status, created_at, confirmed_at, delivered_at
- **Documents**: id, content, metadata (type, source), created_by, created_at, embedding (pgvector)
- **BusinessTimings**: id, day, open_time, close_time, is_holiday
- **Users (Admin)**: id, email, password_hash, role, created_at, last_login
- **ChatLogs**: id, phone_number, message, type (inbound/outbound), created_at

## Success Criteria

- ✅ WhatsApp bot responds to menu queries within 3 seconds with accurate dish information
- ✅ Customer can place complete order via WhatsApp with confirmation received within 2 seconds
- ✅ Admin can update menu/knowledge base and changes reflect in bot within 5 seconds
- ✅ Order appears in Admin Dashboard within 1 second of WhatsApp placement
- ✅ Voice notes are generated and delivered within 2 seconds of order confirmation
- ✅ RAG returns contextually relevant answers for FAQ questions with > 80% accuracy (manual test)
- ✅ System handles 100 concurrent users without degradation
- ✅ All admin APIs require JWT authentication
- ✅ Database queries use parameterized queries (no SQL injection)
- ✅ Zero sensitive data (passwords, tokens) in logs or error messages

## Assumptions

- Admin users will upload well-formatted documents (PDFs, TXT) for RAG ingestion
- WhatsApp Business Account is pre-configured with Meta webhook
- Groq API key and Google TTS credentials are available in environment
- Neon PostgreSQL database with pgvector extension is provisioned
- Restaurant operates fixed hours (not 24/7)
- Customer phone numbers are valid and unique per order
- Admin and customer are different user personas (no overlap)

## Out of Scope

- Complex analytics (ML models, predictive insights) - Phase 2
- Multi-language support - Phase 2
- Payment gateway integration - Phase 2
- Loyalty/rewards system - Phase 3
- Multiple restaurant support - Phase 3
- Custom chatbot training/fine-tuning - Phase 3
