// Test WATI API token validity
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testPhone = searchParams.get('phone') || '923001234567';
  const customToken = searchParams.get('token') || '';

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  // Check environment variables
  results.environment = {
    WATI_BASE_URL: env.WATI_BASE_URL || '❌ Missing',
    WHATSAPP_API_TOKEN: env.WHATSAPP_API_TOKEN ?
      `✅ Set (${env.WHATSAPP_API_TOKEN.slice(0, 20)}...)` :
      '❌ Missing',
  };

  // Test token
  const tokenToTest = customToken || env.WHATSAPP_API_TOKEN;

  if (!tokenToTest) {
    return NextResponse.json({
      success: false,
      error: 'No token available to test',
      environment: results.environment,
    }, { status: 400 });
  }

  // Test 1: Send test message via WATI API
  try {
    const response = await fetch(
      `${env.WATI_BASE_URL}/api/v1/sendSessionMessage/${testPhone}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToTest}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageText: '🧪 Test message from RoyalBite token validator',
        }),
      }
    );

    const responseText = await response.text();
    let data: any = {};

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    results.watiTest = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: data,
      endpoint: `${env.WATI_BASE_URL}/api/v1/sendSessionMessage/${testPhone}`,
    };

    if (response.status === 401) {
      results.diagnosis = {
        issue: '🔴 Token is INVALID or EXPIRED',
        solution: [
          '1. Login to WATI: https://app.wati.io/',
          '2. Go to Settings → API Docs',
          '3. Copy "API Access Token"',
          '4. Update WHATSAPP_API_TOKEN in Vercel env vars',
          '5. Redeploy',
        ],
      };
    } else if (response.ok) {
      results.diagnosis = {
        issue: '✅ Token is VALID and working!',
        note: 'Bot should work now. Test with real WhatsApp message.',
      };
    } else {
      results.diagnosis = {
        issue: `⚠️ Unexpected status: ${response.status}`,
        response: data,
      };
    }
  } catch (error: any) {
    results.watiTest = {
      success: false,
      error: error.message,
      stack: error.stack?.slice(0, 200),
    };
    results.diagnosis = {
      issue: '🔴 Failed to connect to WATI API',
      error: error.message,
    };
  }

  return NextResponse.json(results, {
    status: results.watiTest?.success ? 200 : 500,
  });
}
