// app/api/admin/brands/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { bikes: true } }
      },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const brand = await prisma.brand.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        logo: body.logo,
        bgColor: body.bgColor || 'bg-white',
        textColor: body.textColor || 'text-gray-800',
        description: body.description,
        isActive: body.isActive ?? true,
        position: body.position || 0
      }
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Brand create error:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}