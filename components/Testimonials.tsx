'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  location?: string;
}

interface Props {
  testimonials: Testimonial[];
  autoplayDelay?: number;
}

export default function Testimonials({ testimonials, autoplayDelay = 4000 }: Props) {
  const [index, setIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const handle = () => {
      if (window.innerWidth < 640) setItemsPerSlide(1);
      else if (window.innerWidth < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(3);
    };

    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
useEffect(() => {
  interval.current = setInterval(next, autoplayDelay);

  return () => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  };
}, [next, autoplayDelay]);


  const start = index * itemsPerSlide;
  const visible = testimonials.slice(start, start + itemsPerSlide);

  return (
    <section className="py-20 bg-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        
        <h2 className="text-center text-4xl md:text-5xl font-bold text-black mb-12">
          What Our Customers Say
        </h2>

        <div className="grid gap-6"
             style={{ gridTemplateColumns: `repeat(${itemsPerSlide}, 1fr)` }}>
          {visible.map((t) => (
            <div key={t.id} 
                 className="bg-white border rounded-xl shadow-lg p-6 transition-all">
              
              <p className="text-gray-800 italic leading-relaxed mb-6">
                “{t.review}”
              </p>

              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-500 mb-2">{t.location}</p>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i}
                        size={18}
                        className={i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span key={i}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-10 bg-red-500' : 'w-3 bg-neutral-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
