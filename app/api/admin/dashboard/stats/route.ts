import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      lowStockProducts,
      orders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { stock: { lt: 10 } } }),
      prisma.order.findMany({ select: { total: true } })
    ]);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      revenue,
      pendingOrders,
      lowStock: lowStockProducts
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}