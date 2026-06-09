// Order creation from WhatsApp messages
// Location: lib/orders/createFromWhatsApp.ts
// Creates orders in the database from WhatsApp order detections

import { db } from '@/lib/db';
import { orders, orderItems, dishes } from '@/lib/db/schema';
import { detectOrderFromMessage, DetectedOrderItem } from '@/lib/whatsapp/orderDetection';
import { DatabaseError, OrderError } from '@/lib/errors';
import { eq, inArray } from 'drizzle-orm';

export interface OrderFromWhatsAppResult {
  success: boolean;
  needsClarification: boolean;
  orderId?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  totalPrice?: number;
  clarificationMessage?: string;
  error?: string;
}

/**
 * Detect order intent from message and create order if clear
 */
export async function detectAndCreateOrder(
  message: string,
  phoneNumber: string
): Promise<OrderFromWhatsAppResult> {
  try {
    // Step 1: Detect order from message
    const detection = await detectOrderFromMessage(message);

    // Step 2: If no order intent detected, return clarification needed
    if (!detection.hasOrder) {
      return {
        success: false,
        needsClarification: true,
        clarificationMessage: 'I can help you place an order! Please tell me what you\'d like to order from our menu. For example: "I want Chicken Biryani" or "One Sindhi Biryani please"',
      };
    }

    // Step 3: If we detected items with low confidence, ask for confirmation
    if (detection.items.length === 0 && detection.confidence < 0.5) {
      return {
        success: false,
        needsClarification: true,
        clarificationMessage: 'I think you want to place an order, but I didn\'t catch the item. Could you please tell me what you\'d like to order? You can say something like "I want Chicken Biryani" or "One plate of Nihari"',
      };
    }

    // Step 4: Match detected items with database dishes
    const matchedItems = await matchItemsWithDatabase(detection.items);

    if (matchedItems.length === 0) {
      return {
        success: false,
        needsClarification: true,
        clarificationMessage: 'I\'m having trouble matching your order with our menu items. Could you please specify the dish names? Here are some options: Biryani, Nihari, Karahi, Kebab, Paratha, Kheer, etc.',
      };
    }

    // Step 5: Create the order
    const totalPrice = matchedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert order
    const [order] = await db.insert(orders).values({
      phoneNumber,
      totalPrice: totalPrice.toString(),
      status: 'pending',
    }).returning();

    // Insert order items
    await db.insert(orderItems).values(
      matchedItems.map(item => ({
        orderId: order.id,
        dishId: item.dishId,
        quantity: item.quantity,
        priceAtOrder: item.price.toString(),
      }))
    );

    return {
      success: true,
      needsClarification: false,
      orderId: order.id,
      items: matchedItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalPrice,
    };
  } catch (error) {
    console.error('Order creation from WhatsApp failed:', error);

    if (error instanceof OrderError || error instanceof DatabaseError) {
      return {
        success: false,
        needsClarification: false,
        error: error.message,
      };
    }

    return {
      success: false,
      needsClarification: true,
      clarificationMessage: 'I encountered an issue processing your order. Our team has been notified and will contact you shortly to complete your order.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Match detected items with dishes in the database
 */
async function matchItemsWithDatabase(
  detectedItems: DetectedOrderItem[]
): Promise<Array<{
  dishId: string;
  name: string;
  quantity: number;
  price: number;
}>> {
  try {
    // Fetch all dishes
    const allDishes = await db.query.dishes.findMany();

    const matchedItems: Array<{
      dishId: string;
      name: string;
      quantity: number;
      price: number;
    }> = [];

    for (const detected of detectedItems) {
      // Find matching dish by name (case-insensitive partial match)
      const match = allDishes.find(
        (dish: any) => dish.name.toLowerCase().includes(detected.name.toLowerCase()) ||
                detected.name.toLowerCase().includes(dish.name.toLowerCase())
      );

      if (match && match.isAvailable) {
        const m = match as any;
        matchedItems.push({
          dishId: m.id,
          name: m.name,
          quantity: detected.quantity,
          price: parseFloat(m.price.toString()),
        });
      }
    }

    return matchedItems;
  } catch (error) {
    console.error('Database matching failed:', error);
    return [];
  }
}
