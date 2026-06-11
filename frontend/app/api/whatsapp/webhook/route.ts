// WhatsApp Webhook handler (WATI compatible)
// Location: app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';
import { processIncomingMessage } from '@/lib/whatsapp/processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('WATI Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('WATI webhook received:', JSON.stringify(body));

    // WATI can send different formats:
    // 1. { id, from, text, timestamp } — single message
    // 2. [{...}] — array of messages
    // 3. { messages: [{...}] } — wrapped in messages key
    // 4. { entry: [{ changes: [{ value: { messages: [...] } }] }] } — Meta format

    let messages: any[] = [];

    if (body.messages && Array.isArray(body.messages)) {
      // WATI bulk format
      messages = body.messages;
    } else if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      // Meta format (backward compat)
      messages = body.entry[0].changes[0].value.messages;
    } else if (Array.isArray(body)) {
      messages = body;
    } else if (body.id && (body.text || body.body)) {
      messages = [body];
    } else {
      // Unknown format — just ack
      return NextResponse.json({ status: 'no_message' }, { status: 200 });
    }

    const results = await Promise.allSettled(
      messages.map((msg: any) => {
        // Extract text from various formats
        const text = msg.text?.body || msg.text || msg.body || '';
        const from = msg.from || msg.waId || '';

        const internalMsg = {
          from,
          id: msg.id || 'unknown',
          timestamp: msg.timestamp || String(Date.now()),
          text: { body: text },
          type: 'text',
        };
        const metadata = {
          phone_number_id: from,
          display_phone_number: from,
        };
        return processIncomingMessage(internalMsg, metadata);
      })
    );

    // Log results
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Message processing failed:', result.reason);
      }
    }

    return NextResponse.json({ status: 'ok', processed: messages.length }, { status: 200 });
  } catch (error) {
    console.error('WATI webhook error:', error);
    return NextResponse.json({ status: 'acknowledged' }, { status: 200 });
  }
}
