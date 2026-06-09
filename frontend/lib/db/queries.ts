// Database query utilities and CRUD helpers
// Location: lib/db/queries.ts

import { db } from '@/lib/db/index';
import * as schema from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors';

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch user', { email });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch user', { userId });
  }
}

/**
 * Get all dishes
 */
export async function getAllDishes(limit = 50, offset = 0) {
  try {
    return await db.query.dishes.findMany({
      limit,
      offset,
      orderBy: desc(schema.dishes.createdAt),
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch dishes');
  }
}

/**
 * Get dishes by category
 */
export async function getDishesByCategory(category: string, limit = 50) {
  try {
    return await db.query.dishes.findMany({
      where: eq(schema.dishes.category, category),
      limit,
      orderBy: desc(schema.dishes.createdAt),
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch dishes by category', { category });
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderWithItems(orderId: string) {
  try {
    return await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: {
        items: {
          with: {
            dish: true,
          },
        },
      },
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch order', { orderId });
  }
}

/**
 * Get orders by phone number
 */
export async function getOrdersByPhone(phoneNumber: string, limit = 20, offset = 0) {
  try {
    return await db.query.orders.findMany({
      where: eq(schema.orders.phoneNumber, phoneNumber),
      limit,
      offset,
      orderBy: desc(schema.orders.createdAt),
      with: {
        items: {
          with: {
            dish: true,
          },
        },
      },
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch orders', { phoneNumber });
  }
}

/**
 * Get business timings for day
 */
export async function getBusinessTiming(dayOfWeek: number) {
  try {
    return await db.query.businessTimings.findFirst({
      where: eq(schema.businessTimings.dayOfWeek, dayOfWeek),
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch business timing', { dayOfWeek });
  }
}

/**
 * Get all business timings
 */
export async function getAllBusinessTimings() {
  try {
    return await db.query.businessTimings.findMany({
      orderBy: schema.businessTimings.dayOfWeek,
    });
  } catch (error) {
    throw new DatabaseError('Failed to fetch business timings');
  }
}

/**
 * Count orders by status
 */
export async function countOrdersByStatus() {
  try {
    const orders = await db.query.orders.findMany();
    const counts = {
      pending: orders.filter((o: any) => o.status === 'pending').length,
      confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
      preparing: orders.filter((o: any) => o.status === 'preparing').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
    };
    return counts;
  } catch (error) {
    throw new DatabaseError('Failed to count orders');
  }
}

/**
 * Get order analytics
 */
export async function getOrderAnalytics() {
  try {
    const allOrders = await db.query.orders.findMany();
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice?.toString() || '0'), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts: await countOrdersByStatus(),
    };
  } catch (error) {
    throw new DatabaseError('Failed to fetch analytics');
  }
}
