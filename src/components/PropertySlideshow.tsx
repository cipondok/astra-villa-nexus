
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, Cube } from "lucide-react";
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
  listing_type: string;
}

const PropertySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
    if (properties.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % properties.length);
    }
  };

  const prevSlide = () => {
    if (properties.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + properties.length) % properties.length);
    }
  };

  const handleViewTour = (propertyTitle: string) => {
    alert(`Launching 3D virtual tour for: ${propertyTitle}`);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isHovered && properties.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isHovered, properties.length]);

  // Create duplicated slides for infinite scroll effect
  const duplicatedProperties = properties.length > 0 ? [...properties, ...properties] : [];

  if (properties.length === 0) {
    return (
      <div className="property-slideshow-loading">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading featured properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-property-slideshow">
      {/* Enhanced Header Section */}
      <div className="slideshow-header">
        <div className="header-gradient-border"></div>
        <div className="header-content">
          <h2 className="header-title">
            Featured Properties
            <span className="title-underline"></span>
          </h2>
          <p className="header-description">
            Discover our handpicked selection of premium properties with virtual tours and detailed insights
          </p>
          <div className="header-actions">
            <button className="header-btn primary-btn">
              <Square className="w-4 h-4" />
              Browse Properties
            </button>
            <button className="header-btn secondary-btn">
              <MapPin className="w-4 h-4" />
              Contact Agent
            </button>
          </div>
        </div>
      </div>

      {/* Slideshow Container */}
      <div 
        className="slideshow-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="slideshow-container" ref={slideshowRef}>
          <div 
            className={`slideshow-track ${!isHovered ? 'auto-scroll' : 'paused'}`}
            ref={trackRef}
          >
            {duplicatedProperties.map((property, index) => (
              <div key={`${property.id}-${index}`} className="property-slide">
                <div className="slide-image-container">
                  <img
                    src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    className="slide-image"
                  />
                  
                  {/* Status Badge */}
                  <span className="status-badge">
                    {property.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                  </span>
                  
                  {/* 3D Tour Button */}
                  <button 
                    className="view-3d-btn"
                    onClick={() => handleViewTour(property.title)}
                  >
                    <Cube className="w-3 h-3" />
                    3D Tour
                  </button>
                  
                  {/* Image Overlay Content */}
                  <div className="image-overlay-content">
                    <div className="slide-price">
                      {formatPrice(property.price)}
                    </div>
                    <div className="slide-location">
                      <MapPin className="w-3 h-3" />
                      {property.city}, {property.state}
                    </div>
                  </div>
                </div>
                
                {/* Slide Details */}
                <div className="slide-details">
                  <h3 className="slide-title">{property.title}</h3>
                  <div className="slide-features">
                    <div className="feature">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms}
                    </div>
                    <div className="feature">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms}
                    </div>
                    <div className="feature">
                      <Square className="w-4 h-4" />
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
          <button className="slide-arrow prev-arrow" onClick={prevSlide}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="slide-arrow next-arrow" onClick={nextSlide}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertySlideshow;
