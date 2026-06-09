// Gallery Images API - Public read, Admin write
// Location: app/api/gallery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleryImages } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { successResponse, errorResponse } from '@/lib/response';
import { RAGError } from '@/lib/errors';

/**
 * GET /api/gallery
 * Public: List all gallery images ordered by sort_order
 */
export async function GET() {
  try {
    const images = await db.query.galleryImages.findMany({
      orderBy: [asc(galleryImages.sortOrder)],
    });

    return NextResponse.json(
      successResponse({
        images: images.map((img: any) => ({
          id: img.id,
          src: img.src,
          alt: img.alt,
          sortOrder: img.sortOrder,
          createdAt: img.createdAt,
        })),
      })
    );
  } catch (error) {
    console.error('Gallery list error:', error);
    return NextResponse.json(
      errorResponse(new RAGError('Failed to fetch gallery images')),
      { status: 500 }
    );
  }
}

/**
 * POST /api/gallery
 * Admin: Create a new gallery image entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { src, alt, sortOrder } = body;

    if (!src || !alt) {
      return NextResponse.json(
        errorResponse(new RAGError('src and alt are required')),
        { status: 400 }
      );
    }

    const [inserted] = await db.insert(galleryImages).values({
      src,
      alt,
      sortOrder: sortOrder ?? 0,
    }).returning();

    return NextResponse.json(
      successResponse({
        id: inserted.id,
        src: inserted.src,
        alt: inserted.alt,
        sortOrder: inserted.sortOrder,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Gallery create error:', error);
    return NextResponse.json(
      errorResponse(new RAGError('Failed to create gallery image')),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gallery
 * Admin: Delete a gallery image by id
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        errorResponse(new RAGError('id is required')),
        { status: 400 }
      );
    }

    await db.delete(galleryImages).where(eq(galleryImages.id, id));

    return NextResponse.json(
      successResponse({ deleted: true })
    );
  } catch (error) {
    console.error('Gallery delete error:', error);
    return NextResponse.json(
      errorResponse(new RAGError('Failed to delete gallery image')),
      { status: 500 }
    );
  }
}
