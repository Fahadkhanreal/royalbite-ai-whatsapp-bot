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

  console.info('[WATI] Attempting to send message:', {
    to: `${formattedNumber.slice(0, 6)}xxx`,
    textLength: text?.length || 0,
    textPreview: text ? text.slice(0, 100) : 'EMPTY!',
    textType: typeof text,
  });

  if (!env.WHATSAPP_API_TOKEN) {
    throw new WhatsAppError('WHATSAPP_API_TOKEN is not configured');
  }

  if (!formattedNumber) {
    throw new WhatsAppError('WhatsApp recipient number is missing');
  }

  if (!text || text.trim().length === 0) {
    console.error('[WATI] ERROR: Reply text is empty!', {
      textValue: text,
      textType: typeof text,
    });
    throw new WhatsAppError('message text can not be empty');
  }

  const payload = { messageText: text.trim() };

  console.info('[WATI] Sending payload:', JSON.stringify(payload).slice(0, 200));

  const response = await fetch(
    `${WATI_BASE_URL}/api/v1/sendSessionMessage/${formattedNumber}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const responseText = await response.text();
  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      result: false,
      info: `Invalid WATI response: ${responseText.slice(0, 200)}`,
    };
  }

  if (!response.ok || !data.result) {
    console.error('[WATI] Send error:', {
      status: response.status,
      to: `${formattedNumber.slice(0, 6)}xxx`,
      info: data.info,
      response: data,
      responseText: responseText.slice(0, 200),
    });
    throw new WhatsAppError(data.info || `WATI send failed with status ${response.status}`);
  }

  console.info('[WATI] Message sent successfully:', {
    to: `${formattedNumber.slice(0, 6)}xxx`,
    status: response.status
  });
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
