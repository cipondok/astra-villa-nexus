
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box, Star, Clock, Calendar, TrendingUp, MessageSquare, Tag, Key, Percent } from "lucide-react";
import { useState } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import Property3DViewModal from "./Property3DViewModal";
import PropertyRatingDisplay from './PropertyRatingDisplay';
import PropertyRatingModal from './PropertyRatingModal';
import { usePropertyRatings } from '@/hooks/usePropertyRatings';
import { BaseProperty } from "@/types/property";
import VerificationBadge from '@/components/ui/VerificationBadge';
import UserStatusBadge from "@/components/ui/UserStatusBadge";
import SocialProofWidget from "./SocialProofWidget";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";

interface PropertyCardProps {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_type: string;
  images?: string[];
  image_urls?: string[];
  thumbnail_url?: string;
  development_status?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  created_at?: string;
  posted_at?: string;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
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
  discount_percentage?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  location,
  price,
  bedrooms,
  bathrooms,
  area_sqm,
  listing_type,
  images,
  image_urls,
  thumbnail_url,
  development_status = 'completed',
  three_d_model_url,
  virtual_tour_url,
  created_at,
  posted_at,
  owner_type,
  owner_verified,
  agent_verified,
  agency_verified,
  posted_by,
  discount_percentage
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { aggregate } = usePropertyRatings(id);
  const { getPropertyImage } = useDefaultPropertyImage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('PropertyCard - Opening detail modal for property:', id);
    console.log('PropertyCard - Modal state before:', showDetailModal);
    setShowDetailModal(true);
    console.log('PropertyCard - Modal state after setting to true');
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('PropertyCard - Opening 3D modal for property:', id);
    setShow3DModal(true);
  };

  // Convert property to BaseProperty format for modal compatibility
  const convertedProperty: BaseProperty = {
    id: id,
    title: title,
    price: price,
    location: location,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    area_sqm: area_sqm,
    property_type: development_status,
    listing_type: (listing_type === 'sale' || listing_type === 'rent' || listing_type === 'lease') 
      ? listing_type as 'sale' | 'rent' | 'lease'
      : 'sale',
    images: images || [],
    description: description,
    three_d_model_url: three_d_model_url,
    virtual_tour_url: virtual_tour_url,
    posted_by: posted_by,
  };

  console.log('PropertyCard - Rendering with showDetailModal:', showDetailModal);
  console.log('PropertyCard - Rendering with show3DModal:', show3DModal);

  return (
    <>
      <Card 
        className="group cursor-pointer overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300" 
        onClick={handleViewDetails}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getPropertyImage(images, thumbnail_url, image_urls)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Save Button */}
          <button 
            className="absolute top-2 right-2 h-8 w-8 bg-background/90 hover:bg-background rounded-full shadow-md flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            <Badge 
              className={`${listing_type === 'sale' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : 'bg-gradient-to-r from-sky-500 to-blue-600'
              } text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md border-0 flex items-center gap-1`}
            >
              {listing_type === 'sale' ? <Tag className="h-3 w-3" /> : <Key className="h-3 w-3" />}
              {listing_type === 'sale' ? 'Dijual' : 'Disewa'}
            </Badge>
            {development_status === 'new_project' && (
              <Badge className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded">
                New Project
              </Badge>
            )}
            {development_status === 'pre_launching' && (
              <Badge className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded">
                Pre-Launch
              </Badge>
            )}
            {(three_d_model_url || virtual_tour_url) && (
              <Badge className="bg-chart-4 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
                <Box className="h-3 w-3" />
                3D
              </Badge>
            )}
          </div>

          {/* Verification Badges - Bottom Left */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {owner_type === 'individual' && owner_verified && (
              <VerificationBadge type="owner" verified={true} size="sm" />
            )}
            {owner_type === 'agent' && agent_verified && (
              <VerificationBadge type="agent" verified={true} size="sm" />
            )}
            {owner_type === 'agency' && agency_verified && (
              <VerificationBadge type="agency" verified={true} size="sm" />
            )}
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-3 sm:p-4">
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-lg sm:text-xl font-bold text-primary">
              {formatPrice(price)}
              {listing_type === 'rent' && (
                <span className="text-sm font-normal text-muted-foreground ml-1">/bln</span>
              )}
            </p>
            {discount_percentage && discount_percentage > 0 && (
              <Badge className="bg-accent text-accent-foreground text-xs font-medium px-1.5 py-0.5">
                -{discount_percentage}%
              </Badge>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1">
            {title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{location}</span>
          </div>
          
          {/* Property Details */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground border-t border-border pt-3">
            {bedrooms !== undefined && bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms !== undefined && bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area_sqm !== undefined && area_sqm > 0 && (
              <div className="flex items-center gap-1">
                <Square className="h-3.5 w-3.5" />
                <span>{area_sqm}m²</span>
              </div>
            )}
          </div>

          {/* Posted By - Compact */}
          {posted_by && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              {posted_by.avatar_url ? (
                <img 
                  src={posted_by.avatar_url} 
                  alt={posted_by.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {posted_by.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{posted_by.name}</p>
              </div>
              {posted_by.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-chart-3 text-chart-3" />
                  <span className="text-xs font-medium">{posted_by.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Rating Summary - Compact */}
          {aggregate && aggregate.total_ratings > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-chart-3 text-chart-3" />
                <span className="text-sm font-semibold">{aggregate.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">({aggregate.total_ratings} reviews)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      {showDetailModal && (
        <PropertyDetailModal
          property={convertedProperty}
          isOpen={showDetailModal}
          onClose={() => {
            console.log('PropertyCard - Closing detail modal');
            setShowDetailModal(false);
          }}
          language="en"
          onView3D={() => {
            console.log('PropertyCard - Opening 3D from detail modal');
            setShowDetailModal(false);
            setShow3DModal(true);
          }}
        />
      )}

      {/* 3D View Modal */}
      {show3DModal && (
        <Property3DViewModal
          property={convertedProperty}
          isOpen={show3DModal}
          onClose={() => {
            console.log('PropertyCard - Closing 3D modal');
            setShow3DModal(false);
          }}
          language="en"
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <PropertyRatingModal
          propertyId={id}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
};

export default PropertyCard;
