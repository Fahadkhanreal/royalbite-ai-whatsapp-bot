// Force sync all data to RAG
import { NextResponse } from 'next/server';
import { syncAllToRAG } from '@/lib/rag/auto-ingest';

export async function POST() {
  try {
    const results = await syncAllToRAG();

    return NextResponse.json({
      success: true,
      message: 'RAG sync completed successfully',
      data: results,
    });
  } catch (error: any) {
    console.error('RAG sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await syncAllToRAG();

    return NextResponse.json({
      success: true,
      message: 'RAG sync completed successfully',
      data: results,
    });
  } catch (error: any) {
    console.error('RAG sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
