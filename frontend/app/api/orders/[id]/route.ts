// Order by ID endpoint
// Location: app/api/orders/[id]/route.ts
// GET /api/orders/[id] - Get single order
// DELETE /api/orders/[id] - Delete order (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { successResponse, errorResponse } from '@/lib/response';
import { NotFoundError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';

/**
 * GET /api/orders/[id]
 *
 * Get a single order with items.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: {
          with: { dish: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        errorResponse(new NotFoundError('Order')),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({ order })
    );
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 *
 * Delete an order and its items. Admin only.
 */
export async function DELETE(
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

    // Delete order items first (cascade should handle this, but explicit is safe)
    await db.delete(orderItems).where(eq(orderItems.orderId, id));

    // Delete the order
    await db.delete(orders).where(eq(orders.id, id));

    return NextResponse.json(
      successResponse({ deleted: true, orderId: id })
    );
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
