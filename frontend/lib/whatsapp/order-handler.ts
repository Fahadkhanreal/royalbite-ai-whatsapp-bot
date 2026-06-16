// Order processing functions
// Location: lib/whatsapp/order-handler.ts
// Handles order creation and processing

import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';

export interface OrderDetails {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  address: string;
  phoneNumber: string;
  specialInstructions?: string;
}

/**
 * Extract order details from user message
 * Looks for: quantity, item names, address
 */
export function extractOrderDetails(message: string, menuContext?: string): {
  items: string[];
  quantity: number | null;
  address: string | null;
  hasAllDetails: boolean;
} {
  const msgLower = message.toLowerCase();

  // Extract quantity (look for numbers)
  const quantityMatch = msgLower.match(/(\d+)\s*(plate|piece|pc|x)?/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : null;

  // Extract potential address (house/flat/block keywords)
  const addressMatch = message.match(/(house|flat|apartment|block|street|road|area|sector|phase)[\s\d\w,.-]+/i);
  const address = addressMatch ? addressMatch[0] : null;

  // Extract item names (basic - can be improved)
  const items: string[] = [];
  const itemKeywords = ['biryani', 'karahi', 'nihari', 'kebab', 'tikka', 'burger', 'samosa', 'naan', 'paratha'];

  for (const keyword of itemKeywords) {
    if (msgLower.includes(keyword)) {
      items.push(keyword);
    }
  }

  const hasAllDetails = items.length > 0 && quantity !== null && address !== null;

  return {
    items,
    quantity,
    address,
    hasAllDetails,
  };
}

/**
 * Create order in database
 */
export async function createOrder(details: OrderDetails): Promise<{
  orderId: string;
  orderNumber: string;
  total: number;
}> {
  try {
    // Calculate total
    const total = details.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const [order] = await db.insert(orders).values({
      phoneNumber: details.phoneNumber,
      totalPrice: total.toString(),
      status: 'pending',
      specialInstructions: details.specialInstructions || null,
    }).returning();

    // Create order items (if we have dish IDs, we'd link them here)
    // For now, we'll store in special instructions or a separate field
    // In a full implementation, you'd match items to dishes and create orderItems entries

    // Generate order number (last 6 chars of UUID)
    const orderNumber = order.id.slice(-6).toUpperCase();

    return {
      orderId: order.id,
      orderNumber,
      total,
    };
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error('Failed to create order');
  }
}

/**
 * Format order confirmation message
 */
export function formatOrderConfirmation(
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  address: string
): string {
  let message = `✅ *Order Confirmed!*\n\n`;
  message += `📋 Order #${orderNumber}\n\n`;
  message += `*Items:*\n`;

  items.forEach(item => {
    message += `• ${item.quantity}x ${item.name} - Rs. ${item.price * item.quantity}\n`;
  });

  message += `\n💰 *Total: Rs. ${total}*\n\n`;
  message += `📍 *Delivery Address:*\n${address}\n\n`;
  message += `⏱️ *Estimated Time:* 30-45 minutes\n\n`;
  message += `Thank you for ordering from RoyalBite! 🍽️`;

  return message;
}
