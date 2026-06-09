// Text chunking utilities for RAG system
// Location: lib/rag/chunker.ts
// Strategy: Recursive chunking with configurable overlap

export interface ChunkResult {
  chunks: string[];
  metadata: {
    totalChunks: number;
    avgChunkSize: number;
    originalLength: number;
  };
}

export interface ChunkerOptions {
  chunkSize: number;      // Target tokens per chunk
  chunkOverlap: number;   // Overlap between chunks
  minChunkSize: number;   // Minimum characters per chunk after cleanup
}

const DEFAULT_OPTIONS: ChunkerOptions = {
  chunkSize: 512,
  chunkOverlap: 64,
  minChunkSize: 50,
};

// Separator hierarchy for recursive splitting
const SEPARATORS = [
  '\n\n',     // Paragraphs
  '\n',       // Lines
  '. ',       // Sentences
  '! ',       // Exclamations
  '? ',       // Questions
  ', ',       // Clauses
  ' ',        // Words
  '',         // Characters (last resort)
];

/**
 * Count approximate tokens using a simple heuristic.
 * ~4 characters per token for English text.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text by a separator and measure overlap
 */
function splitBySeparator(text: string, separator: string): string[] {
  if (separator === '') {
    // Character-level split
    return Array.from(text);
  }

  const parts: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = text.indexOf(separator, start);
    if (end === -1) {
      parts.push(text.slice(start));
      break;
    }
    parts.push(text.slice(start, end + separator.length));
    start = end + separator.length;
  }

  return parts.filter(p => p.length > 0);
}

/**
 * Recursively chunk text using semantic boundaries.
 *
 * Strategy: Start with paragraph separation, then recursively
 * try smaller separators until chunks fit within chunkSize.
 */
function recursiveChunk(
  text: string,
  options: ChunkerOptions,
  separatorIndex: number = 0
): string[] {
  const { chunkSize, chunkOverlap } = options;

  // If text fits in one chunk, return as-is
  if (estimateTokens(text) <= chunkSize) {
    return [text];
  }

  // If we've exhausted separators, hard-split by tokens
  if (separatorIndex >= SEPARATORS.length) {
    return hardSplit(text, chunkSize, chunkOverlap);
  }

  const separator = SEPARATORS[separatorIndex];
  const parts = splitBySeparator(text, separator);

  // If separator didn't help, try next level
  if (parts.length <= 1) {
    return recursiveChunk(text, options, separatorIndex + 1);
  }

  // Merge small parts together to form chunks
  const merged: string[] = [];
  let current = '';

  for (const part of parts) {
    const combined = current ? current + part : part;

    if (estimateTokens(combined) <= chunkSize) {
      current = combined;
    } else {
      if (current) {
        merged.push(current.trim());
      }
      current = part;
    }
  }

  if (current) {
    merged.push(current.trim());
  }

  // Recursively split any chunks that are still too large
  const result: string[] = [];
  for (const chunk of merged) {
    if (estimateTokens(chunk) > chunkSize) {
      result.push(...recursiveChunk(chunk, options, separatorIndex + 1));
    } else {
      result.push(chunk);
    }
  }

  // Apply overlap
  if (chunkOverlap > 0 && result.length > 1) {
    return applyOverlap(result, chunkOverlap);
  }

  return result;
}

/**
 * Hard-split text by approximate token count
 */
function hardSplit(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const avgCharsPerToken = 4;
  const chunkChars = chunkSize * avgCharsPerToken;
  const overlapChars = chunkOverlap * avgCharsPerToken;

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkChars, text.length);
    chunks.push(text.slice(start, end));
    start += chunkChars - overlapChars;
  }

  return chunks.filter(c => c.length > 0);
}

/**
 * Apply overlap between consecutive chunks
 */
function applyOverlap(chunks: string[], overlapTokens: number): string[] {
  const avgCharsPerToken = 4;
  const overlapChars = overlapTokens * avgCharsPerToken;

  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;

    // Add suffix from previous chunk as overlap
    const previousEnd = chunks[i - 1].slice(-overlapChars);
    return previousEnd + chunk;
  });
}

/**
 * Clean chunk text by normalizing whitespace and trimming
 */
function cleanChunk(chunk: string): string {
  return chunk
    .replace(/\s+/g, ' ')        // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')  // Limit paragraph breaks
    .trim();
}

/**
 * Main chunking function
 *
 * @param text - The text to split into chunks
 * @param options - Optional chunking configuration
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  options: Partial<ChunkerOptions> = {}
): ChunkResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!text || text.trim().length === 0) {
    return {
      chunks: [],
      metadata: {
        totalChunks: 0,
        avgChunkSize: 0,
        originalLength: 0,
      },
    };
  }

  // Normalize text
  const normalized = text.trim();

  // Apply recursive chunking
  const rawChunks = recursiveChunk(normalized, opts);

  // Clean chunks and filter empty/small ones
  const chunks = rawChunks
    .map(cleanChunk)
    .filter(c => c.length >= opts.minChunkSize);

  const totalChunks = chunks.length;
  const totalSize = chunks.reduce((sum, c) => sum + estimateTokens(c), 0);
  const avgChunkSize = totalChunks > 0 ? Math.round(totalSize / totalChunks) : 0;

  return {
    chunks,
    metadata: {
      totalChunks,
      avgChunkSize,
      originalLength: normalized.length,
    },
  };
}

/**
 * Chunk a document into smaller pieces for embedding
 *
 * @param content - Document content
 * @param chunkSize - Max tokens per chunk (default: 512)
 * @param overlap - Overlap tokens (default: 64)
 * @returns Array of chunk strings
 */
export function chunkDocument(
  content: string,
  chunkSize: number = 512,
  overlap: number = 64
): string[] {
  const result = chunkText(content, { chunkSize, chunkOverlap: overlap });
  return result.chunks;
}

/**
 * Split menu items into individual chunks for fine-grained search
 *
 * @param menuItems - Array of menu item descriptions
 * @returns Array of individual item chunks
 */
export function chunkMenuItems(
  menuItems: Array<{ name: string; description?: string | null; price: number; category?: string | null }>
): string[] {
  return menuItems.map(
    item => `${item.name} - ${item.description || ''} - Rs. ${item.price}${item.category ? ` [${item.category}]` : ''}`
  ).filter(Boolean);
}
