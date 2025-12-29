import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Eye } from 'lucide-react';
import { BaseProperty } from '@/types/property';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import WhatsAppInquiryDialog from './WhatsAppInquiryDialog';
import ProgressPopup from '@/components/ui/ProgressPopup';

interface AIRecommendedPropertiesProps {
  onPropertyClick: (property: BaseProperty) => void;
  className?: string;
}

const AIRecommendedProperties = ({ onPropertyClick, className }: AIRecommendedPropertiesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<BaseProperty[]>([]);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user preferences and property data
  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('interaction_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      return interactions;
    },
    enabled: !!user,
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    setShowProgressPopup(true);
    
    try {
      // Get recent properties for context
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      // Use AI to analyze and recommend
      const body: any = {
        message: `Based on ${userPreferences ? 'user preferences and browsing history' : 'popular trends'}, recommend 8 properties that would be most suitable. Consider location, price range, property type, and amenities. Return property IDs only in format: "propertyId1,propertyId2,..."`,
        conversationId: 'recommendations_' + Date.now(),
      };
      if (user?.id) body.userId = user.id;

      const { data: aiResponse, error } = await supabase.functions.invoke('ai-assistant', {
        body
      });

      if (error) throw error;

      // Extract property IDs from AI response
      const responseText = aiResponse?.message || '';
      const propertyIds = responseText
        .match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];

      if (propertyIds.length === 0) {
        // Fallback to recent properties
        const recommended = recentProperties
          ?.slice(0, 8)
          .map(p => ({
            ...p,
            listing_type: p.listing_type as "sale" | "rent" | "lease",
            image_urls: p.images || []
          })) || [];
        setRecommendations(recommended);
      } else {
        // Fetch recommended properties
        const { data: recommendedProps } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url')
          .in('id', propertyIds.slice(0, 8))
          .eq('status', 'active')
          .eq('approval_status', 'approved');

        const transformed = recommendedProps?.map(p => ({
          ...p,
          listing_type: p.listing_type as "sale" | "rent" | "lease",
          image_urls: p.images || []
        })) || [];

        setRecommendations(transformed);
      }

      toast({
        title: "✨ Recommendations Generated",
        description: "AI has selected properties based on your preferences",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback to trending properties
      const { data: fallbackProps } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8);

      const transformed = fallbackProps?.map(p => ({
        ...p,
        listing_type: p.listing_type as "sale" | "rent" | "lease",
        image_urls: p.images || []
      })) || [];

      setRecommendations(transformed);

      toast({
        title: "Trending Properties",
        description: "Showing popular properties",
        variant: "default",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowProgressPopup(false), 500);
    }
  };

  useEffect(() => {
    // Delay AI recommendations to improve initial page load
    const timer = setTimeout(() => {
      generateRecommendations();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(0)}M`;
    }
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  if (recommendations.length === 0 && !isGenerating) return null;

  return (
    <div className={cn("relative glass-card rounded-lg p-1.5 md:p-2", className)}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-1 md:mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
          <h3 className="text-[10px] md:text-sm font-bold gradient-text">AI Recommended</h3>
          <span className="text-[8px] md:text-[10px] text-muted-foreground hidden sm:inline">
            • {user ? 'For you' : 'Trending picks'}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="outline"
            size="icon"
            className="h-5 w-5 md:h-6 md:w-6 rounded-full glass-effect border-border/50"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-5 w-5 md:h-6 md:w-6 rounded-full glass-effect border-border/50"
            onClick={scrollRight}
          >
            <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </Button>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            size="icon"
            variant="ghost"
            className="h-5 w-5 md:h-6 md:w-6"
          >
            <RefreshCw className={cn("h-2.5 w-2.5 md:h-3 md:w-3", isGenerating && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {isGenerating ? (
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[140px] md:w-[170px] h-[56px] md:h-[64px] animate-pulse bg-muted rounded-md"
              />
            ))}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recommendations.map((property) => (
              <div
                key={property.id}
                onClick={() => onPropertyClick(property)}
                className="flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer group/card"
              >
                <div className="relative overflow-hidden rounded-md glass-effect shadow-sm hover:shadow-md transition-all duration-300 flex h-[56px] md:h-[64px]">
                  {/* Image */}
                  <div className="relative w-[56px] md:w-[64px] flex-shrink-0">
                    <img
                      src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-1.5 flex flex-col justify-between min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="inline-block px-1 py-0.5 bg-primary/20 text-primary text-[7px] md:text-[8px] font-medium rounded truncate">
                          {property.property_type || 'Property'}
                        </span>
                        <span className="text-[7px] md:text-[8px] text-muted-foreground">
                          {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </div>
                      <h4 className="text-[9px] md:text-[10px] font-medium text-foreground line-clamp-1">
                        {property.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-[8px] md:text-[9px] text-muted-foreground truncate">
                        {property.bedrooms && <span>{property.bedrooms}bd</span>}
                        {property.bathrooms && <span>{property.bathrooms}ba</span>}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold text-primary whitespace-nowrap">
                        {formatPrice(property.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedProperty && (
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={selectedProperty}
        />
      )}
      
      <ProgressPopup
        isVisible={showProgressPopup}
        title={isGenerating ? "🔍 Finding Best Properties" : "✨ Properties Loaded"}
        description={isGenerating ? "AI is analyzing trending properties..." : "Showing popular properties"}
        duration={2000}
      />
    </div>
  );
};

export default AIRecommendedProperties;
