// ===================================================
// app/api/orders/verify-payment/route.ts
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/orders/verify-payment called ===');
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    console.log('Verifying payment for order:', orderId);

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('Payment signature verification failed');
      
      // Update order as failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    console.log('Payment signature verified successfully');

    // Update order as paid
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        paymentId: razorpay_payment_id,
      },
      include: {
        items: true,
      },
    });

    console.log('Order updated to CONFIRMED');

    // Reduce stock for all products
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    console.log('Product stock reduced');

    // Clear user's cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
      console.log('Cart cleared');
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}