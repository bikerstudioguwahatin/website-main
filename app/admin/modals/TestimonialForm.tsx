// modals/forms/TestimonialForm.tsx
import React, { useState, useEffect } from 'react';
import { Star, Upload, X } from 'lucide-react';

interface TestimonialFormProps {
  item: any;
  onSave: (endpoint: string, data: any, method: 'POST' | 'PUT') => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  uploadingImage: boolean;
  loading: boolean;
}

export function TestimonialForm({ item, onSave, onImageUpload, uploadingImage, loading }: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    rating: 5,
    image: '',
    location: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        review: item.review || '',
        rating: item.rating || 5,
        image: item.image || '',
        location: item.location || ''
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!formData.review.trim()) {
      alert('Please enter a review');
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    const endpoint = item?.id ? `/testimonials/${item.id}` : '/testimonials';
    const method = item?.id ? 'PUT' : 'POST';
    onSave(endpoint, formData, method);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Customer name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="City, Country"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review *
        </label>
        <textarea
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          placeholder="Customer's review..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, rating })}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= (hoveredRating || formData.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-600 font-medium">
            {formData.rating}.0
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Image (Optional)
        </label>
        <div className="flex items-center gap-4">
          {formData.image && (
            <div className="relative">
              <img
                src={formData.image}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
            <Upload size={20} />
            <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(e, (url) => setFormData({ ...formData, image: url }))}
              className="hidden"
              disabled={uploadingImage}
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : item?.id ? 'Update Testimonial' : 'Create Testimonial'}
        </button>
      </div>
    </form>
  );
}