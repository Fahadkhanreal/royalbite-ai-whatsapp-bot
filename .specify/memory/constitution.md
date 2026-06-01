<!--
Sync Impact Report
Version change: template → 1.0.0
Modified principles:
- Template principle 1 → I. Accuracy First Through RAG
- Template principle 2 → II. Human-Like Pakistani Restaurant Experience
- Template principle 3 → III. Customer-Centric Order Integrity
- Template principle 4 → IV. Privacy, Security, and Data Isolation
- Template principle 5 → V. Admin-Controlled Continuous Knowledge
- Template principle 6 → VI. Speed, Reliability, and Voice Quality
Added sections:
- Technical Constitution
- Product Scope and Responsibilities
- Response and Order Handling Rules
Removed sections:
- Template placeholder comments and unused placeholder sections
Templates requiring updates:
- ✅ .specify/templates/plan-template.md updated with RoyalBite Constitution Check gates
- ✅ .specify/templates/spec-template.md reviewed; user scenarios, requirements, and success criteria align
- ✅ .specify/templates/tasks-template.md reviewed; existing security, logging, performance, and validation tasks align
- ✅ .specify/templates/commands/*.md checked; directory absent, no updates required
Runtime guidance docs:
- ✅ README.md checked; absent, no update required
- ✅ docs/**/*.md checked; absent, no update required
Follow-up TODOs: none
-->
# RoyalBite AI Constitution

## Core Principles

### I. Accuracy First Through RAG

RoyalBite AI MUST answer restaurant, menu, pricing, timing, offer, delivery, and order
questions only from approved retrieval-augmented generation data or verified admin-controlled
records. The system MUST NOT guess prices, availability, timings, policies, or order status.
When knowledge is missing or uncertain, the bot MUST respond politely, ask a clarifying
question, or route the issue to an admin-safe fallback.

**Rationale:** The product promise depends on near-zero hallucination and customer trust.
Restaurant information directly affects payments, expectations, and operational workload.

### II. Human-Like Pakistani Restaurant Experience

Customer-facing replies MUST feel like a warm, energetic, respectful Pakistani restaurant
waiter using natural Roman Urdu and English mix. Replies MUST be short, scannable, helpful,
and friendly, with moderate emoji use where appropriate. The bot MUST NOT say "Main AI hoon"
or use rude, sarcastic, impatient, robotic, or sensitive-topic responses.

**Rationale:** RoyalBite AI succeeds only if customers feel they are speaking with a helpful
restaurant waiter rather than a generic chatbot.

### III. Customer-Centric Order Integrity

Ordering flows MUST clearly repeat selected items, quantities, totals, customer details, and
estimated delivery or pickup expectations before final confirmation. Orders MUST be saved to
the source-of-truth database only after customer confirmation, and the customer MUST receive
an order ID plus estimated time after successful persistence. Error paths MUST avoid duplicate
orders and MUST clearly tell the customer what happened.

**Rationale:** Order mistakes create direct business loss and customer frustration. Every order
step must be auditable, confirmable, and recoverable.

### IV. Privacy, Security, and Data Isolation

Customer information, phone numbers, addresses, chat history, order details, admin settings,
API keys, WhatsApp tokens, TTS credentials, database credentials, and LLM provider secrets MUST
be protected. Secrets MUST live in environment variables or managed secret stores, never in
source code. Admin capabilities MUST require authenticated and authorized access. Customer data
MUST NOT be leaked across conversations, logs, analytics, or retrieval contexts.

**Rationale:** The system handles personal customer data and operational restaurant data. A
privacy failure damages both customers and the restaurant brand.

### V. Admin-Controlled Continuous Knowledge

The admin dashboard is the operational brain of RoyalBite AI. Menu items, prices, descriptions,
business timings, offers, knowledge base content, RAG documents, system prompt controls, order
status, analytics, and chat history MUST be manageable through admin-owned workflows. Updates
that affect customer answers MUST be reflected in retrieval data through a deliberate ingestion
or synchronization path.

**Rationale:** Restaurant knowledge changes frequently. Admin-managed data keeps answers
accurate without requiring code changes for routine business updates.

