// WhatsApp Cloud API client (Meta Cloud API)
// Using Meta Cloud API directly - most reliable

import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';

const API_VERSION = 'v22.0';

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/**
 * Send a text message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<WhatsAppResponse> {
  try {
    const phoneNumberId = env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '1113344018536753';
    const token = env.WHATSAPP_API_TOKEN || 'EAAOQjtXsCAcBRsCRiGwXXmQwCCOWanLJ7R5VDKcxZCjsZBJDB9SPsuJf0gpYTspqs0EKPSlqzrEcx7hKoCfSu0D8fY2fnduZA0YcjwqoPJaJrheyJ1cpmB6MVpWAqIFO51RNX7GUargIRTZAC1ooIuAgKsUTAueNtxfg7iwfS4rkZAehZCXa1P2EAjZCyRJmgiestftE1sJAlswEVBjz0T9xSVy7qDKaZB7ZA6tKOjZBgJmST7wgWDMpYtCLGmeGDYSi6GkJZBIz2ZAb8xHmHoUWHVsV';
    const formattedNumber = to.replace(/[^0-9]/g, '');

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'text',
          text: { body: text },
        }),
      }
    );

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

export async function sendWhatsAppAudio(to: string, audioUrl: string): Promise<WhatsAppResponse> {
  try {
    const phoneNumberId = env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '1113344018536753';
    const token = env.WHATSAPP_API_TOKEN || 'EAAOQjtXsCAcBRsCRiGwXXmQwCCOWanLJ7R5VDKcxZCjsZBJDB9SPsuJf0gpYTspqs0EKPSlqzrEcx7hKoCfSu0D8fY2fnduZA0YcjwqoPJaJrheyJ1cpmB6MVpWAqIFO51RNX7GUargIRTZAC1ooIuAgKsUTAueNtxfg7iwfS4rkZAehZCXa1P2EAjZCyRJmgiestftE1sJAlswEVBjz0T9xSVy7qDKaZB7ZA6tKOjZBgJmST7wgWDMpYtCLGmeGDYSi6GkJZBIz2ZAb8xHmHoUWHVsV';
    const formattedNumber = to.replace(/[^0-9]/g, '');

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'audio',
          audio: { link: audioUrl },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new WhatsAppError(`WhatsApp API audio error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof WhatsAppError) throw error;
    throw new WhatsAppError('Failed to send WhatsApp audio message');
  }
}

export async function uploadWhatsAppMedia(fileUrl: string, mimeType: string = 'audio/ogg'): Promise<string> {
  return fileUrl;
}

export async function markAsRead(messageId: string): Promise<void> {}

export function verifyWebhookToken(token: string): boolean {
  return token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
}

export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
