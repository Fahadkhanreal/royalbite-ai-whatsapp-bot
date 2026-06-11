// WhatsApp Webhook handler (WATI compatible)
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  // Always respond ok for WATI verification
  return new NextResponse(challenge || 'ok', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('WATI webhook received:', JSON.stringify(body));

    // Extract message from various WATI formats
    let from = '';
    let text = '';

    // Format 1: { id, from, text, timestamp }
    if (body.from && body.text) {
      from = body.from;
      text = body.text;
    }
    // Format 2: { messages: [{ from, text }] }
    else if (body.messages?.[0]) {
      from = body.messages[0].from || body.messages[0].waId || '';
      text = body.messages[0].text?.body || body.messages[0].text || body.messages[0].body || '';
    }
    // Format 3: Array
    else if (Array.isArray(body) && body[0]) {
      from = body[0].from || '';
      text = body[0].text || '';
    }
    // Format 4: { body: "...", from: "..." }
    else if (body.body) {
      text = body.body;
      from = body.from || body.waId || '';
    }

    if (!text || !from) {
      return NextResponse.json({ status: 'no_message' }, { status: 200 });
    }

    // Clean phone number
    from = from.replace(/[^0-9]/g, '');
    if (!from.startsWith('92')) from = '92' + from;

    console.log(`Processing: from=${from}, text=${text}`);

    // Intent detection
    const intent = await detectIntent(text);

    // Generate reply (handles greeting, help, order, and RAG + Groq)
    const reply = await generateReply(text, intent);

    // Send reply via WATI
    await sendWhatsAppMessage(from, reply);

    console.log(`Reply sent to ${from}: ${reply.substring(0, 50)}...`);
    return NextResponse.json({ status: 'ok', reply_sent: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error?.message || error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}
