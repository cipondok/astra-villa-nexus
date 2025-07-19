
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import CompactPropertyCard from "./CompactPropertyCard";
import PropertyDetailModal from "./PropertyDetailModal";
import Property3DViewModal from "./Property3DViewModal";
import { BaseProperty } from "@/types/property";

interface PropertySlideSectionProps {
  title: string;
  subtitle?: string;
  type: 'featured' | 'buy' | 'rent' | 'pre-launch' | 'new-projects' | 'vendor-services';
  language: "en" | "id";
  limit?: number;
}

const PropertySlideSection = ({ title, subtitle, type, language, limit = 8 }: PropertySlideSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: [`properties-${type}`, limit],
    queryFn: async () => {
      console.log(`Fetching ${type} properties...`);
      
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0);

        // Apply type-specific filters
        switch (type) {
          case 'buy':
            query = query
              .eq('listing_type', 'sale')
              .in('development_status', ['completed', 'ready']);
            break;
          case 'rent':
            query = query
              .eq('listing_type', 'rent')
              .in('development_status', ['completed', 'ready']);
            break;
          case 'pre-launch':
            query = query.eq('development_status', 'pre_launching');
            break;
          case 'new-projects':
            query = query.eq('development_status', 'new_project');
            break;
          case 'featured':
          default:
            // No additional filters for featured
            break;
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error(`Error fetching ${type} properties:`, error);
          return [];
        }

        const filteredData = (data || []).filter(property => 
          property.title?.trim() &&
          property.price > 0 &&
          (property.images?.length > 0 || property.thumbnail_url)
        );

        console.log(`${type} properties loaded:`, filteredData.length);
        return filteredData;
        
      } catch (err) {
        console.error(`Error fetching ${type} properties:`, err);
        return [];
      }
    },
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const itemsPerSlide = 3; // Optimized for better responsive display
  const maxSlides = Math.ceil(properties.length / itemsPerSlide);

  const nextSlide = () => {
    if (!showDetailModal && !show3DModal) { // Stop sliding when modal is open
      setCurrentSlide((prev) => (prev + 1) % maxSlides);
    }
  };

  const prevSlide = () => {
    if (!showDetailModal && !show3DModal) { // Stop sliding when modal is open
      setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
    }
  };

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const handleView3D = (property: any) => {
    setSelectedProperty(property);
    setShow3DModal(true);
  };

  const currentProperties = properties.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className="card-grid gap-4">{/* Responsive card grid using utility classes */}
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          No properties available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 professional-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 gradient-text">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        {properties.length > itemsPerSlide && (
          <div className="flex gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="h-10 w-10 p-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === maxSlides - 1}
              className="h-10 w-10 p-0 hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onMouseEnter={() => setCurrentSlide(currentSlide)} // Stop auto-scroll on hover
        >
          {Array.from({ length: maxSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="card-grid gap-4">
                {properties
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((property) => (
                    <div key={property.id} className="w-full min-w-0">
                      <CompactPropertyCard
                        property={property}
                        language={language}
                        onView={() => handleViewProperty(property)}
                        onView3D={() => handleView3D(property)}
                        isSaved={false}
                        onSave={() => {}}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {properties.length > itemsPerSlide && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
      
      
      {/* Property Detail Modal */}
      {selectedProperty && showDetailModal && (
        <PropertyDetailModal
          property={selectedProperty as BaseProperty}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProperty(null);
          }}
          language={language}
          onView3D={() => {
            setShowDetailModal(false);
            setShow3DModal(true);
          }}
        />
      )}

      {/* 3D View Modal */}
      {selectedProperty && show3DModal && (
        <Property3DViewModal
          property={selectedProperty as BaseProperty}
          isOpen={show3DModal}
          onClose={() => {
            setShow3DModal(false);
            setSelectedProperty(null);
          }}
          language={language}
        />
      )}
    </div>
  );
};

export default PropertySlideSection;
