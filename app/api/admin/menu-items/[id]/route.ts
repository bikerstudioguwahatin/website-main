// app/api/admin/menu-items/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // AWAIT params
    const body = await request.json();
    
    console.log('Updating menu item:', id, 'with data:', body);
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        type: body.type,
        description: body.description || null,
        icon: body.icon || null,
        image: body.image || null,
        isActive: body.isActive,
        position: parseInt(body.position) || 0,
        parentId: body.parentId || null,
        brandId: body.brandId || null,
        categoryId: body.categoryId || null
      }
    });

    console.log('Updated menu item:', menuItem);
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Menu item update error:', error);
    return NextResponse.json({ error: 'Failed to update menu item', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // AWAIT params
    
    await prisma.menuItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Menu item delete error:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
