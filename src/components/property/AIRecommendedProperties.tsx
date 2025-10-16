import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import PropertyGridView from '@/components/search/PropertyGridView';
import { BaseProperty } from '@/types/property';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { shareProperty } from '@/utils/shareUtils';
import { toast as sonnerToast } from 'sonner';
import WhatsAppInquiryDialog from './WhatsAppInquiryDialog';

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
    <Card className={cn("bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-primary/20", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                AI Recommended For You
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? 'Personalized based on your preferences' : 'Trending properties selected by AI'}
              </p>
            </div>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Powered by Lovable AI • Updated in real-time</span>
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2" />
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2" />
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <PropertyGridView
            properties={recommendations}
            onPropertyClick={onPropertyClick}
            onView3D={onPropertyClick}
            onSave={(property) => console.log('Save property:', property.id)}
            onShare={async (property) => {
              const success = await shareProperty({
                id: property.id,
                title: property.title,
                price: property.price || 0,
                location: property.location || property.city || '',
                images: property.images
              });
              if (success) {
                sonnerToast.success("Property link shared!");
              }
            }}
            onContact={(property) => {
              setSelectedProperty(property);
              setWhatsappDialogOpen(true);
            }}
          />
        )}
      </CardContent>
      
      {selectedProperty && (
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={selectedProperty}
        />
      )}
    </Card>
  );
};

export default AIRecommendedProperties;
