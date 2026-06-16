// Orders API endpoints
// Location: app/api/orders/route.ts
// GET /api/orders - List orders
// POST /api/orders - Create new order

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, dishes } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { createOrderSchema, orderFiltersSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, NotFoundError, OrderError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';

/**
 * GET /api/orders
 *
 * List orders with optional filters.
 * Admin only.
 *
 * Query params:
 *   status: string (optional filter)
 *   phoneNumber: string (optional filter)
 *   limit: number (default 20)
 *   offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const phoneNumber = searchParams.get('phoneNumber');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query with filters
    let result;
    if (status) {
      result = await db.query.orders.findMany({
        where: eq(orders.status, status as any),
        limit,
        offset,
        orderBy: desc(orders.createdAt),
        with: {
          items: {
            with: { dish: true },
          },
        },
      });
    } else if (phoneNumber) {
      result = await db.query.orders.findMany({
        where: eq(orders.phoneNumber, phoneNumber),
        limit,
        offset,
        orderBy: desc(orders.createdAt),
        with: {
          items: {
            with: { dish: true },
          },
        },
      });
    } else {
      result = await db.query.orders.findMany({
        limit,
        offset,
        orderBy: desc(orders.createdAt),
        with: {
          items: {
            with: { dish: true },
          },
        },
      });
    }

    const totalCount = (await db.query.orders.findMany()).length;

    // Transform orders to match frontend interface
    const transformedOrders = result.map((order: any) => {
      // Extract items from order_items relation
      let items = order.items?.map((item: any) => ({
        menuItemId: item.dishId,
        name: item.dish?.name || 'Unknown Item',
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.priceAtOrder || '0'),
      })) || [];

      // If no items from order_items, try to parse specialInstructions
      // Format: "2x tikka @ Rs. 250" or "2x tikka @ Rs. 250; 1x samosa @ Rs. 50"
      if (items.length === 0 && order.specialInstructions) {
        const instructionItems = order.specialInstructions.split(';').map((part: string) => {
          const match = part.trim().match(/(\d+)x\s+(.+?)\s+@\s+Rs\.\s+(\d+)/i);
          if (match) {
            const quantity = parseInt(match[1]);
            const name = match[2].trim();
            const price = parseInt(match[3]);
            return {
              menuItemId: 'custom',
              name,
              quantity,
              unitPrice: price,
            };
          }
          return null;
        }).filter(Boolean);

        if (instructionItems.length > 0) {
          items = instructionItems;
        }
      }

      return {
        id: order.id,
        customerName: order.phoneNumber, // Use phone as name for now
        customerPhone: order.phoneNumber,
        customerAddress: order.specialInstructions || '',
        items,
        totalAmount: parseFloat(order.totalPrice || '0'),
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return NextResponse.json(
      successResponse({
        orders: transformedOrders,
        pagination: { total: totalCount, limit, offset },
      })
    );
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 *
 * Create a new order manually (admin or API).
 *
 * Body:
 * {
 *   "phoneNumber": "+923482240731",
 *   "dishIds": ["uuid1", "uuid2"],
 *   "specialInstructions": "No onions"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid order data', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { phoneNumber, dishIds, specialInstructions } = parsed.data;

    // Fetch dish prices
    const orderedDishes = await db.query.dishes.findMany({
      where: inArray(dishes.id, dishIds),
    });

    if (orderedDishes.length !== dishIds.length) {
      return NextResponse.json(
        errorResponse(new NotFoundError('One or more dishes')),
        { status: 404 }
      );
    }

    // Check availability
    const unavailable = orderedDishes.filter((d: any) => !d.isAvailable);
    if (unavailable.length > 0) {
      return NextResponse.json(
        errorResponse(
          new OrderError(`Some dishes are unavailable: ${unavailable.map((d: any) => d.name).join(', ')}`)
        ),
        { status: 400 }
      );
    }

    // Calculate total
    const totalPrice = orderedDishes.reduce(
      (sum: number, dish: any) => sum + parseFloat(dish.price?.toString() || '0'),
      0
    );

    // Create order
    const [order] = await db.insert(orders).values({
      phoneNumber,
      totalPrice: totalPrice.toString(),
      status: 'pending',
      specialInstructions: specialInstructions || null,
    }).returning();

    // Create order items
    await db.insert(orderItems).values(
      orderedDishes.map((dish: any) => ({
        orderId: order.id,
        dishId: dish.id,
        quantity: 1,
        priceAtOrder: dish.price.toString(),
      }))
    );

    // Fetch full order with items
    const fullOrder = await db.query.orders.findFirst({
      where: eq(orders.id, order.id),
      with: {
        items: { with: { dish: true } },
      },
    });

    return NextResponse.json(
      successResponse({ order: fullOrder }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
