// Simulate WhatsApp webhook for local testing
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '923001234567';
  const message = searchParams.get('msg') || 'Do you have biryani?';

  // Simulate WATI webhook payload
  const watiPayload = {
    waId: from,
    text: message,
    eventType: 'message',
    messageText: message,
    from: from,
  };

  try {
    // Call the actual webhook handler
    const webhookUrl = new URL('/api/whatsapp/webhook', request.url);
    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(watiPayload),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Webhook simulation completed',
      webhookResponse: result,
      simulatedPayload: watiPayload,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      simulatedPayload: watiPayload,
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Allow manual POST testing too
  const body = await request.json();

  try {
    const webhookUrl = new URL('/api/whatsapp/webhook', request.url);
    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Webhook test completed',
      webhookResponse: result,
      receivedPayload: body,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      receivedPayload: body,
    }, { status: 500 });
  }
}
