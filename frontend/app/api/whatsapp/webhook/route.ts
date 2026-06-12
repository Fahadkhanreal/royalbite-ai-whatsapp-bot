// WhatsApp Webhook - WATI handler v3.0
// Force rebuild: 2026-06-13T02:35:00Z
// This file MUST generate a new webpack hash
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // Force new deployment

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

type ParsedMessage = {
  from: string;
  msgText: string;
  eventType?: string;
};

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseWatiMessage(body: Record<string, any>): ParsedMessage {
  const data = body.data || body.payload || body.messageData || {};
  const nestedMessage = data.message || body.message || {};
  const textObject = body.text || data.text || nestedMessage.text || {};

  // Extract phone number
  const from =
    getString(body.from) ||
    getString(body.waId) ||
    getString(body.sender) ||
    getString(body.phone) ||
    getString(body.contact?.waId) ||
    getString(body.contact?.phone) ||
    getString(data.from) ||
    getString(data.waId) ||
    getString(data.sender) ||
    getString(data.phone) ||
    getString(data.contact?.waId) ||
    getString(data.contact?.phone) ||
    getString(nestedMessage.from) ||
    getString(nestedMessage.waId);

  // Extract message text - WATI specific parsing
  let msgText = '';

  // Priority 1: Direct text field (WATI sends it here)
  if (typeof body.text === 'string') {
    msgText = body.text.trim();
  } else if (body.text && typeof body.text === 'object' && body.text.body) {
    msgText = getString(body.text.body);
  }

  // Priority 2: Standard fields
  if (!msgText) {
    msgText =
      getString(body.body) ||
      getString(body.content) ||
      getString(body.messageText) ||
      getString(body.message?.text) ||
      getString(body.message?.body) ||
      getString(textObject.body) ||
      getString(data.body) ||
      getString(data.content) ||
      getString(data.messageText) ||
      getString(data.text) ||
      getString(nestedMessage.body) ||
      getString(nestedMessage.content) ||
      getString(nestedMessage.messageText);
  }

  return {
    from,
    msgText,
    eventType: getString(body.eventType) || getString(body.type),
  };
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

    const parsed = parseWatiMessage(body);
    from = parsed.from;
    msgText = parsed.msgText;

    // Debug: Log the actual text field to see what WATI sends
    console.info('[WEBHOOK] Raw payload analysis:', {
      hasBodyText: typeof body.text,
      bodyTextValue: typeof body.text === 'string' ? body.text : JSON.stringify(body.text).slice(0, 100),
      hasBodyBody: typeof body.body,
      eventType: body.eventType,
      type: body.type,
    });

    // Meta API format
    if (!from && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const m = body.entry[0].changes[0].value.messages[0];
      from = getString(m.from);
      msgText = getString(m.text?.body);
    }

    console.info('[WEBHOOK] Message parsed:', {
      eventType: parsed.eventType || 'unknown',
      hasFrom: Boolean(from),
      hasMessage: Boolean(msgText),
      msgTextPreview: msgText ? msgText.slice(0, 50) : 'EMPTY',
      bodyKeys: Object.keys(body).slice(0, 15),
      rawPreview: raw.slice(0, 200),
    });

    if (!msgText || !from) {
      console.warn('[WEBHOOK] Ignored - missing data:', {
        hasFrom: Boolean(from),
        fromValue: from ? `${from.slice(0, 6)}xxx` : 'empty',
        hasMessage: Boolean(msgText),
        msgLength: msgText?.length || 0,
        bodyKeys: Object.keys(body),
      });
      return new Response(JSON.stringify({ status: 'no_message' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    from = from.replace(/[^0-9]/g, '');

    console.info('[WEBHOOK] Processing message:', {
      from: `${from.slice(0, 6)}xxx`,
      messageLength: msgText.length,
      messagePreview: msgText.slice(0, 50),
    });

    const intent = await detectIntent(msgText);
    console.info('[WEBHOOK] Intent detected:', intent);

    const reply = await generateReply(msgText, intent);

    console.info('[WEBHOOK] Reply generated:', {
      replyLength: reply?.length || 0,
      replyPreview: reply ? reply.slice(0, 100) : 'EMPTY OR UNDEFINED!',
      replyType: typeof reply,
      replyTruthy: Boolean(reply),
    });

    if (!reply || reply.trim().length === 0) {
      console.error('[WEBHOOK] CRITICAL: generateReply returned empty!', {
        query: msgText,
        intent: intent.action,
        replyValue: reply,
      });
      // Send fallback message
      const fallbackMsg = 'Thanks for your message! Our team will respond shortly. For urgent queries, please call us.';
      await sendWhatsAppMessage(from, fallbackMsg);

      return new Response(JSON.stringify({
        status: 'ok',
        reply_sent: true,
        warning: 'Used fallback message'
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    await sendWhatsAppMessage(from, reply);
    console.info('[WEBHOOK] Message sent successfully to:', `${from.slice(0, 6)}xxx`);

    return new Response(JSON.stringify({ status: 'ok', reply_sent: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[WEBHOOK] Critical error:', {
      error: error.message,
      stack: error.stack?.slice(0, 200),
      from: from ? `${from.slice(0, 6)}xxx` : 'unknown',
      message: msgText?.slice(0, 50) || 'empty',
    });
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
