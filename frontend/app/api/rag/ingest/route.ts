// POST /api/rag/ingest - Ingest documents into RAG vector store
// Location: app/api/rag/ingest/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ingestDocument, ingestDocuments } from '@/lib/rag/ingest';
import { searchDocuments } from '@/lib/rag/search';
import { createDocumentSchema, searchDocumentsSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, RAGError } from '@/lib/errors';

/**
 * POST /api/rag/ingest
 *
 * Accepts document content and ingests it into the RAG vector store.
 * Supports both single document and batch ingestion.
 *
 * Request Body (single):
 * {
 *   "content": "Document text here...",
 *   "type": "menu|faq|policy",
 *   "metadata": { "category": "biryani" },
 *   "source": "optional source identifier"
 * }
 *
 * Request Body (batch):
 * {
 *   "documents": [
 *     { "content": "...", "type": "menu" },
 *     { "content": "...", "type": "faq" }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for batch ingestion
    if (body.documents && Array.isArray(body.documents)) {
      return await handleBatchIngest(body.documents);
    }

    // Single document ingestion
    return await handleSingleIngest(body);
  } catch (error) {
    console.error('RAG ingest error:', error);

    if (error instanceof ValidationError || error instanceof RAGError) {
      return NextResponse.json(
        errorResponse(error),
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      errorResponse(new RAGError('Ingestion failed')),
      { status: 500 }
    );
  }
}

/**
 * Handle single document ingestion
 */
async function handleSingleIngest(body: any) {
  // Validate input
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Invalid document data',
      { errors: parsed.error.flatten().fieldErrors }
    );
  }

  const { content, metadata, source, type } = parsed.data as any;

  const result = await ingestDocument(content, {
    source: (source as string | undefined) ?? undefined,
    metadata: {
      type: type as any,
      category: metadata?.category,
    },
  });

  return NextResponse.json(
    successResponse({
      documentId: result.documentId,
      chunksCreated: result.chunksCreated,
      embeddingsGenerated: result.embeddingsGenerated,
    }),
    { status: 201 }
  );
}

/**
 * Handle batch document ingestion
 */
async function handleBatchIngest(documents: any[]) {
  if (documents.length === 0) {
    throw new ValidationError('Documents array is empty');
  }

  if (documents.length > 50) {
    throw new ValidationError('Maximum 50 documents per batch');
  }

  const results = await ingestDocuments(
    documents.map((doc: any) => ({
      content: doc.content,
      options: {
        source: doc.source || undefined,
        metadata: {
          type: doc.type || 'general',
          category: doc.category,
        },
      },
    }))
  );

  return NextResponse.json(
    successResponse({
      documents: results.documents,
      totalChunks: results.totalChunks,
      failed: results.failed,
    }),
    { status: 201 }
  );
}

/**
 * GET /api/rag/ingest
 *
 * Health check and stats for the RAG ingest endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      successResponse({
        status: 'ready',
        endpoint: 'RAG Document Ingestion',
        version: '1.0.0',
        supportedTypes: ['menu', 'faq', 'policy'],
        maxBatchSize: 50,
      })
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
