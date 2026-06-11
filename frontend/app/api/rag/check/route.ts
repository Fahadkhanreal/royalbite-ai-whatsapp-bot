// Check RAG database status
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Count total documents
    const totalDocs = await db.select({ count: sql<number>`count(*)` }).from(documents);

    // Count by source
    const bySource = await db
      .select({
        source: documents.source,
        count: sql<number>`count(*)`,
      })
      .from(documents)
      .groupBy(documents.source);

    // Get sample documents
    const samples = await db
      .select({
        id: documents.id,
        content: sql<string>`substring(${documents.content}, 1, 100)`,
        source: documents.source,
      })
      .from(documents)
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments: totalDocs[0]?.count || 0,
        bySource: bySource,
        samples: samples,
      },
    });
  } catch (error: any) {
    console.error('RAG check failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}
