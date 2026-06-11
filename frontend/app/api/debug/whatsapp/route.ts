// Debug endpoint to test WhatsApp + RAG + Groq pipeline
import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/groq/client';
import { searchDocuments } from '@/lib/rag/search';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg = searchParams.get('msg') || 'Do you have biryani?';
  const to = searchParams.get('to') || '';
  const results: Record<string, any> = {};

  // 1. Test RAG Search
  try {
    const rag = await searchDocuments(msg, { limit: 3, minSimilarity: 0.2 });
    results.ragSearch = { results: rag.results, totalResults: rag.totalResults };
  } catch (e) {
    results.ragSearch = { error: String(e) };
  }

  // 2. Test Groq API
  try {
    const context = results.ragSearch?.results?.map((r: any) => r.content).join('\n') || 'No context found';
    const reply = await generateResponse(
      'You are a friendly restaurant assistant. Reply in 2-3 sentences.',
      `Context: ${context}\n\nUser: ${msg}`,
      0.7, 100
    );
    results.groqReply = { success: true, reply };
  } catch (e) {
    results.groqReply = { error: String(e) };
  }

  // 3. Test WATI send (if phone number provided)
  if (to) {
    try {
      const res = await sendWhatsAppMessage(to, 'Debug test from RoyalBite');
      results.watiSend = { success: true };
    } catch (e) {
      results.watiSend = { error: String(e) };
    }
  }

  return NextResponse.json({ success: true, data: results });
}
