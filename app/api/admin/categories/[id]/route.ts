import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================
// FILE: app/api/admin/categories/[id]/route.ts
// ============================================

async function checkCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
  let currentId = newParentId;
  const visited = new Set<string>();
  
  while (currentId) {
    if (visited.has(currentId)) return true;
    if (currentId === categoryId) return true;
    
    visited.add(currentId);
    
    const parent = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true }
    });
    
    if (!parent || !parent.parentId) break;
    currentId = parent.parentId;
  }
  
  return false;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('📝 Updating category:', params.id);
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const slugConflict = await prisma.category.findFirst({
      where: {
        slug: body.slug.trim(),
        NOT: { id: params.id }
      }
    });

    if (slugConflict) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    if (body.parentId && body.parentId !== '') {
      if (body.parentId === params.id) {
        return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
      }

      const isCircular = await checkCircularReference(params.id, body.parentId);
      if (isCircular) {
        return NextResponse.json({ error: 'Circular parent reference detected' }, { status: 400 });
      }
    }

    const bikeId = body.bikeId && body.bikeId !== '' ? body.bikeId : null;
    const parentId = body.parentId && body.parentId !== '' ? body.parentId : null;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
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

    console.log('✅ Category updated:', category.id);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('❌ Category update error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category with this name or slug already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update category',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Deleting category:', params.id);
    
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.products} products` },
        { status: 400 }
      );
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.children} subcategories` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id }
    });

    console.log('✅ Category deleted:', params.id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('❌ Category delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete category',
      details: error.message 
    }, { status: 500 });
  }
}