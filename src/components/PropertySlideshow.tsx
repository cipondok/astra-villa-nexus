
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        .limit(8);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, properties.length - 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, properties.length - 3)) % Math.max(1, properties.length - 3));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isHovered && properties.length > 4) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isHovered, properties.length]);

  if (properties.length === 0) {
    return null;
  }

  const maxSlides = Math.max(1, properties.length - 3);

  return (
    <div className="property-slideshow">
      <div 
        className="slideshow-container"
        ref={slideshowRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="slideshow-track"
          style={{
            transform: `translateX(-${currentSlide * 325}px)`,
            transition: 'transform 0.5s ease',
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        >
          {properties.map((property) => (
            <div key={property.id} className="property-slide">
              <img
                src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="slide-image"
              />
              <div className="slide-content">
                <h3 className="slide-title">{property.title}</h3>
                <div className="slide-location">
                  <MapPin size={14} />
                  {property.city}, {property.state}
                </div>
                <div className="slide-price">
                  {formatPrice(property.price)}
                </div>
                <div className="slide-features">
                  <div className="feature">
                    <Bed size={14} />
                    {property.bedrooms}
                  </div>
                  <div className="feature">
                    <Bath size={14} />
                    {property.bathrooms}
                  </div>
                  <div className="feature">
                    <Square size={14} />
                    {property.area_sqm}m²
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="slideshow-nav">
        <button className="slide-arrow" onClick={prevSlide}>
          <ChevronLeft size={18} />
        </button>
        <button className="slide-arrow" onClick={nextSlide}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="slideshow-dots">
        {Array.from({ length: maxSlides }, (_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertySlideshow;
