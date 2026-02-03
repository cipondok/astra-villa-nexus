import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Rumah123PropertyCard from "@/components/property/Rumah123PropertyCard";
import { motion } from "framer-motion";

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
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Similar Properties</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5 bg-accent/10 text-accent border-0">
              AI Match
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 sm:h-32 md:h-40 bg-muted rounded-lg mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-1.5"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Similar Properties</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No similar properties found in this area</p>
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
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Similar Properties</span>
            <div className="flex items-center gap-1.5 ml-auto">
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5 bg-accent/10 text-accent border-0 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                AI Match
              </Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5 border-border/50 text-muted-foreground">
                {similarProperties.length} found
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {similarProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Rumah123PropertyCard
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

export default SimilarProperties;
