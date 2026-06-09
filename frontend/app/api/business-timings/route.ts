// Business Timings API
// Location: app/api/business-timings/route.ts
// GET /api/business-timings - List timings
// POST /api/business-timings - Create/Update timing (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { businessTimings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { businessTimingSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';
import { syncTimingsToRAG } from '@/lib/rag/auto-ingest';

/**
 * GET /api/business-timings
 *
 * List all business timings, ordered by day of week.
 */
export async function GET() {
  try {
    const timings = await db.query.businessTimings.findMany({
      orderBy: businessTimings.dayOfWeek,
    });

    return NextResponse.json(
      successResponse({ timings })
    );
  } catch (error) {
    console.error('Business timings GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * POST /api/business-timings
 *
 * Create or update a business timing for a specific day. Admin only.
 * Triggers RAG sync after update.
 *
 * Body:
 * {
 *   "dayOfWeek": 0,
 *   "openTime": "11:00:00",
 *   "closeTime": "22:00:00",
 *   "isHoliday": false
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const body = await request.json();

    // Validate
    const parsed = businessTimingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid timing data', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { dayOfWeek, openTime, closeTime, isHoliday } = parsed.data;

    // Check if timing exists for this day
    const existing = await db.query.businessTimings.findFirst({
      where: eq(businessTimings.dayOfWeek, dayOfWeek),
    });

    let result;
    if (existing) {
      // Update
      [result] = await db.update(businessTimings)
        .set({ openTime, closeTime, isHoliday })
        .where(eq(businessTimings.dayOfWeek, dayOfWeek))
        .returning();
    } else {
      // Create
      [result] = await db.insert(businessTimings).values({
        dayOfWeek,
        openTime,
        closeTime,
        isHoliday,
      }).returning();
    }

    // Sync to RAG
    syncTimingsToRAG().catch(err => {
      console.error('RAG sync after timings update failed:', err);
    });

    return NextResponse.json(
      successResponse({ timing: result }),
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('Business timings POST error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
