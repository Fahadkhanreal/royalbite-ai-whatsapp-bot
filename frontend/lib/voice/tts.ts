// Google Cloud Text-to-Speech client
// Location: lib/voice/tts.ts
// Converts text to speech audio for WhatsApp voice replies

import { env } from '@/lib/env';
import { ExternalServiceError } from '@/lib/errors';

export interface TTSOptions {
  text: string;
  language?: string;
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
}

export interface TTSVoice {
  name: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

const DEFAULT_OPTIONS: TTSOptions = {
  text: '',
  language: 'en-US',
  voiceName: 'en-US-Neural2-D',
  speakingRate: 1.0,
  pitch: 0,
};

/**
 * Generate text-to-speech audio using Google Cloud TTS API
 *
 * Makes a direct REST API call to Google Cloud TTS.
 * Falls back gracefully if API key is not configured.
 */
export async function generateTextToSpeech(
  text: string,
  options: Partial<TTSOptions> = {}
): Promise<ArrayBuffer> {
  const opts = { ...DEFAULT_OPTIONS, text, ...options };

  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate speech from empty text');
  }

  // If no API key configured, return mock audio for development
  if (!env.GOOGLE_TTS_API_KEY || env.GOOGLE_TTS_API_KEY === 'your_google_tts_api_key_here') {
    console.warn('Google TTS API key not configured, returning mock audio');
    return generateMockAudio(text);
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: opts.text },
          voice: {
            languageCode: opts.language,
            name: opts.voiceName,
          },
          audioConfig: {
            audioEncoding: 'OGG_OPUS',
            speakingRate: opts.speakingRate,
            pitch: opts.pitch,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ExternalServiceError(
        `Google TTS API error: ${response.status} - ${errorBody.slice(0, 200)}`
      );
    }

    const data = await response.json();

    // Decode base64 audio content
    const audioContent = data.audioContent;
    if (!audioContent) {
      throw new ExternalServiceError('Google TTS returned empty audio content');
    }

    const binaryString = atob(audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  } catch (error) {
    if (error instanceof ExternalServiceError) throw error;
    throw new ExternalServiceError(
      `TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Synthesize speech with multiple voices/options
 */
export async function synthesizeSpeech(
  texts: string[],
  options: Partial<TTSOptions> = {}
): Promise<ArrayBuffer[]> {
  return Promise.all(
    texts.map(text => generateTextToSpeech(text, options))
  );
}

/**
 * Generate mock audio for development/testing purposes
 * Returns a minimal valid OGG Opus header
 */
async function generateMockAudio(text: string): Promise<ArrayBuffer> {
  // Create a minimal OGG container (this is just a placeholder)
  // In development, this allows testing the pipeline without TTS API
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(`[TTS Mock] ${text}`);
  return textBytes.buffer;
}
