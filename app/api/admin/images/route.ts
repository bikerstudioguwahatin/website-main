// app/api/admin/images/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(imagesDir);
    
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(imagesDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          path: `/uploads/images/${file}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Failed to read images directory:', error);
    return NextResponse.json(
      { error: 'Failed to load images', images: [] },
      { status: 500 }
    );
  }
}

