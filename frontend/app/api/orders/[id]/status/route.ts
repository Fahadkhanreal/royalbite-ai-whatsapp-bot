// Order status update endpoint
// Location: app/api/orders/[id]/status/route.ts
// PUT /api/orders/[id]/status - Update order status (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateOrderStatusSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';

/**
 * PUT /api/orders/[id]/status
 *
 * Update order status. Admin only.
 *
 * Body:
 * {
 *   "status": "confirmed | preparing | delivered | cancelled"
 * }
 *
 * Automatically sets confirmed_at or delivered_at timestamps.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(request);

    const { id } = await params;

    // Check order exists
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        errorResponse(new NotFoundError('Order')),
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate status
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid status', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Build update with timestamps
    const updateData: Record<string, any> = { status };
    if (status === 'confirmed') updateData.confirmedAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    // Update order
    const [updated] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json(
      successResponse({
        orderId: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      })
    );
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
