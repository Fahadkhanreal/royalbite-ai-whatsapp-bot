// POST /api/rag/search - Search the RAG knowledge base
// Location: app/api/rag/search/route.ts
// Internal endpoint used by the WhatsApp bot to find relevant context

import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch } from '@/lib/rag/search';
import { searchDocumentsSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, RAGError } from '@/lib/errors';

/**
 * POST /api/rag/search
 *
 * Search the RAG vector store for documents relevant to a query.
 * Used internally by the WhatsApp bot and admin panel.
 *
 * Request Body:
 * {
 *   "query": "Do you have biryani?",
 *   "limit": 3,
 *   "minSimilarity": 0.5
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "results": [
 *       {
 *         "content": "We offer Sindhi Biryani...",
 *         "similarity": 0.89,
 *         "source": "menu"
 *       }
 *     ]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = searchDocumentsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError(
            'Invalid search parameters',
            { errors: parsed.error.flatten().fieldErrors }
          )
        ),
        { status: 400 }
      );
    }

    const { query, limit, minSimilarity } = parsed.data;

    // Perform hybrid search (vector + keyword fallback)
    const result = await hybridSearch(query, {
      limit,
      minSimilarity,
    });

    return NextResponse.json(
      successResponse({
        results: result.results.map(r => ({
          content: r.content,
          similarity: r.similarity,
          source: r.source,
        })),
        totalResults: result.totalResults,
        tookMs: result.tookMs,
      })
    );
  } catch (error) {
    console.error('RAG search error:', error);

    if (error instanceof RAGError) {
      return NextResponse.json(
        errorResponse(error),
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      errorResponse(new RAGError('Search failed')),
      { status: 500 }
    );
  }
}

/**
 * GET /api/rag/search
 *
 * Health check for the search endpoint.
 */
export async function GET() {
  return NextResponse.json(
    successResponse({
      status: 'ready',
      endpoint: 'RAG Knowledge Search',
      version: '1.0.0',
    })
  );
}
