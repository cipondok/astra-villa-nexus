import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sparkles, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ThumbsUp, 
  ThumbsDown,
  Info,
  TrendingUp,
  Lightbulb,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PropertyRecommendation, MatchReason } from '@/hooks/useSmartRecommendations';
import { useRecommendationFeedback } from '@/hooks/useSmartRecommendations';

interface SmartPropertyCardProps {
  recommendation: PropertyRecommendation;
  onSave?: () => void;
}

const SmartPropertyCard = ({ recommendation, onSave }: SmartPropertyCardProps) => {
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const feedback = useRecommendationFeedback();
  const { property, overallScore, matchReasons, discoveryReasons, isDiscoveryMatch } = recommendation;

  const handleFeedback = (type: 'liked' | 'disliked') => {
    feedback.mutate({ 
      recommendationId: recommendation.propertyId, 
      feedback: type 
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <Link to={`/property/${property.id}`}>
          <img
            src={property.image_urls?.[0] || '/placeholder.svg'}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Match Score Badge */}
        <div className="absolute top-2 left-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={`${getScoreBg(overallScore)} ${getScoreColor(overallScore)} border-0 cursor-help`}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {Math.round(overallScore)}% Match
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Why this property?</p>
                <ul className="text-xs space-y-1">
                  {matchReasons.slice(0, 3).map((reason, i) => (
                    <li key={i}>• {reason.explanation}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Discovery Badge */}
        {isDiscoveryMatch && (
          <Badge className="absolute top-2 right-2 bg-purple-500 text-white">
            <Lightbulb className="h-3 w-3 mr-1" />
            Discovery
          </Badge>
        )}

        {/* Quick Feedback */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90"
            onClick={(e) => {
              e.preventDefault();
              handleFeedback('liked');
            }}
          >
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90"
            onClick={(e) => {
              e.preventDefault();
              handleFeedback('disliked');
            }}
          >
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90"
            onClick={(e) => {
              e.preventDefault();
              onSave?.();
            }}
          >
            <Heart className="h-4 w-4 text-pink-600" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-primary">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms}
            </span>
          )}
          {property.land_size && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              {property.land_size}m²
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${property.price?.toLocaleString()}
          </span>

          <Dialog open={showMatchDetails} onOpenChange={setShowMatchDetails}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Why this match?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Match Analysis
                </DialogTitle>
              </DialogHeader>
              <MatchDetailsPanel 
                matchReasons={matchReasons}
                discoveryReasons={discoveryReasons}
                overallScore={overallScore}
                isDiscoveryMatch={isDiscoveryMatch}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

interface MatchDetailsPanelProps {
  matchReasons: MatchReason[];
  discoveryReasons?: MatchReason[];
  overallScore: number;
  isDiscoveryMatch: boolean;
}

const MatchDetailsPanel = ({ 
  matchReasons, 
  discoveryReasons, 
  overallScore,
  isDiscoveryMatch 
}: MatchDetailsPanelProps) => {
  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="text-center p-4 bg-muted rounded-lg">
        <div className="text-3xl font-bold text-primary mb-1">
          {Math.round(overallScore)}%
        </div>
        <div className="text-sm text-muted-foreground">
          {isDiscoveryMatch ? 'Discovery Match' : 'Preference Match'}
        </div>
      </div>

      {/* Match Factors */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Match Factors
        </h4>
        <div className="space-y-3">
          {matchReasons.map((reason, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{reason.factor}</span>
                <span className="text-muted-foreground">
                  {Math.round(reason.score * 100)}%
                </span>
              </div>
              <Progress value={reason.score * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{reason.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Discovery Reasons */}
      {discoveryReasons && discoveryReasons.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-purple-500" />
            Why Discover This?
          </h4>
          <div className="space-y-2">
            {discoveryReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="text-xs shrink-0">
                  {reason.factor}
                </Badge>
                <span className="text-muted-foreground">{reason.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2 border-t">
        Our AI learns from your browsing to improve recommendations
      </p>
    </div>
  );
};

export default SmartPropertyCard;
