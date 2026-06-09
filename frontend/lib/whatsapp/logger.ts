// Conversation logging for WhatsApp messages
// Location: lib/whatsapp/logger.ts
// Logs conversations for analytics and training data

import { db } from '@/lib/db';
import { chatLogs } from '@/lib/db/schema';
import { DatabaseError } from '@/lib/errors';

export interface LogEntry {
  phoneNumber: string;
  messageText: string;
  messageType?: string;
  intent?: string;
  responseText?: string;
}

/**
 * Log a WhatsApp conversation to the database
 */
export async function logConversation(entry: LogEntry): Promise<void> {
  try {
    await db.insert(chatLogs).values({
      phoneNumber: entry.phoneNumber,
      messageText: entry.messageText,
      messageType: entry.messageType || 'text',
      intent: entry.intent || 'unknown',
      responseText: entry.responseText || '',
    });
  } catch (error) {
    // Log should never break the main flow
    console.error('Failed to log conversation:', error);
  }
}

/**
 * Get conversation history for a phone number
 */
export async function getConversationHistory(
  phoneNumber: string,
  limit: number = 10
): Promise<Array<{
  messageText: string;
  responseText: string | null;
  intent: string | null;
  createdAt: Date;
}>> {
  try {
    const allLogs = await db.query.chatLogs.findMany();
    const logs = allLogs
      .filter((l: any) => l.phoneNumber === phoneNumber)
      .slice(-limit);

    return logs.map(log => ({
      messageText: String(log.messageText || ''),
      responseText: log.responseText ? String(log.responseText) : null,
      intent: log.intent ? String(log.intent) : null,
      createdAt: log.createdAt || new Date(),
    })) as any;
  } catch (error) {
    console.error('Failed to fetch conversation history:', error);
    return [];
  }
}

/**
 * Get conversation stats for analytics
 */
export async function getConversationStats(): Promise<{
  totalConversations: number;
  uniqueUsers: number;
  intentBreakdown: Record<string, number>;
}> {
  try {
    const logs = await db.query.chatLogs.findMany();

    const uniqueUsers = new Set(logs.map(l => l.phoneNumber));
    const intentBreakdown: Record<string, number> = {};

    for (const log of logs) {
      const intent = (log.intent as string) || 'unknown';
      intentBreakdown[intent] = (intentBreakdown[intent] || 0) + 1;
    }

    return {
      totalConversations: logs.length,
      uniqueUsers: uniqueUsers.size,
      intentBreakdown,
    };
  } catch (error) {
    console.error('Failed to get conversation stats:', error);
    return { totalConversations: 0, uniqueUsers: 0, intentBreakdown: {} };
  }
}
