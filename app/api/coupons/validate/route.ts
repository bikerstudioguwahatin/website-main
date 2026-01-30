// app/api/coupons/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/coupons/validate called ===');
  
  try {
    const { code, orderValue } = await request.json();
    
    console.log('Validating coupon:', { code, orderValue });

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    console.log('Coupon found:', coupon ? 'Yes' : 'No');

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      console.log('Coupon is not active');
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    // Set times to start of day for date-only comparison
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const validFromDateOnly = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
    const validUntilDateOnly = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate());
    
    console.log('Date comparison:', {
      now: now.toISOString(),
      validFrom: validFrom.toISOString(),
      validUntil: validUntil.toISOString(),
      nowDateOnly: nowDateOnly.toISOString(),
      validFromDateOnly: validFromDateOnly.toISOString(),
      validUntilDateOnly: validUntilDateOnly.toISOString()
    });

    // Compare dates only (ignore time)
    if (nowDateOnly < validFromDateOnly) {
      console.log('Coupon not yet valid');
      return NextResponse.json(
        { error: `This coupon will be valid from ${validFromDateOnly.toLocaleDateString('en-IN')}` },
        { status: 400 }
      );
    }

    if (nowDateOnly > validUntilDateOnly) {
      console.log('Coupon has expired');
      return NextResponse.json(
        { error: `This coupon expired on ${validUntilDateOnly.toLocaleDateString('en-IN')}` },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      console.log('Coupon usage limit reached');
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order value
    const minOrderValue = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
    if (minOrderValue > 0 && orderValue < minOrderValue) {
      console.log('Order value below minimum:', { orderValue, minOrderValue });
      return NextResponse.json(
        { 
          error: `Minimum order value of Rs. ${minOrderValue.toFixed(2)} required` 
        },
        { status: 400 }
      );
    }

    console.log('Coupon validated successfully');

    // Return valid coupon with converted Decimal values
    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
      },
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to validate coupon', details: error.message },
      { status: 500 }
    );
  }
}