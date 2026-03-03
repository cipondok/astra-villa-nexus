import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTracking } from "@/hooks/useUserTracking";
import { 
  Sparkles, 
  MapPin, 
  Home,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

interface SmartRecommendationsProps {
  limit?: number;
  className?: string;
}

const SmartRecommendations = ({ limit = 4, className = "" }: SmartRecommendationsProps) => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['smart-recommendations', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-match-engine-v2', {
        body: { limit },
      });
      if (error) throw error;
      return {
        recommendations: (data?.results || []) as Array<{
          property_id: string;
          title: string;
          city: string;
          price: number;
          property_type: string;
          image_url: string;
          match_score: number;
        }>,
        userProfile: data?.user_ai_profile || {},
      };
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const recommendations = data?.recommendations || [];
  const userProfile = data?.userProfile;

  const trackPropertyView = async (propertyId: string, property: any) => {
    if (!user?.id) return;
    await trackInteraction('property_view', {
      propertyId,
      propertyType: property.property_type,
      location: property.city,
      price: property.price,
      source: 'ai_recommendation'
    });
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-accent-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Recommendations</h3>
          <p className="text-muted-foreground mb-4">Sign in to get personalized property recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  const loading = isLoading || isFetching;

  return (
    <Card className={`backdrop-blur-xl bg-card/60 border-gold-primary/15 ${className}`}>
      <CardHeader className="p-2 pb-1.5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs">
            <div className="h-5 w-5 rounded bg-gold-primary/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-gold-primary" />
            </div>
            Smart Picks
            <Badge className="bg-gold-primary/10 text-gold-primary text-[8px] px-1 py-0">AI</Badge>
          </CardTitle>
          <Button
            onClick={() => refetch()}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {userProfile?.property_type_preference && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[8px] text-muted-foreground">Based on:</span>
            <Badge variant="secondary" className="text-[8px] px-1 py-0">
              {userProfile.property_type_preference}
            </Badge>
            {userProfile.preferred_city && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0">
                {userProfile.preferred_city}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-2">
                <div className="h-14 w-14 bg-muted rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5 py-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-0">
            {recommendations.map((property) => (
              <Link
                key={property.property_id}
                to={`/property/${property.property_id}`}
                onClick={() => trackPropertyView(property.property_id, property)}
                className="block p-2 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
              >
                <div className="flex gap-2">
                  <div className="relative flex-shrink-0">
                    <img
                      src={property.image_url || "/placeholder.svg"}
                      alt={property.title}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    {property.match_score > 50 && (
                      <Badge className="absolute -top-1.5 -right-1.5 bg-chart-1 text-primary-foreground text-[7px] px-1 py-0">
                        <TrendingUp className="h-2 w-2 mr-0.5" />
                        {Math.round(property.match_score)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-semibold text-foreground truncate">
                      {property.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[8px] text-muted-foreground mt-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {property.city}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                      <Home className="h-2.5 w-2.5" />
                      {property.property_type}
                    </div>
                    <div className="text-[10px] font-bold text-gold-primary mt-0.5">
                      IDR {property.price?.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground">Browse properties to unlock AI recommendations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
