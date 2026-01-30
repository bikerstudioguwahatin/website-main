// admin/modals/Modal.tsx

"use client"
import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { api } from '../api';
import { TabType, ModalType, Product, Category, Brand, Bike } from '../types';
import {
  CategoryForm,
  BrandForm,
  BikeForm,
  BannerForm,
  CouponForm,
  MenuItemForm
} from './FormComponents';
import { VideoModalForm } from './VideoModalForm';
import { UserModalForm } from './UserModalForm';
import { TestimonialForm } from './TestimonialForm';

interface ModalProps {
  type: ModalType;
  activeTab: TabType;
  item: any;
  onClose: () => void;
  onSave: (endpoint: string, data: any, method: 'POST' | 'PUT') => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  uploadingImage: boolean;
  loading: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  type, 
  activeTab, 
  item, 
  onClose, 
  onSave, 
  onImageUpload, 
  uploadingImage, 
  loading 
}) => {
  const [formData, setFormData] = useState<any>(item || {});
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);

  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'bikes') {
      loadBrands();
    }
    if (activeTab === 'products' || activeTab === 'categories') {
      loadCategories();
    }
    if (activeTab === 'products') {
      loadBikes();
    }
  }, [activeTab]);

  const loadBrands = async () => {
    try {
      const data = await api.fetchData<Brand[]>('/brands');
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.fetchData<Category[]>('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBikes = async () => {
    try {
      const data = await api.fetchData<Bike[]>('/bikes');
      setBikes(data);
    } catch (error) {
      console.error('Failed to load bikes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== MODAL SUBMIT DEBUG ===');
    console.log('Active Tab:', activeTab);
    console.log('Modal Type:', type);
    console.log('Item ID:', item?.id);
    console.log('Form Data:', formData);
    
    let endpoint = `/${activeTab}`;
    let method: 'POST' | 'PUT' = type === 'create' ? 'POST' : 'PUT';
    
    const dataToSend = { ...formData };
    
    if (activeTab === 'products') {
      dataToSend.images = images;
      if (images.length > 0) {
        dataToSend.thumbnail = images[0];
      }
    }
    
    if (type === 'edit' && item?.id) {
      endpoint = `${endpoint}/${item.id}`;
    }
    
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Data to Send:', JSON.stringify(dataToSend, null, 2));
    
    await onSave(endpoint, dataToSend, method);
  };

  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Special handling for users - render UserModalForm directly
  if (activeTab === 'users') {
    return (
      <UserModalForm
        type={type}
        item={item}
        onClose={onClose}
        onSave={onSave}
        loading={loading}
      />
    );
  }

  // Special handling for testimonials - render TestimonialForm directly
  if (activeTab === 'testimonials') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black">
              {type === 'create' ? 'Add New' : 'Edit'} Testimonial
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <TestimonialForm
              item={item}
              onSave={onSave}
              onImageUpload={onImageUpload}
              uploadingImage={uploadingImage}
              loading={loading}
            />
          </div>
        </div>
      </div>
    );
  }

  // For all other tabs, use the standard modal wrapper
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black">
            {type === 'create' ? 'Add New' : 'Edit'} {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'products' && (
            <ProductForm 
              formData={formData}
              setFormData={setFormData}
              images={images}
              addImage={addImage}
              removeImage={removeImage}
              categories={categories}
              bikes={bikes}
              onImageUpload={onImageUpload}
              uploadingImage={uploadingImage}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryForm 
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              currentItemId={item?.id}
            />
          )}

          {activeTab === 'brands' && (
            <BrandForm 
              formData={formData}
              setFormData={setFormData}
              onImageUpload={onImageUpload}
              uploadingImage={uploadingImage}
            />
          )}

          {activeTab === 'bikes' && (
            <BikeForm 
              formData={formData}
              setFormData={setFormData}
              brands={brands}
            />
          )}

          {activeTab === 'banners' && (
            <BannerForm 
              formData={formData}
              setFormData={setFormData}
              onImageUpload={onImageUpload}
              uploadingImage={uploadingImage}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponForm 
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {activeTab === 'menu-items' && (
            <MenuItemForm 
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              onImageUpload={onImageUpload}
              uploadingImage={uploadingImage}
            />
          )}

          {activeTab === 'videos' && (
            <VideoModalForm
              video={item}
              onSave={(data) => {
                const endpoint = '/api/admin/videos';
                const method = type === 'edit' ? 'PUT' : 'POST';
                const payload = type === 'edit' ? { ...data, id: item.id } : data;
                onSave(endpoint, payload, method);
              }}
              loading={loading}
            />
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="text-white">Saving...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span className="text-white">{type === 'create' ? 'Create' : 'Update'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-black"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Individual Form Components
interface ProductFormProps {
  formData: any;
  setFormData: (data: any) => void;
  images: string[];
  addImage: (url: string) => void;
  removeImage: (index: number) => void;
  categories: Category[];
  bikes: Bike[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  uploadingImage: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  formData, 
  setFormData, 
  images, 
  addImage, 
  removeImage, 
  categories, 
  bikes, 
  onImageUpload, 
  uploadingImage 
}) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-2 text-black">Product Name *</label>
      <input
        type="text"
        required
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={formData.name || ''}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-black">SKU *</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border rounded-lg text-black"
          value={formData.sku || ''}
          onChange={(e) => setFormData({...formData, sku: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-black">Price (₹) *</label>
        <input
          type="number"
          required
          step="0.01"
          className="w-full px-4 py-2 border rounded-lg text-black"
          value={formData.price || ''}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-black">Sale Price (₹)</label>
        <input
          type="number"
          step="0.01"
          className="w-full px-4 py-2 border rounded-lg text-black"
          value={formData.salePrice || ''}
          onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-black">Stock *</label>
        <input
          type="number"
          required
          className="w-full px-4 py-2 border rounded-lg text-black"
          value={formData.stock || ''}
          onChange={(e) => setFormData({...formData, stock: e.target.value})}
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2 text-black">Description *</label>
      <textarea
        required
        rows={4}
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={formData.description || ''}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-2 text-black">Category *</label>
      <select
        required
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={formData.categoryId || ''}
        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2 text-black">Bike (Optional)</label>
      <select
        className="w-full px-4 py-2 border rounded-lg text-black"
        value={formData.bikeId || ''}
        onChange={(e) => setFormData({...formData, bikeId: e.target.value})}
      >
        <option value="">General Product</option>
        {bikes.map(bike => (
          <option key={bike.id} value={bike.id}>{bike.name}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2 text-black">Product Images</label>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-24 h-24 border rounded">
              <img src={img} alt="" className="w-full h-full object-cover rounded" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-block px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200">
          <ImageIcon size={16} className="inline mr-2" />
          <span className="text-black">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onImageUpload(e, addImage)}
            disabled={uploadingImage}
          />
        </label>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isActive ?? true}
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
        />
        <span className="text-sm text-black">Active</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isFeatured ?? false}
          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
        />
        <span className="text-sm text-black">Featured</span>
      </label>
    </div>
  </>
);