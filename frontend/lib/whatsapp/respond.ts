// Groq response generation for WhatsApp bot
// Location: lib/whatsapp/respond.ts
// Generates contextual replies using RAG + Groq LLM

import { generateResponse } from '@/lib/groq/client';
import { hybridSearch } from '@/lib/rag/search';
import { getGreetingResponse, IntentResult } from './intent';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { getConversationState, setConversationState, clearConversationState } from './conversation-state';
import { extractOrderDetails, createOrder, formatOrderConfirmation } from './order-handler';

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
- If user writes in Urdu script (اردو), reply in Urdu script

LANGUAGE SCRIPT RULES (CRITICAL):
- Roman Urdu = Latin alphabet ONLY (a-z characters). Examples:
  * "Peer se Jumma: 11:00 AM se 10:00 PM" ✓
  * "Timings: Subah 11 baje se raat 10 baje tak" ✓
  * "Aap kab visit karna chahte hain?" ✓
- NEVER use Hindi/Devanagari script (समवार, शुक्रवार, etc.) ✗
- NEVER use Urdu script (پیر سے جمعہ) unless user writes in Urdu script ✗
- Only THREE valid options:
  1. Roman Urdu (Latin letters: Peer, Jumma, subah, raat, kya, hai)
  2. English (Monday, Friday, morning, night, what, is)
  3. Urdu script (only if user uses Urdu script)

