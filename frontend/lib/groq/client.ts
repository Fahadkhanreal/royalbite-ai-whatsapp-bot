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
  maxTokens: number = 1024
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    return content;
  } catch (error) {
    console.error('Groq API error:', error);
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
