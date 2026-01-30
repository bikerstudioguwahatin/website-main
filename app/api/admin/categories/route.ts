
// ============================================
// FILE: app/api/admin/categories/route.ts
// ============================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('📦 Fetching categories...');
    
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        bike: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } }
      },
      orderBy: { name: 'asc' } // Changed from position to name
    });

    console.log(`✅ Found ${categories.length} categories`);
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('❌ Categories fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📝 Creating category:', body.name);
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.slug?.trim() || body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    const bikeId = body.bikeId && body.bikeId !== '' ? body.bikeId : null;
    const parentId = body.parentId && body.parentId !== '' ? body.parentId : null;

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug: slug,
        description: body.description?.trim() || null,
        image: body.image?.trim() || null,
        icon: body.icon?.trim() || null,
        showInMenu: body.showInMenu ?? true,
        menuColumns: parseInt(body.menuColumns) || 1,
        isActive: body.isActive ?? true,
        bikeId: bikeId,
        parentId: parentId
        // Removed position field
      },
      include: {
        parent: { select: { id: true, name: true } },
        bike: { select: { id: true, name: true } }
      }
    });

    console.log('✅ Category created:', category.id);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('❌ Category create error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category with this name or slug already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create category',
      details: error.message 
    }, { status: 500 });
  }
}