import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ASTRAVillaPropertyCard from "@/components/property/ASTRAVillaPropertyCard";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { motion } from "framer-motion";

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
  const { defaultImage } = useDefaultPropertyImage();

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

      if (currentPropertyId) {
        query = query.neq('id', currentPropertyId);
      }

      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      if (location) {
        query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%,area.ilike.%${location}%`);
      }

      if (priceRange && priceRange[0] && priceRange[1]) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations(generateFallbackProperties());
      } else if (data && data.length > 0) {
        setRecommendations(data);
      } else {
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
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{title}</span>
            {showAIBadge && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-xs px-2 py-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 sm:h-36 bg-muted rounded-lg mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-1.5"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{title}</span>
            {showAIBadge && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-xs px-2 py-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recommendations available at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-5 pb-2 sm:pb-3 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{title}</span>
            {showAIBadge && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-xs px-2 py-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                AI Powered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {recommendations.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ASTRAVillaPropertyCard
                  property={property}
                  language="en"
                  isSaved={false}
                  onSave={() => {}}
                  onView={() => window.open(`/property/${property.id}`, '_blank')}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendedProperties;
