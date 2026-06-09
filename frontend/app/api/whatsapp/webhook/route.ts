// WhatsApp Webhook handler
// Location: app/api/whatsapp/webhook/route.ts
// Meta WhatsApp Cloud API webhook - handles both GET (verification) and POST (messages)

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { successResponse, errorResponse } from '@/lib/response';
import { WhatsAppError } from '@/lib/errors';
import { processIncomingMessage } from '@/lib/whatsapp/processor';
import { whatsappRateLimit } from '@/lib/middleware/rateLimit';

/**
 * GET /api/whatsapp/webhook
 *
 * WhatsApp Cloud API webhook verification.
 * Meta sends a GET request with hub.challenge to verify the webhook endpoint.
 *
 * Query Params:
 *   hub.mode: string (should be 'subscribe')
 *   hub.verify_token: string (should match WHATSAPP_WEBHOOK_VERIFY_TOKEN)
 *   hub.challenge: string (echo this back to verify)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, tokenProvided: !!token, challengeProvided: !!challenge });

    // Verify mode and token
    if (mode === 'subscribe' && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    // Verification failed
    console.warn('Webhook verification failed - invalid token or mode');
    return NextResponse.json(
      errorResponse(new WhatsAppError('Webhook verification failed')),
      { status: 403 }
    );
  } catch (error) {
    console.error('Webhook GET error:', error);
    return NextResponse.json(
      errorResponse(new WhatsAppError('Webhook verification error')),
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/webhook
 *
 * Receive incoming WhatsApp messages from Meta Cloud API.
 * Processes text messages, detects intent, and generates responses.
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = whatsappRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse the incoming webhook payload
    const body = await request.json();

    console.log('WhatsApp webhook received:', JSON.stringify(body).slice(0, 500));

    // Extract message from Meta's webhook payload format
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) {
      return NextResponse.json(
        successResponse({ status: 'no_message' }),
        { status: 200 }
      );
    }

    // Check for incoming messages
    const messages = value.messages;
    if (!messages || messages.length === 0) {
      // Could be a status update, just acknowledge
      return NextResponse.json(
        successResponse({ status: 'acknowledged' }),
        { status: 200 }
      );
    }

    // Process each incoming message
    const results = await Promise.allSettled(
      messages.map((msg: any) => processIncomingMessage(msg, value.metadata))
    );

    // Log any failures
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Message processing failed:', result.reason);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      successResponse({
        processed: messages.length,
        status: 'ok',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('WhatsApp webhook POST error:', error);

    // Always return 200 to prevent Meta from retrying endlessly
    return NextResponse.json(
      successResponse({ status: 'acknowledged' }),
      { status: 200 }
    );
  }
}
