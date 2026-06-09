import { z } from 'zod';

// Environment variables schema with validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional().default(''),

  // OpenAI (optional, for embeddings)
  OPENAI_API_KEY: z.string().optional().default(''),

  // Groq LLM (optional for frontend-only features)
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

  // Google Cloud TTS (optional)
  GOOGLE_TTS_API_KEY: z.string().optional().default(''),
  GOOGLE_TTS_PROJECT_ID: z.string().optional().default(''),

  // WhatsApp (optional, needed only for bot)
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional().default(''),
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_BUSINESS_PHONE_NUMBER: z.string().optional().default('+923482240731'),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().optional().default(''),
  WHATSAPP_API_TOKEN: z.string().optional().default(''),

  // NextAuth
  AUTH_SECRET: z.string().optional().default(''),
  AUTH_URL: z.string().optional().default('http://localhost:3000'),

  // Fallback to NEXT_PUBLIC variables for Vercel compat
  NEXTAUTH_SECRET: z.string().optional().default(''),
  NEXTAUTH_URL: z.string().optional().default('http://localhost:3000'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/**
 * Parse environment variables with graceful fallback.
 * If validation fails, returns sensible defaults instead of crashing.
 */
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const missing = err.issues.map(i => i.path.join('.')).join(', ');
      console.warn(`[env] Some env vars are missing or invalid: ${missing}. Using defaults.`);
    }
    // Return partial defaults for everything that's optional
    return {
      DATABASE_URL: process.env.DATABASE_URL || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      GROQ_API_KEY: process.env.GROQ_API_KEY || '',
      GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || '',
      GOOGLE_TTS_PROJECT_ID: process.env.GOOGLE_TTS_PROJECT_ID || '',
      WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      WHATSAPP_BUSINESS_PHONE_NUMBER_ID: process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '',
      WHATSAPP_BUSINESS_PHONE_NUMBER: process.env.WHATSAPP_BUSINESS_PHONE_NUMBER || '+923482240731',
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || '',
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'royalbite-dev-secret-key-change-in-production',
      AUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      SENTRY_DSN: process.env.SENTRY_DSN || '',
      LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    };
  }
}

// Parse and validate environment variables
export const env = parseEnv();

// Type for environment variables
export type Env = ReturnType<typeof parseEnv>;
