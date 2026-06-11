// Log WATI webhook payloads for debugging
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Store last 10 webhook payloads in memory (for debugging)
const recentPayloads: Array<{ timestamp: string; payload: any }> = [];
const MAX_STORED = 10;

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let body: any = {};

    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw };
    }

    // Store payload
    recentPayloads.push({
      timestamp: new Date().toISOString(),
      payload: body,
    });

    // Keep only last 10
    if (recentPayloads.length > MAX_STORED) {
      recentPayloads.shift();
    }

    console.log('[WEBHOOK LOGGER] Payload received:', {
      timestamp: new Date().toISOString(),
      keys: Object.keys(body),
      text: body.text,
      type: body.type,
      eventType: body.eventType,
    });

    return NextResponse.json({ status: 'logged', timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Last webhook payloads received',
    data: {
      count: recentPayloads.length,
      payloads: recentPayloads.map(p => ({
        timestamp: p.timestamp,
        eventType: p.payload.eventType,
        type: p.payload.type,
        hasText: Boolean(p.payload.text),
        textValue: typeof p.payload.text === 'string' ? p.payload.text : JSON.stringify(p.payload.text).slice(0, 100),
        waId: p.payload.waId,
        keys: Object.keys(p.payload),
      })),
      fullPayloads: recentPayloads, // Full payload for deep inspection
    },
  });
}
