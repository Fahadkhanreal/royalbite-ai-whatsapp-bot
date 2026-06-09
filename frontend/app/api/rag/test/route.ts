// GET /api/rag/test - Test and verify RAG system functionality
// Location: app/api/rag/test/route.ts
// Used for development and debugging RAG pipeline

import { NextRequest, NextResponse } from 'next/server';
import { chunkText, chunkDocument } from '@/lib/rag/chunker';
import { generateEmbedding, cosineSimilarity } from '@/lib/rag/embeddings';
import { searchDocuments } from '@/lib/rag/search';
import { ingestDocument } from '@/lib/rag/ingest';
import { countDocuments } from '@/lib/rag/ingest';
import { successResponse, errorResponse } from '@/lib/response';
import { RAGError } from '@/lib/errors';

/**
 * GET /api/rag/test
 *
 * Test the full RAG pipeline: chunking embeddings search
 * Query params:
 *   - mode: 'chunk' | 'embed' | 'search' | 'full' | 'stats' (default: 'stats')
 *   - text: Sample text to test chunking/embedding
 *   - query: Sample query for search test
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'stats';
    const text = searchParams.get('text') || 'RoyalBite offers delicious Sindhi Biryani with fragrant basmati rice.';
    const query = searchParams.get('query') || 'Do you have biryani?';

    switch (mode) {
      case 'chunk':
        return await testChunking(text);
      case 'embed':
        return await testEmbedding(text);
      case 'search':
        return await testSearch(query);
      case 'full':
        return await testFullPipeline(text, query);
      case 'stats':
      default:
        return await getSystemStats();
    }
  } catch (error) {
    console.error('RAG test error:', error);

    if (error instanceof RAGError) {
      return NextResponse.json(
        errorResponse(error),
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      errorResponse(new RAGError('Test failed')),
      { status: 500 }
    );
  }
}

/**
 * Test text chunking
 */
async function testChunking(text: string) {
  const result = chunkText(text, {
    chunkSize: 100,
    chunkOverlap: 20,
  });

  return NextResponse.json(
    successResponse({
      mode: 'chunk',
      input: {
        originalLength: text.length,
        text: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
      },
      output: {
        totalChunks: result.metadata.totalChunks,
        avgChunkSize: result.metadata.avgChunkSize,
        chunks: result.chunks.map((chunk, i) => ({
          index: i,
          length: chunk.length,
          preview: chunk.slice(0, 100) + (chunk.length > 100 ? '...' : ''),
        })),
      },
    })
  );
}

/**
 * Test embedding generation
 */
async function testEmbedding(text: string) {
  const embedding = await generateEmbedding(text);

  // Generate a second embedding from similar text for similarity test
  const similarEmbedding = await generateEmbedding(
    text.replace('Sindhi Biryani', 'Chicken Biryani')
  );

  // Generate embedding from different text
  const differentEmbedding = await generateEmbedding(
    'RoyalBite restaurant timings are 11 AM to 10 PM daily.'
  );

  const similarity = cosineSimilarity(embedding, similarEmbedding);
  const dissimilarity = cosineSimilarity(embedding, differentEmbedding);

  return NextResponse.json(
    successResponse({
      mode: 'embed',
      input: {
        text: text.slice(0, 100),
        textLength: text.length,
      },
      output: {
        dimensions: embedding.length,
        vectorPreview: embedding.slice(0, 5),
        magnitude: Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)),
        similarityTest: {
          similarTextSimilarity: similarity.toFixed(4),
          differentTextSimilarity: dissimilarity.toFixed(4),
          expectedBehavior: similarity > dissimilarity
            ? 'PASS: Similar texts have higher similarity'
            : 'WARN: Similar texts should have higher similarity than different texts',
        },
      },
    })
  );
}

/**
 * Test search functionality
 */
async function testSearch(query: string) {
  const result = await searchDocuments(query, {
    limit: 5,
    minSimilarity: 0.3,
  });

  return NextResponse.json(
    successResponse({
      mode: 'search',
      input: { query },
      output: {
        totalResults: result.totalResults,
        tookMs: result.tookMs,
        results: result.results.map(r => ({
          content: r.content.slice(0, 150),
          similarity: r.similarity.toFixed(4),
          source: r.source,
        })),
      },
    })
  );
}

/**
 * Run full pipeline test
 */
async function testFullPipeline(text: string, query: string) {
  // Step 1: Ingest test document
  const ingestResult = await ingestDocument(text, {
    source: 'test',
    metadata: { type: 'menu', category: 'test' },
  });

  // Step 2: Search for it
  const searchResult = await searchDocuments(query, {
    limit: 3,
    minSimilarity: 0.3,
  });

  return NextResponse.json(
    successResponse({
      mode: 'full',
      pipeline: {
        ingest: {
          chunksCreated: ingestResult.chunksCreated,
          embeddingsGenerated: ingestResult.embeddingsGenerated,
        },
        search: {
          query,
          totalResults: searchResult.totalResults,
          tookMs: searchResult.tookMs,
          results: searchResult.results.map(r => ({
            similarity: r.similarity.toFixed(4),
            content: r.content.slice(0, 200),
          })),
        },
      },
    })
  );
}

/**
 * Get RAG system stats
 */
async function getSystemStats() {
  const docCount = await countDocuments();

  return NextResponse.json(
    successResponse({
      mode: 'stats',
      system: {
        status: 'healthy',
        documentsInStore: docCount,
        embeddingDimensions: 768,
        maxSearchResults: 10,
        version: '1.0.0',
      },
      endpoints: {
        ingest: 'POST /api/rag/ingest',
        search: 'POST /api/rag/search',
        test: 'GET /api/rag/test',
      },
      sampleCommands: {
        ingest: 'POST /api/rag/ingest with { "content": "text", "type": "menu" }',
        search: 'POST /api/rag/search with { "query": "Do you have biryani?", "limit": 3 }',
      },
    })
  );
}
