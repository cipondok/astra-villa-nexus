
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, Building2, TrendingUp, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import PropertyDetailModal from "@/components/property/PropertyDetailModal";
import Property3DViewModal from "@/components/property/Property3DViewModal";
import { BaseProperty } from "@/types/property";

interface AutoScrollCarouselProps {
  title: string;
  currentPropertyId: string;
  queryType: 'owner' | 'similar' | 'recommended';
  ownerId?: string;
  ownerType?: string;
  propertyData?: {
    property_type?: string;
    price?: number;
    bedrooms?: number;
    city?: string;
    state?: string;
    listing_type?: string;
    properties?: any[];
  };
  propertyType?: string;
  location?: string;
  autoScrollInterval?: number;
  limit?: number;
  hideTitle?: boolean;
  customProperties?: any[];
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
  limit = 8,
  hideTitle = false,
  customProperties
}: AutoScrollCarouselProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
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

  // Use custom properties if provided, otherwise fetch from database
  useEffect(() => {
    if (customProperties) {
      // Filter out properties with missing essential data
      const validProperties = customProperties.filter(property => 
        property && 
        property.id &&
        property.title && 
        property.title.trim() !== '' &&
        property.price && 
        property.price > 0 &&
        (property.images?.length > 0 || property.thumbnail_url)
      );
      setProperties(validProperties);
      setIsLoading(false);
    } else {
      fetchProperties();
    }
  }, [currentPropertyId, queryType, ownerId, propertyData, propertyType, location, customProperties]);

  // Auto-scroll functionality with seamless looping - stops when modal is open
  useEffect(() => {
    if (isAutoScrolling && properties.length > 0 && !showDetailModal && !show3DModal) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          // If we have enough properties to fill the view, use normal pagination
          if (properties.length > itemsPerView) {
            const maxIndex = properties.length - itemsPerView;
            return prev >= maxIndex ? 0 : prev + 1;
          } else {
            // If we have fewer properties than items per view, just loop through all
            return (prev + 1) % properties.length;
          }
        });
      }, autoScrollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoScrolling, properties.length, itemsPerView, autoScrollInterval, showDetailModal, show3DModal]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let data: any[] = [];

      switch (queryType) {
        case 'owner':
          if (ownerId) {
            const { data: ownerProps } = await supabase
              .from('properties')
              .select(`
                *,
                owner:profiles!properties_owner_id_fkey(
                  id,
                  full_name,
                  avatar_url,
                  verification_status,
                  created_at
                )
              `)
              .eq('owner_id', ownerId)
              .neq('id', currentPropertyId)
              .eq('status', 'active')
              .not('title', 'is', null)
              .not('title', 'eq', '')
              .gt('price', 0)
              .limit(limit);
            data = (ownerProps || []).map(p => {
              const ownerData = Array.isArray(p.owner) ? p.owner[0] : p.owner;
              return {
                ...p,
                posted_by: ownerData ? {
                  id: ownerData.id,
                  name: ownerData.full_name || 'Anonymous',
                  avatar_url: ownerData.avatar_url,
                  verification_status: ownerData.verification_status || 'unverified',
                  joining_date: ownerData.created_at
                } : undefined
              };
            });
          }
          break;

        case 'similar':
          if (propertyData && propertyData.property_type) {
            const priceMin = propertyData.price ? propertyData.price * 0.7 : 0;
            const priceMax = propertyData.price ? propertyData.price * 1.3 : 999999999;

            const { data: similarProps } = await supabase
              .from('properties')
              .select(`
                *,
                owner:profiles!properties_owner_id_fkey(
                  id,
                  full_name,
                  avatar_url,
                  verification_status,
                  created_at
                )
              `)
              .neq('id', currentPropertyId)
              .eq('status', 'active')
              .eq('property_type', propertyData.property_type)
              .eq('listing_type', propertyData.listing_type || 'sale')
              .gte('price', priceMin)
              .lte('price', priceMax)
              .not('title', 'is', null)
              .not('title', 'eq', '')
              .gt('price', 0)
              .or(`city.ilike.%${propertyData.city || ''}%,state.ilike.%${propertyData.state || ''}%`)
              .limit(limit);

            data = (similarProps || []).map(p => {
              const ownerData = Array.isArray(p.owner) ? p.owner[0] : p.owner;
              return {
                ...p,
                posted_by: ownerData ? {
                  id: ownerData.id,
                  name: ownerData.full_name || 'Anonymous',
                  avatar_url: ownerData.avatar_url,
                  verification_status: ownerData.verification_status || 'unverified',
                  joining_date: ownerData.created_at
                } : undefined
              };
            });
          }
          break;

        case 'recommended':
          let query = supabase
            .from('properties')
            .select(`
              *,
              owner:profiles!properties_owner_id_fkey(
                id,
                full_name,
                avatar_url,
                verification_status,
                created_at
              )
            `)
            .eq('status', 'active')
            .neq('id', currentPropertyId)
            .not('title', 'is', null)
            .not('title', 'eq', '')
            .gt('price', 0)
            .limit(limit);

          if (propertyType) {
            query = query.eq('property_type', propertyType);
          }

          if (location) {
            query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%,area.ilike.%${location}%`);
          }

          const { data: recommendedProps } = await query;
          data = (recommendedProps || []).map(p => {
            const ownerData = Array.isArray(p.owner) ? p.owner[0] : p.owner;
            return {
              ...p,
              posted_by: ownerData ? {
                id: ownerData.id,
                name: ownerData.full_name || 'Anonymous',
                avatar_url: ownerData.avatar_url,
                verification_status: ownerData.verification_status || 'unverified',
                joining_date: ownerData.created_at
              } : undefined
            };
          });
          break;
      }

      // Additional filtering to ensure only valid properties with images
      const validData = data.filter(property => 
        property.title && 
        property.title.trim() !== '' &&
        property.price && 
        property.price > 0 &&
        (property.images?.length > 0 || property.thumbnail_url)
      );

      setProperties(validData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => {
      if (properties.length > itemsPerView) {
        const maxIndex = properties.length - itemsPerView;
        return prev <= 0 ? maxIndex : prev - 1;
      } else {
        return prev <= 0 ? properties.length - 1 : prev - 1;
      }
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (properties.length > itemsPerView) {
        const maxIndex = properties.length - itemsPerView;
        return prev >= maxIndex ? 0 : prev + 1;
      } else {
        return (prev + 1) % properties.length;
      }
    });
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

  // Calculate pagination based on available properties
  const showNavigation = properties.length > 1;
  const maxIndex = properties.length > itemsPerView ? properties.length - itemsPerView : properties.length - 1;
  const totalPages = properties.length > itemsPerView ? maxIndex + 1 : properties.length;

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
              <Badge variant="outline">{properties.length} properties</Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Auto-scroll toggle */}
              {showNavigation && (
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
              )}

              {/* Navigation buttons */}
              {showNavigation && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={hideTitle ? "pt-6" : ""}>
        <div className="relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{
              transform: properties.length > itemsPerView 
                ? `translateX(-${currentIndex * (100 / itemsPerView)}%)`
                : `translateX(-${currentIndex * (100 / Math.min(properties.length, itemsPerView))}%)`,
              width: properties.length > itemsPerView 
                ? `${(properties.length / itemsPerView) * 100}%`
                : `100%`
            }}
            onMouseEnter={() => setIsAutoScrolling(false)} // Stop auto-scroll on hover
            onMouseLeave={() => setIsAutoScrolling(true)}   // Resume auto-scroll when hover ends
          >
            {properties.map((property, index) => (
              <div 
                key={`${property.id}-${index}`} 
                className="flex-shrink-0"
                style={{ 
                  width: properties.length > itemsPerView 
                    ? `${100 / properties.length}%`
                    : `${100 / Math.min(properties.length, itemsPerView)}%`
                }}
              >
                <CompactPropertyCard
                  property={property}
                  language="en"
                  isSaved={false}
                  onSave={() => {}}
                  onView={() => {
                    setSelectedProperty(property);
                    setShowDetailModal(true);
                  }}
                  onView3D={() => {
                    setSelectedProperty(property);
                    setShow3DModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Show navigation controls on main page even when hideTitle is true */}
        {hideTitle && showNavigation && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoScroll}
              className="flex items-center gap-1"
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </Button>

            {/* Pagination dots for main page */}
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation Controls for regular carousel */}
        {!hideTitle && showNavigation && (
          <>
            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Auto-scroll progress bar */}
            {isAutoScrolling && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-100"
                  style={{
                    width: `${((Date.now() % autoScrollInterval) / autoScrollInterval) * 100}%`
                  }}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Property Detail Modal */}
      {selectedProperty && showDetailModal && (
        <PropertyDetailModal
          property={selectedProperty as BaseProperty}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProperty(null);
          }}
          language="en"
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
          language="en"
        />
      )}
    </Card>
  );
};

export default AutoScrollCarousel;
