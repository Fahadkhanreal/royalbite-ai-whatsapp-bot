// Menu API endpoints
// Location: app/api/menu/route.ts
// GET /api/menu - List all dishes
// POST /api/menu - Create new dish

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dishes } from '@/lib/db/schema';
import { createDishSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';
import { syncMenuToRAG } from '@/lib/rag/auto-ingest';

/**
 * GET /api/menu
 *
 * List all dishes with optional category filter and pagination.
 *
 * Query params:
 *   category: string (optional filter)
 *   available: boolean (optional filter)
 *   limit: number (default 50)
 *   offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query with filters using findMany pattern
    const featured = searchParams.get('featured');
    let result;
    if (featured === 'true') {
      const allDishes = await db.query.dishes.findMany({ limit, offset });
      result = allDishes.filter((d: any) => d.isFeatured === true && d.isAvailable !== false);
    } else if (category) {
      const allDishes = await db.query.dishes.findMany({ limit, offset });
      result = allDishes.filter((d: any) => d.category === category);
    } else {
      result = await db.query.dishes.findMany({ limit, offset });
    }

    const allCount = await db.query.dishes.findMany();
    const totalCount = allCount.length;

    return NextResponse.json(
      successResponse({
        dishes: result,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      })
    );
  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu
 *
 * Create a new dish. Admin only.
 * Automatically triggers RAG re-indexing.
 *
 * Body:
 * {
 *   "name": "Sindhi Biryani",
 *   "description": "...",
 *   "price": 250,
 *   "category": "biryani",
 *   "imageUrl": "https://...",
 *   "isAvailable": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const body = await request.json();

    // Validate input
    const parsed = createDishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid dish data', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { name, description, price, category, imageUrl, isAvailable, isFeatured } = parsed.data;

    // Insert dish
    const [dish] = await db.insert(dishes).values({
      name,
      description: description || null,
      price: price.toString(),
      category: category || null,
      imageUrl: imageUrl || null,
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
    }).returning();

    // Trigger RAG sync for menu updates
    syncMenuToRAG().catch(err => {
      console.error('RAG sync after menu create failed:', err);
    });

    return NextResponse.json(
      successResponse({ dish }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
