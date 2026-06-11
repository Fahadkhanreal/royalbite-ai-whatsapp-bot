// WhatsApp Webhook handler (WATI compatible)
// Location: app/api/whatsapp/webhook/route.ts
// Handles both WATI webhook (POST) and Meta verification (GET)

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { successResponse, errorResponse } from '@/lib/response';
import { WhatsAppError } from '@/lib/errors';
import { processIncomingMessage } from '@/lib/whatsapp/processor';

/**
 * GET /api/whatsapp/webhook
 * WATI webhook verification (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // WATI verification
    if (mode === 'subscribe' && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('WATI Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json(
      errorResponse(new WhatsAppError('Webhook verification failed')),
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(new WhatsAppError('Webhook verification error')),
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/webhook
 * Receive incoming messages from WATI
 *
 * WATI sends messages in this format:
 * {
 *   "id": "msg_id",
 *   "from": "923001234567",      // Sender's number
 *   "text": "Hello",              // Message text
 *   "timestamp": "1234567890"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('WATI webhook received:', JSON.stringify(body).slice(0, 500));

    // WATI format: { id, from, text, timestamp }
    // or array of messages
    const messages = Array.isArray(body) ? body : [body];

    const results = await Promise.allSettled(
      messages.map((msg: any) => {
        // Convert WATI format to internal format
        const internalMsg = {
          from: msg.from,
          id: msg.id,
          timestamp: msg.timestamp || String(Date.now()),
          text: { body: msg.text || '' },
          type: 'text',
        };
        const metadata = {
          phone_number_id: msg.from || '',
          display_phone_number: msg.from || '',
        };
        return processIncomingMessage(internalMsg, metadata);
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Message processing failed:', result.reason);
      }
    }

    return NextResponse.json(
      successResponse({ processed: messages.length, status: 'ok' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('WATI webhook error:', error);
    return NextResponse.json(
      successResponse({ status: 'acknowledged' }),
      { status: 200 }
    );
  }
}
