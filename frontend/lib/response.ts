// Standard response formatting utility
// Location: lib/response.ts

import { isAppError, AppError } from './errors';

/**
 * Success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
  timestamp: string;
}

/**
 * Create success response
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error response
 */
export function errorResponse(error: AppError | Error | unknown): ErrorResponse {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        ...(process.env.NODE_ENV === 'development' && { details: error.details }),
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Type guard for success response
 */
export function isSuccessResponse(response: any): response is SuccessResponse {
  return response?.success === true && 'data' in response;
}

/**
 * Type guard for error response
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response?.success === false && 'error' in response;
}
