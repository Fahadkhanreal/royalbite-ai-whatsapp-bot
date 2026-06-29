// Fuzzy matching utility for menu items
// Location: lib/whatsapp/fuzzy-match.ts
// Handles typos and spelling variations automatically

/**
 * Calculate similarity between two strings (0 to 1)
 * Uses Levenshtein distance ratio
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1.0;

  // One is substring of other (high similarity)
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length);
    const shorter = Math.min(s1.length, s2.length);
    return shorter / longer;
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  // Convert distance to similarity ratio (0-1)
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance (edit distance) between two strings
 * Measures minimum number of edits needed to transform one string to another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create 2D array for dynamic programming
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Find best matching item from a list of menu items
 * Returns null if no good match found
 */
export function findBestMatch(
  userInput: string,
  menuItems: string[],
  threshold: number = 0.75
): { match: string; similarity: number } | null {
  let bestMatch: string | null = null;
  let bestSimilarity = 0;

  const normalizedInput = userInput.toLowerCase().trim();

  for (const item of menuItems) {
    const normalizedItem = item.toLowerCase().trim();
    const similarity = stringSimilarity(normalizedInput, normalizedItem);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = item;
    }
  }

  // Return match only if above threshold
  if (bestMatch && bestSimilarity >= threshold) {
    return { match: bestMatch, similarity: bestSimilarity };
  }

  return null;
}

/**
 * Extract menu items from user message using fuzzy matching
 * Works with any items in database (current + future)
 *
 * Strategy:
 * 1. Check if any FULL menu item name appears in the user message (e.g., "Chicken Tikka" in "2 chicken tikka")
 * 2. Check if any message word is a substring OF a menu item (e.g., "biryani" → "Sindhi Biryani")
 * 3. Word-by-word Levenshtein similarity for typos
 */
export function fuzzyExtractItems(
  userMessage: string,
  availableItems: string[],
  threshold: number = 0.75
): string[] {
  const msgLower = userMessage.toLowerCase().trim();
  const words = msgLower.split(/[\s,]+/);
  const matchedItems: string[] = [];

  // Step 1: Check full menu item names against complete message
  // Fix: "biryani" should match "Sindhi Biryani", "tikka" should match "Chicken Tikka"
  for (const item of availableItems) {
    const itemLower = item.toLowerCase().trim();
    // Check: does the FULL user message contain this menu item name?
    if (msgLower.includes(itemLower)) {
      if (!matchedItems.includes(item)) {
        matchedItems.push(item);
        console.info(`[FUZZY-MATCH] Exact phrase found: "${item}" in message`);
      }
      continue;
    }
    // Check: does any word from message exist AS PART of this item name?
    // e.g., word "biryani" is contained in "Sindhi Biryani"
    for (const word of words) {
      if (word.length < 3 || /^\d+$/.test(word)) continue;
      if (itemLower.includes(word) && !matchedItems.includes(item)) {
        // Use substring ratio: shorter/longer
        const ratio = word.length / itemLower.length;
        if (ratio >= 0.30) { // Low threshold: even "tea" in "Chai Tea" should match
          matchedItems.push(item);
          console.info(`[FUZZY-MATCH] Word substring: "${word}" → "${item}" (ratio: ${ratio.toFixed(2)})`);
          break;
        }
      }
    }
  }

  // Step 2: Word-by-word Levenshtein for typos (only for unmatched items)
  for (const word of words) {
    if (word.length < 3 || /^\d+$/.test(word)) continue;

    // Skip if this word already helped match an item
    const alreadyMatched = matchedItems.some(item => item.toLowerCase().includes(word));
    if (alreadyMatched && matchedItems.length > 0) continue;

    const match = findBestMatch(word, availableItems, threshold);

    if (match && !matchedItems.includes(match.match)) {
      matchedItems.push(match.match);
      console.info(`[FUZZY-MATCH] Levenshtein: "${word}" → "${match.match}" (similarity: ${match.similarity.toFixed(2)})`);
    }
  }

  return matchedItems;
}
