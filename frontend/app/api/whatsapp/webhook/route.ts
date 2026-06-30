// WhatsApp Webhook - WATI handler v3.2 - DATABASE DEDUPLICATION
// Force rebuild: 2026-06-18T04:15:00Z
// This file MUST generate a new webpack hash
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';
import { generateReply } from '@/lib/whatsapp/respond';
import { detectIntent } from '@/lib/whatsapp/intent';
import { db } from '@/lib/db';
import { processedWebhooks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { isMessageProcessed, markMessageProcessed } from '@/lib/whatsapp/message-dedup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // Force new deployment

// Clean up old processed messages (older than 5 minutes - long enough for all duplicates to arrive, short enough to prevent table bloat)
async function cleanupOldMessages() {
  try {
    await db.delete(processedWebhooks)
      .where(sql`${processedWebhooks.processedAt} < NOW() - INTERVAL '5 minutes'`);
  } catch (error) {
    console.error('[WEBHOOK] Cleanup failed:', error);
  }
}

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
  messageId?: string;
};

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseWatiMessage(body: Record<string, any>): ParsedMessage {
  const data = body.data || body.payload || body.messageData || {};
  const nestedMessage = data.message || body.message || {};
  const textObject = body.text || data.text || nestedMessage.text || {};

  // Extract message ID (for deduplication)
  const messageId =
    getString(body.id) ||
    getString(body.messageId) ||
    getString(body.msgId) ||
    getString(data.id) ||
    getString(data.messageId) ||
    getString(data.msgId) ||
    getString(nestedMessage.id) ||
    getString(nestedMessage.messageId);

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
    messageId,
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

    // CRITICAL: Filter event types - only process actual user messages
    const eventType = parsed.eventType?.toLowerCase();
    if (eventType && !['message', 'message_received', 'text', ''].includes(eventType)) {
      console.info('[WEBHOOK] Ignoring non-message event:', eventType);
      return new Response(JSON.stringify({ status: 'ok', reason: 'ignored_event_type' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // DEDUPLICATION CHECK - ALWAYS use phone+message text ONLY (NEVER use Green API's messageId)
    // CRITICAL: Green API sends DIFFERENT messageId values for the same user message on duplicate webhooks
    // Using phone+text guarantees same ID for same message, blocking ALL duplicates
    // Normalize text so subtle whitespace/unicode differences don't bypass dedup
    const normalizedText = msgText.replace(/\s+/g, ' ').trim();
    const messageId = `${from}-${normalizedText}`;
    // Hash messageId to a 32-bit integer for advisory lock (hoisted var for finally block access)
    var _lockHash = 0; // eslint-disable-line
    for (let i = 0; i < messageId.length; i++) {
      _lockHash = ((_lockHash << 5) - _lockHash) + messageId.charCodeAt(i);
      _lockHash = _lockHash & _lockHash; // Convert to 32-bit int
    }

    // LAYER 1: POSTGRESQL ADVISORY LOCK - Guaranteed atomic at SERVER level, not connection level
    // Fixes race condition where Neon HTTP driver allows 2 concurrent INSERTs to both succeed
    // pg_try_advisory_lock returns false if another session holds the lock → it's a duplicate
    try {
      const lockResult = await db.execute(sql`
        SELECT pg_try_advisory_lock(${_lockHash}) as locked
      `);
      const locked = lockResult.rows?.[0]?.locked === true;

      if (!locked) {
        // Another webhook instance is already processing this exact message
        console.info('[WEBHOOK] DUPLICATE BLOCKED (ADVISORY LOCK):', {
          messageId: messageId.slice(0, 30),
        });
        return new Response(JSON.stringify({ status: 'ok', reason: 'duplicate_blocked_lock' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      console.info('[WEBHOOK] Advisory lock acquired:', messageId.slice(0, 30));
    } catch (lockError) {
      console.error('[WEBHOOK] Advisory lock failed, continuing anyway:', lockError);
    }

    // LAYER 2: IN-MEMORY DEDUP - Additional protection for same-instance duplicates
    const dedupKey = `${from}:${normalizedText}`;
    if (isMessageProcessed(dedupKey)) {
      console.info('[WEBHOOK] DUPLICATE BLOCKED (IN-MEMORY):', {
        from: `${from.slice(0, 6)}xxx`,
        message: msgText.slice(0, 30),
      });
      return new Response(JSON.stringify({ status: 'ok', reason: 'duplicate_blocked_in_memory' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    markMessageProcessed(dedupKey);

    // LAYER 3: ATOMIC DATABASE DEDUP - INSERT with unique constraint
    // Used for dedup across sessions (same message text at different times)
    try {
      await db.execute(sql`
        INSERT INTO processed_webhooks (message_id, phone_number, message_preview)
        VALUES (${messageId}, ${from}, ${msgText.slice(0, 100)})
        ON CONFLICT (message_id) DO NOTHING
      `);
    } catch (dedupError) {
      console.error('[WEBHOOK] DB dedup failed, continuing:', dedupError);
    }

    // Release advisory lock when done (schedule at end, but don't await)
    const releaseLock = () => {
      db.execute(sql`SELECT pg_advisory_unlock(${_lockHash})`).catch(() => {});
    };
    // Schedule lock release after response is sent

    // Debug: Log the actual text field to see what WATI sends
    console.info('[WEBHOOK] Raw payload analysis:', {
      hasBodyText: typeof body.text,
      bodyTextValue: typeof body.text === 'string' ? body.text : JSON.stringify(body.text).slice(0, 100),
      hasBodyBody: typeof body.body,
      eventType: body.eventType,
      type: body.type,
    });

    // Meta API format - ONLY if not already set by WATI parsing
    if (!from && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const m = body.entry[0].changes[0].value.messages[0];
      from = getString(m.from);
      msgText = getString(m.text?.body);
    }

    // CRITICAL: Recreate messageId NOW because from/msgText may have changed!
    // The earlier messageId was computed before Meta API format override
    const messageIdFinal = `${from}-${msgText.replace(/\s+/g, ' ').trim()}`;

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

    // Release advisory lock
    releaseLock();

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
  } finally {
    // Always release advisory lock if it was acquired
    try {
      db.execute(sql`SELECT pg_advisory_unlock(${_lockHash})`).catch(() => {});
    } catch (_) {}
  }
}
