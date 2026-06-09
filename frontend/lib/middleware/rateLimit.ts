// Rate limiting middleware for API routes
// Location: lib/middleware/rateLimit.ts

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (production: use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use Upstash Redis or similar
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  return function rateLimit(request: NextRequest): NextResponse | null {
    // Get client identifier (IP or phone number from body)
    const clientId = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    const now = Date.now();
    const record = rateLimitStore.get(clientId);

    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Request allowed
    }

    // Increment counter
    record.count++;

    // Check if limit exceeded
    if (record.count > maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
            retryAfter: resetIn,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Request allowed
    return null;
  };
}

/**
 * Rate limiter for WhatsApp users (10 requests per minute per phone)
 */
export const whatsappRateLimit = createRateLimiter(10, 60 * 1000); // 10 req/min

/**
 * Rate limiter for admin API (100 requests per minute)
 */
export const adminRateLimit = createRateLimiter(100, 60 * 1000); // 100 req/min

/**
 * Apply rate limit to request
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: (req: NextRequest) => NextResponse | null
): Promise<NextResponse | null> {
  return limiter(request);
}

/**
 * Clean up expired records (call periodically)
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}
