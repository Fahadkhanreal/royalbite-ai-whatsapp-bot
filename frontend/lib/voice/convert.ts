// Audio format conversion utilities for WhatsApp
// Location: lib/voice/convert.ts
// Converts audio to WhatsApp-compatible formats (OGG_OPUS)

export type AudioFormat = 'OGG_OPUS' | 'MP3' | 'WAV';
export const WHATSAPP_AUDIO_FORMAT: AudioFormat = 'OGG_OPUS';
export const WHATSAPP_MAX_AUDIO_SIZE = 16 * 1024 * 1024; // 16MB

/**
 * Convert audio buffer to WhatsApp-compatible format
 *
 * For MVP: Assumes audio is already in OGG_OPUS format from Google TTS.
 * For production: Use FFmpeg or a Node.js audio processing library.
 */
export async function convertToWhatsAppAudio(
  audioBuffer: ArrayBuffer,
  targetFormat: AudioFormat = WHATSAPP_AUDIO_FORMAT
): Promise<ArrayBuffer> {
  // Validate audio size
  if (audioBuffer.byteLength > WHATSAPP_MAX_AUDIO_SIZE) {
    throw new Error(
      `Audio exceeds WhatsApp size limit: ${(audioBuffer.byteLength / 1024 / 1024).toFixed(1)}MB > 16MB`
    );
  }

  // For MVP: Google TTS already returns OGG_OPUS which is WhatsApp-compatible
  // In production: Convert using FFmpeg for other formats
  if (targetFormat === 'OGG_OPUS') {
    return audioBuffer;
  }

  // For non-OGG formats, log warning and return as-is
  console.warn(`Format conversion to ${targetFormat} not yet implemented, returning original buffer`);
  return audioBuffer;
}

/**
 * Check if audio is within WhatsApp constraints
 */
export function validateAudioForWhatsApp(audioBuffer: ArrayBuffer): {
  valid: boolean;
  sizeMB: number;
  maxSizeMB: number;
  issues: string[];
} {
  const sizeMB = audioBuffer.byteLength / 1024 / 1024;
  const issues: string[] = [];

  if (sizeMB > 16) {
    issues.push(`Audio too large: ${sizeMB.toFixed(1)}MB > 16MB`);
  }

  return {
    valid: issues.length === 0,
    sizeMB: Math.round(sizeMB * 100) / 100,
    maxSizeMB: 16,
    issues,
  };
}

/**
 * Truncate text to fit within TTS character limits
 * Google TTS has a ~5000 character limit per request
 */
export function truncateForTTS(text: string, maxChars: number = 3000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}
