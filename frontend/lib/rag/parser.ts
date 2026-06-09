// Document upload parsing and text extraction for RAG
// Location: lib/rag/parser.ts
// Handles plain text, PDF extraction, and structured data parsing

import { RAGError } from '@/lib/errors';

export type SupportedFileType = 'txt' | 'json' | 'csv';

export interface ParsedDocument {
  content: string;
  title: string;
  type: SupportedFileType;
  metadata: Record<string, any>;
  chunks?: string[];
}

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Parse uploaded file content for RAG ingestion
 *
 * Supports:
 * - .txt: Plain text
 * - .json: Structured data
 * - .csv: Tabular data (converted to text)
 *
 * For PDF support in production, integrate with pdf-parse library.
 */
export async function parseUploadedFile(
  content: string | Buffer,
  filename: string,
  mimeType?: string
): Promise<ParsedDocument> {
  const fileExt = filename.split('.').pop()?.toLowerCase() as SupportedFileType || 'txt';
  const textContent = typeof content === 'string' ? content : content.toString('utf-8');

  if (textContent.length > MAX_FILE_SIZE) {
    throw new RAGError('File too large. Maximum size is 10MB');
  }

  switch (fileExt) {
    case 'txt':
      return parseTextFile(textContent, filename);
    case 'json':
      return parseJsonFile(textContent, filename);
    case 'csv':
      return parseCsvFile(textContent, filename);
    default:
      // Treat unknown as plain text
      return parseTextFile(textContent, filename);
  }
}

/**
 * Parse plain text file
 */
function parseTextFile(content: string, filename: string): ParsedDocument {
  return {
    content: content.trim(),
    title: filename.replace(/\.txt$/i, ''),
    type: 'txt',
    metadata: {
      filename,
      fileType: 'txt',
      parsedAt: new Date().toISOString(),
    },
  };
}

/**
 * Parse JSON file - converts structured data to text
 */
function parseJsonFile(content: string, filename: string): ParsedDocument {
  try {
    const data = JSON.parse(content);

    // Handle array of items (e.g., menu items)
    if (Array.isArray(data)) {
      const text = data
        .map((item, i) => {
          if (typeof item === 'string') return item;
          return Object.entries(item)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        })
        .join('\n');

      return {
        content: text,
        title: filename.replace(/\.json$/i, ''),
        type: 'json',
        metadata: {
          filename,
          fileType: 'json',
          itemCount: data.length,
          parsedAt: new Date().toISOString(),
        },
      };
    }

    // Handle single object
    if (typeof data === 'object' && data !== null) {
      const text = Object.entries(data)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            return `${key}: ${JSON.stringify(val)}`;
          }
          return `${key}: ${val}`;
        })
        .join('\n');

      return {
        content: text,
        title: data.title || data.name || filename.replace(/\.json$/i, ''),
        type: 'json',
        metadata: {
          filename,
          fileType: 'json',
          ...(data.category ? { category: data.category } : {}),
          parsedAt: new Date().toISOString(),
        },
      };
    }

    // Fallback
    return parseTextFile(JSON.stringify(data, null, 2), filename);
  } catch {
    // If JSON parsing fails, treat as plain text
    return parseTextFile(content, filename);
  }
}

/**
 * Parse CSV file - converts rows to descriptive text
 */
function parseCsvFile(content: string, filename: string): ParsedDocument {
  try {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return parseTextFile(content, filename);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((header, i) => {
        rowObj[header] = values[i] || '';
      });
      return rowObj;
    });

    // Convert to descriptive text
    const text = rows
      .map((row, i) => `Item ${i + 1}: ${Object.values(row).filter(Boolean).join(', ')}`)
      .join('\n');

    return {
      content: text,
      title: filename.replace(/\.csv$/i, ''),
      type: 'csv',
      metadata: {
        filename,
        fileType: 'csv',
        rowCount: rows.length,
        columns: headers,
        parsedAt: new Date().toISOString(),
      },
    };
  } catch {
    // Fallback to plain text on CSV parse failure
    return parseTextFile(content, filename);
  }
}

/**
 * Parse form data from upload request
 */
export async function parseFormData(
  formData: FormData
): Promise<{ documents: ParsedDocument[] }> {
  const documents: ParsedDocument[] = [];
  const entries = Array.from(formData.entries());

  for (const [key, value] of entries) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const parsed = await parseUploadedFile(buffer, value.name, value.type);
      documents.push(parsed);
    }
  }

  return { documents };
}

/**
 * Extract text from structured menu data for RAG
 */
export function extractMenuForRAG(
  items: Array<{
    name: string;
    description?: string | null;
    price: number;
    category?: string | null;
    isAvailable?: boolean | null;
  }>
): string {
  return items
    .filter(item => item.isAvailable !== false)
    .map(item => {
      const parts = [
        `Item: ${item.name}`,
        item.description ? `Description: ${item.description}` : '',
        `Price: Rs. ${item.price}`,
        item.category ? `Category: ${item.category}` : '',
      ];
      return parts.filter(Boolean).join('\n');
    })
    .join('\n\n');
}
