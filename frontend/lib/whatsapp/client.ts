/**
 * WhatsApp Client — Green API Integration
 * Sends messages to customers via Green API
 */

const GREEN_API_INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN;

if (!GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN) {
  console.error('[GREEN-API] CRITICAL: GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set in environment!');
}

const GREEN_API_URL = `https://api.green-api.com/waInstance${GREEN_API_INSTANCE_ID}`;

export async function sendWhatsAppMessage(to: string, text: string) {
  if (!GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN) {
    throw new Error('GREEN_API_INSTANCE_ID or GREEN_API_TOKEN environment variable is not set');
  }

  // Ensure text is trimmed and not empty
  const messageText = text.trim();

  if (!messageText || messageText.length === 0) {
    console.error('[GREEN-API] Attempted to send empty message - rejecting');
    throw new Error('Cannot send empty message to WhatsApp');
  }

  // Green API requires chatId in format: "923482240731@c.us"
  const chatId = to.includes('@') ? to : `${to}@c.us`;

  const payload = {
    chatId: chatId,
    message: messageText
  };

  console.info('[GREEN-API] Sending payload:', {
    payload: JSON.stringify(payload),
    chatId: chatId,
    messageLength: messageText.length,
    messagePreview: messageText.slice(0, 100),
  });

  const response = await fetch(`${GREEN_API_URL}/sendMessage/${GREEN_API_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  console.info('[GREEN-API] Response received:', {
    status: response.status,
    ok: response.ok,
    responseData: JSON.stringify(data).slice(0, 300),
  });

  if (!response.ok) {
    console.error('[GREEN-API] Send failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData: JSON.stringify(data),
      sentPayload: JSON.stringify(payload),
    });
    throw new Error(`Green API error: ${response.statusText}`);
  }

  console.info('[GREEN-API] Message sent successfully to', chatId);
  return data;
}
