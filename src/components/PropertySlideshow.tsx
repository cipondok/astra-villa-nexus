
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  thumbnail_url?: string;
  city: string;
  state: string;
}

const PropertySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);

  // Fetch featured properties for slideshow
  const { data: properties = [] } = useQuery({
    queryKey: ['slideshow-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching slideshow properties:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 60000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(1)}M`;
    } else {
      return `Rp ${price.toLocaleString()}`;
    }
  };

  const slidesToShow = 4;
  const maxSlides = Math.max(1, properties.length - slidesToShow + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isHovered && properties.length > slidesToShow) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isHovered, properties.length]);

  if (properties.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="titanium-card animate-pulse">
              <div className="h-56 bg-muted rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div 
        className="relative overflow-hidden"
        ref={slideshowRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slideshow Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out gap-6"
          style={{
            transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
          }}
        >
          {properties.map((property, index) => (
            <div 
              key={property.id} 
              className="titanium-slide-card flex-shrink-0"
              style={{ width: `calc(${100 / slidesToShow}% - 1.5rem)` }}
            >
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="titanium-slide-image"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full backdrop-blur-sm">
                    {property.property_type}
                  </span>
                </div>
              </div>
              
              <div className="titanium-slide-content">
                <h3 className="titanium-slide-title">{property.title}</h3>
                <div className="titanium-slide-location">
                  <i className="fas fa-map-marker-alt text-primary"></i>
                  {property.city}, {property.state}
                </div>
                <div className="titanium-slide-price">
                  {formatPrice(property.price)}
                </div>
                <div className="titanium-slide-features">
                  <div className="titanium-slide-feature">
                    <i className="fas fa-bed text-primary"></i>
                    {property.bedrooms}
                  </div>
                  <div className="titanium-slide-feature">
                    <i className="fas fa-bath text-primary"></i>
                    {property.bathrooms}
                  </div>
                  <div className="titanium-slide-feature">
                    <i className="fas fa-ruler-combined text-primary"></i>
                    {property.area_sqm}m²
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {properties.length > slidesToShow && (
          <>
            <button 
              className="titanium-nav-arrow absolute left-4 top-1/2 -translate-y-1/2 z-10"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              className="titanium-nav-arrow absolute right-4 top-1/2 -translate-y-1/2 z-10"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {properties.length > slidesToShow && (
        <div className="flex justify-center items-center mt-8 gap-3">
          {Array.from({ length: maxSlides }, (_, index) => (
            <button
              key={index}
              className={`titanium-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertySlideshow;
