// app/api/admin/batch-upload-images/route.ts

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitized = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `${sanitized}-${timestamp}-${random}.webp`;
}

export async function POST(request: Request) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push({
            file: file.name,
            error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
          });
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            file: file.name,
            error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
          });
          continue;
        }

        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Process with Sharp (resize and convert to WebP)
        const processedImage = await sharp(buffer)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toBuffer();

        // Generate filename and save
        const fileName = generateFileName(file.name);
        const filePath = path.join(UPLOAD_DIR, fileName);
        await writeFile(filePath, processedImage);

        // Return public URL
        const publicUrl = `/uploads/images/${fileName}`;
        
        results.push({
          originalName: file.name,
          fileName: fileName,
          url: publicUrl,
          size: processedImage.length
        });

      } catch (error: any) {
        errors.push({
          file: file.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error: any) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: 'Batch upload failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};