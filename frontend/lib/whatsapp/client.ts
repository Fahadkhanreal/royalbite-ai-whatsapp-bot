// WATI WhatsApp API client
// Location: lib/whatsapp/client.ts
// Handles sending messages via WATI API (alternative to Meta Cloud API)

import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';

const WATI_BASE_URL = 'https://live-mt-server.wati.io/10180462';

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  [key: string]: any;
}

/**
 * Send a text message via WATI API
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<WhatsAppResponse> {
  try {
    const formattedNumber = to.replace(/[^0-9]/g, '');

    const response = await fetch(`${WATI_BASE_URL}/api/v1/sendSessionMessage/${formattedNumber}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageText: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WhatsAppError(
        `WATI API error: ${response.status}`,
        { status: response.status, body: errorBody.slice(0, 500) }
      );
    }

    const data = await response.json();
    return data as WhatsAppResponse;
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError(
      'Failed to send WhatsApp message via WATI',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Send a voice/audio message via WATI
 * Note: WATI requires audio URL to be accessible publicly
 */
export async function sendWhatsAppAudio(
  to: string,
  audioUrl: string
): Promise<WhatsAppResponse> {
  try {
    const formattedNumber = to.replace(/[^0-9]/g, '');

    const response = await fetch(`${WATI_BASE_URL}/api/v1/sendSessionMessage/${formattedNumber}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageText: '🔊 *Voice message*',
        audio: audioUrl,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WhatsAppError(
        `WATI API audio error: ${response.status}`,
        { status: response.status, body: errorBody.slice(0, 500) }
      );
    }

    const data = await response.json();
    return data as WhatsAppResponse;
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError(
      'Failed to send WhatsApp audio message via WATI',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Upload media to WATI (for voice messages)
 * WATI accepts public URLs directly, no upload needed
 */
export async function uploadWhatsAppMedia(
  fileUrl: string,
  mimeType: string = 'audio/ogg'
): Promise<string> {
  // WATI uses direct URLs, just return the URL
  return fileUrl;
}

/**
 * Mark message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  // WATI auto-marks as read, no explicit API needed
  console.log('WATI: auto-read enabled, skipping markAsRead');
}

/**
 * Set up WATI webhook
 * WATI will call this URL when messages arrive
 */
export function getWebhookUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp/webhook`
    : 'http://localhost:3000/api/whatsapp/webhook';
}

/**
 * Verify webhook token matches
 */
export function verifyWebhookToken(token: string): boolean {
  return token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
}

/**
 * Format phone number to international format (remove + and spaces)
 */
export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
