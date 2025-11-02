import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
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

  if (recommendations.length === 0 && !isGenerating) return null;

  return (
    <div className={cn("bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-3 md:p-4", className)}>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                AI Recommended For You
              </h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {user ? 'Personalized based on your preferences' : 'Trending properties selected by AI'}
              </p>
            </div>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 px-3"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </Button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span className="hidden sm:inline">Powered by Lovable AI • Updated in real-time</span>
          <span className="sm:hidden">AI Powered</span>
        </div>
      </div>

      {isGenerating ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[120px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {recommendations.map((property) => (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex h-[120px]">
                {/* Image - Left Side */}
                <div className="relative w-[100px] lg:w-[120px] flex-shrink-0">
                  <img
                    src={property.thumbnail_url || property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="px-1.5 py-0.5 bg-primary/90 text-primary-foreground text-[9px] font-semibold rounded-full backdrop-blur-sm shadow-sm">
                      {property.property_type}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 group-hover:to-black/20 transition-all duration-300" />
                </div>
                
                {/* Content - Right Side */}
                <div className="flex-1 p-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-0.5">
                      {property.title}
                    </h3>
                    <div className="text-[9px] text-muted-foreground line-clamp-1">
                      {property.city || property.location}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {property.price && property.price >= 1000000 
                      ? `Rp ${(property.price / 1000000).toFixed(1)}M`
                      : `Rp ${property.price?.toLocaleString() || 'N/A'}`
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
