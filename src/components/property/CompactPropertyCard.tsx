import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye, Heart, Share2, View as ViewIcon } from 'lucide-react';
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
    if (e) e.stopPropagation();
    console.log('Opening detail modal for property:', property.id);
    setShowDetailModal(true);
    if (onView) {
      onView(property.id);
    }
  };

  const handleView3D = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log('Opening 3D modal for property:', property.id);
    setShow3DModal(true);
    if (onView3D) {
      onView3D(property);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(property.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
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

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={handleViewDetails}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-background/90">
              {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
            </Badge>
            {property.property_type && (
              <Badge variant="outline" className="bg-background/90 capitalize">
                {property.property_type}
              </Badge>
            )}
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm border-none flex items-center gap-1">
                <ViewIcon className="h-4 w-4" />
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
        <CardContent className="p-4 space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">
              {formatPrice(property.price)}
            </h3>
            {property.listing_type === 'rent' && (
              <span className="text-sm text-muted-foreground">/month</span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-foreground line-clamp-2 min-h-[3rem]">
            {property.title}
          </h4>

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
          <div className="flex gap-2 mt-3">
            <Button 
              className="flex-1"
              variant="default"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4 mr-2" />
              {currentText.viewDetails}
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleView3D}
              >
                <ViewIcon className="h-4 w-4 mr-2" />
                {currentText.view3D}
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
        language={language}
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
        language={language}
      />
    </>
  );
};

export default CompactPropertyCard;
