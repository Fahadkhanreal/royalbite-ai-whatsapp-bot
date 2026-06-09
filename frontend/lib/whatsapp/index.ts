// WhatsApp Integration - Barrel exports
// Location: lib/whatsapp/index.ts

export { processIncomingMessage } from './processor';
export type { WhatsAppMessage, WhatsAppMetadata } from './processor';

export { detectIntent, getGreetingResponse } from './intent';
export type { IntentResult, IntentAction } from './intent';

export { sendWhatsAppMessage, sendWhatsAppAudio } from './client';

export { generateReply, generateContextualReply } from './respond';

export { logConversation, getConversationHistory, getConversationStats } from './logger';
export type { LogEntry } from './logger';

export { detectOrderFromMessage } from './orderDetection';
export type { DetectedOrderItem, OrderDetectionResult } from './orderDetection';

export { generateAndSendVoice, sendHybridReply, isVoiceEnabled } from './hybridReply';
