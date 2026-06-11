// WhatsApp API client (WATI-only)
import { env } from '@/lib/env';
import { WhatsAppError } from '@/lib/errors';

const WATI_BASE_URL = 'https://live-mt-server.wati.io/10180462';
const WATI_TOKEN = 'wati_6be060f6-5221-42f9-9f1a-72ef746b9baf.-5Hpdc3_Sis1yZRBVu8z0V082Ol12DmI0LSIesbk-idp96KuYF3AZ-oaY_4Cu2BoudQryFomfNU3QkxiiuSvvfrJNReLbDtUgoypc6UQm5HQquZ4oK4SJzsik86MyDI3';

interface WhatsAppResponse {
  result: boolean;
  info?: string;
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<WhatsAppResponse> {
  const formattedNumber = to.replace(/[^0-9]/g, '');

  const response = await fetch(
    `${WATI_BASE_URL}/api/v1/sendSessionMessage/${formattedNumber}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WATI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageText: text }),
    }
  );

  const data = await response.json();

  if (!data.result) {
    console.error('WATI send error:', data.info);
    // Don't throw — WATI returns 200 even on fail
  }

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
