
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, Building2, TrendingUp, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

interface AutoScrollCarouselProps {
  title: string;
  currentPropertyId: string;
  queryType: 'owner' | 'similar' | 'recommended';
  ownerId?: string;
  ownerType?: string;
  propertyData?: {
    property_type: string;
    price: number;
    bedrooms: number;
    city: string;
    state: string;
    listing_type: string;
  };
  propertyType?: string;
  location?: string;
  autoScrollInterval?: number;
  limit?: number;
}

const AutoScrollCarousel = ({
  title,
  currentPropertyId,
  queryType,
  ownerId,
  ownerType = 'individual',
  propertyData,
  propertyType,
  location,
  autoScrollInterval = 5000,
  limit = 8
}: AutoScrollCarouselProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Fetch properties based on query type
  useEffect(() => {
    fetchProperties();
  }, [currentPropertyId, queryType, ownerId, propertyData, propertyType, location]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling && properties.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, properties.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, autoScrollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoScrolling, properties.length, itemsPerView, autoScrollInterval]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let data: any[] = [];

      switch (queryType) {
        case 'owner':
          if (ownerId) {
            const { data: ownerProps } = await supabase
              .from('properties')
              .select('*')
              .eq('owner_id', ownerId)
              .neq('id', currentPropertyId)
              .eq('status', 'active')
              .limit(limit);
            data = ownerProps || [];
          }
          break;

        case 'similar':
          if (propertyData) {
            const priceMin = propertyData.price * 0.7;
            const priceMax = propertyData.price * 1.3;

            const { data: similarProps } = await supabase
              .from('properties')
              .select('*')
              .neq('id', currentPropertyId)
              .eq('status', 'active')
              .eq('property_type', propertyData.property_type)
              .eq('listing_type', propertyData.listing_type)
              .gte('price', priceMin)
              .lte('price', priceMax)
              .or(`city.ilike.%${propertyData.city}%,state.ilike.%${propertyData.state}%`)
              .limit(limit);

            data = similarProps || [];
          }
          break;

        case 'recommended':
          let query = supabase
            .from('properties')
            .select('*')
            .eq('status', 'active')
            .neq('id', currentPropertyId)
            .limit(limit);

          if (propertyType) {
            query = query.eq('property_type', propertyType);
          }

          if (location) {
            query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%,area.ilike.%${location}%`);
          }

          const { data: recommendedProps } = await query;
          data = recommendedProps || [];
          break;
      }

      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, properties.length - itemsPerView);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  const getIcon = () => {
    switch (queryType) {
      case 'owner':
        return ownerType === 'company' ? Building2 : User;
      case 'similar':
        return Building2;
      case 'recommended':
        return TrendingUp;
      default:
        return Building2;
    }
  };

  const Icon = getIcon();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, properties.length - itemsPerView);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
            <Badge variant="outline">{properties.length} properties</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoScroll}
              className="flex items-center gap-1"
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span className="hidden sm:inline">Auto</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </Button>

            {/* Navigation buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!canScrollLeft}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!canScrollRight}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(properties.length / itemsPerView) * 100}%`
            }}
          >
            {properties.map((property) => (
              <div 
                key={property.id} 
                className="flex-shrink-0"
                style={{ width: `${100 / properties.length}%` }}
              >
                <CompactPropertyCard
                  property={property}
                  language="en"
                  isSaved={false}
                  onSave={() => {}}
                  onView={() => window.open(`/property/${property.id}`, '_blank')}
                  onView3D={() => {}}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        {properties.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(maxIndex + 1)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Auto-scroll progress bar */}
        {isAutoScrolling && properties.length > itemsPerView && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-100"
              style={{
                width: `${((Date.now() % autoScrollInterval) / autoScrollInterval) * 100}%`
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoScrollCarousel;
