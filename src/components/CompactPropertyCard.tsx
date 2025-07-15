
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Eye, Box, Clock, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  rating: number;
  featured?: boolean;
  isHotDeal?: boolean;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  created_at?: string;
  posted_at?: string;
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    rating?: number;
    user_level?: string;
    verification_status?: string;
    total_properties?: number;
    joining_date?: string;
    customer_feedback_rating?: number;
    customer_feedback_count?: number;
  };
}

interface CompactPropertyCardProps {
  property: Property;
}

const CompactPropertyCard = ({ property }: CompactPropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-500';
      case 'rent':
        return 'bg-blue-500';
      case 'new-project':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Sale';
      case 'rent':
        return 'Rent';
      case 'new-project':
        return 'New';
      default:
        return type;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  };

  const formatJoiningDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 rounded-xl bg-card/95 backdrop-blur-sm cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Compact Badges */}
        <div className="absolute top-1.5 left-1.5 flex gap-1 flex-wrap">
          <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-md font-medium">
            {getTypeLabel(property.type)}
          </Badge>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Badge className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Box className="h-2 w-2" />
              3D
            </Badge>
          )}
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/90 hover:bg-background transition-all duration-300 ${
            isLiked ? 'text-destructive scale-110' : 'text-muted-foreground'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={`h-2.5 w-2.5 transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* Rating Badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-background/90 text-foreground px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium">{property.rating}</span>
        </div>

        {/* Hot Deal Badge */}
        {property.isHotDeal && (
          <div className="absolute top-2 left-2 mt-6">
            <Badge className="bg-red-500 text-white animate-pulse text-xs px-2 py-1 rounded-full">
              🔥 Hot
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem] flex-1">
            {property.title}
          </h3>
        </div>

        {/* User Information Section */}
        {property.posted_by && (
          <div className="space-y-2 mb-2">
            {/* Main User Info */}
            <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center gap-1">
                {property.posted_by.avatar_url ? (
                  <img 
                    src={property.posted_by.avatar_url} 
                    alt={property.posted_by.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                 ) : (
                   <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                     {property.posted_by.name.charAt(0).toUpperCase()}
                   </div>
                 )}
                 <div className="flex flex-col">
                   <span className="text-xs font-medium text-foreground">
                     {property.posted_by.name}
                   </span>
                   {property.posted_by.user_level && (
                     <span className="text-xs text-primary font-semibold">
                       {property.posted_by.user_level}
                     </span>
                   )}
                </div>
              </div>
              {property.posted_by.rating && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                    {property.posted_by.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Additional User Information */}
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {/* Customer Feedback Status */}
              {property.posted_by.customer_feedback_rating && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <TrendingUp className="h-3 w-3 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300 font-medium truncate">
                    Rating: {property.posted_by.customer_feedback_rating.toFixed(1)}
                    {property.posted_by.customer_feedback_count && ` (${property.posted_by.customer_feedback_count})`}
                  </span>
                </div>
              )}

              {/* Joining Date and Posting Time */}
              <div className="grid grid-cols-2 gap-1.5">
                {property.posted_by.joining_date && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <Calendar className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium text-xs truncate">
                      {formatJoiningDate(property.posted_by.joining_date)}
                    </span>
                  </div>
                )}

                {(property.created_at || property.posted_at) && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-700">
                    <Clock className="h-3 w-3 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs truncate">
                      {formatTimeAgo(property.posted_at || property.created_at || '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="text-xs line-clamp-1">{property.location}</span>
        </div>

        <div className="relative mb-2">
          <div className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1 tracking-tight">
            {property.price}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              <span>{property.area}m²</span>
            </div>
          </div>
        </div>

        <Button 
          size="sm"
          className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 text-xs rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactPropertyCard;
