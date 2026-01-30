// views/TestimonialsView.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import { api } from '../api';

interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  image?: string;
  location?: string;
}

interface TestimonialsViewProps {
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string, name: string) => void;
  refreshTrigger: number;
}

export function TestimonialsView({ onEdit, onDelete, refreshTrigger }: TestimonialsViewProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, [refreshTrigger]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await api.fetchData<Testimonial[]>('/testimonials');
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search testimonials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
        />
        <div className="text-sm text-gray-600">
          Total: {filteredTestimonials.length} testimonials
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  {testimonial.location && (
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(testimonial.id, testimonial.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 italic line-clamp-3">
              "{testimonial.review}"
            </p>

            <div className="flex items-center gap-1 pt-4 border-t border-gray-100">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < testimonial.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600 font-medium">
                {testimonial.rating}.0
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No testimonials found</p>
        </div>
      )}
    </div>
  );
}