// WhatsApp Webhook - Pure WATI handler
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  let from = '';
  let msgText = '';

  try {
    // Read raw body as text
    const raw = await req.text();
    if (!raw || !raw.trim()) {
      return new Response(JSON.stringify({ status: 'empty_body' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Try JSON first
    let body: Record<string, any> = {};
    try {
      body = JSON.parse(raw);
    } catch {
      // Try form-urlencoded
      if (raw.includes('=')) {
        const params = new URLSearchParams(raw);
        for (const [k, v] of params) body[k] = v;
      }
    }

    from = body.from || body.waId || body.sender || '';
    msgText = body.text || body.body || body.message || body.content || '';

    // Meta API format
    if (!from && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const m = body.entry[0].changes[0].value.messages[0];
      from = m.from || '';
      msgText = m.text?.body || '';
    }

    if (!msgText || !from) {
      return new Response(JSON.stringify({ status: 'no_message' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    from = from.replace(/[^0-9]/g, '');

    const intent = await detectIntent(msgText);
    const reply = await generateReply(msgText, intent);
    await sendWhatsAppMessage(from, reply);

    return new Response(JSON.stringify({ status: 'ok', reply_sent: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ status: 'error', error: error.message }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
