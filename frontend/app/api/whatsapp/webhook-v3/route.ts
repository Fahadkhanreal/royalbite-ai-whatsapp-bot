/**
 * WhatsApp Webhook v3 — Green API Integration
 * Receives incoming messages from Green API and replies using RAG + Groq
 */

import { NextResponse } from 'next/server';
import { detectIntent } from '@/lib/whatsapp/intent';
import { generateReply } from '@/lib/whatsapp/respond';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { isInCooldown, recordResponse, getCooldownRemaining } from '@/lib/whatsapp/cooldown';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

interface GreenAPIWebhook {
  typeWebhook: string;
  instanceData: {
    idInstance: number;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage: string;
  senderData: {
    chatId: string;
    chatName?: string;
    sender: string;
    senderName?: string;
  };
  messageData: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    extendedTextMessageData?: {
      text: string;
    };
  };
}

export async function POST(req: Request) {
  try {
    const body: GreenAPIWebhook = await req.json();

    console.info('[WEBHOOK-V3] Green API webhook received:', {
      typeWebhook: body.typeWebhook,
      timestamp: body.timestamp,
      hasMessageData: Boolean(body.messageData),
      hasSenderData: Boolean(body.senderData),
    });

    // Only process incoming messages
    if (body.typeWebhook !== 'incomingMessageReceived') {
      console.info('[WEBHOOK-V3] Ignoring non-message webhook:', body.typeWebhook);
      return NextResponse.json({ status: 'ignored', reason: 'not_incoming_message' });
    }

    // Extract sender info
    const chatId = body.senderData?.chatId;
    if (!chatId) {
      console.warn('[WEBHOOK-V3] No chatId found in webhook');
      return NextResponse.json({ status: 'error', reason: 'no_chat_id' });
    }

    // Extract phone number (remove @c.us suffix)
    const from = chatId.replace('@c.us', '').replace('@s.whatsapp.net', '');

    // Extract message text
    let msgText = '';

    if (body.messageData?.textMessageData?.textMessage) {
      msgText = body.messageData.textMessageData.textMessage.trim();
    } else if (body.messageData?.extendedTextMessageData?.text) {
      msgText = body.messageData.extendedTextMessageData.text.trim();
    }

    console.info('[WEBHOOK-V3] Parsed message:', {
      from: from,
      chatId: chatId,
      messageType: body.messageData?.typeMessage,
      textLength: msgText.length,
      textPreview: msgText.slice(0, 100),
    });

    // Ignore empty messages
    if (!msgText || msgText.length === 0) {
      console.warn('[WEBHOOK-V3] Empty message received, ignoring');
      return NextResponse.json({ status: 'ignored', reason: 'empty_message' });
    }

    // Detect intent (menu, reservation, hours, etc.)
    console.info('[WEBHOOK-V3] Detecting intent for:', msgText.slice(0, 50));
    const intent = await detectIntent(msgText);
    console.info('[WEBHOOK-V3] Intent detected:', intent);

    // Check cooldown to prevent duplicate responses
    if (isInCooldown(from, intent.action)) {
      const remaining = getCooldownRemaining(from, intent.action);
      console.info('[WEBHOOK-V3] ⏱️ User in cooldown for intent:', {
        user: from,
        intent: intent.action,
        remainingSeconds: remaining,
        message: 'Skipping duplicate response'
      });
      return NextResponse.json({
        status: 'cooldown',
        intent: intent.action,
        remainingSeconds: remaining,
        message: 'Duplicate intent within cooldown period'
      });
    }

    // Generate reply using RAG + Groq
    console.info('[WEBHOOK-V3] Generating reply via RAG + Groq...');
    const reply = await generateReply(msgText, intent);

    // Fallback if reply is empty (should never happen with our safeguards)
    const finalReply = reply && reply.trim().length > 0
      ? reply
      : 'Thanks for your message! Our team will respond shortly.';

    console.info('[WEBHOOK-V3] Reply generated:', {
      replyLength: finalReply.length,
      replyPreview: finalReply.slice(0, 100),
    });

    // Send reply back via Green API
    console.info('[WEBHOOK-V3] Sending reply to', from);
    await sendWhatsAppMessage(from, finalReply);

    // Record response to activate cooldown
    recordResponse(from, intent.action);

    console.info('[WEBHOOK-V3] ✅ Reply sent successfully!');
    return NextResponse.json({
      status: 'success',
      from: from,
      intent: intent,
      replyLength: finalReply.length,
    });

  } catch (error) {
    console.error('[WEBHOOK-V3] ERROR:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.info('[WEBHOOK-V3] GET request received (health check)');
  return NextResponse.json({
    status: 'ok',
    message: 'RoyalBite WhatsApp Webhook v3 (Green API)',
    timestamp: new Date().toISOString(),
  });
}
