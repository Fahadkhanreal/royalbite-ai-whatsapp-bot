// Groq response generation for WhatsApp bot
// Location: lib/whatsapp/respond.ts
// Generates contextual replies using RAG + Groq LLM

import { generateResponse } from '@/lib/groq/client';
import { hybridSearch } from '@/lib/rag/search';
import { getGreetingResponse, IntentResult } from './intent';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, ilike, sql } from 'drizzle-orm';
import { getConversationState, setConversationState, clearConversationState } from './conversation-state';
import { extractOrderDetails, createOrder, formatOrderConfirmation } from './order-handler';
import { formatMenuForWhatsApp } from './menu-formatter';

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

    // CRITICAL: If user is in order flow AND this message is EXACTLY the same as
    // the one that triggered the state → it's a duplicate webhook, DON'T re-process
    if (conversationState?.state === 'awaiting_order_details' &&
        conversationState?.context?.originalMessage === userMessage) {
      console.info('[RESPOND] Duplicate message detected via conversation state, sending same response as before');
      // Return the same form again — don't process differently
      return `Bilkul order le raha hoon! 😊\n\nMujhe yeh details de dijiye:\n• Kya order karna hai? (item name)\n• Kitne plate/piece?\n• Aapka delivery address?\n\nExample: "2 tikka 3 biryani, House 123 Block 5 Gulshan"`;
    }

    // CRITICAL: Allow user to escape order flow if they change topic
    // If user asks for menu, greeting, help, etc. while in order state, clear it
    if (conversationState?.state === 'awaiting_order_details') {
      const msgLower = userMessage.toLowerCase();
      const hasGreeting = ['hi', 'hello', 'hey', 'salam', 'assalamo'].some(k => msgLower.includes(k));
      const hasItemsWithNumbers = msgLower.match(/\d+\s*(tikka|samosa|biryani|kebab|karahi)/i);

      // Case 1: Greeting only, no items → escape order flow, go to greeting handler
      if (hasGreeting && !hasItemsWithNumbers) {
        console.info('[RESPOND] User escaped order flow with greeting (no items):', intent.action);
        clearConversationState(conversationUserId);
        // Continue to normal greeting handler below
      }
      // Case 2: Greeting + items → process order (mixed message)
      else if (hasGreeting && hasItemsWithNumbers) {
        console.info('[RESPOND] Mixed greeting+order, processing order');
        // Continue to order processing below (not escaped)
      }
      // Case 3: Check if escaping intent (menu/help/timings etc.)
      else {
        const escapingKeywords = ['menu', 'help', 'timings', 'cancel', 'kya hai', 'batao', 'dekhao',
                                  'hi', 'hello', 'hey', 'salam', 'assalamo', 'good morning', 'good evening',
                                  'thanks', 'thank you', 'shukria', 'thankyou'];
        const isEscaping = escapingKeywords.some(keyword => msgLower.includes(keyword)) &&
                          !hasItemsWithNumbers;

        if (isEscaping && ['menu_query', 'greeting', 'help', 'timing', 'thanks'].includes(intent.action)) {
          console.info('[RESPOND] User escaped order flow with intent:', intent.action);
          clearConversationState(conversationUserId);
          // Continue to normal handler below
        } else {
          // User is still in order flow - process order details
          console.info('[RESPOND] Processing order details (ignoring intent detection)');
          const extracted = await extractOrderDetails(userMessage);

          if (extracted.hasAllDetails) {
            try {
              const orderItems: Array<{ name: string; quantity: number; price: number }> = [];
              let totalPrice = 0;

              for (const extItem of extracted.items) {
                const dishMatch = await db.query.dishes.findFirst({
                  where: (dishes, { and, eq, ilike }) =>
                    and(
                      ilike(dishes.name, '%' + extItem.name + '%'),
                      eq(dishes.isAvailable, true)
                    ),
                });

                const price = dishMatch ? parseFloat(dishMatch.price) : 250;
                const displayName = dishMatch ? dishMatch.name : extItem.name;
                orderItems.push({ name: displayName, quantity: extItem.quantity, price });
                totalPrice += price * extItem.quantity;
              }

              const orderResult = await createOrder({
                items: orderItems,
                address: extracted.address,
                phoneNumber: conversationUserId,
              });

              clearConversationState(conversationUserId);
              return formatOrderConfirmation(orderResult.orderNumber, orderItems, orderResult.total, extracted.address);
            } catch (error) {
              console.error('Order creation failed:', error);
              clearConversationState(conversationUserId);
              return 'Sorry, order create karte waqt issue aa gaya. Please try again ya call karein!';
            }
          } else {
            const missing = [];
            if (extracted.items.length === 0) missing.push('Kya order karna hai? (item name)');
            if (!extracted.address) missing.push('Aapka delivery address?');
            return 'Thoda aur detail chahiye \u{1F60A}\n\nPlease bataiye:\n- ' + missing.join('\n- ') + '\n- Kitne plate/piece?\n\nExample: "2 tikka 3 biryani, House 123 Block 5 Gulshan"';
          }
        }
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
          // Must cast UUID to text for LIKE to work
          const order = await db.query.orders.findFirst({
            where: (orders, { and, eq }) =>
              and(
                sql`LOWER(${orders.id}::text) LIKE ${`%${orderNumber.toLowerCase()}`}`,
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
      const extracted = await extractOrderDetails(userMessage);

      if (extracted.hasAllDetails) {
        // User provided everything in one message - process immediately
        try {
          // Build order items with per-item quantities from extractOrderDetails
          const orderItems: Array<{ name: string; quantity: number; price: number }> = [];
          let totalPrice = 0;

          for (const extItem of extracted.items) {
            // Try to find matching dish
            const dishMatch = await db.query.dishes.findFirst({
              where: (dishes, { and, eq, ilike }) =>
                and(
                  ilike(dishes.name, `%${extItem.name}%`),
                  eq(dishes.isAvailable, true)
                ),
            });

            const price = dishMatch ? parseFloat(dishMatch.price) : 250;
            const displayName = dishMatch ? dishMatch.name : extItem.name;

            orderItems.push({ name: displayName, quantity: extItem.quantity, price });
            totalPrice += price * extItem.quantity;
          }

          // Create order with all items
          const orderResult = await createOrder({
            items: orderItems,
            address: extracted.address!,
            phoneNumber: conversationUserId,
          });

          return formatOrderConfirmation(
            orderResult.orderNumber,
            orderItems,
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
          originalMessage: userMessage,
        });

        return `Bilkul order le raha hoon! 😊\n\nMujhe yeh details de dijiye:\n• Kya order karna hai? (item name)\n• Kitne plate/piece?\n• Aapka delivery address?\n\nExample: "2 tikka 3 biryani, House 123 Block 5 Gulshan"`;
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

    // SPECIAL CASE: For menu queries, return INSTANT formatted menu (no Groq needed!)
    if (intent.action === 'menu_query') {
      console.info('[MENU] Menu query detected - returning formatted menu instantly');

      try {
        // Fetch from admin menu (dishes table)
        const adminMenuItems = await db.query.dishes.findMany({
          where: (dishes, { eq }) => eq(dishes.isAvailable, true),
          orderBy: (dishes, { asc }) => [asc(dishes.category)],
        });

        console.info('[MENU] Menu items loaded:', {
          totalItems: adminMenuItems.length,
        });

        // If no menu items
        if (adminMenuItems.length === 0) {
          return `😔 Menu update ho rahi hai abhi. Thodi der mein check karein ya call karein!`;
        }

        // Format menu with beautiful categories and emojis
        const formattedMenu = formatMenuForWhatsApp(adminMenuItems.map(item => ({
          name: item.name,
          price: item.price,
          category: item.category || 'Other',
          description: item.description,
        })));

        console.info('[MENU] Formatted menu ready:', {
          length: formattedMenu.length,
        });

        return formattedMenu;
      } catch (error) {
        console.error('[MENU] Menu query failed:', error);
        return `Menu load ho raha hai... Thoda wait karein ya call karein! 😊`;
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
