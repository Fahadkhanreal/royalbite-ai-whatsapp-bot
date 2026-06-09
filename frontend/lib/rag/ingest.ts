// RAG ingestion pipeline
// Location: lib/rag/ingest.ts
// Orchestrates: chunking → embedding → storage pipeline

import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { chunkDocument } from './chunker';
import { generateEmbeddings } from './embeddings';
import { createMetadata, DocumentMetadata, validateMetadata } from './metadata';
import { RAGError } from '@/lib/errors';

export interface IngestOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Partial<DocumentMetadata>;
  source?: string;
  createdBy?: string;
}

export interface IngestResult {
  documentId: string;
  chunksCreated: number;
  embeddingsGenerated: boolean;
  metadata: DocumentMetadata;
}

export interface BatchIngestResult {
  documents: IngestResult[];
  totalChunks: number;
  failed: number;
}

/**
 * Ingest a document into the RAG vector store.
 *
 * Pipeline:
 * 1. Validate and normalize content
 * 2. Create document metadata
 * 3. Split content into chunks
 * 4. Generate embeddings for each chunk
 * 5. Store chunks with embeddings in PostgreSQL
 *
 * @param content - Raw text content to ingest
 * @param options - Ingestion options (chunk size, metadata, etc.)
 * @returns IngestResult with document ID and chunk count
 */
export async function ingestDocument(
  content: string,
  options: IngestOptions = {}
): Promise<IngestResult> {
  try {
    if (!content || content.trim().length === 0) {
      throw new RAGError('Cannot ingest empty content');
    }

    // Create metadata
    const metadata = createMetadata(options.metadata);

    // Validate metadata
    const validation = validateMetadata(metadata);
    if (!validation.valid) {
      throw new RAGError(`Invalid metadata: ${validation.errors.join('; ')}`);
    }

    // Chunk the content
    const chunks = chunkDocument(
      content,
      options.chunkSize || 512,
      options.chunkOverlap || 64
    );

    if (chunks.length === 0) {
      throw new RAGError('Content produced no chunks after processing');
    }

    // Generate embeddings for all chunks in parallel
    const embeddings = await generateEmbeddings(chunks);

    // Insert each chunk as a document row
    const insertPromises = chunks.map(async (chunk, i) => {
      try {
        const [inserted] = await db.insert(documents).values({
          content: chunk,
          embedding: embeddings[i],
          metadata: metadata as any,
          source: options.source || metadata.source || 'manual_upload',
          createdBy: options.createdBy || null,
        }).returning({ id: documents.id });

        return inserted;
      } catch (err) {
        console.error(`Failed to insert chunk ${i}:`, err);
        return null;
      }
    });

    const results = await Promise.all(insertPromises);
    const successfulInserts = results.filter(Boolean);

    if (successfulInserts.length === 0) {
      throw new RAGError('Failed to store any chunks in the database');
    }

    return {
      documentId: successfulInserts[0]!.id,
      chunksCreated: successfulInserts.length,
      embeddingsGenerated: true,
      metadata,
    };
  } catch (error) {
    if (error instanceof RAGError) throw error;
    throw new RAGError(
      'Document ingestion failed',
      {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        contentLength: content?.length,
      }
    );
  }
}

/**
 * Ingest multiple documents in batch
 */
export async function ingestDocuments(
  documents: Array<{ content: string; options?: IngestOptions }>
): Promise<BatchIngestResult> {
  const results: IngestResult[] = [];
  let failed = 0;

  for (const doc of documents) {
    try {
      const result = await ingestDocument(doc.content, doc.options);
      results.push(result);
    } catch (error) {
      failed++;
      console.error('Batch ingest failed for document:', error);
    }
  }

  return {
    documents: results,
    totalChunks: results.reduce((sum, r) => sum + r.chunksCreated, 0),
    failed,
  };
}

/**
 * Delete document embeddings for a given source or ID
 */
export async function deleteDocumentEmbeddings(
  filter: { id?: string; source?: string }
): Promise<number> {
  try {
    if (filter.id) {
      await db.delete(documents).where(
        eq(documents.id, filter.id)
      );
      return 1;
    }

    if (filter.source) {
      await db.delete(documents).where(sql`source = ${filter.source}`);
      return 1;
    }

    return 0;
  } catch (error) {
    throw new RAGError(
      'Failed to delete document embeddings',
      { filter }
    );
  }
}

/**
 * Count total documents in the vector store
 */
export async function countDocuments(): Promise<number> {
  try {
    const result = await db.select({ count: documents.id }).from(documents);
    return result.length;
  } catch (error) {
    throw new RAGError('Failed to count documents');
  }
}

/**
 * Re-index all documents (re-generate embeddings)
 * Useful after embedding model update
 */
export async function reindexAll(): Promise<BatchIngestResult> {
  try {
    // Fetch all documents
    const allDocs = await db.select().from(documents);

    if (allDocs.length === 0) {
      return { documents: [], totalChunks: 0, failed: 0 };
    }

    // Re-generate embeddings
    const contents = allDocs.map(d => d.content);
    const newEmbeddings = await generateEmbeddings(contents);

    // Update embeddings in batches
    for (let i = 0; i < allDocs.length; i++) {
      await db.update(documents)
        .set({ embedding: newEmbeddings[i] } as any)
        .where(eq(documents.id, allDocs[i].id));
    }

    return {
      documents: allDocs.map(d => ({
        documentId: d.id,
        chunksCreated: 1,
        embeddingsGenerated: true,
        metadata: createMetadata(),
      })),
      totalChunks: allDocs.length,
      failed: 0,
    };
  } catch (error) {
    throw new RAGError(
      'Re-indexing failed',
      {
        originalError: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
}
