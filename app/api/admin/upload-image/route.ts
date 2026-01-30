// app/api/admin/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');
const MAX_FILE_SIZE = 500 * 1024; // 500KB

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Process image with sharp
    let processedImage = sharp(buffer)
      .webp({ quality: 85 }) // Start with quality 85
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Convert to buffer to check size
    let outputBuffer = await processedImage.toBuffer();
    let quality = 85;

    // Reduce quality if file is too large
    while (outputBuffer.length > MAX_FILE_SIZE && quality > 20) {
      quality -= 5;
      processedImage = sharp(buffer)
        .webp({ quality })
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        });
      outputBuffer = await processedImage.toBuffer();
    }

    // If still too large, reduce dimensions
    if (outputBuffer.length > MAX_FILE_SIZE) {
      let width = 1200;
      while (outputBuffer.length > MAX_FILE_SIZE && width > 300) {
        width -= 100;
        processedImage = sharp(buffer)
          .webp({ quality: 80 })
          .resize(width, width, {
            fit: 'inside',
            withoutEnlargement: true
          });
        outputBuffer = await processedImage.toBuffer();
      }
    }

    // Save the processed image
    await writeFile(filepath, outputBuffer);

    // Return the public URL
    const url = `/uploads/images/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      size: outputBuffer.length,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};