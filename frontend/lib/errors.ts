// Global error handling classes and utilities
// Location: lib/errors.ts

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        ...(process.env.NODE_ENV === 'development' && { details: this.details }),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

/**
 * RAG system error (500)
 */
export class RAGError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(500, 'RAG_ERROR', message, details);
  }
}

/**
 * WhatsApp integration error (500)
 */
export class WhatsAppError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(500, 'WHATSAPP_ERROR', message, details);
  }
}

/**
 * Order processing error (500)
 */
export class OrderError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(500, 'ORDER_ERROR', message, details);
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: Record<string, any>) {
    super(500, 'DATABASE_ERROR', message, details);
  }
}

/**
 * External service error (503)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string) {
    super(503, 'EXTERNAL_SERVICE_ERROR', `${service} is unavailable`);
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(500, 'INTERNAL_ERROR', error.message, { originalError: error.stack });
  }

  return new AppError(500, 'UNKNOWN_ERROR', 'An unknown error occurred', { error });
}
