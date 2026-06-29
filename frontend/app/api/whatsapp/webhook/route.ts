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

    // DEDUPLICATION CHECK - Create stable messageId (NO TIMESTAMP!)
    let messageId = parsed.messageId;
    if (!messageId) {
      // CRITICAL FIX: Use phone + message text ONLY (no timestamp)
      // Same message from same user = ALWAYS same ID
      // This blocks ALL duplicate webhooks for the same message
      messageId = `${from}-${msgText}`;
    }

    // LAYER 1: IN-MEMORY DEDUP - Blazing fast, works for same-Vercel-instance duplicates
    // Green API often sends duplicates within milliseconds to the same instance
    const dedupKey = `${from}:${msgText}`;
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

    // LAYER 2: ATOMIC DATABASE DEDUP - Works across all Vercel instances
    // Raw SQL INSERT ... ON CONFLICT DO NOTHING fixes race condition
    // PostgreSQL unique constraint handles this atomically at DB level
    //
    // CRITICAL: messageId = `${from}-${msgText}` means same user saying "hi" again reuses same ID.
    // If old entry exists from hours ago, we must ALLOW re-processing, not block it forever.
    try {
      const result = await db.execute(sql`
        INSERT INTO processed_webhooks (message_id, phone_number, message_preview)
        VALUES (${messageId}, ${from}, ${msgText.slice(0, 100)})
        ON CONFLICT (message_id) DO NOTHING
        RETURNING id
      `);

      // If no row returned, this is a potential duplicate (unique constraint blocked the insert)
      if (!result.rows || result.rows.length === 0) {
        // But it could be an OLD entry from a prior session, not a genuine webhook duplicate
        // Check when the existing entry was created
        const existing = await db.execute(sql`
          SELECT id, processed_at FROM processed_webhooks
          WHERE message_id = ${messageId}
          LIMIT 1
        `);

        const existingRow = existing.rows?.[0] as { id: string; processed_at: string } | undefined;
        if (existingRow) {
          const createdAt = new Date(existingRow.processed_at).getTime();
          const ageSeconds = (Date.now() - createdAt) / 1000;

          if (ageSeconds > 120) {
            // Old entry (> 2 min) — this is a NEW message with same text, not a webhook duplicate
            // Delete old entry and re-insert to allow processing
            console.info('[WEBHOOK] OLD ENTRY FOUND, RE-PROCESSING:', {
              messageId: messageId.slice(0, 30),
              ageSeconds: Math.round(ageSeconds),
            });

            await db.execute(sql`
              DELETE FROM processed_webhooks WHERE message_id = ${messageId}
            `);

            await db.execute(sql`
              INSERT INTO processed_webhooks (message_id, phone_number, message_preview)
              VALUES (${messageId}, ${from}, ${msgText.slice(0, 100)})
            `);
          } else {
            // Recent entry (< 2 min) — genuine webhook duplicate, block it
            console.info('[WEBHOOK] DUPLICATE MESSAGE BLOCKED (ATOMIC DB):', {
              messageId: messageId.slice(0, 30),
              from: `${from.slice(0, 6)}xxx`,
              message: msgText.slice(0, 30),
              ageSeconds: Math.round(ageSeconds),
            });
            return new Response(JSON.stringify({ status: 'ok', reason: 'duplicate_blocked' }), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
        } else {
          // Shouldn't happen, but just in case
          console.warn('[WEBHOOK] Conflict but no existing row found, skipping:', messageId.slice(0, 30));
          return new Response(JSON.stringify({ status: 'ok', reason: 'duplicate_unknown' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
      }

      console.info('[WEBHOOK] Message marked as processing in database:', {
        messageId: messageId.slice(0, 30),
      });

      // Cleanup old messages (async, don't wait)
      cleanupOldMessages().catch(err => console.error('[WEBHOOK] Cleanup error:', err));
    } catch (dedupError) {
      console.error('[WEBHOOK] Deduplication failed:', dedupError);
      // If dedup fails, continue anyway (better to risk duplicate than block all messages)
    }

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
