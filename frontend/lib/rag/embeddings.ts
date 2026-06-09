// Embedding generation for RAG system
// Location: lib/rag/embeddings.ts
// Generates vectors for document chunks using real embedding APIs
//
// Strategy (in order of preference):
// 1. OpenAI embeddings (text-embedding-3-small, 512 dims) — best quality
// 2. Groq embeddings (all-MiniLM-L6-v2, 384 dims) — good quality, free tier
// 3. Hash-based deterministic embedding (any dims) — fallback for local dev

import { env } from '@/lib/env';
import { RAGError } from '@/lib/errors';

export interface EmbeddingOptions {
  dimensions?: number;
}

const DEFAULT_OPTIONS: EmbeddingOptions = {
  dimensions: 768, // Must match DB schema (pgvector 768-dim column)
};

/**
 * Generate a vector embedding from text using the best available API.
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { dimensions } = opts;

  if (!text || text.trim().length === 0) {
    throw new RAGError('Cannot generate embedding for empty text');
  }

  // Strategy 1: OpenAI embeddings (best quality)
  if (env.OPENAI_API_KEY) {
    try {
      return await generateOpenAIEmbedding(text, dimensions);
    } catch (error) {
      console.warn('[embeddings] OpenAI failed, trying Groq:', error);
    }
  }

  // Strategy 2: Groq embeddings
  if (env.GROQ_API_KEY) {
    try {
      return await generateGroqEmbedding(text, dimensions);
    } catch (error) {
      console.warn('[embeddings] Groq failed, using hash fallback:', error);
    }
  }

  // Strategy 3: Deterministic hash-based (local development)
  return generateHashEmbedding(text, dimensions);
}

/**
 * Generate embeddings for multiple chunks in parallel
 */
export async function generateEmbeddings(
  chunks: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  if (chunks.length === 0) return [];
  return Promise.all(chunks.map(chunk => generateEmbedding(chunk, options)));
}

// ─── OpenAI Embeddings ────────────────────────────────────────────────

async function generateOpenAIEmbedding(text: string, dimensions: number): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions, // OpenAI supports reducing dimensions natively
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// ─── Groq Embeddings ──────────────────────────────────────────────────

async function generateGroqEmbedding(text: string, dimensions: number): Promise<number[]> {
  // Groq's all-MiniLM-L6-v2 outputs 384-dim vectors
  const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'all-MiniLM-L6-v2',
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq embedding API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const embedding: number[] = data.data[0].embedding;

  // Pad or truncate to match requested dimensions
  if (embedding.length !== dimensions) {
    return resizeVector(embedding, dimensions);
  }

  return embedding;
}

// ─── Hash-based Fallback Embedding ─────────────────────────────────────

function generateHashEmbedding(text: string, dimensions: number): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();
  const nGramSizes = [2, 3, 4];

  function hash(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  }

  for (const n of nGramSizes) {
    for (let i = 0; i <= normalized.length - n; i++) {
      const gram = normalized.slice(i, i + n);
      const h = hash(gram);
      const index = h % dimensions;
      const weight = 1 + (i / normalized.length) * 0.5;
      vector[index] += weight * (h % 3 === 0 ? 1 : -1);
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / magnitude;
    }
  }

  return vector;
}

// ─── Utilities ────────────────────────────────────────────────────────

/**
 * Resize a vector to target dimensions (pad with zeros or truncate)
 */
function resizeVector(vec: number[], target: number): number[] {
  if (vec.length === target) return vec;
  if (vec.length > target) return vec.slice(0, target);
  return [...vec, ...new Array(target - vec.length).fill(0)];
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new RAGError(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}
