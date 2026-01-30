// app/api/admin/bulk-import/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// Validation helpers
function validateRequired(value: any, fieldName: string): string {
  if (!value || value === '') {
    throw new Error(`${fieldName} is required`);
  }
  return String(value).trim();
}

function parseNumber(value: any, fieldName: string, isRequired = true): number | null {
  if (!value || value === '') {
    if (isRequired) throw new Error(`${fieldName} is required`);
    return null;
  }
  const num = parseFloat(value);
  if (isNaN(num)) throw new Error(`${fieldName} must be a valid number`);
  return num;
}

function parseInteger(value: any, fieldName: string, isRequired = true): number | null {
  if (!value || value === '') {
    if (isRequired) throw new Error(`${fieldName} is required`);
    return null;
  }
  const num = parseInt(value);
  if (isNaN(num)) throw new Error(`${fieldName} must be a valid integer`);
  return num;
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toUpperCase() === 'TRUE' || value === '1';
  }
  return false;
}

function generateSlug(name: string, existingSlugs: Set<string>): string {
  let baseSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(slug);
  return slug;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    // Create bulk import record
    const bulkImport = await prisma.bulkImport.create({
      data: {
        type: type.toUpperCase().replace('-', '_') as any,
        status: 'PROCESSING',
        fileName: file.name,
        fileUrl: '',
        totalRows: data.length,
        createdBy: 'admin' // Replace with actual user ID from session
      }
    });

    // Track existing slugs to prevent duplicates within the batch
    const existingSlugs = new Set<string>();

    // Process based on type
    try {
      switch (type) {
        case 'products':
          // Pre-load existing product slugs and SKUs
          const existingProducts = await prisma.product.findMany({
            select: { slug: true, sku: true }
          });
          existingProducts.forEach(p => {
            existingSlugs.add(p.slug);
          });
          const existingSkus = new Set(existingProducts.map(p => p.sku));

          for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2; // Excel row number (accounting for header)

            try {
              // Validate required fields
              const name = validateRequired(row.name, 'Name');
              const price = parseNumber(row.price, 'Price', true)!;
              const stock = parseInteger(row.stock, 'Stock', true)!;
              const categoryId = validateRequired(row.categoryId, 'Category ID');
              
              // Validate SKU
              let sku = validateRequired(row.sku, 'SKU');
              if (existingSkus.has(sku)) {
                throw new Error(`SKU '${sku}' already exists`);
              }
              existingSkus.add(sku);

              // Generate or validate slug
              let slug = row.slug?.trim() || '';
              if (!slug) {
                slug = generateSlug(name, existingSlugs);
              } else {
                // Check if custom slug already exists
                if (existingSlugs.has(slug)) {
                  slug = generateSlug(name, existingSlugs);
                } else {
                  existingSlugs.add(slug);
                }
              }

              // Verify category exists
              const category = await prisma.category.findUnique({
                where: { id: categoryId }
              });
              if (!category) {
                throw new Error(`Category ID '${categoryId}' not found`);
              }

              // Verify bike exists if provided
              let bikeId = row.bikeId?.trim() || null;
              if (bikeId) {
                const bike = await prisma.bike.findUnique({
                  where: { id: bikeId }
                });
                if (!bike) {
                  throw new Error(`Bike ID '${bikeId}' not found`);
                }
              }

              // Parse optional fields
              const salePrice = parseNumber(row.salePrice, 'Sale Price', false);
              const weight = parseNumber(row.weight, 'Weight', false);
              
              // Parse images (comma-separated URLs)
              let images: string[] = [];
              if (row.images) {
                images = String(row.images)
                  .split(',')
                  .map(url => url.trim())
                  .filter(url => url.length > 0);
              }

              // Set thumbnail (use first image or provided thumbnail)
              let thumbnail = row.thumbnail?.trim() || '';
              if (!thumbnail && images.length > 0) {
                thumbnail = images[0];
              }

              // Create product
              await prisma.product.create({
                data: {
                  name,
                  slug,
                  description: row.description?.trim() || '',
                  price,
                  salePrice,
                  stock,
                  sku,
                  categoryId,
                  bikeId,
                  images,
                  thumbnail,
                  isActive: parseBoolean(row.isActive ?? true),
                  isFeatured: parseBoolean(row.isFeatured ?? false),
                  metaTitle: row.metaTitle?.trim() || null,
                  metaDescription: row.metaDescription?.trim() || null,
                  weight,
                  dimensions: row.dimensions?.trim() || null,
                  material: row.material?.trim() || null,
                  color: row.color?.trim() || null,
                  size: row.size?.trim() || null
                }
              });
              
              successCount++;
            } catch (error: any) {
              failCount++;
              errors.push({ 
                row: rowNumber,
                name: row.name || 'Unknown',
                error: error.message 
              });
            }
          }
          break;

        case 'categories':
          // Pre-load existing category slugs
          const existingCategories = await prisma.category.findMany({
            select: { slug: true }
          });
          existingCategories.forEach(c => existingSlugs.add(c.slug));

          for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            try {
              const name = validateRequired(row.name, 'Name');
              
              // Generate or validate slug
              let slug = row.slug?.trim() || '';
              if (!slug) {
                slug = generateSlug(name, existingSlugs);
              } else {
                if (existingSlugs.has(slug)) {
                  slug = generateSlug(name, existingSlugs);
                } else {
                  existingSlugs.add(slug);
                }
              }

              const position = parseInteger(row.position, 'Position', false) || 0;

              // Verify parent category if provided
              let parentId = row.parentId?.trim() || null;
              if (parentId) {
                const parent = await prisma.category.findUnique({
                  where: { id: parentId }
                });
                if (!parent) {
                  throw new Error(`Parent Category ID '${parentId}' not found`);
                }
              }

              await prisma.category.create({
                data: {
                  name,
                  slug,
                  description: row.description?.trim() || null,
                  position,
                  showInMenu: parseBoolean(row.showInMenu ?? true),
                  isActive: parseBoolean(row.isActive ?? true),
                  parentId
                }
              });
              
              successCount++;
            } catch (error: any) {
              failCount++;
              errors.push({ 
                row: rowNumber,
                name: row.name || 'Unknown',
                error: error.message 
              });
            }
          }
          break;

        case 'brands':
          // Pre-load existing brand slugs
          const existingBrands = await prisma.brand.findMany({
            select: { slug: true }
          });
          existingBrands.forEach(b => existingSlugs.add(b.slug));

          for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            try {
              const name = validateRequired(row.name, 'Name');
              const logo = validateRequired(row.logo, 'Logo');
              
              // Generate or validate slug
              let slug = row.slug?.trim() || '';
              if (!slug) {
                slug = generateSlug(name, existingSlugs);
              } else {
                if (existingSlugs.has(slug)) {
                  slug = generateSlug(name, existingSlugs);
                } else {
                  existingSlugs.add(slug);
                }
              }

              const position = parseInteger(row.position, 'Position', false) || 0;

              await prisma.brand.create({
                data: {
                  name,
                  slug,
                  logo,
                  description: row.description?.trim() || null,
                  position,
                  isActive: parseBoolean(row.isActive ?? true)
                }
              });
              
              successCount++;
            } catch (error: any) {
              failCount++;
              errors.push({ 
                row: rowNumber,
                name: row.name || 'Unknown',
                error: error.message 
              });
            }
          }
          break;

        case 'bikes':
          // Pre-load existing bike slugs
          const existingBikes = await prisma.bike.findMany({
            select: { slug: true }
          });
          existingBikes.forEach(b => existingSlugs.add(b.slug));

          for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            try {
              const name = validateRequired(row.name, 'Name');
              const model = validateRequired(row.model, 'Model');
              const year = parseInteger(row.year, 'Year', true)!;
              const brandId = validateRequired(row.brandId, 'Brand ID');
              const image = validateRequired(row.image, 'Image');

              // Verify brand exists
              const brand = await prisma.brand.findUnique({
                where: { id: brandId }
              });
              if (!brand) {
                throw new Error(`Brand ID '${brandId}' not found`);
              }

              // Generate or validate slug
              let slug = row.slug?.trim() || '';
              if (!slug) {
                slug = generateSlug(name, existingSlugs);
              } else {
                if (existingSlugs.has(slug)) {
                  slug = generateSlug(name, existingSlugs);
                } else {
                  existingSlugs.add(slug);
                }
              }

              const position = parseInteger(row.position, 'Position', false) || 0;

              await prisma.bike.create({
                data: {
                  name,
                  slug,
                  model,
                  year,
                  brandId,
                  image,
                  description: row.description?.trim() || null,
                  position,
                  isActive: parseBoolean(row.isActive ?? true)
                }
              });
              
              successCount++;
            } catch (error: any) {
              failCount++;
              errors.push({ 
                row: rowNumber,
                name: row.name || 'Unknown',
                error: error.message 
              });
            }
          }
          break;

        case 'menu-items':
          // Pre-load existing menu item slugs
          const existingMenuItems = await prisma.menuItem.findMany({
            select: { slug: true }
          });
          existingMenuItems.forEach(m => existingSlugs.add(m.slug));

          for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            try {
              const name = validateRequired(row.name, 'Name');
              const type = validateRequired(row.type, 'Type');

              // Validate type
              const validTypes = ['BRAND_MENU', 'CATEGORY_MENU', 'CUSTOM_MENU'];
              if (!validTypes.includes(type)) {
                throw new Error(`Type must be one of: ${validTypes.join(', ')}`);
              }

              // Generate or validate slug
              let slug = row.slug?.trim() || '';
              if (!slug) {
                slug = generateSlug(name, existingSlugs);
              } else {
                if (existingSlugs.has(slug)) {
                  slug = generateSlug(name, existingSlugs);
                } else {
                  existingSlugs.add(slug);
                }
              }

              const position = parseInteger(row.position, 'Position', false) || 0;

              // Verify parent if provided
              let parentId = row.parentId?.trim() || null;
              if (parentId) {
                const parent = await prisma.menuItem.findUnique({
                  where: { id: parentId }
                });
                if (!parent) {
                  throw new Error(`Parent Menu ID '${parentId}' not found`);
                }
              }

              // Verify brand if provided
              let brandId = row.brandId?.trim() || null;
              if (brandId) {
                const brand = await prisma.brand.findUnique({
                  where: { id: brandId }
                });
                if (!brand) {
                  throw new Error(`Brand ID '${brandId}' not found`);
                }
              }

              // Verify category if provided
              let categoryId = row.categoryId?.trim() || null;
              if (categoryId) {
                const category = await prisma.category.findUnique({
                  where: { id: categoryId }
                });
                if (!category) {
                  throw new Error(`Category ID '${categoryId}' not found`);
                }
              }

              await prisma.menuItem.create({
                data: {
                  name,
                  slug,
                  type: type as any,
                  description: row.description?.trim() || null,
                  position,
                  isActive: parseBoolean(row.isActive ?? true),
                  parentId,
                  brandId,
                  categoryId
                }
              });
              
              successCount++;
            } catch (error: any) {
              failCount++;
              errors.push({ 
                row: rowNumber,
                name: row.name || 'Unknown',
                error: error.message 
              });
            }
          }
          break;

        default:
          throw new Error('Invalid import type');
      }

      // Update bulk import record
      await prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: {
          status: 'COMPLETED',
          successRows: successCount,
          failedRows: failCount,
          errors: errors.length > 0 ? JSON.stringify(errors) : null,
          completedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        totalRows: data.length,
        successRows: successCount,
        failedRows: failCount,
        errors: errors.length > 0 ? errors : null
      });
    } catch (error: any) {
      // Update bulk import as failed
      await prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: {
          status: 'FAILED',
          successRows: successCount,
          failedRows: failCount,
          errors: JSON.stringify([{ error: error.message }]),
          completedAt: new Date()
        }
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Bulk import failed: ' + error.message },
      { status: 500 }
    );
  }
}