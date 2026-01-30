import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        name: true,
        slug: true,
        bikes: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}