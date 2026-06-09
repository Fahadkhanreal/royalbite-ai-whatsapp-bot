// Admin-only middleware for protecting API routes
// Location: lib/middleware/adminOnly.ts
// Reusable middleware to enforce admin role on endpoints

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { errorResponse } from '@/lib/response';
import { AuthorizationError } from '@/lib/errors';

/**
 * Middleware to ensure the request has admin privileges.
 * Use this for all admin-only API routes.
 */
export async function requireAdmin(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      errorResponse(new AuthorizationError('Authentication required')),
      { status: 401 }
    );
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json(
      errorResponse(new AuthorizationError('Admin access required')),
      { status: 403 }
    );
  }

  return null; // null means allowed
}

/**
 * Helper to validate admin session and return error response if invalid
 */
export async function validateAdminSession(): Promise<{
  isAdmin: boolean;
  error?: NextResponse;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        isAdmin: false,
        error: NextResponse.json(
          errorResponse(new AuthorizationError('Authentication required')),
          { status: 401 }
        ),
      };
    }

    if (session.user.role !== 'admin') {
      return {
        isAdmin: false,
        error: NextResponse.json(
          errorResponse(new AuthorizationError('Admin access required')),
          { status: 403 }
        ),
      };
    }

    return { isAdmin: true };
  } catch {
    return {
      isAdmin: false,
      error: NextResponse.json(
        errorResponse(new AuthorizationError('Session validation failed')),
        { status: 500 }
      ),
    };
  }
}
