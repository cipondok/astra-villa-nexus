/**
 * AI Property Recommendations Component
 * Displays smart property suggestions with "Why this match?" explanations
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Info, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Star,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";

interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
  weight: number;
}

interface Recommendation {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  thumbnail_url: string;
  images: string[];
  overallScore: number;
  preferenceScore: number;
  discoveryScore: number;
  matchReasons: MatchReason[];
  aiExplanation: string | null;
  matchPercentage: number;
  isDiscovery: boolean;
}

interface AIPropertyRecommendationsProps {
  limit?: number;
  showInsights?: boolean;
  className?: string;
}

const AIPropertyRecommendations = ({
  limit = 6,
  showInsights = true,
  className
}: AIPropertyRecommendationsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Recommendation | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { getPropertyImage } = useDefaultPropertyImage();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['ai-recommendations', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('ai-property-recommendations', {
        body: {
          action: 'get_ai_recommendations',
          userId: user.id,
          limit
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const recommendations: Recommendation[] = data?.recommendations || [];
  const insights = data?.userInsights;

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleShowExplanation = (property: Recommendation) => {
    setSelectedProperty(property);
    setShowExplanation(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}M`;
    return `Rp ${price.toLocaleString()}`;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  if (!user) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Personalized Recommendations</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to get AI-powered property recommendations tailored to your preferences.
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Building Your Recommendations</h3>
          <p className="text-muted-foreground mb-4">
            Browse more properties to help us understand your preferences better.
          </p>
          <Button onClick={() => navigate('/search-advanced')}>Explore Properties</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
          <Badge variant="secondary" className="ml-2">
            AI Powered
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Insights */}
        {showInsights && insights && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Based on:</span>
            {insights.preferredLocations?.slice(0, 3).map((loc: string) => (
              <Badge key={loc} variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {loc}
              </Badge>
            ))}
            {insights.budgetRange?.max && insights.budgetRange.max < Infinity && (
              <Badge variant="outline" className="text-xs">
                Budget: {formatPrice(insights.budgetRange.max)}
              </Badge>
            )}
          </div>
        )}

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((property) => (
            <div
              key={property.id}
              className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div 
                className="relative aspect-[4/3] cursor-pointer"
                onClick={() => handlePropertyClick(property.id)}
              >
                <img
                  src={getPropertyImage(property.images, property.thumbnail_url)}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Match Badge */}
                <div className="absolute top-2 left-2">
                  {property.isDiscovery ? (
                    <Badge className="bg-purple-600 text-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Discovery
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      {property.matchPercentage}% Match
                    </Badge>
                  )}
                </div>

                {/* Why This Match Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowExplanation(property);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/70 rounded-full hover:bg-white transition-colors"
                      >
                        <Info className="h-4 w-4 text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Why this match?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 
                  className="font-medium line-clamp-1 cursor-pointer hover:text-primary"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  {property.title}
                </h3>
                
                <p className="text-lg font-bold text-primary">
                  {formatPrice(property.price)}
                </p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{property.city || property.location}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="h-3 w-3" />
                    {property.area_sqm}m²
                  </span>
                </div>

                {/* AI Explanation Preview */}
                {property.aiExplanation && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    "{property.aiExplanation}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/search-advanced')}
          >
            View All Recommendations
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Why This Match?
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              {/* Property Summary */}
              <div className="flex gap-3">
                <img
                  src={getPropertyImage(selectedProperty.images, selectedProperty.thumbnail_url)}
                  alt={selectedProperty.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium">{selectedProperty.title}</h4>
                  <p className="text-sm text-primary font-bold">
                    {formatPrice(selectedProperty.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProperty.city}
                  </p>
                </div>
              </div>

              {/* Match Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Match</span>
                  <span className={cn("font-bold", getMatchColor(selectedProperty.matchPercentage))}>
                    {selectedProperty.matchPercentage}%
                  </span>
                </div>
                <Progress value={selectedProperty.matchPercentage} className="h-2" />
              </div>

              {/* AI Explanation */}
              {selectedProperty.aiExplanation && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{selectedProperty.aiExplanation}</p>
                  </div>
                </div>
              )}

              {/* Match Breakdown */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Match Breakdown</h5>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {selectedProperty.matchReasons?.map((reason, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{reason.factor}</span>
                            <span className={getMatchColor(reason.score * 100)}>
                              {Math.round(reason.score * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {reason.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Discovery Badge */}
              {selectedProperty.isDiscovery && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700 dark:text-purple-300">
                    Discovery pick - something different you might like!
                  </span>
                </div>
              )}

              {/* View Property Button */}
              <Button 
                className="w-full"
                onClick={() => {
                  setShowExplanation(false);
                  handlePropertyClick(selectedProperty.id);
                }}
              >
                View Property Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AIPropertyRecommendations;
