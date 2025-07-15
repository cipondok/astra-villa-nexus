
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye, Heart, Share2, View as ViewIcon, Star, Clock, Calendar, TrendingUp } from 'lucide-react';
import PropertyDetailModal from './PropertyDetailModal';
import Property3DViewModal from './Property3DViewModal';
import { BaseProperty } from '@/types/property';

interface CompactProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type?: string;
  listing_type: string;
  images?: string[];
  thumbnail_url?: string;
  description?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  state?: string;
  city?: string;
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
  property: CompactProperty;
  language: "en" | "id";
  onView?: (id: string) => void;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onView3D?: (property: CompactProperty) => void;
}

const CompactPropertyCard = ({ 
  property, 
  language, 
  onView, 
  isSaved = false,
  onSave,
  onShare,
  onView3D
}: CompactPropertyCardProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [isLiked, setIsLiked] = useState(isSaved);

  const text = {
    en: {
      viewDetails: "View Details",
      view3D: "3D View",
      forSale: "For Sale",
      forRent: "For Rent",
      bedrooms: "bed",
      bathrooms: "bath"
    },
    id: {
      viewDetails: "Lihat Detail",
      view3D: "Tampilan 3D",
      forSale: "Dijual",
      forRent: "Disewa",
      bedrooms: "kmr", 
      bathrooms: "kmdi"
    }
  };

  const currentText = text[language];

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
    
    if (diffInHours < 1) return language === 'en' ? 'Just now' : 'Baru saja';
    if (diffInHours < 24) return `${diffInHours}${language === 'en' ? 'h ago' : 'j lalu'}`;
    if (diffInDays < 30) return `${diffInDays}${language === 'en' ? 'd ago' : 'h lalu'}`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}${language === 'en' ? 'mo ago' : 'bl lalu'}`;
    return `${Math.floor(diffInDays / 365)}${language === 'en' ? 'y ago' : 'th lalu'}`;
  };

  const formatJoiningDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getImageUrl = () => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.thumbnail_url) {
      return property.thumbnail_url;
    }
    return "/placeholder.svg";
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('CompactPropertyCard - Opening detail modal for property:', property.id);
    setShowDetailModal(true);
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('CompactPropertyCard - Opening 3D modal for property:', property.id);
    setShow3DModal(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(property.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onSave) {
      onSave(property.id);
    }
  };

  // Convert property to BaseProperty format for modals
  const convertedProperty: BaseProperty = {
    ...property,
    listing_type: (property.listing_type === 'sale' || property.listing_type === 'rent' || property.listing_type === 'lease') 
      ? property.listing_type as 'sale' | 'rent' | 'lease'
      : 'sale'
  };

  console.log('CompactPropertyCard - Rendering with showDetailModal:', showDetailModal);
  console.log('CompactPropertyCard - Rendering with show3DModal:', show3DModal);

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image Section */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge 
              className="bg-primary text-primary-foreground font-medium px-2 py-0.5 text-xs shadow-md"
            >
              {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
            </Badge>
            {property.property_type && (
              <Badge variant="outline" className="bg-background/90 capitalize text-xs px-2 py-0.5">
                {property.property_type}
              </Badge>
            )}
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground backdrop-blur-sm border-none flex items-center gap-1 px-2 py-0.5 text-xs">
                <ViewIcon className="h-2.5 w-2.5" />
                <span>3D</span>
              </Badge>
            )}
          </div>

          {/* Top-right: Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className={`bg-white/90 hover:bg-white ${isLiked ? "ring-2 ring-red-400" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/90 hover:bg-white text-blue-500"
                onClick={handleView3D}
              >
                <ViewIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-gray-600"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3 space-y-2">
          {/* Price */}
          <div className="relative price-section mb-2">
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight leading-none">
              {formatPrice(property.price)}
            </div>
            {property.listing_type === 'rent' && (
              <div className="text-xs font-medium text-muted-foreground mt-0.5">
                Per Month
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
            {property.title}
          </h4>

          {/* User Information Section */}
          {property.posted_by && (
            <div className="space-y-2">
              {/* Main User Info */}
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  {property.posted_by.avatar_url ? (
                    <img 
                      src={property.posted_by.avatar_url} 
                      alt={property.posted_by.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {property.posted_by.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {property.posted_by.name}
                    </span>
                    {property.posted_by.user_level && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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
                      {language === 'en' ? 'Rating:' : 'Rating:'} {property.posted_by.customer_feedback_rating.toFixed(1)}
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

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{property.location}</span>
          </div>

          {/* Property Details */}
          {(property.bedrooms || property.bathrooms || property.area_sqm) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms} {currentText.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms} {currentText.bathrooms}</span>
                </div>
              )}
              {property.area_sqm && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>{property.area_sqm} sqm</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <Button 
              className="flex-1 h-7 text-xs"
              variant="default"
              onClick={handleViewDetails}
            >
              <Eye className="h-3 w-3 mr-1" />
              {currentText.viewDetails}
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={handleView3D}
              >
                <ViewIcon className="h-3 w-3 mr-1" />
                {currentText.view3D}
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
            console.log('CompactPropertyCard - Closing detail modal');
            setShowDetailModal(false);
          }}
          language={language}
          onView3D={() => {
            console.log('CompactPropertyCard - Opening 3D from detail modal');
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
            console.log('CompactPropertyCard - Closing 3D modal');
            setShow3DModal(false);
          }}
          language={language}
        />
      )}
    </>
  );
};

export default CompactPropertyCard;
