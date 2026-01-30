// app/api/admin/products/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        bike: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.product.count();

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        price: parseFloat(body.price),
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        stock: parseInt(body.stock),
        sku: body.sku,
        images: body.images || [],
        thumbnail: body.thumbnail || body.images?.[0] || '',
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}