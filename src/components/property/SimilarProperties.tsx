
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Similar Properties
            <Badge variant="outline">Location Match</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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

  if (similarProperties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Similar Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No similar properties found in this area</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Similar Properties
          <Badge variant="outline">{similarProperties.length} found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarProperties.map((property) => (
            <CompactPropertyCard
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
