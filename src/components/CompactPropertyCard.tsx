
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Eye, Box } from "lucide-react";
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
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    rating?: number;
    user_level?: string;
    verification_status?: string;
    total_properties?: number;
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

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Compact Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <Badge className={`${getTypeColor(property.type)} text-white text-xs px-2 py-1 rounded-full`}>
            {getTypeLabel(property.type)}
          </Badge>
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Box className="h-2 w-2" />
              3D
            </Badge>
          )}
        </div>

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 hover:bg-white transition-all duration-300 ${
            isLiked ? 'text-red-500 scale-110' : 'text-gray-600'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={`h-3 w-3 transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[3rem] flex-1">
            {property.title}
          </h3>
        </div>

        {/* User Rating and Level */}
        {property.posted_by && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-1">
              {property.posted_by.avatar_url ? (
                <img 
                  src={property.posted_by.avatar_url} 
                  alt={property.posted_by.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {property.posted_by.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {property.posted_by.name}
                </span>
                {property.posted_by.user_level && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
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
        )}
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        <div className="relative mb-3">
          <div className="text-2xl font-black bg-gradient-to-r from-primary via-primary-foreground to-secondary bg-clip-text text-transparent mb-1 tracking-tight">
            {property.price}
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-sm -z-10 rounded-lg opacity-75"></div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.area}m²</span>
            </div>
          </div>
        </div>

        <Button 
          size="sm"
          className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 text-sm rounded-xl shadow-md hover:shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactPropertyCard;
