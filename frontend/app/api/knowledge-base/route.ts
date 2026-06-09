// Knowledge Base API
// Location: app/api/knowledge-base/route.ts
// GET /api/knowledge-base - List knowledge entries
// POST /api/knowledge-base - Create entry (admin only, triggers RAG)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { knowledgeBase } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { createKnowledgeSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';
import { syncKnowledgeToRAG } from '@/lib/rag/auto-ingest';

/**
 * GET /api/knowledge-base
 *
 * List all knowledge base entries.
 */
export async function GET() {
  try {
    const entries = await db.query.knowledgeBase.findMany({
      orderBy: desc(knowledgeBase.createdAt),
    });

    return NextResponse.json(
      successResponse({ entries })
    );
  } catch (error) {
    console.error('Knowledge base GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge-base
 *
 * Create a new knowledge base entry. Admin only.
 * Automatically triggers RAG re-indexing.
 *
 * Body:
 * {
 *   "title": "Delivery Policy",
 *   "content": "Free delivery for orders above Rs. 500...",
 *   "category": "policy",
 *   "source": "admin"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const body = await request.json();

    // Validate
    const parsed = createKnowledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid knowledge entry', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { title, content, category, source } = parsed.data;

    // Insert
    const [entry] = await db.insert(knowledgeBase).values({
      title,
      content,
      category: category || null,
      source: source || null,
    }).returning();

    // Trigger RAG sync
    syncKnowledgeToRAG().catch(err => {
      console.error('RAG sync after knowledge create failed:', err);
    });

    return NextResponse.json(
      successResponse({ entry }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Knowledge base POST error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
