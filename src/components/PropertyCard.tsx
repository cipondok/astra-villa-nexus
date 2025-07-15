
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box, Star, Clock, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import PropertyDetailModal from "./property/PropertyDetailModal";
import Property3DViewModal from "./property/Property3DViewModal";
import { BaseProperty } from "@/types/property";

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
  rating?: number;
  featured?: boolean;
  description?: string;
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

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-emerald-600 text-white font-semibold';
      case 'rent':
        return 'bg-blue-600 text-white font-semibold';
      case 'new-project':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold';
      default:
        return 'bg-slate-600 text-white font-semibold';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'FOR SALE';
      case 'rent':
        return 'FOR RENT';
      case 'new-project':
        return 'NEW PROJECT';
      default:
        return type.toUpperCase();
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

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log('Opening detail modal for property:', property.id);
    setShowDetailModal(true);
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log('Opening 3D modal for property:', property.id);
    setShow3DModal(true);
  };

  // Convert old property format to new format for modal compatibility
  const convertedProperty: BaseProperty = {
    id: property.id.toString(),
    title: property.title,
    price: parseFloat(property.price.replace(/[^0-9.-]+/g, "")) || 0,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area_sqm: property.area,
    property_type: property.type,
    listing_type: (property.type === 'sale' || property.type === 'rent') ? property.type as 'sale' | 'rent' : 'sale',
    images: [property.image],
    description: property.description,
    three_d_model_url: property.three_d_model_url,
    virtual_tour_url: property.virtual_tour_url,
  };

  return (
    <>
      <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] border-0 bg-card" onClick={handleViewDetails}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
              {getTypeLabel(property.type)}
            </Badge>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge className="bg-secondary text-secondary-foreground flex items-center gap-1 px-2 py-0.5 text-xs">
                <Box className="h-2.5 w-2.5" />
                3D
              </Badge>
            )}
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-3 right-14">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold shadow-lg animate-pulse">
                ⭐ Featured
              </Badge>
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 ${
              isLiked ? 'text-binance-red' : 'text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base line-clamp-2 text-foreground flex-1">
              {property.title}
            </h3>
          </div>

          {/* User Information Section */}
          {property.posted_by && (
            <div className="space-y-3 mb-4">
              {/* Main User Info */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-binance-dark-gray/50 to-binance-gray/50 rounded-xl border border-binance-orange/20">
                <div className="flex items-center gap-2">
                  {property.posted_by.avatar_url ? (
                    <img 
                      src={property.posted_by.avatar_url} 
                      alt={property.posted_by.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-binance-orange/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-binance-orange to-binance-yellow flex items-center justify-center text-black text-sm font-bold">
                      {property.posted_by.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-binance-orange">
                      {property.posted_by.name}
                    </span>
                    {property.posted_by.user_level && (
                      <span className="text-xs text-binance-yellow font-bold">
                        {property.posted_by.user_level}
                      </span>
                    )}
                  </div>
                </div>
                {property.posted_by.rating && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="h-4 w-4 fill-binance-yellow text-binance-yellow" />
                    <span className="text-sm font-bold text-binance-yellow">
                      {property.posted_by.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional User Information */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Customer Feedback Status */}
                {property.posted_by.customer_feedback_rating && (
                  <div className="flex items-center gap-1 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                    <TrendingUp className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {property.posted_by.customer_feedback_rating.toFixed(1)} 
                      {property.posted_by.customer_feedback_count && ` (${property.posted_by.customer_feedback_count})`}
                    </span>
                  </div>
                )}

                {/* Joining Date */}
                {property.posted_by.joining_date && (
                  <div className="flex items-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      Joined {formatJoiningDate(property.posted_by.joining_date)}
                    </span>
                  </div>
                )}

                {/* Posting Time Ago */}
                {(property.created_at || property.posted_at) && (
                  <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-700 col-span-2">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Posted {formatTimeAgo(property.posted_at || property.created_at || '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-sm line-clamp-1 font-medium">{property.location}</span>
          </div>

          <div className="relative price-container mb-3">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight leading-none">
              {property.price}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">
              {property.type === 'rent' ? 'Per Month' : 'Total Price'}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <Bed className="h-3 w-3 text-primary" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <Bath className="h-3 w-3 text-primary" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <Square className="h-3 w-3 text-primary" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 font-medium transition-all duration-300 text-xs h-8" 
              onClick={handleViewDetails}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="font-medium transition-all duration-300 text-xs h-8" 
                onClick={handleView3D}
              >
                <Box className="h-3 w-3 mr-1" />
                3D View
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={convertedProperty}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        language="en"
        onView3D={() => {
          setShowDetailModal(false);
          setShow3DModal(true);
        }}
      />

      {/* 3D View Modal */}
      <Property3DViewModal
        property={convertedProperty}
        isOpen={show3DModal}
        onClose={() => setShow3DModal(false)}
        language="en"
      />
    </>
  );
};

export default PropertyCard;
