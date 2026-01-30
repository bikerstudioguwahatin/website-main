// app/api/orders/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  console.log('=== POST /api/orders/create called ===');
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Order creation request received');

    const {
      addressId,
      items,
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      couponCode,
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Verify all products exist and have stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Razorpay order
    console.log('Creating Razorpay order...');
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: 'INR',
      receipt: orderNumber,
    });
    console.log('Razorpay order created:', razorpayOrder.id);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId,
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CARD', // Will be updated after payment
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log('Order created in database:', order.id);

    // Update coupon usage if applied
    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
      console.log('Coupon usage updated:', couponCode);
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
