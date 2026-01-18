
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
      <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] border bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30" onClick={handleViewDetails}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-28 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status Badge */}
          <div className="absolute top-1.5 left-1.5 flex gap-1 flex-wrap">
            <Badge className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-medium">
              {getTypeLabel(property.type)}
            </Badge>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge className="bg-secondary text-secondary-foreground flex items-center gap-0.5 px-1.5 py-0.5 text-[9px]">
                <Box className="h-2 w-2" />
                3D
              </Badge>
            )}
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-1.5 right-8">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[8px] font-bold shadow px-1 py-0.5">
                ⭐ Featured
              </Badge>
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 ${
              isLiked ? 'text-binance-red' : 'text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-2 md:p-3 bg-card/50">
          <h3 className="font-semibold text-xs md:text-sm line-clamp-1 text-foreground mb-1.5">
            {property.title}
          </h3>

          {/* Compact User Info */}
          {property.posted_by && (
            <div className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-md mb-1.5">
              <div className="flex items-center gap-1.5">
                {property.posted_by.avatar_url ? (
                  <img 
                    src={property.posted_by.avatar_url} 
                    alt={property.posted_by.name}
                    className="w-5 h-5 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-[9px] font-bold">
                    {property.posted_by.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] font-medium text-foreground/80 truncate max-w-16">
                  {property.posted_by.name}
                </span>
              </div>
              {property.posted_by.rating && (
                <div className="flex items-center gap-0.5 ml-auto">
                  <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-[9px] font-bold text-yellow-600">
                    {property.posted_by.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground mb-1.5">
            <MapPin className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
            <span className="text-[10px] line-clamp-1">{property.location}</span>
          </div>

          <div className="mb-1.5">
            <div className="text-sm md:text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
              {property.price}
            </div>
            <div className="text-[9px] text-muted-foreground">
              {property.type === 'rent' ? 'Per Month' : 'Total Price'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mb-2">
            <div className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded">
              <Bed className="h-2.5 w-2.5 text-primary" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded">
              <Bath className="h-2.5 w-2.5 text-primary" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded">
              <Square className="h-2.5 w-2.5 text-primary" />
              <span>{property.area}m²</span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button 
              size="sm"
              className="flex-1 font-medium transition-all duration-300 text-[9px] h-6 px-2" 
              onClick={handleViewDetails}
            >
              <Eye className="h-2.5 w-2.5 mr-0.5" />
              Details
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                size="sm"
                className="font-medium transition-all duration-300 text-[9px] h-6 px-2" 
                onClick={handleView3D}
              >
                <Box className="h-2.5 w-2.5 mr-0.5" />
                3D
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
