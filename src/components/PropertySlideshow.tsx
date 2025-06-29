
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
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isHovered, properties.length]);

  if (properties.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="macos-card animate-pulse">
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
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div 
        className="relative overflow-hidden"
        ref={slideshowRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slideshow Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out gap-8"
          style={{
            transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
          }}
        >
          {properties.map((property) => (
            <div 
              key={property.id} 
              className="macos-card flex-shrink-0 group cursor-pointer"
              style={{ width: `calc(${100 / slidesToShow}% - 2rem)` }}
            >
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full backdrop-blur-sm">
                    {property.property_type}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center text-primary mb-3 text-sm font-medium">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {property.city}, {property.state}
                </div>
                <div className="text-2xl font-bold macos-text-gradient mb-4">
                  {formatPrice(property.price)}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg text-sm transition-all hover:bg-secondary">
                    <i className="fas fa-bed text-primary"></i>
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg text-sm transition-all hover:bg-secondary">
                    <i className="fas fa-bath text-primary"></i>
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg text-sm transition-all hover:bg-secondary">
                    <i className="fas fa-ruler-combined text-primary"></i>
                    <span>{property.area_sqm}m²</span>
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
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full macos-glass flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full macos-glass flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300"
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
        <div className="flex justify-center items-center mt-10 gap-4">
          {Array.from({ length: maxSlides }, (_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary scale-150 shadow-lg' 
                  : 'bg-muted-foreground hover:bg-primary/60 hover:scale-125'
              }`}
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
