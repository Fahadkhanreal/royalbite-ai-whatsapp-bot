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
  const quantityMatch = msgLower.match(/(\d+)\s*(plate|piece|pc|x|samosa|biryani|tikka|kebab)?/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : null;

  // Extract address - IMPROVED to capture more formats
  let address: string | null = null;

  // Try multiple address patterns
  const addressPatterns = [
    // Pattern 1: house/flat/block style
    /(house|flat|apartment|block|street|road|area|sector|phase)[\s\d\w,.\/-]+/i,
    // Pattern 2: FC area, DHA, Clifton style (areas without house keyword)
    /(fc|dha|clifton|gulshan|north\s*nazimabad|saddar|pechs|defence|malir|korangi)[\s\w\d,.\/-]+/i,
    // Pattern 3: Generic pattern - anything after common delivery keywords
    /(?:address[:\s]+|deliver[:\s]+to[:\s]+|location[:\s]+)([\w\s\d,.\/-]+)/i,
  ];

  for (const pattern of addressPatterns) {
    const match = message.match(pattern);
    if (match) {
      address = match[0].trim();
      // Clean up if it starts with keywords
      address = address.replace(/^(address|deliver\s+to|location)[:\s]+/i, '').trim();
      break;
    }
  }

  // If no pattern matched but message has multiple lines, try last line as address
  if (!address) {
    const lines = message.trim().split('\n');
    if (lines.length >= 3) {
      // If 3+ lines, last line might be address
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine.length > 10 && !msgLower.includes('example')) {
        address = lastLine;
      }
    }
  }

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
 * Estimate delivery time based on address
 * Returns time in minutes
 */
export function estimateDeliveryTime(address: string): number {
  const addressLower = address.toLowerCase();

  // Near areas (30-40 minutes)
  const nearAreas = ['gulshan', 'bahadurabad', 'tariq road', 'liaquatabad'];
  // Medium areas (40-50 minutes)
  const mediumAreas = ['north nazimabad', 'federal b area', 'fb area', 'saddar', 'pechs'];
  // Far areas (50-60 minutes)
  const farAreas = ['dha', 'clifton', 'defence', 'korangi', 'malir', 'landhi', 'orangi'];

  for (const area of nearAreas) {
    if (addressLower.includes(area)) {
      return 30; // Near: 30 minutes
    }
  }

  for (const area of mediumAreas) {
    if (addressLower.includes(area)) {
      return 45; // Medium: 45 minutes
    }
  }

  for (const area of farAreas) {
    if (addressLower.includes(area)) {
      return 55; // Far: 55 minutes
    }
  }

  // Default: 40 minutes (moderate estimate)
  return 40;
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
  const deliveryTime = estimateDeliveryTime(address);

  let message = `✅ *Order Confirmed!*\n\n`;
  message += `📋 Order #${orderNumber}\n\n`;
  message += `*Items:*\n`;

  items.forEach(item => {
    message += `• ${item.quantity}x ${item.name} - Rs. ${item.price * item.quantity}\n`;
  });

  message += `\n💰 *Total: Rs. ${total}*\n\n`;
  message += `📍 *Delivery Address:*\n${address}\n\n`;
  message += `⏱️ *Estimated Delivery Time:* ${deliveryTime} minutes\n\n`;
  message += `Thank you for ordering from RoyalBite! 🍽️`;

  return message;
}
