// Vector similarity search for RAG system
// Location: lib/rag/search.ts
// Performs cosine similarity search against stored document embeddings
//
// Uses Drizzle query builder for portability (works with both neon-http and node-postgres)

import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { sql, ilike, inArray } from 'drizzle-orm';
import { generateEmbedding } from './embeddings';
import { RAGError } from '@/lib/errors';

export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  metadataFilter?: Record<string, any>;
  source?: string;
}

export interface SearchResult {
  content: string;
  similarity: number;
  metadata: Record<string, any> | null;
  source: string | null;
  documentId: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  tookMs: number;
}

const DEFAULT_OPTIONS: SearchOptions = {
  limit: 3,
  minSimilarity: 0.1, // Lowered from 0.5 for hash embedding compatibility
};

/**
 * Search for similar documents using cosine similarity on pgvector.
 *
 * Uses Drizzle raw SQL with pgvector's cosine distance operator (<=>).
 * Falls back to keyword search if vector query fails.
 */
export async function searchDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorStr = JSON.stringify(queryEmbedding);

    // Build query params
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIdx = 0;

    if (opts.source) {
      paramIdx++;
      conditions.push(`source = $${paramIdx}`);
      params.push(opts.source);
    }

    paramIdx++;
    const similarityThreshold = opts.minSimilarity ?? 0.5;
    conditions.push(`1 - (embedding <=> $${paramIdx}::vector) >= ${similarityThreshold}`);
    params.push(vectorStr);

    paramIdx++;
    const limitVal = opts.limit ?? 3;

    const whereClause = conditions.join(' AND ');
    const queryStr = sql`
      SELECT id, content, metadata, source,
             1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM documents
      WHERE ${sql.raw(whereClause)}
      ORDER BY similarity DESC
      LIMIT ${limitVal}
    `;

    const results = await db.execute(queryStr);

    const searchResults: SearchResult[] = (results.rows || []).map((row: any) => ({
      content: row.content,
      similarity: parseFloat(row.similarity) || 0,
      metadata: row.metadata
        ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata)
        : null,
      source: row.source || null,
      documentId: row.id,
    }));

    return {
      results: searchResults,
      query,
      totalResults: searchResults.length,
      tookMs: Date.now() - startTime,
    };
  } catch (error) {
    console.warn('Vector search failed, falling back to keyword search:', error);
    return keywordSearch(query, opts);
  }
}

/**
 * Keyword-based fallback search using ILIKE.
 * Used when vector search is unavailable or fails.
 */
export async function keywordSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (terms.length === 0) {
      return { results: [], query, totalResults: 0, tookMs: Date.now() - startTime };
    }

    // Fetch all docs (with optional source filter) then client-filter
    let allDocs;
    if (opts.source) {
      allDocs = (await db.query.documents.findMany())
        .filter(d => (d as any).source === opts.source);
    } else {
      allDocs = await db.query.documents.findMany();
    }

    const filtered = (allDocs || [])
      .map(doc => ({
        content: doc.content,
        similarity: 0,
        metadata: doc.metadata as Record<string, any> | null,
        source: doc.source || null,
        documentId: doc.id,
      }))
      .filter(result =>
        terms.some(term =>
          result.content.toLowerCase().includes(term)
        )
      );

    return {
      results: filtered.slice(0, opts.limit ?? 3),
      query,
      totalResults: filtered.length,
      tookMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Keyword search error:', error);
    return { results: [], query, totalResults: 0, tookMs: Date.now() - startTime };
  }
}

/**
 * Hybrid search: vector search with keyword fallback.
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  return searchDocuments(query, options);
}

/**
 * Search for menu-related documents by category.
 */
export async function searchMenuByCategory(category: string): Promise<SearchResult[]> {
  const result = await searchDocuments(category, {
    limit: 10,
    source: 'menu',
  });
  return result.results;
}
