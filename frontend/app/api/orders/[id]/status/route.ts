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
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

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

    // Send WhatsApp notification to customer based on new status
    try {
      const phoneNumber = existing.phoneNumber;
      const orderNumber = id.slice(-6).toUpperCase();

      let notificationMessage = '';

      switch (status) {
        case 'confirmed':
          notificationMessage = `✅ *Order Confirmed!*\n\nAapka order #${orderNumber} confirm ho gaya hai.\n\nHum jald hi aapka khana tayyar karna shuru karenge! 👨‍🍳\n\nThank you for choosing RoyalBite! 🍽️`;
          break;

        case 'preparing':
          notificationMessage = `👨‍🍳 *Khana Tayyar Ho Raha Hai!*\n\nAapka order #${orderNumber} abhi prepare ho raha hai.\n\nHamara chef mehnat se aapka delicious khana bana raha hai! 🔥\n\nJald hi deliver hoga. Thank you for your patience! 😊`;
          break;

        case 'delivered':
          notificationMessage = `🚴 *Order Delivered!*\n\nAapka order #${orderNumber} successfully deliver ho gaya hai!\n\nEnjoy your delicious meal! 🍽️✨\n\nHumein feedback dena na bhoolein. Thank you for ordering from RoyalBite! ❤️`;
          break;

        case 'cancelled':
          notificationMessage = `❌ *Order Cancelled*\n\nAapka order #${orderNumber} cancel kar diya gaya hai.\n\nAgar koi problem hai ya aap phir se order karna chahte hain, please humein message karein ya call karein.\n\nWe're here to help! 😊`;
          break;

        default:
          // No notification for other statuses
          break;
      }

      if (notificationMessage) {
        await sendWhatsAppMessage(phoneNumber, notificationMessage);
        console.info(`[ORDER-STATUS] Notification sent to ${phoneNumber} for status: ${status}`);
      }
    } catch (notificationError) {
      // Don't fail the status update if notification fails
      console.error('[ORDER-STATUS] Failed to send WhatsApp notification:', notificationError);
      // Continue anyway - status was updated successfully
    }

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
