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
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-foreground">
              AI Recommended
            </h3>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {user ? 'Personalized for you' : 'Trending picks'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {isGenerating ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[160px] md:w-[200px] h-[200px] md:h-[240px] animate-pulse bg-muted rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recommendations.map((property) => (
              <div
                key={property.id}
                onClick={() => onPropertyClick(property)}
                className="flex-shrink-0 w-[150px] md:w-[200px] snap-start cursor-pointer group"
              >
                <div className="relative h-[190px] md:h-[240px] rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  {/* Image */}
                  <div className="relative h-[100px] md:h-[130px] overflow-hidden">
                    <img
                      src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-primary/90 text-primary-foreground text-[9px] md:text-[10px] font-medium rounded-md backdrop-blur-sm capitalize">
                        {property.property_type || 'Property'}
                      </span>
                    </div>

                    {/* Listing Type Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 bg-background/80 text-foreground text-[9px] md:text-[10px] font-medium rounded-md backdrop-blur-sm">
                        {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                    </div>

                    {/* Price on Image */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs md:text-sm font-bold drop-shadow-lg">
                        {formatPrice(property.price || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2 md:p-2.5 space-y-1.5">
                    <h4 className="text-[11px] md:text-xs font-semibold text-foreground line-clamp-2 leading-tight min-h-[28px] md:min-h-[32px]">
                      {property.title}
                    </h4>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="text-[9px] md:text-[10px] truncate">
                        {property.city || property.location || 'Indonesia'}
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-muted-foreground">
                      {property.bedrooms && (
                        <div className="flex items-center gap-0.5">
                          <Bed className="h-2.5 w-2.5" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-0.5">
                          <Bath className="h-2.5 w-2.5" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm && (
                        <div className="flex items-center gap-0.5">
                          <span>{property.area_sqm}m²</span>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <Button 
                      size="sm" 
                      className="w-full h-6 md:h-7 text-[10px] md:text-xs mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPropertyClick(property);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Scroll Indicators */}
        <div className="flex justify-center gap-1 mt-2 md:hidden">
          {recommendations.slice(0, Math.min(6, recommendations.length)).map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
            />
          ))}
        </div>
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
