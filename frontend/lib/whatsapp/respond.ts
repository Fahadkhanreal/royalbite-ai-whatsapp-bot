// Groq response generation for WhatsApp bot
// Location: lib/whatsapp/respond.ts
// Generates contextual replies using RAG + Groq LLM

import { generateResponse } from '@/lib/groq/client';
import { hybridSearch } from '@/lib/rag/search';
import { getGreetingResponse, IntentResult } from './intent';

// System prompt for the RoyalBite WhatsApp bot
const SYSTEM_PROMPT = `You are a friendly and helpful WhatsApp assistant for RoyalBite Restaurant.

Your personality:
- Friendly, warm, and professional
- Use emojis occasionally but naturally
- Keep responses concise (under 200 words) for WhatsApp
- Always represent RoyalBite positively

Your knowledge includes:
- Menu items, prices, and descriptions
- Restaurant timings
- Delivery policies
- FAQ information

Guidelines:
1. If asked about menu items, describe them appetizingly
2. For price inquiries, always mention the price clearly
3. If you don't know something, be honest and offer to connect with staff
4. Never make up information about the restaurant
5. Always end with an offer to help further
6. Use English primarily, with occasional Urdu words like "ji" for warmth

Response format:
- Keep paragraphs short (2-3 sentences max)
- Use bullet points for lists
- Bold item names with asterisks`;

/**
 * Generate a reply to a user message using RAG context
 */
export async function generateReply(
  userMessage: string,
  intent: IntentResult
): Promise<string> {
  try {
    // Handle greetings separately
    if (intent.action === 'greeting') {
      return `${getGreetingResponse()}! Welcome to RoyalBite! How can I help you today? You can ask about our menu, timings, or place an order!`;
    }

    if (intent.action === 'thanks') {
      return `You're welcome! It's our pleasure to serve you. If you need anything else, just let us know! Have a great day!`;
    }

    if (intent.action === 'help') {
      return getHelpResponse();
    }

    // Search RAG for relevant context
    const searchResult = await hybridSearch(userMessage, {
      limit: 3,
      minSimilarity: 0.25, // Lowered from 0.4 for hash-based embeddings
    });

    // Build context from search results
    const contextText = searchResult.results
      .map(r => r.content)
      .join('\n\n');

    // If no context found, return a helpful message
    if (!contextText) {
      return `I'd be happy to help you with that! Unfortunately, I don't have specific information about that right now. Could you please rephrase your question? You can ask about our menu, timings, or place an order.`;
    }

    const context = `Relevant information:\n${contextText}\n\nUser question: ${userMessage}`;

    // Generate response using Groq
    const reply = await generateResponse(SYSTEM_PROMPT, context, 0.7, 300);

    return reply;
  } catch (error) {
    console.error('Response generation failed:', error);

    // Fallback response
    return `Thank you for your message! Our team is currently reviewing it and will get back to you shortly. For immediate assistance, you can call us directly.`;
  }
}

/**
 * Generate a contextual reply with specific RAG results
 */
export async function generateContextualReply(
  userMessage: string,
  ragResults: Array<{ content: string; similarity: number; source: string | null }>
): Promise<string> {
  try {
    const contextText = ragResults
      .filter(r => r.similarity > 0.4)
      .map(r => r.content)
      .join('\n\n');

    if (!contextText) {
      return `I couldn't find specific information about that in our knowledge base. Let me connect you with our team for assistance!`;
    }

    const context = `Relevant information:\n${contextText}\n\nUser question: ${userMessage}`;
    const reply = await generateResponse(SYSTEM_PROMPT, context, 0.7, 300);

    return reply;
  } catch (error) {
    console.error('Contextual reply generation failed:', error);
    return `Thank you for reaching out! Our team will assist you shortly.`;
  }
}

/**
 * Get help/options response
 */
function getHelpResponse(): string {
  return [
    '*RoyalBite Bot - Help Guide*',
    '',
    'Here\'s what I can help you with:',
    '',
    '*Menu Queries*',
    'Ask about dishes like "Do you have biryani?" or "What desserts do you serve?"',
    '',
    '*Place Orders*',
    'Say something like "I want to order Chicken Biryani" or "One Sindhi Biryani please"',
    '',
    '*Timings*',
    'Ask "What are your timings?" or "Are you open now?"',
    '',
    '*Contact*',
    'For complex queries, you can call us directly.',
    '',
    'How can I help you?',
  ].join('\n');
}
