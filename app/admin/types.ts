// app/admin/types.ts

// ---------------------
// Admin Dashboard Types
// ---------------------

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
  pendingOrders: number;
  lowStock: number;
}

// ---------------------
// DB Entities (API / Prisma / Backend)
// ---------------------

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  description: string;
  categoryId: string;
  category?: Category;
  bikeId?: string;
  bike?: Bike;
  images: string[];
  thumbnail?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  parentId?: string;
  showInMenu: boolean;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  position: number;
  isActive: boolean;
}

export interface Bike {
  id: string;
  name: string;
  brandId: string;
  brand?: Brand;
  model: string;
  year: number;
  isActive: boolean;
}

export interface MenuEntity {
  id: string;
  name: string;
  type: 'BRAND_MENU' | 'CATEGORY_MENU' | 'CUSTOM_MENU';
  position: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name?: string;
    email: string;
  };
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  position: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// ---------------------
// Table Config Types
// ---------------------

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  successRows?: number;
  failedRows?: number;
}

// ---------------------
// Admin UI Navigation
// ---------------------

export type TabType =
  | 'dashboard'
  | 'users'
  | 'products'
  | 'categories'
  | 'brands'
  | 'bikes'
  | 'menu-json'
  | 'menu-items'
  | 'orders'
  | 'reviews'
  | 'testimonials'
  | 'banners'
  | 'coupons'
  | 'images'
  | 'videos';

import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

// ---------------------
// Modals / UI helpers
// ---------------------

export type ModalType = 'create' | 'edit';