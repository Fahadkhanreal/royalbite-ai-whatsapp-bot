// Comprehensive WhatsApp + RAG pipeline test
import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/groq/client';
import { hybridSearch } from '@/lib/rag/search';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { detectIntent } from '@/lib/whatsapp/intent';
import { generateReply } from '@/lib/whatsapp/respond';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testMsg = searchParams.get('msg') || 'Do you have biryani?';
  const testPhone = searchParams.get('phone') || '';
  const sendMsg = searchParams.get('send') === 'true';

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    testMessage: testMsg,
  };

  // 1. Environment Check
  results.environment = {
    DATABASE_URL: env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    GROQ_API_KEY: env.GROQ_API_KEY ? '✅ Set' : '❌ Missing',
    WHATSAPP_API_TOKEN: env.WHATSAPP_API_TOKEN ? '✅ Set' : '❌ Missing',
    WATI_BASE_URL: env.WATI_BASE_URL || '❌ Missing',
  };

  // 2. Intent Detection Test
  try {
    const intent = await detectIntent(testMsg);
    results.intentDetection = {
      success: true,
      intent: intent.action,
      confidence: intent.confidence,
      entities: intent.entities,
    };
  } catch (e: any) {
    results.intentDetection = { success: false, error: e.message };
  }

  // 3. RAG Search Test
  try {
    const ragResult = await hybridSearch(testMsg, {
      limit: 3,
      minSimilarity: 0.25,
    });
    results.ragSearch = {
      success: true,
      totalResults: ragResult.totalResults,
      tookMs: ragResult.tookMs,
      results: ragResult.results.map(r => ({
        content: r.content.substring(0, 150) + '...',
        similarity: r.similarity,
        source: r.source,
      })),
    };
  } catch (e: any) {
    results.ragSearch = { success: false, error: e.message };
  }

  // 4. Groq Response Generation Test
  try {
    const context = results.ragSearch?.results?.map((r: any) => r.content).join('\n') || 'No context';
    const reply = await generateResponse(
      'You are a friendly Pakistani restaurant assistant. Reply in 2-3 sentences with emojis.',
      `Context: ${context}\n\nUser question: ${testMsg}`,
      0.7,
      200
    );
    results.groqGeneration = {
      success: true,
      reply: reply,
      replyLength: reply.length,
    };
  } catch (e: any) {
    results.groqGeneration = { success: false, error: e.message };
  }

  // 5. Full generateReply Test
  try {
    if (results.intentDetection?.success) {
      const fullReply = await generateReply(testMsg, results.intentDetection.intent);
      results.fullReplyPipeline = {
        success: true,
        reply: fullReply,
      };
    }
  } catch (e: any) {
    results.fullReplyPipeline = { success: false, error: e.message };
  }

  // 6. WhatsApp Send Test (optional)
  if (sendMsg && testPhone) {
    try {
      const reply = results.fullReplyPipeline?.reply || results.groqGeneration?.reply || 'Test message from RoyalBite!';
      await sendWhatsAppMessage(testPhone, reply);
      results.whatsappSend = {
        success: true,
        to: testPhone,
        message: 'Message sent successfully',
      };
    } catch (e: any) {
      results.whatsappSend = { success: false, error: e.message };
    }
  }

  // Summary
  results.summary = {
    pipelineStatus:
      results.environment.DATABASE_URL === '✅ Set' &&
      results.environment.GROQ_API_KEY === '✅ Set' &&
      results.ragSearch?.success &&
      results.groqGeneration?.success
        ? '✅ All systems operational'
        : '❌ Some systems failing',
    ragDataAvailable: (results.ragSearch?.totalResults || 0) > 0,
    recommendedAction:
      (results.ragSearch?.totalResults || 0) === 0
        ? 'Run /api/rag/sync-all to populate RAG database'
        : 'Pipeline looks good! Test with real WhatsApp message',
  };

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
