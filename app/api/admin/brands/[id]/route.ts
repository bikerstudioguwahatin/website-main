// app/api/admin/brands/[id]/route.ts

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
    
    console.log('Brand ID from params:', params.id);
    console.log('Body:', body);

    if (!params.id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    // Get existing brand to find old logo
    const existingBrand = await prisma.brand.findUnique({
      where: { id: params.id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      logo: body.logo || existingBrand.logo,
      bgColor: body.bgColor || 'bg-white',
      textColor: body.textColor || 'text-gray-800',
      description: body.description || null,
      isActive: body.isActive ?? true,
      position: body.position ?? 0
    };

    // Update brand
    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: updateData
    });

    // Delete old logo if it was changed and is different
    if (
      existingBrand.logo && 
      body.logo && 
      existingBrand.logo !== body.logo &&
      existingBrand.logo.startsWith('/uploads/')
    ) {
      deleteImage(existingBrand.logo).catch(err => {
        console.error('Failed to delete old logo (non-critical):', err);
      });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Brand update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update brand', 
        details: error instanceof Error ? error.message : String(error)
      },
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
    
    console.log('Deleting brand ID:', params.id);

    if (!params.id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    // First, get the brand to retrieve logo URL
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      select: { logo: true }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Delete the brand from database
    await prisma.brand.delete({
      where: { id: params.id }
    });

    // Delete logo image from filesystem if it exists and is our uploaded file
    if (brand.logo && brand.logo.startsWith('/uploads/')) {
      deleteImage(brand.logo).catch(err => {
        console.error('Failed to delete logo (non-critical):', err);
      });
    }

    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('Brand delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete brand', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}