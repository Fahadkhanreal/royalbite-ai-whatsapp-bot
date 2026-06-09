// Admin Analytics API
// Location: app/api/admin/analytics/route.ts
// GET /api/admin/analytics - Order and revenue metrics (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, dishes } from '@/lib/db/schema';
import { eq, gte, sql } from 'drizzle-orm';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAdminAuth } from '@/lib/middleware/auth';

/**
 * GET /api/admin/analytics
 *
 * Get order and revenue analytics. Admin only.
 *
 * Query params:
 *   period: 'today' | 'week' | 'month' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    // Calculate date range
    const now = new Date();
    let dateFrom: Date | null = null;

    switch (period) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Fetch orders
    let allOrders;
    if (dateFrom) {
      allOrders = await db.query.orders.findMany({
        where: gte(orders.createdAt, dateFrom),
      });
    } else {
      allOrders = await db.query.orders.findMany();
    }

    // Calculate metrics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum: number, o: any) => sum + parseFloat(o.totalPrice?.toString() || '0'),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusCounts = {
      pending: allOrders.filter((o: any) => o.status === 'pending').length,
      confirmed: allOrders.filter((o: any) => o.status === 'confirmed').length,
      preparing: allOrders.filter((o: any) => o.status === 'preparing').length,
      delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
    };

    // Get popular items (fetch all order items + dishes)
    const recentOrderIds = allOrders.slice(0, 100).map((o: any) => o.id);
    let popularItems: Array<{ name: string; count: number }> = [];

    if (recentOrderIds.length > 0) {
      const recentItems = await db.query.orderItems.findMany();

      // Count by dish
      const dishCount = new Map<string, number>();
      for (const item of recentItems) {
        if (recentOrderIds.includes(item.orderId)) {
          const did = item.dishId as string;
          const qty = (item.quantity as number) ?? 1;
          const prev = dishCount.get(did) || 0;
          dishCount.set(did, prev + qty);
        }
      }

      // Get dish names
      const dishIds = Array.from(dishCount.keys());
      const dishNames = new Map<string, string>();
      for (const id of dishIds) {
        const dish = await db.query.dishes.findFirst({ where: eq(dishes.id, id) });
        if (dish) dishNames.set(id, dish.name);
      }

      popularItems = Array.from(dishCount.entries())
        .map(([id, count]) => ({
          name: dishNames.get(id) || 'Unknown',
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return NextResponse.json(
      successResponse({
        period,
        metrics: {
          totalOrders,
          totalRevenue,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          statusBreakdown: statusCounts,
        },
        popularItems,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
