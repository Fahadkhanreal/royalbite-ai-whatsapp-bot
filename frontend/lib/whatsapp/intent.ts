// Intent detection for WhatsApp messages
// Location: lib/whatsapp/intent.ts
// Detects user intent from message text: menu, order, timing, greeting, or fallback

export type IntentAction = 'menu_query' | 'order' | 'timing' | 'greeting' | 'thanks' | 'help' | 'complaint' | 'fallback';

export interface IntentResult {
  action: IntentAction;
  confidence: number;
  entities?: {
    dishName?: string;
    category?: string;
    quantity?: number;
    time?: string;
  };
}

// Keyword maps for each intent
const INTENT_KEYWORDS: Record<IntentAction, string[]> = {
  menu_query: [
    // English keywords
    'menu', 'dish', 'food', 'eat', 'biryani', 'karahi', 'nihari', 'kebab', 'paratha',
    'dessert', 'kheer', 'curry', 'rice', 'bread', 'chicken', 'mutton', 'beef',
    'vegetarian', 'vegan', 'spicy', 'what do you have', 'available', 'serving',
    'recommend', 'special', 'signature', 'halal',
    // Roman Urdu keywords
    'kya', 'hai', 'ha', 'batao', 'batio', 'dikhao', 'dikha', 'sara', 'sab', 'poora',
    'complete', 'puri', 'list', 'items', 'konsa', 'kaunsa', 'milta', 'milti',
  ],
  order: [
    'order', 'want', 'buy', 'get', 'deliver', 'send', 'book', 'place',
    'i\'ll have', 'i would like', 'can i have', 'bring me', 'one',
    'pack', 'takeaway', 'delivery', 'home delivery',
  ],
  timing: [
    'timing', 'time', 'open', 'close', 'hours', 'when', 'late', 'early',
    'sunday', 'monday', 'friday', 'holiday', 'now', 'still open',
  ],
  greeting: [
    'hello', 'hi', 'hey', 'salam', 'assalamo', 'good morning', 'good evening',
    'howdy', 'yo', 'sup', 'good afternoon',
  ],
  thanks: [
    'thanks', 'thank you', 'thankyou', 'shukria', 'thanks a lot', 'appreciate',
    'thank', 'ty', 'thx', 'great',
  ],
  help: [
    'help', 'how', 'what can you', 'options', 'support', 'guide', 'tutorial',
    'help me', 'i need', 'can you',
  ],
  complaint: [
    'complaint', 'bad', 'worst', 'terrible', 'disappointed', 'issue', 'problem',
    'wrong', 'missing', 'cold', 'late delivery', 'refund', 'not good',
  ],
  fallback: [],
};

// Greeting responses for different times of day
const GREETING_RESPONSES = {
  morning: 'Good morning! Welcome to RoyalBite.',
  afternoon: 'Good afternoon! Welcome to RoyalBite.',
  evening: 'Good evening! Welcome to RoyalBite.',
};

/**
 * Detect the intent of a user's message based on keyword matching
 */
export async function detectIntent(message: string): Promise<IntentResult> {
  const normalized = message.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  let bestIntent: IntentAction = 'fallback';
  let bestScore = 0;
  let matchedEntities: IntentResult['entities'] = {};

  // Score each intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;

    for (const keyword of keywords) {
      // Check if keyword appears in the message
      if (normalized.includes(keyword)) {
        // Weight by keyword length (longer = more specific = higher confidence)
        score += keyword.length;
      }
    }

    // Normalize by message length to avoid bias towards longer messages
    score = score / Math.max(words.length, 1);

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as IntentAction;
    }
  }

  // Extract entities for menu queries
  if (bestIntent === 'menu_query' || bestIntent === 'order') {
    matchedEntities = extractEntities(normalized);
  }

  // Set confidence
  const confidence = Math.min(bestScore / 5, 1); // Normalize to 0-1

  return {
    action: bestIntent,
    confidence: Math.round(confidence * 100) / 100,
    entities: Object.keys(matchedEntities).length > 0 ? matchedEntities : undefined,
  };
}

/**
 * Extract entities (dish names, quantities) from message
 */
function extractEntities(text: string): IntentResult['entities'] {
  const entities: IntentResult['entities'] = {};

  // Extract quantity (numbers)
  const quantityMatch = text.match(/(\d+)\s*(plate|piece|kg|pack|pcs)/i);
  if (quantityMatch) {
    entities.quantity = parseInt(quantityMatch[1], 10);
  }

  // Known dish/category keywords
  const dishKeywords: Record<string, string> = {
    'biryani': 'biryani',
    'sindhi biryani': 'Sindhi Biryani',
    'chicken biryani': 'Chicken Biryani',
    'beef biryani': 'Beef Biryani',
    'karahi': 'Chicken Karahi',
    'nihari': 'Karachi Nihari',
    'kebab': 'Seekh Kebab',
    'seekh kebab': 'Seekh Kebab',
    'paratha': 'Paratha',
    'naan': 'Naan',
    'roti': 'Roti',
    'kheer': 'Kheer',
    'gulab jamun': 'Gulab Jamun',
    'samosa': 'Samosa',
    'chicken tikka': 'Chicken Tikka',
    'dal': 'Dal Tadka',
    'paneer': 'Palak Paneer',
    'lassi': 'Mango Lassi',
    'chai': 'Chai',
    'ice cream': 'Ice Cream',
  };

  for (const [keyword, dishName] of Object.entries(dishKeywords)) {
    if (text.includes(keyword)) {
      entities.dishName = dishName;
      break;
    }
  }

  // Extract category mentions
  const categoryKeywords = ['biryani', 'curry', 'dessert', 'bread', 'appetizer', 'beverage'];
  for (const cat of categoryKeywords) {
    if (text.includes(cat)) {
      entities.category = cat;
      break;
    }
  }

  return entities;
}

/**
 * Get greeting response based on time of day
 */
export function getGreetingResponse(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return GREETING_RESPONSES.morning;
  } else if (hour < 17) {
    return GREETING_RESPONSES.afternoon;
  } else {
    return GREETING_RESPONSES.evening;
  }
}