### VI. Speed, Reliability, and Voice Quality

Customer replies SHOULD be fast enough for natural WhatsApp conversation, with target latency
budgets captured in each feature plan. The system MUST degrade gracefully when Groq, Neon,
Meta WhatsApp Cloud API, Google Cloud Text-to-Speech, pgvector retrieval, or other dependencies
fail. Voice replies MUST use natural Urdu/Pakistani-friendly pronunciation where configured and
MUST fall back to text when voice generation or delivery fails.

**Rationale:** A waiter experience fails if responses are slow, unreliable, or unnatural. Clear
fallbacks protect customer experience during provider outages.

## Technical Constitution

- Framework: Next.js 15 with App Router for full-stack application structure.
- Database: Neon PostgreSQL as source of truth for restaurant data, orders, chat history, and
  admin-managed content.
- Vector search: pgvector for retrieval over restaurant knowledge and uploaded documents.
- LLM: Groq with Llama 3.3 class models for fast restaurant conversation generation.
- Voice: Google Cloud Text-to-Speech for natural Urdu/Pakistani-friendly voice replies.
- WhatsApp: Meta WhatsApp Cloud API for customer messaging and voice-note delivery.
- UI: Tailwind CSS, shadcn/ui, and Framer Motion for a premium admin dashboard experience.
- Deployment: Vercel for application/API deployment and Neon for managed PostgreSQL.

Any proposed replacement of these foundational technologies MUST be justified in a feature
plan, include migration and rollback notes, and trigger an ADR suggestion.

## Product Scope and Responsibilities

Customer-side WhatsApp scope includes menu discovery, pricing and descriptions, personalized
dish recommendations, order booking with confirmation, delivery time estimation, timings,
location, offers, hybrid text and voice replies, and order tracking.

Admin dashboard scope includes menu CRUD, business timings, knowledge base and offers, RAG
document upload and ingestion, order viewing and status updates, analytics, chat history, and
system prompt control.

Phase 2+ ideas such as multi-language support, payment integration, returning-customer order
history, AI demand forecasting, and multi-branch support are out of scope unless explicitly
introduced through a feature specification and plan.

## Response and Order Handling Rules

Customer responses MUST follow these rules:

- Use short, clear, and scannable replies.
- Use Roman Urdu plus English in a friendly Pakistani style unless the feature explicitly
  requires another language.
- Use emojis moderately and only where they improve warmth or clarity.
- Give fallback answers politely when requested data is unavailable.
- Avoid sensitive topics and redirect to restaurant-relevant help.

Order handling MUST follow these rules:

1. Repeat selected items, quantities, and any options clearly.
2. Collect required customer details: name, address or pickup intent, and phone when needed.
3. Calculate and show the total amount from verified menu data.
4. Ask for final confirmation before saving the order.
5. Save confirmed orders in Neon PostgreSQL.
6. Return an order ID and estimated time after successful save.

## Governance

This constitution is the highest project-level authority for RoyalBite AI. Feature specs,
plans, tasks, implementation, tests, prompts, admin workflows, and operational changes MUST
comply with these principles.

Amendments require:

1. A written proposal explaining the change and affected principles or sections.
2. Review against product goals, customer experience, security, data accuracy, and operations.
3. Version update using semantic versioning.
4. Propagation review for templates, specs, plans, tasks, runtime docs, and guidance files.
5. Prompt History Record capture for the constitution change.

Versioning policy:

- MAJOR version for incompatible governance changes, principle removals, or principle
  redefinitions.
- MINOR version for new principles, new sections, or materially expanded guidance.
- PATCH version for clarifications, typo fixes, and non-semantic refinements.

Compliance review expectations:

- Every feature plan MUST include a Constitution Check that addresses accuracy, human-like
  response style, order integrity, privacy/security, admin-managed knowledge, and reliability.
- Every feature spec MUST include measurable acceptance criteria and explicit error paths.
- Every task list MUST include validation work for security, logging or observability,
  performance where relevant, and quickstart or manual verification.
- Significant technology, data model, API, security, platform, or deployment decisions MUST
  trigger an ADR suggestion and wait for project-owner consent before ADR creation.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
