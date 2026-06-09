import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
