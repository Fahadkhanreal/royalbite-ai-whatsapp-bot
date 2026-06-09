// Document metadata handler for RAG system
// Location: lib/rag/metadata.ts
// Manages document metadata, source tracking, and categorization

export type DocumentType = 'menu' | 'faq' | 'policy' | 'timing' | 'general';
export type DocumentSource = 'manual_upload' | 'menu_sync' | 'admin_panel' | 'system';

export interface DocumentMetadata {
  type: DocumentType;
  source: DocumentSource;
  category?: string;
  title?: string;
  tags?: string[];
  language?: string;
  author?: string;
  version?: number;
  expiresAt?: string;       // ISO date string
  lastReviewedAt?: string;  // ISO date string
  customFields?: Record<string, any>;
}

export interface MetadataValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_TYPES: DocumentType[] = ['menu', 'faq', 'policy', 'timing', 'general'];
const VALID_SOURCES: DocumentSource[] = ['manual_upload', 'menu_sync', 'admin_panel', 'system'];

/**
 * Create document metadata with defaults
 */
export function createMetadata(
  overrides: Partial<DocumentMetadata> = {}
): DocumentMetadata {
  return {
    type: overrides.type || 'general',
    source: overrides.source || 'manual_upload',
    category: overrides.category,
    title: overrides.title,
    tags: overrides.tags || [],
    language: overrides.language || 'en',
    author: overrides.author,
    version: overrides.version || 1,
    expiresAt: overrides.expiresAt,
    lastReviewedAt: overrides.lastReviewedAt || new Date().toISOString(),
    customFields: overrides.customFields,
  };
}

/**
 * Validate document metadata
 */
export function validateMetadata(metadata: any): MetadataValidationResult {
  const errors: string[] = [];

  if (!metadata) {
    return { valid: false, errors: ['Metadata is required'] };
  }

  if (metadata.type && !VALID_TYPES.includes(metadata.type)) {
    errors.push(`Invalid document type: ${metadata.type}. Valid types: ${VALID_TYPES.join(', ')}`);
  }

  if (metadata.source && !VALID_SOURCES.includes(metadata.source)) {
    errors.push(`Invalid source: ${metadata.source}. Valid sources: ${VALID_SOURCES.join(', ')}`);
  }

  if (metadata.tags && !Array.isArray(metadata.tags)) {
    errors.push('Tags must be an array');
  }

  if (metadata.version && (typeof metadata.version !== 'number' || metadata.version < 1)) {
    errors.push('Version must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Update metadata with new values, preserving existing fields
 */
export function updateMetadata(
  existing: DocumentMetadata,
  updates: Partial<DocumentMetadata>
): DocumentMetadata {
  return {
    ...existing,
    ...updates,
    version: (existing.version || 0) + 1,
    lastReviewedAt: new Date().toISOString(),
    customFields: {
      ...(existing.customFields || {}),
      ...(updates.customFields || {}),
    },
  };
}

/**
 * Get metadata for menu synchronisation
 */
export function menuSyncMetadata(
  name: string,
  category?: string
): DocumentMetadata {
  return createMetadata({
    type: 'menu',
    source: 'menu_sync',
    category,
    title: name,
    tags: ['menu', category || 'uncategorized'],
  });
}

/**
 * Get metadata for FAQ documents
 */
export function faqMetadata(category?: string): DocumentMetadata {
  return createMetadata({
    type: 'faq',
    source: 'manual_upload',
    category,
    tags: ['faq', category || 'general'],
  });
}

/**
 * Extract searchable tags from document content
 */
export function extractTags(content: string, existingTags: string[] = []): string[] {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // Get unique words (exclude common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'and', 'or', 'not', 'but', 'if', 'so', 'as', 'than',
  ]);

  const contentTags = words
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 20);

  // Merge with existing tags, remove duplicates
  const merged = new Set([...existingTags, ...contentTags]);
  return Array.from(merged).slice(0, 30);
}
