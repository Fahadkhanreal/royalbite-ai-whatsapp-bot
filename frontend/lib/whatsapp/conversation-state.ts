// Conversation state tracker for multi-step interactions
// Location: lib/whatsapp/conversation-state.ts
// Tracks conversation flow for orders, reservations, etc.

interface ConversationState {
  state: 'awaiting_order_details' | 'idle';
  context?: {
    orderedItem?: string;
    [key: string]: any;
  };
  timestamp: number;
}

// In-memory store: {userId: ConversationState}
const conversationMap = new Map<string, ConversationState>();

// State expires after 5 minutes of inactivity
const STATE_EXPIRY = 300000; // 5 minutes

// Cleanup old states every 5 minutes
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [userId, state] of conversationMap.entries()) {
      if (now - state.timestamp > STATE_EXPIRY) {
        conversationMap.delete(userId);
      }
    }
  }, STATE_EXPIRY);
}

/**
 * Get current conversation state for user
 */
export function getConversationState(userId: string): ConversationState | null {
  const state = conversationMap.get(userId);

  if (!state) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now - state.timestamp > STATE_EXPIRY) {
    conversationMap.delete(userId);
    return null;
  }

  return state;
}

/**
 * Set conversation state for user
 */
export function setConversationState(
  userId: string,
  state: 'awaiting_order_details' | 'idle',
  context?: any
): void {
  conversationMap.set(userId, {
    state,
    context: context || {},
    timestamp: Date.now(),
  });

  startCleanup();
}

/**
 * Clear conversation state (back to idle)
 */
export function clearConversationState(userId: string): void {
  conversationMap.delete(userId);
}

/**
 * Update conversation context
 */
export function updateConversationContext(userId: string, context: any): void {
  const current = conversationMap.get(userId);
  if (current) {
    current.context = { ...current.context, ...context };
    current.timestamp = Date.now();
  }
}
