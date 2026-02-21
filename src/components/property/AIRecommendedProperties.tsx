import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Eye, ArrowRight, Key, Tag, Building, Clock, Maximize } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';
import { BaseProperty } from '@/types/property';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getEdgeFunctionUserMessage, getEdgeFunctionStatus, throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from '@/lib/aiAvailability';
import WhatsAppInquiryDialog from './WhatsAppInquiryDialog';
import ProgressPopup from '@/components/ui/ProgressPopup';
import { useNavigate } from 'react-router-dom';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';

interface AIRecommendedPropertiesProps {
  onPropertyClick: (property: BaseProperty) => void;
  className?: string;
}

const AIRecommendedProperties = ({ onPropertyClick, className }: AIRecommendedPropertiesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<BaseProperty[]>([]);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getPropertyImage } = useDefaultPropertyImage();

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
      // If AI is temporarily disabled (e.g., due to 402 credits), skip calling it.
      if (isAiTemporarilyDisabled()) {
        throw Object.assign(new Error('AI temporarily disabled'), { status: 402 });
      }

      // Get recent properties for context
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url, created_at')
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
       throwIfEdgeFunctionReturnedError(aiResponse);

      // Extract property IDs from AI response
      const responseText = aiResponse?.message || '';
      const propertyIds = responseText
        .match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];

      if (propertyIds.length === 0) {
        // Fallback to recent properties
        const recommended = recentProperties
          ?.slice(0, 8)
          .map((p: any) => ({
            ...p,
            listing_type: p.listing_type as "sale" | "rent" | "lease",
            image_urls: p.images || [],
          })) || [];
        setRecommendations(recommended);
      } else {
        // Fetch recommended properties
        const { data: recommendedProps } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url, created_at')
          .in('id', propertyIds.slice(0, 8))
          .eq('status', 'active')
          .eq('approval_status', 'approved');

        const transformed = recommendedProps?.map((p: any) => ({
          ...p,
          listing_type: p.listing_type as "sale" | "rent" | "lease",
          image_urls: p.images || [],
        })) || [];

        setRecommendations(transformed);
      }

      toast({
        title: "✨ Recommendations Generated",
        description: "AI has selected properties based on your preferences",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);

      // Back off further AI calls for a bit on common gateway failures.
      markAiTemporarilyDisabledFromError(error);

      // Friendly handling for credit/rate-limit errors.
      // Keep the app usable by falling back to trending properties, but clearly inform the user.
      const status = getEdgeFunctionStatus(error);
      if (status === 402 || status === 429 || status === 503) {
        const msg = getEdgeFunctionUserMessage(error);
        toast({ title: msg.title, description: msg.description, variant: msg.variant });
      }
      
      // Fallback to trending properties
      const { data: fallbackProps } = await supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8);

      const transformed = fallbackProps?.map((p: any) => ({
        ...p,
        listing_type: p.listing_type as "sale" | "rent" | "lease",
        image_urls: p.images || [],
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
      const value = (price / 1000000000).toFixed(1);
      return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{value}<span className="text-[0.7em] font-medium opacity-90">M</span></>;
    }
    if (price >= 1000000) {
      const value = (price / 1000000).toFixed(0);
      return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{value}<span className="text-[0.7em] font-medium opacity-90">Jt</span></>;
    }
    return <><span className="text-[0.7em] font-medium opacity-90">Rp</span>{price.toLocaleString('id-ID')}</>;
  };

  const PropertyCard = ({ property }: { property: BaseProperty }) => {
    const isRent = property.listing_type === 'rent';
    const ListingIcon = isRent ? Key : Tag;
    const formatPriceClean = (price: number) => {
      if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}M`;
      if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}Jt`;
      return `Rp ${price.toLocaleString('id-ID')}`;
    };

    return (
      <div
        onClick={() => onPropertyClick(property)}
        className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] cursor-pointer group/card overflow-hidden bg-card border border-border rounded-md hover:border-primary/30 hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getPropertyImage(property.images, property.thumbnail_url)}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
          />

          {/* Save Button */}
          <button className="absolute top-1.5 right-1.5 h-6 w-6 sm:h-7 sm:w-7 p-0 bg-background/90 hover:bg-background rounded-full shadow-md flex items-center justify-center">
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
          </button>

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
            <span className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded text-white",
              isRent ? "bg-primary" : "bg-green-600"
            )}>
              <ListingIcon className="h-2.5 w-2.5" />
              {isRent ? 'Sewa' : 'Jual'}
            </span>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded bg-purple-500/90 text-white">
              <Sparkles className="h-2 w-2" />
              AI
            </span>
          </div>
        </div>

        {/* Content - Matching Dijual style */}
        <div className="p-2 sm:p-2.5">
          {/* Price */}
          <p className="text-xs sm:text-sm font-bold text-primary mb-0.5 leading-tight">
            {formatPriceClean(property.price || 0)}
            {isRent && <span className="text-[9px] font-medium text-muted-foreground">/bln</span>}
          </p>

          {/* Title */}
          <h3 className="text-[10px] sm:text-xs font-semibold text-foreground line-clamp-1 mb-0.5">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-0.5 text-muted-foreground mb-1.5">
            <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] truncate">{property.city || property.location || 'Indonesia'}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-muted-foreground border-t border-border pt-1.5">
            {property.bedrooms && property.bedrooms > 0 && (
              <div className="flex items-center gap-0.5">
                <Bed className="h-2.5 w-2.5" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && property.bathrooms > 0 && (
              <div className="flex items-center gap-0.5">
                <Bath className="h-2.5 w-2.5" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area_sqm && (
              <div className="flex items-center gap-0.5">
                <Maximize className="h-2.5 w-2.5" />
                <span>{property.area_sqm}m²</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ViewAllCard = () => (
    <div
      onClick={() => navigate('/search')}
      className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] cursor-pointer group/card bg-gradient-to-br from-primary via-primary/90 to-accent rounded-lg border border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px]"
    >
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform duration-300">
        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
      <h3 className="text-xs sm:text-sm font-bold text-white">View All</h3>
      <p className="text-[9px] sm:text-[10px] text-white/80 mt-0.5">Explore more</p>
    </div>
  );

  if (recommendations.length === 0 && !isGenerating) return null;

  return (
    <div className={cn("relative rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3", className)}>
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2 px-0.5 sm:px-1">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-[7px] sm:text-[10px] md:text-xs font-semibold text-foreground">AI Recommended</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-white/80 dark:bg-black/50 border-purple-200/50 dark:border-purple-800/30"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-white/80 dark:bg-black/50 border-purple-200/50 dark:border-purple-800/30"
            onClick={scrollRight}
          >
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
          </Button>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            size="icon"
            variant="ghost"
            className="h-6 w-6 md:h-7 md:w-7"
          >
            <RefreshCw
              className={cn(
                "h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400",
                isGenerating && "animate-spin"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Two Row Grid */}
      <div className="relative">
        {isGenerating ? (
          <div className="grid grid-rows-2 gap-2 md:gap-3 px-1">
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-[140px] md:w-[180px] h-32 md:h-40 animate-pulse bg-purple-100/50 dark:bg-purple-900/20 rounded-xl"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-rows-2 gap-2 md:gap-3 px-1">
            {/* Row 1 */}
            <div 
              ref={scrollRef}
              className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recommendations.slice(0, Math.ceil(recommendations.length / 2)).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              <ViewAllCard />
            </div>
            {/* Row 2 */}
            <div 
              className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recommendations.slice(Math.ceil(recommendations.length / 2)).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              <ViewAllCard />
            </div>
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
