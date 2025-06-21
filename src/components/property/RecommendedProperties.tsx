
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

interface RecommendedPropertiesProps {
  currentPropertyId?: string;
  propertyType?: string;
  location?: string;
  priceRange?: [number, number];
  limit?: number;
  title?: string;
  showAIBadge?: boolean;
}

const RecommendedProperties = ({ 
  currentPropertyId, 
  propertyType, 
  location, 
  priceRange,
  limit = 4,
  title = "Recommended Properties",
  showAIBadge = true
}: RecommendedPropertiesProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentPropertyId, propertyType, location, priceRange]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .limit(limit);

      // Exclude current property if viewing a specific property
      if (currentPropertyId) {
        query = query.neq('id', currentPropertyId);
      }

      // Filter by property type if specified
      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      // Filter by location if specified
      if (location) {
        query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%,area.ilike.%${location}%`);
      }

      // Filter by price range if specified
      if (priceRange && priceRange[0] && priceRange[1]) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to sample data
        setRecommendations(generateFallbackProperties());
      } else if (data && data.length > 0) {
        setRecommendations(data);
      } else {
        // If no matches, get random properties
        const { data: fallbackData } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .limit(limit);
        
        setRecommendations(fallbackData || generateFallbackProperties());
      }
    } catch (error) {
      console.error('Error in fetchRecommendations:', error);
      setRecommendations(generateFallbackProperties());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackProperties = () => {
    return [
      {
        id: 'rec-1',
        title: 'Modern City Apartment',
        location: 'Jakarta, Indonesia',
        price: 2500000000,
        bedrooms: 2,
        bathrooms: 2,
        area_sqm: 95,
        property_type: 'apartment',
        listing_type: 'sale',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
        state: 'DKI Jakarta',
        city: 'Jakarta',
        area: 'Central Jakarta',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'rec-2',
        title: 'Beachfront Villa',
        location: 'Bali, Indonesia',
        price: 8500000000,
        bedrooms: 4,
        bathrooms: 3,
        area_sqm: 250,
        property_type: 'villa',
        listing_type: 'sale',
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop'],
        state: 'Bali',
        city: 'Denpasar',
        area: 'Seminyak',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'rec-3',
        title: 'Family Townhouse',
        location: 'Surabaya, Indonesia',
        price: 1800000000,
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: 150,
        property_type: 'house',
        listing_type: 'sale',
        images: ['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop'],
        state: 'East Java',
        city: 'Surabaya',
        area: 'Surabaya Barat',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'rec-4',
        title: 'Luxury Penthouse',
        location: 'Bandung, Indonesia',
        price: 4200000000,
        bedrooms: 3,
        bathrooms: 3,
        area_sqm: 180,
        property_type: 'apartment',
        listing_type: 'sale',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'],
        state: 'West Java',
        city: 'Bandung',
        area: 'Bandung Utara',
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
            <TrendingUp className="h-5 w-5" />
            {title}
            {showAIBadge && <Badge className="bg-purple-100 text-purple-800">AI</Badge>}
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

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
            {showAIBadge && <Badge className="bg-purple-100 text-purple-800">AI</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recommendations available at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
          {showAIBadge && <Badge className="bg-purple-100 text-purple-800">AI</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((property) => (
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

export default RecommendedProperties;
