
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PropertySlideSectionProps {
  title: string;
  subtitle?: string;
  type: 'featured' | 'buy' | 'rent' | 'pre-launch' | 'new-projects' | 'vendor-services';
  language: "en" | "id";
  limit?: number;
}

const PropertySlideSection = ({ title, subtitle, type, language, limit = 8 }: PropertySlideSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const itemsPerSlide = 4;
  const maxSlides = Math.ceil(properties.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        
        {properties.length > itemsPerSlide && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === maxSlides - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: maxSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {properties
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((property) => (
                    <Card key={property.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="relative">
                        <img
                          src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                          alt={property.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge 
                            variant={property.listing_type === 'sale' ? 'default' : 'secondary'}
                            className="text-white"
                          >
                            {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                          </Badge>
                        </div>
                        {property.development_status !== 'completed' && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-white/90 text-gray-800">
                              {property.development_status === 'pre_launching' ? 'Pre-Launch' : 'New Project'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {property.title}
                          </h3>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{property.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {property.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="h-3 w-3" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center gap-1">
                                <Bath className="h-3 w-3" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area_sqm && (
                              <div className="flex items-center gap-1">
                                <Square className="h-3 w-3" />
                                <span>{property.area_sqm}m²</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-green-600">
                              IDR {formatPrice(property.price)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {property.property_type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  ? 'bg-blue-600 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertySlideSection;
