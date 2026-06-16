// Message deduplication to prevent duplicate webhook processing
// Location: lib/whatsapp/message-dedup.ts
// Green API sometimes sends duplicate webhooks for same message

// In-memory cache of recently processed message IDs
const processedMessages = new Map<string, number>();

// How long to remember processed messages (5 minutes)
const DEDUP_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if a message has already been processed recently
 */
export function isMessageProcessed(messageId: string): boolean {
  const processedAt = processedMessages.get(messageId);

  if (!processedAt) {
    return false; // Never seen this message
  }

  const timeSinceProcessed = Date.now() - processedAt;

  if (timeSinceProcessed > DEDUP_WINDOW) {
    // Message ID expired, clean it up
    processedMessages.delete(messageId);
    return false;
  }

  return true; // Message was processed recently
}

/**
 * Mark a message as processed
 */
export function markMessageProcessed(messageId: string): void {
  processedMessages.set(messageId, Date.now());

  // Clean up old entries to prevent memory leak
  cleanupOldEntries();
}

/**
 * Clean up message IDs older than dedup window
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  for (const [messageId, timestamp] of processedMessages.entries()) {
    if (now - timestamp > DEDUP_WINDOW) {
      entriesToDelete.push(messageId);
    }
  }

  entriesToDelete.forEach(id => processedMessages.delete(id));
}

/**
 * Get stats about processed messages (for debugging)
 */
export function getMessageStats() {
  return {
    totalTracked: processedMessages.size,
    oldestTimestamp: Math.min(...Array.from(processedMessages.values())),
    newestTimestamp: Math.max(...Array.from(processedMessages.values())),
  };
}
