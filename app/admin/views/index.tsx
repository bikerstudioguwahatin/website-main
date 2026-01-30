// admin/views/index.tsx

"use client"
import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { api } from '../api';
import { ORDER_STATUS_COLORS } from '../constants';
import { 
  Product, 
  Category, 
  Brand, 
  Bike, 
  MenuItem, 
  Order, 
  Banner, 
  Coupon 
} from '../types';

interface ViewProps<T> {
  onEdit?: (item: T) => void;
  onDelete?: (id: string, name: string) => void;
  refreshTrigger: number;
}

// Products View
export const ProductsView: React.FC<ViewProps<Product>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.fetchData<{ data?: Product[] } | Product[]>('/products');
      setProducts(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading products...</div>;

  return (
    <DataTable 
      data={products}
      columns={[
        { key: 'name', label: 'Product Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'price', label: 'Price', render: (val) => `₹${val}` },
        { key: 'stock', label: 'Stock' },
        { key: 'category', label: 'Category', render: (val, row) => row.category?.name || 'N/A' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Categories View
export const CategoriesView: React.FC<ViewProps<Category>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Category[]>('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading categories...</div>;

  return (
    <DataTable 
      data={categories}
      columns={[
        { key: 'name', label: 'Category Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'position', label: 'Position' },
        { key: 'showInMenu', label: 'In Menu', render: (val) => val ? '✓' : '✗' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Brands View
export const BrandsView: React.FC<ViewProps<Brand>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, [refreshTrigger]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Brand[]>('/brands');
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading brands...</div>;

  return (
    <DataTable 
      data={brands}
      columns={[
        { key: 'name', label: 'Brand Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'position', label: 'Position' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Bikes View
export const BikesView: React.FC<ViewProps<Bike>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBikes();
  }, [refreshTrigger]);

  const loadBikes = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Bike[]>('/bikes');
      setBikes(data);
    } catch (error) {
      console.error('Failed to load bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading bikes...</div>;

  return (
    <DataTable 
      data={bikes}
      columns={[
        { key: 'name', label: 'Bike Name' },
        { key: 'brand', label: 'Brand', render: (val, row) => row.brand?.name || 'N/A' },
        { key: 'model', label: 'Model' },
        { key: 'year', label: 'Year' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Menu Items View
export const MenuItemsView: React.FC<ViewProps<MenuItem>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, [refreshTrigger]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<MenuItem[]>('/menu-items');
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading menu items...</div>;

  return (
    <DataTable 
      data={menuItems}
      columns={[
        { key: 'name', label: 'Menu Name' },
        { key: 'type', label: 'Type' },
        { key: 'position', label: 'Position' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Orders View
export const OrdersView: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.fetchData<{ data?: Order[] } | Order[]>('/orders');
      setOrders(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading orders...</div>;

  return (
    <DataTable 
      data={orders}
      columns={[
        { key: 'orderNumber', label: 'Order #' },
        { key: 'user', label: 'Customer', render: (val, row) => row.user?.name || row.user?.email || 'N/A' },
        { key: 'total', label: 'Total', render: (val) => `₹${val}` },
        { key: 'status', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${ORDER_STATUS_COLORS[val] || 'bg-gray-100 text-gray-800'}`}>
            {val}
          </span>
        )},
        { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() }
      ]}
      showEdit={false}
      showDelete={false}
    />
  );
};

// Banners View
export const BannersView: React.FC<ViewProps<Banner>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [refreshTrigger]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Banner[]>('/banners');
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading banners...</div>;

  return (
    <DataTable 
      data={banners}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'position', label: 'Position' },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

// Coupons View
export const CouponsView: React.FC<ViewProps<Coupon>> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, [refreshTrigger]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Coupon[]>('/coupons');
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-black">Loading coupons...</div>;

  return (
    <DataTable 
      data={coupons}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'discountType', label: 'Type' },
        { key: 'discountValue', label: 'Value', render: (val, row) => 
          row.discountType === 'PERCENTAGE' ? `${val}%` : `₹${val}`
        },
        { key: 'isActive', label: 'Status', render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {val ? 'Active' : 'Inactive'}
          </span>
        )}
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};
export { ImagesView } from './ImagesView';
export { ReviewsView } from './ReviewsView';
export { MenuJsonView } from './MenuJsonView';
export {UsersView} from "./UsersView"
export { VideosView } from './VideosView';