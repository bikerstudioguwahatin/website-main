// app/api/admin/banners/[id]/route.ts

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
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Get existing banner to find old images
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id },
      select: { image: true, mobileImage: true }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Update banner
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        image: body.image || existingBanner.image,
        mobileImage: body.mobileImage || existingBanner.mobileImage,
        link: body.link,
        position: body.position ?? 0,
        isActive: body.isActive ?? true
      }
    });

    // Delete old images if they were changed
    const imagesToDelete: string[] = [];

    if (
      existingBanner.image && 
      body.image && 
      existingBanner.image !== body.image &&
      existingBanner.image.startsWith('/uploads/')
    ) {
      imagesToDelete.push(existingBanner.image);
    }

    if (
      existingBanner.mobileImage && 
      body.mobileImage && 
      existingBanner.mobileImage !== body.mobileImage &&
      existingBanner.mobileImage.startsWith('/uploads/')
    ) {
      imagesToDelete.push(existingBanner.mobileImage);
    }

    if (imagesToDelete.length > 0) {
      deleteImages(imagesToDelete).catch(err => {
        console.error('Failed to delete old images (non-critical):', err);
      });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Banner update error:', error);
    return NextResponse.json(
      { error: 'Failed to update banner', details: error instanceof Error ? error.message : String(error) },
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
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Get banner to retrieve images
    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
      select: { image: true, mobileImage: true }
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete banner from database
    await prisma.banner.delete({
      where: { id: params.id }
    });

    // Delete images from filesystem
    const imagesToDelete: string[] = [];
    
    if (banner.image && banner.image.startsWith('/uploads/')) {
      imagesToDelete.push(banner.image);
    }
    
    if (banner.mobileImage && banner.mobileImage.startsWith('/uploads/')) {
      imagesToDelete.push(banner.mobileImage);
    }

    if (imagesToDelete.length > 0) {
      deleteImages(imagesToDelete).catch(err => {
        console.error('Failed to delete images (non-critical):', err);
      });
    }

    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}