// Groq LLM API client wrapper
// Location: lib/groq/client.ts

import Groq from 'groq-sdk';
import { env } from '@/lib/env';

// Initialize Groq client
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

/**
 * Generate response using Groq LLM
 */
export async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7,
  maxTokens: number = 1024,
  timeoutMs: number = 8000 // 8 second timeout to stay under Vercel's 10s limit
): Promise<string> {
  try {
    console.info('[GROQ] Starting request:', {
      model: env.GROQ_MODEL,
      hasApiKey: Boolean(env.GROQ_API_KEY),
      apiKeyPrefix: env.GROQ_API_KEY ? env.GROQ_API_KEY.slice(0, 10) : 'MISSING',
      maxTokens,
      temperature,
      timeoutMs,
    });

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Groq API timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    // Race between API call and timeout
    const completion = await Promise.race([
      groq.chat.completions.create({
        model: env.GROQ_MODEL,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      timeoutPromise,
    ]);

    console.info('[GROQ] Response received:', {
      hasChoices: Boolean(completion.choices?.length),
      choicesCount: completion.choices?.length || 0,
      firstChoiceHasMessage: Boolean(completion.choices?.[0]?.message),
      firstChoiceHasContent: Boolean(completion.choices?.[0]?.message?.content),
    });

    const content = completion.choices[0]?.message?.content;

    console.info('[GROQ] Raw response analysis:', {
      hasContent: Boolean(content),
      contentType: typeof content,
      contentValue: content,
      contentLength: content?.length || 0,
      completionKeys: Object.keys(completion),
      choicesLength: completion.choices?.length,
      finishReason: completion.choices?.[0]?.finish_reason,
    });

    if (!content || content.trim().length === 0) {
      console.error('[GROQ] CRITICAL: Empty or whitespace-only content from Groq!', {
        contentValue: JSON.stringify(content),
        completion: JSON.stringify(completion).slice(0, 500),
        finishReason: completion.choices?.[0]?.finish_reason,
      });
      throw new Error('Empty response from Groq - content is null or empty string');
    }

    console.info('[GROQ] Success:', {
      contentLength: content.length,
      contentPreview: content.slice(0, 100),
    });

    return content.trim();
  } catch (error) {
    console.error('[GROQ] API error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.slice(0, 300) : undefined,
      apiKeySet: Boolean(env.GROQ_API_KEY),
    });
    throw error;
  }
}

/**
 * Chat completion with RAG context
 */
export async function chatWithContext(
  systemPrompt: string,
  contextText: string,
  userQuery: string
): Promise<string> {
  const fullPrompt = `
${systemPrompt}

Context:
${contextText}

User Query: ${userQuery}
`;

  return generateResponse(systemPrompt, fullPrompt, 0.7, 1024);
}

export default groq;
