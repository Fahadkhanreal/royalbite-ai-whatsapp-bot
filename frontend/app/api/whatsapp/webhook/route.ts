// WhatsApp Webhook handler (supports Meta Cloud API + WATI format)
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';
import { detectAndCreateOrder } from '@/lib/orders/createFromWhatsApp';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  return new NextResponse(challenge || 'ok', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Read body as text — Vercel Edge runtime sometimes eats the body on first read
    // so we try request.text() first
    const cloned = request.clone();
    let rawText = '';

    try {
      rawText = await cloned.text();
    } catch {
      // ignore
    }

    if (!rawText || rawText.trim().length === 0) {
      console.log('Webhook: empty body from text(), trying request.json()');
      try {
        const jsonBody = await request.json();
        rawText = JSON.stringify(jsonBody);
      } catch {
        console.log('Webhook: request.json() also failed');
      }
    }

    if (!rawText || rawText.trim().length === 0) {
      console.log('Webhook received empty body');
      return NextResponse.json({ status: 'empty_body' }, { status: 200 });
    }

    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error, raw body:', rawText.slice(0, 300));
      if (rawText.includes('=')) {
        const params = new URLSearchParams(rawText);
        const jsonObj: Record<string, string> = {};
        for (const [key, val] of params.entries()) {
          jsonObj[key] = val;
        }
        body = jsonObj;
      } else {
        return NextResponse.json({ status: 'invalid_json', error: String(parseError) }, { status: 200 });
      }
    }

    console.log('Webhook received:', JSON.stringify(body).slice(0, 500));

    // Extract message from various formats
    let from = '';
    let text = '';

    // Format 1: Meta Cloud API
    const metaMsg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (metaMsg) {
      from = metaMsg.from || '';
      text = metaMsg.text?.body || '';
    }
    // Format 2: WATI standard
    else if (body.from && (body.text || body.body)) {
      from = body.from;
      text = body.text || body.body || '';
    }
    // Format 3: WATI with waId
    else if (body.waId || body.from || body.sender) {
      from = body.waId || body.from || body.sender || '';
      text = body.text?.body || body.body || body.text || body.message || '';
    }
    // Format 4: messages array
    else if (body.messages && Array.isArray(body.messages) && body.messages[0]) {
      const msg = body.messages[0];
      from = msg.from || msg.waId || '';
      text = msg.text?.body || msg.body || msg.text || '';
    }

    if (!from) from = '';
    if (!text) text = '';

    from = from.replace(/[^0-9]/g, '');

    if (!text || !from) {
      console.log('Could not extract message, body keys:', Object.keys(body));
      return NextResponse.json({ status: 'no_message' }, { status: 200 });
    }

    console.log(`Processing: from=${from}, text=${text}`);

    const intent = await detectIntent(text);
    let reply: string;

    if (intent.action === 'order') {
      try {
        const orderResult = await detectAndCreateOrder(text, from);
        if (orderResult.success) {
          const items = orderResult.items || [];
          const total = orderResult.totalPrice || 0;
          const itemList = items
            .map((i: any) => `✅ ${i.name} x${i.quantity || 1} - Rs. ${i.price}`)
            .join('\n');
          reply = [
            '*Order Confirmed!* 🎉',
            '',
            itemList,
            '',
            `*Total: Rs. ${total}*`,
            '',
            `We'll start preparing it right away! Thank you for choosing RoyalBite! 🍽️`
          ].join('\n');
        } else if (orderResult.needsClarification) {
          reply = orderResult.clarificationMessage || 'What would you like to order?';
        } else {
          reply = await generateReply(text, intent);
        }
      } catch (orderErr) {
        console.error('Order processing failed, falling back to RAG:', orderErr);
        reply = await generateReply(text, intent);
      }
    } else {
      reply = await generateReply(text, intent);
    }

    await sendWhatsAppMessage(from, reply);
    console.log(`Reply sent successfully to ${from}`);

    return NextResponse.json({ status: 'ok', reply_sent: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error?.message || error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}
