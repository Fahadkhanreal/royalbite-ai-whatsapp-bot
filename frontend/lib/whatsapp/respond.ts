// Groq response generation for WhatsApp bot
// Location: lib/whatsapp/respond.ts
// Generates contextual replies using RAG + Groq LLM

import { generateResponse } from '@/lib/groq/client';
import { hybridSearch } from '@/lib/rag/search';
import { getGreetingResponse, IntentResult } from './intent';
import { db } from '@/lib/db';

// System prompt for the RoyalBite WhatsApp bot
const SYSTEM_PROMPT = `You are a friendly and helpful WhatsApp assistant for RoyalBite Restaurant.

Your personality:
- Friendly, warm, and professional
- Use emojis occasionally but naturally
- Keep responses concise (under 200 words) for WhatsApp
- Always represent RoyalBite positively

Your knowledge includes:
- Menu items, prices, and descriptions (from RAG documents)
- Restaurant timings and delivery policies (from RAG documents)
- Current offers, announcements, and policies (from Knowledge Base)
- FAQ information

CRITICAL SCOPE BOUNDARY:
- You can ONLY answer questions about RoyalBite Restaurant (menu, prices, timings, delivery, orders, location, offers, policies)
- For ANY question outside restaurant topics (personal questions, general knowledge, other businesses, people's whereabouts, etc.):
  * Politely decline in the user's language
  * Example (Roman Urdu): "Main sirf RoyalBite restaurant ke baare mein information de sakta hoon 😊 Menu, timings, offers ya delivery ke baare mein kuch poochna chahte hain?"
  * Example (English): "I can only help with RoyalBite restaurant information 😊 Would you like to know about our menu, timings, current offers, or delivery?"
- DO NOT try to answer questions about people, personal matters, or non-restaurant topics
- Redirect conversation back to restaurant services

CRITICAL SCOPE BOUNDARY:
- You can ONLY answer questions about RoyalBite Restaurant (menu, prices, timings, delivery, orders, location)
- For ANY question outside restaurant topics (personal questions, general knowledge, other businesses, people's whereabouts, etc.):
  * Politely decline in the user's language
  * Example (Roman Urdu): "Main sirf RoyalBite restaurant ke baare mein information de sakta hoon 😊 Menu, timings, ya delivery ke baare mein kuch poochna chahte hain?"
  * Example (English): "I can only help with RoyalBite restaurant information 😊 Would you like to know about our menu, timings, or delivery?"
- DO NOT try to answer questions about people, personal matters, or non-restaurant topics
- Redirect conversation back to restaurant services

CRITICAL LANGUAGE RULE:
- ALWAYS reply in the SAME LANGUAGE the user is using
- If user writes in Roman Urdu (e.g., "kya menu ha", "timings batao"), reply in Roman Urdu
- If user writes in English, reply in English
- If user writes in Urdu script, reply in Urdu script
- Use natural, conversational style matching the user's tone

CRITICAL CONTEXT RULE:
- You HAVE access to RoyalBite's actual menu, timings, and information in the "Relevant information" section below
- ALWAYS use the provided context to answer questions
- If menu items, prices, or timings are in the context, USE THEM DIRECTLY
- DO NOT say "I don't have information" if the context contains relevant data
- ONLY say you don't know if the context truly doesn't contain the answer

CRITICAL MENU DISPLAY RULE:
- When user asks for "sara menu", "poora menu", "complete menu", "sab menu", "full menu", or similar:
  * Show ALL menu items from the context
  * Group by category (Biryanis, Main Dishes, Breads, Desserts, Drinks)
  * Include prices for EVERY item
  * DO NOT summarize or show only 2-3 items
  * Show the COMPLETE list

Guidelines:
1. If asked about menu items, describe them appetizingly using the context
2. For price inquiries, mention prices from the context
3. Use the provided context as your PRIMARY source of truth
4. Never make up information not in the context
5. Always end with an offer to help further

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
    // Handle greetings with VARIETY (not hardcoded same response)
    if (intent.action === 'greeting') {
      const greetingVariations = [
        `${getGreetingResponse()}! RoyalBite mein aapka swagat hai 🍽️ Main aapki kya madad kar sakta hoon?`,
        `Salam! Welcome to RoyalBite 😊 Menu, timings ya order - kuch bhi poochein!`,
        `${getGreetingResponse()}! Kaisi hain aap? Main RoyalBite ka assistant hoon. Kya jaanna chahte hain?`,
        `Hello! RoyalBite ke menu, delivery ya timings ke baare mein kuch puchhna hai? 🍛`,
        `${getGreetingResponse()} RoyalBite pe aapka swagat hai! Kaise madad kar sakta hoon aaj?`,
        `Assalam o alaikum! Main aapko RoyalBite ke menu aur orders mein madad kar sakta hoon 👋`,
        `Hi there! Kya aap hamara menu dekhna chahte hain ya order dena? 🤗`,
        `${getGreetingResponse()}! Welcome back to RoyalBite. Aaj kya order karna hai?`,
      ];
      // Pick random greeting each time
      const randomGreeting = greetingVariations[Math.floor(Math.random() * greetingVariations.length)];
      return randomGreeting;
    }

    if (intent.action === 'thanks') {
      return `You're welcome! It's our pleasure to serve you. If you need anything else, just let us know! Have a great day!`;
    }

    if (intent.action === 'help') {
      return getHelpResponse();
    }

    // SPECIAL CASE: For menu queries, fetch ALL menu items (not search-based)
    if (intent.action === 'menu_query') {
      console.info('[RAG] Menu query detected - fetching ALL menu items');
      const allMenuItems = await db.query.documents.findMany({
        where: (docs, { eq }) => eq(docs.source, 'menu'),
      });

      const menuContext = allMenuItems.map(item => item.content).join('\n\n');

      if (menuContext) {
        const context = `RoyalBite Menu (complete list):\n${menuContext}\n\nUser question: ${userMessage}`;
        console.info('[RAG] Menu context loaded:', {
          totalItems: allMenuItems.length,
          contextLength: menuContext.length,
        });
        const reply = await generateResponse(SYSTEM_PROMPT, context, 0.7, 1200);

        if (!reply || reply.trim().length === 0) {
          console.error('[Groq] CRITICAL: Groq returned empty despite no error thrown!');
          return `Thank you for your message! Our team is currently reviewing it and will respond shortly. You can also call us for immediate assistance!`;
        }

        return reply;
      }
    }

    // For other queries, use search + knowledge base
    const searchResult = await hybridSearch(userMessage, {
      limit: 3,
      minSimilarity: 0.25, // Lowered from 0.4 for hash-based embeddings
    });

    console.info('[RAG] Search completed:', {
      query: userMessage.slice(0, 50),
      totalResults: searchResult.totalResults,
      tookMs: searchResult.tookMs,
      hasContext: searchResult.results.length > 0,
      topSimilarity: searchResult.results[0]?.similarity || 0,
    });

    // ALSO fetch from Knowledge Base (offers, policies, announcements)
    const knowledgeEntries = await db.query.knowledgeBase.findMany({
      limit: 5,
      orderBy: (kb, { desc }) => [desc(kb.createdAt)],
    });

    console.info('[Knowledge Base] Fetched entries:', {
      totalEntries: knowledgeEntries.length,
    });

    // Build context from search results
    const contextText = searchResult.results
      .map(r => r.content)
      .join('\n\n');

    // Add knowledge base context
    const knowledgeContext = knowledgeEntries.length > 0
      ? '\n\nCurrent Offers & Announcements:\n' + knowledgeEntries.map(e => `- ${e.title}: ${e.content}`).join('\n')
      : '';

    // If no context found, return a helpful message
    if (!contextText && knowledgeEntries.length === 0) {
      console.warn('[RAG] No context found for query:', userMessage.slice(0, 50));
      return `I'd be happy to help you with that! Unfortunately, I don't have specific information about that right now. Could you please rephrase your question? You can ask about our menu, timings, or place an order.`;
    }

    const context = `Relevant information:\n${contextText}${knowledgeContext}\n\nUser question: ${userMessage}`;

    console.info('[Groq] Generating response with context length:', contextText.length);

    // Generate response using Groq (increased maxTokens from 300 to 800 for better responses)
    const reply = await generateResponse(SYSTEM_PROMPT, context, 0.7, 800);

    console.info('[Groq] Response generated:', {
      replyLength: reply?.length || 0,
      replyType: typeof reply,
      replyValue: reply ? reply.slice(0, 100) : 'NULL_OR_UNDEFINED',
      query: userMessage.slice(0, 50),
    });

    // CRITICAL: Never return empty
    if (!reply || reply.trim().length === 0) {
      console.error('[GROQ] CRITICAL: Groq returned empty despite no error thrown!');
      return `Thank you for your message! Our team is currently reviewing it and will get back to you shortly. For immediate assistance, you can call us directly.`;
    }

    return reply;
  } catch (error) {
    console.error('[RESPOND] Response generation failed:', {
      error: error instanceof Error ? error.message : String(error),
      query: userMessage.slice(0, 50),
      intent: intent.action,
    });

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