PROHIBITED:
- Hindi Devanagari script in ANY response (Somvaar, Shukravaar, etc.)
- Mixing scripts (Roman + Devanagari in same message)

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
  intent: IntentResult,
  userId?: string
): Promise<string> {
  try {
    // Extract userId from phone number (will be passed from webhook)
    const conversationUserId = userId || 'unknown';

    // Check if user is in middle of an order flow
    const conversationState = getConversationState(conversationUserId);

    if (conversationState?.state === 'awaiting_order_details') {
      // User is providing order details
      const extracted = extractOrderDetails(userMessage);

      if (extracted.hasAllDetails) {
        // All details present, create order
        try {
          // Get item details from context (simplified - match by name)
          const itemName = extracted.items[0]; // First matched item
          const quantity = extracted.quantity || 1;

          // Fetch item price (check admin menu first, then documents)
          const dishMatch = await db.query.dishes.findFirst({
            where: (dishes, { and, eq, ilike }) =>
              and(
                ilike(dishes.name, `%${itemName}%`),
                eq(dishes.isAvailable, true)
              ),
          });

          const price = dishMatch ? parseFloat(dishMatch.price) : 250; // Default fallback
          const displayName = dishMatch ? dishMatch.name : itemName;

          // Create order
          const orderResult = await createOrder({
            items: [{ name: displayName, quantity, price }],
            address: extracted.address!,
            phoneNumber: conversationUserId,
          });

          // Clear conversation state
          clearConversationState(conversationUserId);

          // Return confirmation
          return formatOrderConfirmation(
            orderResult.orderNumber,
            [{ name: displayName, quantity, price }],
            orderResult.total,
            extracted.address!
          );
        } catch (error) {
          console.error('Order creation failed:', error);
          clearConversationState(conversationUserId);
          return `Sorry, order create karte waqt issue aa gaya. Please try again ya call karein!`;
        }
      } else {
        // Missing details, ask for them
        const missing: string[] = [];
        if (extracted.items.length === 0) missing.push('item name');
        if (!extracted.quantity) missing.push('quantity');
        if (!extracted.address) missing.push('address');

        return `Thoda aur detail chahiye 😊\n\nPlease bataiye:\n${
          missing.includes('item name') ? '- Kya order karna hai?\n' : ''
        }${
          missing.includes('quantity') ? '- Kitne plate/piece?\n' : ''
        }${
          missing.includes('address') ? '- Delivery address?\n' : ''
        }\nExample: "2 chicken biryani, House 123 Block 5 Gulshan"`;
      }
    }

    // Handle order cancellation
    if (intent.action === 'cancel_order') {
      // Extract order number from message
      const orderNumberMatch = userMessage.match(/[a-f0-9]{6}/i);

      if (orderNumberMatch) {
        const orderNumber = orderNumberMatch[0].toUpperCase();

        try {
          // Find order by last 6 chars of ID (case-insensitive)
          const order = await db.query.orders.findFirst({
            where: (orders, { and, eq, ilike }) =>
              and(
                ilike(orders.id, `%${orderNumber.toLowerCase()}`),
                eq(orders.phoneNumber, conversationUserId)
              ),
          });

          if (order && order.status === 'pending') {
            // Update order status to cancelled
            await db.update(orders)
              .set({ status: 'cancelled' })
              .where(eq(orders.id, order.id));

            return `✅ Order #${orderNumber} cancelled successfully.\n\nAgar koi problem thi to please batayein. We're here to help! 😊`;
          } else if (order && order.status !== 'pending') {
            return `Order #${orderNumber} ko cancel nahi kar sakte kyunki yeh already ${order.status} hai. Please call us for assistance.`;
          } else {
            // Order not found - could be wrong number or different phone
            // Try to find user's recent orders to help them
            const recentOrders = await db.query.orders.findMany({
              where: (orders, { and, eq }) =>
                and(
                  eq(orders.phoneNumber, conversationUserId),
                  eq(orders.status, 'pending')
                ),
              orderBy: (orders, { desc }) => [desc(orders.createdAt)],
              limit: 3,
            });

            if (recentOrders.length > 0) {
              const orderList = recentOrders
                .map(o => `#${o.id.slice(-6).toUpperCase()}`)
                .join(', ');
              return `Order #${orderNumber} nahi mila is number par.\n\nAapke recent pending orders:\n${orderList}\n\nIn mein se koi cancel karna chahte hain?`;
            } else {
              return `Order #${orderNumber} nahi mila. Aapke koi pending orders nahi hain is number par.\n\nShayad:\n- Order already cancelled/delivered\n- Order number galat hai\n- Different number se order kiya tha\n\nHelp ke liye call karein!`;
            }
          }
        } catch (error) {
          console.error('Order cancellation failed:', error);
          return `Sorry, order cancel karte waqt technical issue aa gaya. Please call us directly: ${error instanceof Error ? error.message : ''}`;
        }
      } else {
        return `Order cancel karne ke liye order number bataiye.\n\nExample: "cancel order ABC123"`;
      }
    }

    // Handle order intent
    if (intent.action === 'order') {
      const extracted = extractOrderDetails(userMessage);

      if (extracted.hasAllDetails) {
        // User provided everything in one message - process immediately
        try {
          const itemName = extracted.items[0];
          const quantity = extracted.quantity || 1;

          const dishMatch = await db.query.dishes.findFirst({
            where: (dishes, { and, eq, ilike }) =>
              and(
                ilike(dishes.name, `%${itemName}%`),
                eq(dishes.isAvailable, true)
              ),
          });

          const price = dishMatch ? parseFloat(dishMatch.price) : 250;
          const displayName = dishMatch ? dishMatch.name : itemName;

          const orderResult = await createOrder({
            items: [{ name: displayName, quantity, price }],
            address: extracted.address!,
            phoneNumber: conversationUserId,
          });

          return formatOrderConfirmation(
            orderResult.orderNumber,
            [{ name: displayName, quantity, price }],
            orderResult.total,
            extracted.address!
          );
        } catch (error) {
          console.error('Order creation failed:', error);
          return `Sorry, order create karte waqt issue aa gaya. Please try again!`;
        }
      } else {
        // Missing details - enter conversation state and ask
        setConversationState(conversationUserId, 'awaiting_order_details', {
          orderedItem: extracted.items[0] || null,
        });

        return `Bilkul! Order le raha hoon 😊\n\nPlease yeh details de dijiye:\n- Kya order karna hai? (item name)\n- Kitne plate/piece?\n- Aapka delivery address?\n\nExample: "2 chicken biryani, House 123 Block 5 Gulshan"`;
      }
    }

    // Handle greetings with VARIETY and LANGUAGE MATCHING
    if (intent.action === 'greeting') {
      // Detect user's language from greeting message
      const msgLower = userMessage.toLowerCase();
      const isRomanUrdu = msgLower.includes('salam') ||
                          msgLower.includes('assalam') ||
                          msgLower.includes('kaise') ||
                          msgLower.includes('kya hal');

      // Roman Urdu greetings
      const romanUrduGreetings = [
        `${getGreetingResponse()}! RoyalBite mein aapka swagat hai 🍽️ Main aapki kya madad kar sakta hoon?`,
        `Salam! Welcome to RoyalBite 😊 Menu, timings ya order - kuch bhi poochein!`,
        `${getGreetingResponse()}! Kaisi hain aap? Main RoyalBite ka assistant hoon. Kya jaanna chahte hain?`,
        `${getGreetingResponse()} RoyalBite pe aapka swagat hai! Kaise madad kar sakta hoon aaj?`,
        `Assalam o alaikum! Main aapko RoyalBite ke menu aur orders mein madad kar sakta hoon 👋`,
        `${getGreetingResponse()}! Welcome back to RoyalBite. Aaj kya order karna hai?`,
      ];

      // English greetings
      const englishGreetings = [
        `${getGreetingResponse()}! Welcome to RoyalBite 🍽️ How can I help you today?`,
        `Hello! Welcome to RoyalBite 😊 Feel free to ask about our menu, timings, or place an order!`,
        `${getGreetingResponse()}! I'm the RoyalBite assistant. What would you like to know?`,
        `Hi there! Would you like to see our menu or place an order? 🤗`,
        `${getGreetingResponse()}! Welcome back to RoyalBite. Ready to order today?`,
        `Hello! How can I assist you with RoyalBite today? 😊`,
      ];

      // Pick appropriate greeting based on user's language
      const greetings = isRomanUrdu ? romanUrduGreetings : englishGreetings;
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      return randomGreeting;
    }

    if (intent.action === 'thanks') {
      return `You're welcome! It's our pleasure to serve you. If you need anything else, just let us know! Have a great day!`;
    }

    if (intent.action === 'help') {
      return getHelpResponse();
    }

    // SPECIAL CASE: For menu queries, fetch from BOTH admin menu AND documents
    if (intent.action === 'menu_query') {
      console.info('[RAG] Menu query detected - fetching from admin menu + documents');

      try {
        // 1. Fetch from admin menu (dishes table)
        const adminMenuItems = await db.query.dishes.findMany({
          where: (dishes, { eq }) => eq(dishes.isAvailable, true),
          orderBy: (dishes, { asc }) => [asc(dishes.category)],
        });

        // 2. Fetch from RAG documents (menu items from documents table)
        const ragMenuDocs = await db.query.documents.findMany({
          where: (docs, { eq }) => eq(docs.source, 'menu'),
        });

        console.info('[RAG] Menu sources loaded:', {
          adminItems: adminMenuItems.length,
          ragDocs: ragMenuDocs.length,
        });

        // Build combined menu context - OPTIMIZED for speed
        let menuContext = 'RoyalBite Complete Menu:\n\n';

        // Add admin menu items (if any)
        if (adminMenuItems.length > 0) {
          const menuByCategory: Record<string, any[]> = {};
          adminMenuItems.forEach(item => {
            const category = item.category || 'Other';
            if (!menuByCategory[category]) {
              menuByCategory[category] = [];
            }
            menuByCategory[category].push(item);
          });

          for (const [category, items] of Object.entries(menuByCategory)) {
            menuContext += `${category}:\n`;
            items.forEach(item => {
              // Shortened format for speed
              menuContext += `- ${item.name}: Rs. ${item.price}\n`;
            });
            menuContext += '\n';
          }
        }

        // Add RAG document menu items - TRUNCATE if too long
        if (ragMenuDocs.length > 0) {
          const ragContent = ragMenuDocs.map(doc => doc.content).join('\n');
          // Limit to 3000 chars to prevent timeout
          menuContext += ragContent.length > 3000 ? ragContent.slice(0, 3000) + '\n...(more items available)' : ragContent;
        }

        // If no menu items at all
        if (adminMenuItems.length === 0 && ragMenuDocs.length === 0) {
          return `I'm sorry, our menu is being updated right now. Please check back in a few minutes or call us directly!`;
        }

        const context = `${menuContext}\n\nUser question: ${userMessage}`;
        console.info('[RAG] Combined menu context ready:', {
          contextLength: menuContext.length,
          truncated: menuContext.includes('...(more items available)'),
        });

        // Call Groq with 7 second timeout (webhook has 10s total)
        const reply = await generateResponse(SYSTEM_PROMPT, context, 0.7, 1200, 7000);

        if (!reply || reply.trim().length === 0) {
          console.error('[Groq] CRITICAL: Groq returned empty despite no error thrown!');
          return `Thank you for your message! Our team is currently reviewing it and will respond shortly. You can also call us for immediate assistance!`;
        }

        return reply;
      } catch (error) {
        console.error('[RAG] Menu query failed:', error);

        // Timeout or error - send quick fallback
        if (error instanceof Error && error.message.includes('timeout')) {
          console.warn('[RAG] Groq timeout detected - sending fallback menu');

          // Emergency fallback: Send brief menu directly without Groq
          try {
            const quickItems = await db.query.dishes.findMany({
              where: (dishes, { eq }) => eq(dishes.isAvailable, true),
              limit: 10,
            });

            if (quickItems.length > 0) {
              let quickMenu = '📋 RoyalBite Menu:\n\n';
              quickItems.forEach(item => {
                quickMenu += `• ${item.name} - Rs. ${item.price}\n`;
              });
              quickMenu += '\n📞 Call us for complete menu & orders!';
              return quickMenu;
            }
          } catch (dbError) {
            console.error('[RAG] Even fallback failed:', dbError);
          }
        }

        return `Menu load ho raha hai... Thoda slow connection hai. Please try again ya call karein for instant menu! 😊`;
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
