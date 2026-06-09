// Order detection from WhatsApp messages
// Location: lib/whatsapp/orderDetection.ts
// Detects order intent and extracts order details from natural language

export interface DetectedOrderItem {
  name: string;
  quantity: number;
  matchedDishId?: string;
}

export interface OrderDetectionResult {
  hasOrder: boolean;
  items: DetectedOrderItem[];
  confidence: number;
  rawMessage: string;
}

// Known dish names for detection
const KNOWN_DISHES: Array<{ keywords: string[]; name: string }> = [
  { keywords: ['sindhi biryani', 'sindhi'], name: 'Sindhi Biryani' },
  { keywords: ['chicken biryani'], name: 'Chicken Biryani' },
  { keywords: ['beef biryani'], name: 'Beef Biryani' },
  { keywords: ['vegetable biryani', 'veggie biryani', 'veg biryani'], name: 'Vegetable Biryani' },
  { keywords: ['karachi nihari', 'nihari'], name: 'Karachi Nihari' },
  { keywords: ['chicken karahi', 'karahi'], name: 'Chicken Karahi' },
  { keywords: ['dal tadka', 'daal'], name: 'Dal Tadka' },
  { keywords: ['palak paneer'], name: 'Palak Paneer' },
  { keywords: ['seekh kebab', 'kebab'], name: 'Seekh Kebab' },
  { keywords: ['chicken tikka'], name: 'Chicken Tikka' },
  { keywords: ['samosa'], name: 'Samosa' },
  { keywords: ['paratha'], name: 'Paratha' },
  { keywords: ['naan', 'garlic naan'], name: 'Naan' },
  { keywords: ['roti'], name: 'Roti' },
  { keywords: ['kheer'], name: 'Kheer' },
  { keywords: ['gulab jamun'], name: 'Gulab Jamun' },
  { keywords: ['ice cream'], name: 'Ice Cream' },
  { keywords: ['mango lassi', 'lassi'], name: 'Mango Lassi' },
  { keywords: ['chai', 'tea'], name: 'Chai' },
];

/**
 * Detect order intent from a WhatsApp message
 */
export async function detectOrderFromMessage(
  message: string
): Promise<OrderDetectionResult> {
  const normalized = message.toLowerCase().trim();
  const items: DetectedOrderItem[] = [];

  // Check for order keywords
  const orderKeywords = [
    'order', 'want', 'buy', 'get', 'deliver', 'send',
    'i\'ll have', 'i would like', 'can i have', 'bring me',
    'one', 'two', 'three',
  ];

  const hasOrderIntent = orderKeywords.some(k => normalized.includes(k));

  // Extract dish names
  for (const dish of KNOWN_DISHES) {
    const matchedKeyword = dish.keywords.find(k => normalized.includes(k));
    if (matchedKeyword) {
      // Extract quantity
      let quantity = 1;
      const quantityMatch = normalized.match(
        new RegExp(`(\\d+)\\s*(plate|piece|pack|pcs|\\s*)?\\s*${matchedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
      );
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1], 10);
      }

      // Avoid duplicates
      const existing = items.find(i => i.name === dish.name);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ name: dish.name, quantity });
      }
    }
  }

  const hasItems = items.length > 0;
  const confidence = hasOrderIntent && hasItems ? 0.9
    : hasItems ? 0.7
    : hasOrderIntent ? 0.4
    : 0;

  return {
    hasOrder: hasItems || hasOrderIntent,
    items,
    confidence,
    rawMessage: message,
  };
}
