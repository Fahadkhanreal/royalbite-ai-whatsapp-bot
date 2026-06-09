// RAG System - Barrel exports
// Location: lib/rag/index.ts

export { chunkText, chunkDocument, chunkMenuItems } from './chunker';
export type { ChunkResult, ChunkerOptions } from './chunker';

export { generateEmbedding, generateEmbeddings, cosineSimilarity } from './embeddings';
export type { EmbeddingOptions } from './embeddings';

export { searchDocuments, keywordSearch, hybridSearch, searchMenuByCategory } from './search';
export type { SearchOptions, SearchResult, SearchResponse } from './search';

export { ingestDocument, ingestDocuments, deleteDocumentEmbeddings, countDocuments, reindexAll } from './ingest';
export type { IngestOptions, IngestResult, BatchIngestResult } from './ingest';

export { createMetadata, validateMetadata, updateMetadata, menuSyncMetadata, faqMetadata, extractTags } from './metadata';
export type { DocumentMetadata, DocumentType, DocumentSource, MetadataValidationResult } from './metadata';
