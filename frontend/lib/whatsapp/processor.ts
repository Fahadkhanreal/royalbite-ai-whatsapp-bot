// WhatsApp message processing logic
// Location: lib/whatsapp/processor.ts
// Handles incoming WhatsApp messages, routes to appropriate handlers

import { detectIntent, IntentResult } from './intent';
import { generateReply } from './respond';
import { sendWhatsAppMessage } from './client';
import { logConversation } from './logger';
import { detectAndCreateOrder } from '../orders/createFromWhatsApp';
import { RAGError } from '@/lib/errors';
import { generateAndSendVoice } from './hybridReply';

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: { body: string };
  type: string;
}

export interface WhatsAppMetadata {
  phone_number_id: string;
  display_phone_number: string;
}

/**
 * Process an incoming WhatsApp message
 *
 * Pipeline:
 * 1. Parse message
 * 2. Detect intent
 * 3. Route to appropriate handler
 * 4. Generate response
 * 5. Send reply
 * 6. Log conversation
 */
export async function processIncomingMessage(
  message: WhatsAppMessage,
  metadata: WhatsAppMetadata
): Promise<void> {
  try {
    // Extract message details
    const from = message.from;
    const messageId = message.id;
    const messageText = message.text?.body?.trim() || '';

    if (!messageText) {
      console.log('Empty message received from:', from);
      return;
    }

    console.log(`Processing message from ${from}: "${messageText.slice(0, 100)}"`);

    // Step 1: Detect user intent
    const intent = await detectIntent(messageText);

    // Step 2: Process based on intent
    let responseText: string;
    let shouldSendVoice = false;

    switch (intent.action) {
      case 'order': {
        // Detect and create order from message
        const orderResult = await detectAndCreateOrder(messageText, from);

        if (orderResult.success) {
          responseText = generateOrderConfirmation(orderResult);
          shouldSendVoice = true; // Send voice for order confirmation
        } else if (orderResult.needsClarification) {
          responseText = orderResult.clarificationMessage || 'I need more details about your order.';
        } else {
          responseText = `I'll help you place an order. Please tell me what you'd like to order from our menu.`;
        }
        break;
      }

      default: {
        // Generate reply using RAG context
        responseText = await generateReply(messageText, intent);
        break;
      }
    }

    // Step 3: Send text reply
    await sendWhatsAppMessage(from, responseText);

    // Step 4: Send voice reply for order confirmations
    if (shouldSendVoice) {
      try {
        await generateAndSendVoice(from, responseText);
      } catch (voiceError) {
        console.error('Voice reply failed, text already sent:', voiceError);
        // Don't fail the whole flow if voice fails
      }
    }

    // Step 5: Log the conversation
    await logConversation({
      phoneNumber: from,
      messageText,
      messageType: message.type || 'text',
      intent: intent.action,
      responseText,
    });

    console.log(`Successfully processed message from ${from}`);
  } catch (error) {
    console.error('Message processing pipeline failed:', error);

    // Send a friendly fallback message
    try {
      await sendWhatsAppMessage(
        message.from,
        'Thank you for your message! Our team will get back to you shortly.'
      );
    } catch (sendError) {
      console.error('Failed to send fallback message:', sendError);
    }
  }
}

/**
 * Generate a friendly order confirmation message
 */
function generateOrderConfirmation(orderResult: any): string {
  const items = orderResult.items || [];
  const total = orderResult.totalPrice || 0;

  const itemList = items
    .map((item: any) => `✅ ${item.name} x${item.quantity || 1}`)
    .join('\n');

  return [
    '*Order Confirmed!*',
    '',
    itemList,
    '',
    `*Total: Rs. ${total}*`,
    '',
    `Your order has been placed successfully! We'll start preparing it right away.`,
    `For any updates, we'll message you here. Thank you for choosing RoyalBite!`,
  ].join('\n');
}
