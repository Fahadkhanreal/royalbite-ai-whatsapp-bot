// Intent cooldown tracker to prevent duplicate responses
// Location: lib/whatsapp/cooldown.ts
// Prevents bot from replying to same intent within cooldown period

interface CooldownEntry {
  intent: string;
  timestamp: number;
}

// In-memory store: {userId: {intent: timestamp}}
const cooldownMap = new Map<string, Map<string, number>>();

// Cooldown period in milliseconds (60 seconds)
const COOLDOWN_PERIOD = 60000;

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 300000;

// Start cleanup timer
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [userId, intents] of cooldownMap.entries()) {
      for (const [intent, timestamp] of intents.entries()) {
        if (now - timestamp > COOLDOWN_PERIOD * 2) {
          intents.delete(intent);
        }
      }
      if (intents.size === 0) {
        cooldownMap.delete(userId);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check if user+intent is in cooldown period
 * @param userId - User phone number or chat ID
 * @param intent - Detected intent action
 * @returns true if in cooldown (should skip), false if should process
 */
export function isInCooldown(userId: string, intent: string): boolean {
  const userIntents = cooldownMap.get(userId);

  if (!userIntents) {
    return false;
  }

  const lastTimestamp = userIntents.get(intent);

  if (!lastTimestamp) {
    return false;
  }

  const now = Date.now();
  const timeSinceLastResponse = now - lastTimestamp;

  // If less than cooldown period, user is in cooldown
  return timeSinceLastResponse < COOLDOWN_PERIOD;
}

/**
 * Record that user received response for this intent
 * @param userId - User phone number or chat ID
 * @param intent - Detected intent action
 */
export function recordResponse(userId: string, intent: string): void {
  let userIntents = cooldownMap.get(userId);

  if (!userIntents) {
    userIntents = new Map<string, number>();
    cooldownMap.set(userId, userIntents);
  }

  userIntents.set(intent, Date.now());

  // Start cleanup if not already running
  startCleanup();
}

/**
 * Get remaining cooldown time in seconds
 * @param userId - User phone number or chat ID
 * @param intent - Detected intent action
 * @returns Seconds remaining, or 0 if not in cooldown
 */
export function getCooldownRemaining(userId: string, intent: string): number {
  const userIntents = cooldownMap.get(userId);

  if (!userIntents) {
    return 0;
  }

  const lastTimestamp = userIntents.get(intent);

  if (!lastTimestamp) {
    return 0;
  }

  const now = Date.now();
  const elapsed = now - lastTimestamp;
  const remaining = COOLDOWN_PERIOD - elapsed;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Clear all cooldowns (useful for testing)
 */
export function clearAllCooldowns(): void {
  cooldownMap.clear();
}
