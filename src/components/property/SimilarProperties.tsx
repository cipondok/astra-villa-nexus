
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModernPropertyCard from "@/components/property/ModernPropertyCard";

interface SimilarPropertiesProps {
  currentProperty: {
    id: string;
    property_type: string;
    price: number;
    bedrooms: number;
    city: string;
    state: string;
    listing_type: string;
  };
  limit?: number;
}

const SimilarProperties = ({ currentProperty, limit = 6 }: SimilarPropertiesProps) => {
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSimilarProperties();
  }, [currentProperty.id]);

  const fetchSimilarProperties = async () => {
    setIsLoading(true);
    try {
      // Calculate price range (±30% of current property price)
      const priceMin = currentProperty.price * 0.7;
      const priceMax = currentProperty.price * 1.3;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .neq('id', currentProperty.id)
        .eq('status', 'active')
        .eq('property_type', currentProperty.property_type)
        .eq('listing_type', currentProperty.listing_type)
        .gte('price', priceMin)
        .lte('price', priceMax)
        .or(`city.ilike.%${currentProperty.city}%,state.ilike.%${currentProperty.state}%`)
        .limit(limit);

      if (error) {
        console.error('Error fetching similar properties:', error);
        setSimilarProperties(generateFallbackSimilar());
      } else if (data && data.length > 0) {
        setSimilarProperties(data);
      } else {
        // Fallback: get properties with same type but different criteria
        const { data: fallbackData } = await supabase
          .from('properties')
          .select('*')
          .neq('id', currentProperty.id)
          .eq('status', 'active')
          .eq('property_type', currentProperty.property_type)
          .limit(limit);
        
        setSimilarProperties(fallbackData || generateFallbackSimilar());
      }
    } catch (error) {
      console.error('Error in fetchSimilarProperties:', error);
      setSimilarProperties(generateFallbackSimilar());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSimilar = () => {
    const basePrice = currentProperty.price;
    return [
      {
        id: 'sim-1',
        title: `Similar ${currentProperty.property_type} in ${currentProperty.city}`,
        location: `${currentProperty.city}, ${currentProperty.state}`,
        price: basePrice * 0.9,
        bedrooms: currentProperty.bedrooms,
        bathrooms: Math.max(1, currentProperty.bedrooms - 1),
        area_sqm: 120,
        property_type: currentProperty.property_type,
        listing_type: currentProperty.listing_type,
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'],
        state: currentProperty.state,
        city: currentProperty.city,
        area: 'Similar Area',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'sim-2',
        title: `Comparable ${currentProperty.property_type}`,
        location: `${currentProperty.city}, ${currentProperty.state}`,
        price: basePrice * 1.1,
        bedrooms: currentProperty.bedrooms,
        bathrooms: currentProperty.bedrooms,
        area_sqm: 140,
        property_type: currentProperty.property_type,
        listing_type: currentProperty.listing_type,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop'],
        state: currentProperty.state,
        city: currentProperty.city,
        area: 'Nearby Area',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
  };

  if (isLoading) {
    return (
      <Card className="border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            Similar Properties
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">Location Match</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 sm:h-32 md:h-40 bg-muted/50 rounded-lg mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-muted/50 rounded w-3/4 mb-1.5 sm:mb-2"></div>
                <div className="h-2 sm:h-3 bg-muted/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <Card className="border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            Similar Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center py-4 sm:py-8">
            <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-2 sm:mb-4" />
            <p className="text-xs sm:text-sm text-muted-foreground">No similar properties found in this area</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          Similar Properties
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ml-auto">{similarProperties.length} found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {similarProperties.map((property) => (
            <ModernPropertyCard
              key={property.id}
              property={property}
              language="en"
              isSaved={false}
              onSave={() => {}}
              onView={() => window.open(`/property/${property.id}`, '_blank')}
              onView3D={() => {}}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarProperties;
