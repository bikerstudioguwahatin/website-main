// app/api/admin/banners/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        image: body.image,
        mobileImage: body.mobileImage,
        link: body.link,
        position: body.position ?? 0,
        isActive: body.isActive ?? true
      }
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}