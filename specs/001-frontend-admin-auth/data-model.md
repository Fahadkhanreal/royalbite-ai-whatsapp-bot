# Data Model: Frontend Admin Experience

**Feature**: 001-frontend-admin-auth  
**Date**: 2026-05-31

## Entity: Admin User

Represents a restaurant operator who can sign in and access protected admin workflows.

**Fields**:

- `id`: stable unique identifier
- `name`: display name
- `email`: unique sign-in email
- `passwordHash`: hashed credential secret, never exposed to the client
- `role`: access role; initial supported value for protected access is `admin`
- `status`: `active`, `disabled`
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp

**Validation rules**:

- Email must be unique and valid.
- Password hash must never be returned in API responses or session payloads.
- Only `active` users with `admin` role can access admin pages.

**Relationships**:

- Can create or update menu items, timings, knowledge entries, documents, orders, and settings.

## Entity: Admin Session

Represents authenticated admin state used for route protection and UI personalization.

**Fields**:

- `userId`: linked admin user identifier
- `email`: admin email
- `role`: authorization role
- `expiresAt`: session expiry timestamp

**Validation rules**:

- Expired sessions must not grant admin access.
- Non-admin role sessions must not access protected admin pages.

## Entity: Public Visitor

Represents an unauthenticated customer or prospect viewing public pages.

**Fields**:

- No persisted identity required for this feature.
- Browser/request context may be used for rendering public pages.

**Validation rules**:

- Public visitors can view public pages only.
- Public visitors must not access admin-only data or actions.

## Entity: Menu Item

Represents a dish visible on the public menu and manageable by admins.

**Fields**:

- `id`: stable unique identifier
- `name`: dish name
- `description`: customer-facing description
- `price`: verified price
- `category`: menu grouping
- `availability`: `available`, `unavailable`, `draft`
- `imageUrl`: optional image reference
- `sortOrder`: display ordering
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp

**Validation rules**:

- Name is required.
- Price must be non-negative.
- Public menu must show only available items unless an admin is viewing management pages.
- Unsupported image files must be rejected before save.

**Relationships**:

- Referenced by dashboard popular item summaries and order item snapshots.

## Entity: Business Timing

Represents weekly restaurant opening/closing schedule data.

**Fields**:

- `id`: stable unique identifier
- `dayOfWeek`: weekday identifier
- `isOpen`: boolean open/closed flag
- `opensAt`: opening time when open
- `closesAt`: closing time when open
- `notes`: optional admin note
- `updatedAt`: last update timestamp

**Validation rules**:

- Closed days do not require opening/closing times.
- Open days require opening and closing times.
- Closing time must be after opening time unless future overnight support is explicitly added.

## Entity: Knowledge Entry

Represents admin-managed offers, policies, FAQs, and other restaurant knowledge.

**Fields**:

- `id`: stable unique identifier
- `type`: `offer`, `policy`, `faq`, `general`
- `title`: short admin-facing title
- `content`: verified restaurant knowledge
- `status`: `draft`, `published`, `archived`
- `updatedAt`: last update timestamp

**Validation rules**:

- Title and content are required.
- Only published knowledge should affect customer-facing answers.
- Archived entries remain hidden from active customer-facing views.

## Entity: RAG Document

Represents an uploaded knowledge document and its ingestion status.

**Fields**:

- `id`: stable unique identifier
- `fileName`: original file name
- `fileType`: file MIME/type category
- `sizeBytes`: file size
- `status`: `uploaded`, `processing`, `indexed`, `failed`
- `failureReason`: optional failure details
- `uploadedBy`: admin user identifier
- `uploadedAt`: upload timestamp
- `indexedAt`: optional indexing completion timestamp

**Validation rules**:

- Unsupported file types must be rejected.
- Failed ingestion must show a clear admin-readable reason when available.
- Re-index action is allowed for uploaded, indexed, or failed documents.

**State transitions**:

```text
uploaded → processing → indexed
uploaded → processing → failed
failed → processing → indexed
indexed → processing → indexed
```

## Entity: Order

Represents a customer order visible and manageable by admins.

**Fields**:

- `id`: stable unique identifier/order ID
- `customerName`: customer name
- `customerPhone`: customer phone
- `customerAddress`: delivery address when applicable
- `items`: list of order item snapshots
- `totalAmount`: verified total amount
- `status`: `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`
- `createdAt`: order creation timestamp
- `updatedAt`: last update timestamp

**Validation rules**:

- Status updates must be admin-only.
- Total amount must be derived from verified item prices at order creation time.
- Cancelled or delivered orders should not move back to active preparation states without an explicit future rule.

**State transitions**:

```text
pending → confirmed → preparing → ready → delivered
pending → cancelled
confirmed → cancelled
preparing → cancelled
```

## Entity: Restaurant Settings

Represents restaurant profile and bot configuration visible to admins.

**Fields**:

- `id`: singleton or stable settings identifier
- `restaurantName`: public restaurant name
- `description`: public summary
- `phone`: restaurant phone/WhatsApp number
- `address`: restaurant address
- `brandColors`: optional UI brand metadata
- `botTone`: customer-facing tone guidance
- `updatedAt`: last update timestamp

**Validation rules**:

- Restaurant name is required.
- Public contact values must be valid before showing them on public pages.
- Bot configuration changes must remain consistent with the constitution's tone and safety rules.

## Entity: Dashboard Summary

Represents computed operational data shown on the admin dashboard.

**Fields**:

- `todayOrders`: count
- `pendingOrders`: count
- `recentOrders`: order summaries
- `popularItems`: menu item summaries
- `knowledgeStatus`: document/knowledge freshness summary

**Validation rules**:

- Summary cards must show empty states when underlying data is missing.
- Dashboard must not expose customer-sensitive details beyond what signed-in admins are allowed to view.
