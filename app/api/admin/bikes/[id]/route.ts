// app/api/admin/bikes/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteImage } from '@/lib/imageUtils';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const body = await request.json();
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    // Get existing bike to find old image
    const existingBike = await prisma.bike.findUnique({
      where: { id: params.id },
      select: { image: true }
    });

    if (!existingBike) {
      return NextResponse.json(
        { error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Update bike
    const bike = await prisma.bike.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        model: body.model,
        year: parseInt(body.year),
        description: body.description,
        image: body.image || existingBike.image,
        isActive: body.isActive ?? true,
        position: body.position ?? 0,
        brandId: body.brandId
      },
      include: {
        brand: { select: { name: true } }
      }
    });

    // Delete old image if it was changed
    if (
      existingBike.image && 
      body.image && 
      existingBike.image !== body.image &&
      existingBike.image.startsWith('/uploads/')
    ) {
      deleteImage(existingBike.image).catch(err => {
        console.error('Failed to delete old image (non-critical):', err);
      });
    }

    return NextResponse.json(bike);
  } catch (error) {
    console.error('Bike update error:', error);
    return NextResponse.json(
      { error: 'Failed to update bike', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    // Check if bike has products
    const productsCount = await prisma.product.count({
      where: { bikeId: params.id }
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete bike with ${productsCount} products` },
        { status: 400 }
      );
    }

    // Get bike to retrieve image
    const bike = await prisma.bike.findUnique({
      where: { id: params.id },
      select: { image: true }
    });

    if (!bike) {
      return NextResponse.json(
        { error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Delete bike from database
    await prisma.bike.delete({
      where: { id: params.id }
    });

    // Delete image from filesystem if it exists and is our uploaded file
    if (bike.image && bike.image.startsWith('/uploads/')) {
      deleteImage(bike.image).catch(err => {
        console.error('Failed to delete image (non-critical):', err);
      });
    }

    return NextResponse.json({ success: true, message: 'Bike deleted' });
  } catch (error) {
    console.error('Bike delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bike', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}