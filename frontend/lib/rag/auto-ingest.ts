// Auto-ingestion trigger for RAG system
// Location: lib/rag/auto-ingest.ts
// Automatically re-indexes RAG when menu, timings, or knowledge base updates

import { db } from '@/lib/db';
import { dishes, businessTimings, knowledgeBase } from '@/lib/db/schema';
import { ingestDocument, deleteDocumentEmbeddings } from './ingest';
import { extractMenuForRAG } from './parser';
import { menuSyncMetadata } from './metadata';

const MENU_SOURCE = 'menu_sync';
const TIMINGS_SOURCE = 'timing_sync';
const KNOWLEDGE_SOURCE = 'knowledge_sync';

/**
 * Sync all dishes into RAG vector store.
 * Call this after any menu CRUD operation.
 */
export async function syncMenuToRAG(): Promise<{
  itemsSynced: number;
  chunksCreated: number;
}> {
  try {
    // Delete existing menu embeddings
    await deleteDocumentEmbeddings({ source: MENU_SOURCE });

    // Fetch all dishes then filter for available ones
    const allDishes = (await db.query.dishes.findMany())
      .filter(d => (d as any).isAvailable === true);

    if (allDishes.length === 0) {
      return { itemsSynced: 0, chunksCreated: 0 };
    }

    // Convert dishes to RAG text
    const menuText = extractMenuForRAG(allDishes as any);

    // Ingest into RAG
    const result = await ingestDocument(menuText, {
      source: MENU_SOURCE,
      metadata: {
        type: 'menu',
        category: 'all-menu-items',
      },
    });

    return {
      itemsSynced: allDishes.length,
      chunksCreated: result.chunksCreated,
    };
  } catch (error) {
    console.error('Menu-to-RAG sync failed:', error);
    throw error;
  }
}

/**
 * Sync business timings into RAG vector store.
 */
export async function syncTimingsToRAG(): Promise<{
  daysSynced: number;
  chunksCreated: number;
}> {
  try {
    // Delete existing timing embeddings
    await deleteDocumentEmbeddings({ source: TIMINGS_SOURCE });

    // Fetch all business timings
    const timings = await db.query.businessTimings.findMany({
      orderBy: (timings: any) => timings.dayOfWeek,
    });

    if (timings.length === 0) {
      return { daysSynced: 0, chunksCreated: 0 };
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Convert timings to readable text
    const timingsText = timings
      .map(t => {
        const dayName = days[t.dayOfWeek] || `Day ${t.dayOfWeek}`;
        if (t.isHoliday) {
          return `${dayName}: Closed (Holiday)`;
        }
        return `${dayName}: ${t.openTime} - ${t.closeTime}`;
      })
      .join('\n');

    const finalText = `RoyalBite Restaurant Timings:\n${timingsText}`;

    const result = await ingestDocument(finalText, {
      source: TIMINGS_SOURCE,
      metadata: {
        type: 'timing',
        category: 'business-hours',
      },
    });

    return {
      daysSynced: timings.length,
      chunksCreated: result.chunksCreated,
    };
  } catch (error) {
    console.error('Timings-to-RAG sync failed:', error);
    throw error;
  }
}

/**
 * Sync knowledge base entries into RAG vector store.
 */
export async function syncKnowledgeToRAG(): Promise<{
  entriesSynced: number;
  chunksCreated: number;
}> {
  try {
    // Delete existing knowledge embeddings
    await deleteDocumentEmbeddings({ source: KNOWLEDGE_SOURCE });

    // Fetch all knowledge base entries
    const entries = await db.query.knowledgeBase.findMany();

    if (entries.length === 0) {
      return { entriesSynced: 0, chunksCreated: 0 };
    }

    // Combine all knowledge entries
    const kbText = entries
      .map(e => {
        const parts = [
          e.title ? `Title: ${e.title}` : '',
          `Content: ${e.content}`,
          e.category ? `Category: ${e.category}` : '',
        ];
        return parts.filter(Boolean).join('\n');
      })
      .join('\n\n---\n\n');

    const result = await ingestDocument(kbText, {
      source: KNOWLEDGE_SOURCE,
      metadata: {
        type: 'faq',
        category: 'knowledge-base',
      },
    });

    return {
      entriesSynced: entries.length,
      chunksCreated: result.chunksCreated,
    };
  } catch (error) {
    console.error('Knowledge-to-RAG sync failed:', error);
    throw error;
  }
}

/**
 * Full RAG sync: menu + timings + knowledge base.
 * Call this after initial setup or major data changes.
 */
export async function syncAllToRAG(): Promise<{
  menu: { itemsSynced: number; chunksCreated: number };
  timings: { daysSynced: number; chunksCreated: number };
  knowledge: { entriesSynced: number; chunksCreated: number };
}> {
  const [menu, timings, knowledge] = await Promise.all([
    syncMenuToRAG(),
    syncTimingsToRAG(),
    syncKnowledgeToRAG(),
  ]);

  return { menu, timings, knowledge };
}
