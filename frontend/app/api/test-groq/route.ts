// Quick Groq API test endpoint
import { generateResponse } from '@/lib/groq/client';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[TEST-GROQ] Starting test...');
    console.log('[TEST-GROQ] API Key:', env.GROQ_API_KEY ? `${env.GROQ_API_KEY.slice(0, 15)}...` : 'MISSING!');
    console.log('[TEST-GROQ] Model:', env.GROQ_MODEL);

    const reply = await generateResponse(
      'You are a helpful assistant.',
      'Say hello in 5 words or less',
      0.7,
      50
    );

    return Response.json({
      success: true,
      reply,
      replyLength: reply.length,
      env: {
        hasApiKey: Boolean(env.GROQ_API_KEY),
        apiKeyPrefix: env.GROQ_API_KEY?.slice(0, 10),
        model: env.GROQ_MODEL,
      },
    });
  } catch (error: any) {
    console.error('[TEST-GROQ] Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack?.slice(0, 500),
      env: {
        hasApiKey: Boolean(env.GROQ_API_KEY),
        apiKeyPrefix: env.GROQ_API_KEY?.slice(0, 10),
        model: env.GROQ_MODEL,
      },
    }, { status: 500 });
  }
}
