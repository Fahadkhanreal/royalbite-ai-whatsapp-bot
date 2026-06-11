// WhatsApp Webhook handler (Meta Cloud API + WATI format)
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  return new NextResponse(challenge || 'ok', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body).slice(0, 300));

    // Support BOTH Meta format AND WATI format
    let from = '';
    let text = '';

    // Format 1: Meta Cloud API format
    // { entry: [{ changes: [{ value: { messages: [{ from, text: { body } }] } }] }] }
    const metaMsg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (metaMsg) {
      from = metaMsg.from || '';
      text = metaMsg.text?.body || '';
    }
    // Format 2: WATI format { id, from, text, timestamp }
    else if (body.from && body.text) {
      from = body.from;
      text = body.text;
    }
    // Format 3: WATI with waId
    else if (body.waId || body.from) {
      from = body.waId || body.from || '';
      text = body.text?.body || body.body || body.text || '';
    }

    if (!text || !from) {
      return NextResponse.json({ status: 'no_message' }, { status: 200 });
    }

    // Clean phone number
    from = from.replace(/[^0-9]/g, '');

    console.log(`Processing: from=${from}, text=${text}`);

    // Detect intent & generate reply
    const intent = await detectIntent(text);
    const reply = await generateReply(text, intent);

    // Send via Meta Cloud API
    await sendWhatsAppMessage(from, reply);

    console.log(`Reply sent: ${reply.slice(0, 50)}...`);
    return NextResponse.json({ status: 'ok', reply_sent: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error?.message || error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}
