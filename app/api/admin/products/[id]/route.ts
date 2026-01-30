// app/api/admin/products/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteImages } from '@/lib/imageUtils';

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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing product to find old images
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { images: true, thumbnail: true }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        stock: parseInt(body.stock),
        sku: body.sku,
        images: body.images || [],
        thumbnail: body.thumbnail,
        categoryId: body.categoryId,
        bikeId: body.bikeId || null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions,
        material: body.material,
        color: body.color,
        size: body.size
      },
      include: {
        category: { select: { name: true } },
        bike: { select: { name: true } }
      }
    });

    // Delete old images that are no longer in use
    const oldImages = existingProduct.images || [];
    const newImages = body.images || [];
    const oldThumbnail = existingProduct.thumbnail;
    const newThumbnail = body.thumbnail;

    // Find images that were removed
    const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
    
    // Check if thumbnail was changed
    if (oldThumbnail && oldThumbnail !== newThumbnail && !newImages.includes(oldThumbnail)) {
      imagesToDelete.push(oldThumbnail);
    }
    
    // Delete removed images from filesystem
    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : String(error) },
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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // First, get the product to retrieve image URLs
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { images: true, thumbnail: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product from database
    await prisma.product.delete({
      where: { id: params.id }
    });

    // Delete associated images from filesystem
    const imagesToDelete = [...(product.images || [])];
    if (product.thumbnail && !imagesToDelete.includes(product.thumbnail)) {
      imagesToDelete.push(product.thumbnail);
    }
    
    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}