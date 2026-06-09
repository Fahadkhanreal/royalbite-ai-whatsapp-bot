// Authentication middleware for protected routes
// Location: lib/middleware/auth.ts
// NOTE: For new code, prefer import { requireAdmin } from "@/lib/admin-auth"
// This module provides alternative auth with error-throwing pattern for API routes.

import { auth } from '@/lib/auth';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { isAdminUser } from '@/lib/repositories/admin-users';

/**
 * Verify JWT token from request header
 */
export async function verifyAuth(request: Request) {
  const session = await auth();

  if (!session?.user) {
    throw new AuthenticationError('Authentication required. Please log in.');
  }

  return session;
}

/**
 * Verify admin role
 */
export async function verifyAdminAuth(request: Request) {
  const session = await verifyAuth(request);

  if (!isAdminUser(session.user)) {
    throw new AuthorizationError('Admin access required.');
  }

  return session;
}

/**
 * Middleware to check authentication
 */
export async function withAuth(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      const session = await verifyAuth(request);
      (request as any).session = session;
      return handler(request, ...args);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Middleware to check admin role
 */
export async function withAdminAuth(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      const session = await verifyAdminAuth(request);
      (request as any).session = session;
      return handler(request, ...args);
    } catch (error) {
      throw error;
    }
  };
}
