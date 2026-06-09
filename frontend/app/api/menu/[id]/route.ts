// Menu item by ID endpoints
// Location: app/api/menu/[id]/route.ts
// PUT /api/menu/[id] - Update dish (triggers RAG update)
// DELETE /api/menu/[id] - Remove dish

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dishes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateDishSchema } from '@/lib/validations/schemas';
import { successResponse, errorResponse } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { verifyAdminAuth } from '@/lib/middleware/auth';
import { syncMenuToRAG } from '@/lib/rag/auto-ingest';

/**
 * PUT /api/menu/[id]
 *
 * Update a dish. Admin only.
 * Triggers RAG re-indexing after update.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(request);

    const { id } = await params;

    // Check dish exists
    const existing = await db.query.dishes.findFirst({
      where: eq(dishes.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        errorResponse(new NotFoundError('Dish')),
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate partial update
    const parsed = updateDishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new ValidationError('Invalid update data', {
            errors: parsed.error.flatten().fieldErrors,
          })
        ),
        { status: 400 }
      );
    }

    const { name, description, price, imageUrl, isAvailable } = parsed.data;

    // Build update data
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price.toString();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // Update dish
    const [updated] = await db.update(dishes)
      .set(updateData)
      .where(eq(dishes.id, id))
      .returning();

    // Trigger RAG sync
    syncMenuToRAG().catch(err => {
      console.error('RAG sync after menu update failed:', err);
    });

    return NextResponse.json(
      successResponse({ dish: updated })
    );
  } catch (error) {
    console.error('Menu PUT error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu/[id]
 *
 * Delete a dish. Admin only.
 * Triggers RAG re-indexing after deletion.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(request);

    const { id } = await params;

    // Check dish exists
    const existing = await db.query.dishes.findFirst({
      where: eq(dishes.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        errorResponse(new NotFoundError('Dish')),
        { status: 404 }
      );
    }

    // Delete dish
    await db.delete(dishes).where(eq(dishes.id, id));

    // Trigger RAG sync
    syncMenuToRAG().catch(err => {
      console.error('RAG sync after menu delete failed:', err);
    });

    return NextResponse.json(
      successResponse({ message: 'Dish deleted successfully' })
    );
  } catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json(
      errorResponse(error),
      { status: 500 }
    );
  }
}
