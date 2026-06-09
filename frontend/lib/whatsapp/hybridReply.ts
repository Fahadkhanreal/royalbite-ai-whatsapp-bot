// Hybrid text + voice reply system for WhatsApp
// Location: lib/whatsapp/hybridReply.ts
// Sends both text and voice replies for order confirmations

import { sendWhatsAppMessage, sendWhatsAppAudio } from './client';
import { generateTextToSpeech } from '@/lib/voice/tts';
import { WhatsAppError } from '@/lib/errors';

/**
 * Generate voice from text and send to WhatsApp user
 *
 * Pipeline:
 * 1. Convert response text to speech audio
 * 2. Upload audio to a temporary storage
 * 3. Send audio via WhatsApp API
 *
 * For MVP: Voice is optional - gracefully falls back to text-only
 */
export async function generateAndSendVoice(
  to: string,
  text: string
): Promise<boolean> {
  try {
    // Generate audio from text (text-to-speech)
    const audioBuffer = await generateTextToSpeech(text);

    if (!audioBuffer || (audioBuffer as any).length === 0) {
      console.warn('Voice generation returned empty audio');
      return false;
    }

    // For MVP: Convert buffer to base64 data URL or upload to cloud storage
    // In production: Upload to a cloud storage (S3, Cloudinary, etc.) and get a URL
    const audioUrl = await uploadAudioToStorage(audioBuffer);

    if (!audioUrl) {
      console.warn('Audio upload failed, sending text only');
      return false;
    }

    // Send audio via WhatsApp
    await sendWhatsAppAudio(to, audioUrl);

    return true;
  } catch (error) {
    console.error('Voice reply failed:', error);
    return false; // Voice failure is non-fatal
  }
}

/**
 * Send both text and voice reply for important messages (order confirmations)
 */
export async function sendHybridReply(
  to: string,
  text: string,
  includeVoice: boolean = true
): Promise<{ textSent: boolean; voiceSent: boolean }> {
  try {
    // Always send text first
    await sendWhatsAppMessage(to, text);
    const result = { textSent: true, voiceSent: false };

    // Optionally send voice
    if (includeVoice) {
      try {
        const voiceSent = await generateAndSendVoice(to, text);
        result.voiceSent = voiceSent;
      } catch (voiceError) {
        console.warn('Voice sending failed, text already delivered:', voiceError);
        // Voice failure doesn't affect text delivery
      }
    }

    return result;
  } catch (error) {
    throw new WhatsAppError(
      'Failed to send hybrid reply',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Upload audio buffer to temporary storage and return a URL
 *
 * For MVP: Returns a base64 data URI (not ideal for WhatsApp).
 * For production: Upload to cloud storage (AWS S3, Cloudinary, etc.)
 */
async function uploadAudioToStorage(audioBuffer: ArrayBuffer): Promise<string | null> {
  try {
    // For MVP: Store as base64 data URI (works for testing)
    // In production: Upload to S3/Cloudinary and return public URL
    const base64 = Buffer.from(audioBuffer).toString('base64');
    return `data:audio/ogg;base64,${base64}`;
  } catch (error) {
    console.error('Audio upload to storage failed:', error);
    return null;
  }
}

/**
 * Check if voice replies are enabled and configured
 */
export function isVoiceEnabled(): boolean {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  return !!apiKey && apiKey !== 'your_google_tts_api_key_here';
}
