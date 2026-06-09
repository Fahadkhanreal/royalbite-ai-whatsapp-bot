// WhatsApp Cloud API client
// Location: lib/whatsapp/client.ts
// Handles sending messages via Meta WhatsApp Cloud API

import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';

const API_VERSION = 'v22.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}`;

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/**
 * Send a text message via WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WhatsAppError(
        `WhatsApp API error: ${response.status}`,
        { status: response.status, body: errorBody.slice(0, 500) }
      );
    }

    const data = await response.json();
    return data as WhatsAppResponse;
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError(
      'Failed to send WhatsApp message',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Send a voice/audio message via WhatsApp
 */
export async function sendWhatsAppAudio(
  to: string,
  audioUrl: string
): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'audio',
        audio: { link: audioUrl },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WhatsAppError(
        `WhatsApp API audio error: ${response.status}`,
        { status: response.status, body: errorBody.slice(0, 500) }
      );
    }

    const data = await response.json();
    return data as WhatsAppResponse;
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError(
      'Failed to send WhatsApp audio message',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Upload media to WhatsApp servers (for voice messages)
 */
export async function uploadWhatsAppMedia(
  fileUrl: string,
  mimeType: string = 'audio/ogg'
): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        type: mimeType,
        link: fileUrl,
      }),
    });

    if (!response.ok) {
      throw new WhatsAppError('Failed to upload media to WhatsApp');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError(
      'Media upload failed',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Mark message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (error) {
    console.error('Failed to mark message as read:', error);
  }
}

/**
 * Verify webhook token matches
 */
export function verifyWebhookToken(token: string): boolean {
  return token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
}

/**
 * Format phone number to WhatsApp international format
 */
export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
