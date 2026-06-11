// WhatsApp API client (WATI-only)
import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';

const WATI_BASE_URL = env.WATI_BASE_URL.replace(/\/$/, '');

interface WhatsAppResponse {
  result: boolean;
  info?: string;
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<WhatsAppResponse> {
  const formattedNumber = to.replace(/[^0-9]/g, '');

  if (!env.WHATSAPP_API_TOKEN) {
    throw new WhatsAppError('WHATSAPP_API_TOKEN is not configured');
  }

  if (!formattedNumber) {
    throw new WhatsAppError('WhatsApp recipient number is missing');
  }

  const response = await fetch(
    `${WATI_BASE_URL}/api/v1/sendSessionMessage/${formattedNumber}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageText: text }),
    }
  );

  const data = await response.json().catch(() => ({
    result: false,
    info: `Invalid WATI response with status ${response.status}`,
  }));

  if (!response.ok || !data.result) {
    console.error('WATI send error:', {
      status: response.status,
      to: formattedNumber,
      info: data.info,
      response: data,
    });
    throw new WhatsAppError(data.info || `WATI send failed with status ${response.status}`);
  }

  console.info('WATI message sent:', { to: formattedNumber, status: response.status });
  return data;
}

export async function sendWhatsAppAudio(to: string, audioUrl: string): Promise<any> {
  return { result: false };
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
