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
    // First check content-type
    const contentType = request.headers.get('content-type') || '';

    // Build body from either JSON or form-data
    let body: Record<string, any> = {};

    if (contentType.includes('json') || contentType.includes('text/plain')) {
      // For JSON, read text first then parse
      try {
        const raw = await request.text();
        if (raw && raw.trim()) {
          body = JSON.parse(raw);
        }
      } catch (e) {
        // fall through to try formData
      }
    }

    // Try formData approach
    if (Object.keys(body).length === 0) {
      try {
        const formData = await request.formData();
        formData.forEach((value, key) => {
          body[key] = value;
        });
      } catch {
        // fall through
      }
    }

    console.log('Webhook body keys:', Object.keys(body), 'content-type:', contentType);

    // Extract message from various formats
    let from = '';
    let msgText = '';

    // WATI format
    if (body.from) {
      from = body.from;
      msgText = body.text || body.body || body.message || '';
    }

    // WATI with waId
    if (!from && body.waId) {
      from = body.waId;
      msgText = body.text || body.body || '';
    }

    // Meta Cloud API
    const metaMsg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (metaMsg) {
      from = metaMsg.from || from;
      msgText = metaMsg.text?.body || msgText;
    }

    // messages array format
    if (!from && body.messages && body.messages[0]) {
      from = body.messages[0].from || '';
      msgText = body.messages[0].text?.body || body.messages[0].text || '';
    }

    // Fallback: check all possible fields
    if (!from) {
      from = body.sender || body.phone || body.waId || '';
    }
    if (!msgText) {
      msgText = body.message || body.content || body.body || '';
    }

    from = (from || '').replace(/[^0-9]/g, '');

    if (!msgText || !from) {
      console.log('Could not extract message from body');
      return NextResponse.json({ status: 'no_message' }, { status: 200 });
    }

    console.log(`Processing: from=${from}, text=${msgText}`);

    const intent = await detectIntent(msgText);
    let reply: string;

    if (intent.action === 'order') {
      try {
        const orderResult = await detectAndCreateOrder(msgText, from);
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
          reply = await generateReply(msgText, intent);
        }
      } catch (orderErr) {
        console.error('Order processing failed, falling back to RAG:', orderErr);
        reply = await generateReply(msgText, intent);
      }
    } else {
      reply = await generateReply(msgText, intent);
    }

    await sendWhatsAppMessage(from, reply);
    console.log(`Reply sent successfully to ${from}`);

    return NextResponse.json({ status: 'ok', reply_sent: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error?.message || error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}
