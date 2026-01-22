
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box, Star, Clock, Calendar, TrendingUp, MessageSquare, Tag, Percent } from "lucide-react";
import { useState } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import Property3DViewModal from "./Property3DViewModal";
import PropertyRatingDisplay from './PropertyRatingDisplay';
import PropertyRatingModal from './PropertyRatingModal';
import { usePropertyRatings } from '@/hooks/usePropertyRatings';
import { BaseProperty } from "@/types/property";
import VerificationBadge from '@/components/ui/VerificationBadge';
import UserStatusBadge from "@/components/ui/UserStatusBadge";

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
      <Card className="w-full bg-transparent border-0 shadow-none hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <div className="relative">
          {images && images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap max-w-[70%]">
            <Badge 
              className={`${listing_type === 'sale' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 text-white'
              } font-semibold px-3 py-1 text-xs tracking-wide shadow-lg`}
            >
              {listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
            </Badge>
            {(three_d_model_url || virtual_tour_url) && (
              <Badge className="bg-blue-600 text-white flex items-center gap-1">
                <Box className="h-3 w-3" />
                3D Available
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

          {development_status !== 'completed' && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {development_status === 'new_project' ? 'New Project' : 'Pre-Launch'}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          
          {/* User Information Section */}
          {posted_by && (
            <div className="space-y-3">
              {/* Main User Info */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  {posted_by.avatar_url ? (
                    <img 
                      src={posted_by.avatar_url} 
                      alt={posted_by.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-400/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {posted_by.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      {posted_by.name}
                      <UserStatusBadge status={posted_by.verification_status} size="xs" />
                    </span>
                    {posted_by.user_level && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        {posted_by.user_level}
                      </span>
                    )}
                  </div>
                </div>
                {posted_by.rating && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {posted_by.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional User Information */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Customer Feedback Status */}
                {posted_by.customer_feedback_rating && (
                  <div className="flex items-center gap-1 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                    <TrendingUp className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {posted_by.customer_feedback_rating.toFixed(1)} 
                      {posted_by.customer_feedback_count && ` (${posted_by.customer_feedback_count})`}
                    </span>
                  </div>
                )}

                {/* Joining Date */}
                {posted_by.joining_date && (
                  <div className="flex items-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      Joined {formatJoiningDate(posted_by.joining_date)}
                    </span>
                  </div>
                )}

                {/* Posting Time Ago */}
                {(created_at || posted_at) && (
                  <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-700 col-span-2">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Posted {formatTimeAgo(posted_at || created_at || '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price with Gradient Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg">
              <Tag className="h-4 w-4 text-primary-foreground" />
              <span className="text-primary-foreground font-bold text-xl sm:text-2xl leading-tight">
                {formatPrice(price)}
              </span>
              {listing_type === 'rent' && (
                <span className="text-primary-foreground/80 text-xs font-medium">/month</span>
              )}
            </div>
            
            {/* Discount Badge */}
            {discount_percentage && discount_percentage > 0 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-destructive to-destructive/80 shadow-md animate-pulse">
                <Percent className="h-3.5 w-3.5 text-destructive-foreground" />
                <span className="text-destructive-foreground font-bold text-sm">
                  {discount_percentage}% OFF
                </span>
              </div>
            )}
          </div>

          {(bedrooms || bathrooms || area_sqm) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {bedrooms} bed
                </div>
              )}
              {bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {bathrooms} bath
                </div>
              )}
              {area_sqm && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {area_sqm} sqm
                </div>
              )}
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          )}

          {/* Property Rating */}
          {aggregate && aggregate.total_ratings > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <PropertyRatingDisplay
                averageRating={aggregate.average_rating}
                totalRatings={aggregate.total_ratings}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRatingModal(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Read Reviews
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleViewDetails}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {(three_d_model_url || virtual_tour_url) && (
              <Button variant="outline" onClick={handleView3D} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                <Box className="h-4 w-4 mr-1" />
                3D View
              </Button>
            )}
          </div>
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
