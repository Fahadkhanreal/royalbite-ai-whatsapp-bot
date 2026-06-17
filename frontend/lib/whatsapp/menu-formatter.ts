// WhatsApp Menu Formatter - Beautiful readable format
// Location: lib/whatsapp/menu-formatter.ts

interface MenuItem {
  name: string;
  price: string | number;
  category: string;
  description?: string | null;
}

// Category to emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  'Biryani': '🍛',
  'Biryanis': '🍛',
  'Chicken': '🍗',
  'Chicken Items': '🍗',
  'Beef': '🥩',
  'Beef Items': '🥩',
  'Mutton': '🐑',
  'Mutton Items': '🐑',
  'Seafood': '🐟',
  'Fish': '🐟',
  'Starters': '🥟',
  'Appetizers': '🥟',
  'Snacks': '🥟',
  'Breads': '🍞',
  'Bread': '🍞',
  'Naan': '🍞',
  'Roti': '🍞',
  'Rice': '🍚',
  'Drinks': '🥤',
  'Beverages': '🥤',
  'Desserts': '🍨',
  'Sweet': '🍰',
  'Karahi': '🍲',
  'Curry': '🍛',
  'BBQ': '🍖',
  'Tikka': '🍢',
  'Kebab': '🍢',
  'Other': '🍽️',
};

function getCategoryEmoji(category: string): string {
  // Try exact match first
  if (CATEGORY_EMOJIS[category]) {
    return CATEGORY_EMOJIS[category];
  }

  // Try partial match
  const categoryLower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (categoryLower.includes(key.toLowerCase())) {
      return emoji;
    }
  }

  return '🍽️'; // Default
}

/**
 * Format menu items into beautiful WhatsApp-friendly text
 */
export function formatMenuForWhatsApp(items: MenuItem[]): string {
  if (items.length === 0) {
    return "😔 Menu update ho rahi hai. Thodi der mein check karein ya call karein!";
  }

  // Group by category
  const menuByCategory: Record<string, MenuItem[]> = {};
  items.forEach(item => {
    const category = item.category || 'Other';
    if (!menuByCategory[category]) {
      menuByCategory[category] = [];
    }
    menuByCategory[category].push(item);
  });

  // Build formatted menu
  let formattedMenu = '🍽️ *RoyalBite Menu*\n\n';

  // Sort categories (keep consistent order)
  const categoryOrder = ['Biryani', 'Biryanis', 'Chicken', 'Beef', 'Mutton', 'Seafood', 'Fish', 'Karahi', 'BBQ', 'Tikka', 'Kebab', 'Starters', 'Appetizers', 'Snacks', 'Breads', 'Rice', 'Desserts', 'Drinks'];
  const sortedCategories = Object.keys(menuByCategory).sort((a, b) => {
    const aIndex = categoryOrder.findIndex(cat => a.toLowerCase().includes(cat.toLowerCase()));
    const bIndex = categoryOrder.findIndex(cat => b.toLowerCase().includes(cat.toLowerCase()));
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Format each category
  sortedCategories.forEach(category => {
    const items = menuByCategory[category];
    const emoji = getCategoryEmoji(category);

    formattedMenu += `${emoji} *${category}*\n`;

    items.forEach(item => {
      formattedMenu += `• ${item.name} - Rs. ${item.price}\n`;
    });

    formattedMenu += '\n';
  });

  // Add footer
  formattedMenu += '📞 *Order karne ke liye:*\n';
  formattedMenu += 'Item name aur quantity batayen!\n';
  formattedMenu += '_Example: 2 tikka 1 biryani_';

  return formattedMenu;
}

/**
 * Format menu for quick preview (short version)
 */
export function formatMenuPreview(items: MenuItem[], maxItems: number = 5): string {
  if (items.length === 0) {
    return "Menu update ho rahi hai 😊";
  }

  let preview = '🍽️ *Popular Items:*\n\n';

  items.slice(0, maxItems).forEach(item => {
    preview += `• ${item.name} - Rs. ${item.price}\n`;
  });

  if (items.length > maxItems) {
    preview += `\n_...aur ${items.length - maxItems} items!_\n`;
    preview += '\n💬 "Menu dekhao" likhein complete menu ke liye';
  }

  return preview;
}
