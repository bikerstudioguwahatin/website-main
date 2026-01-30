import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code.toUpperCase(),
        description: body.description,
        discountType: body.discountType,
        discountValue: parseFloat(body.discountValue),
        minOrderValue: body.minOrderValue ? parseFloat(body.minOrderValue) : null,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        isActive: body.isActive,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil)
      }
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.coupon.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}