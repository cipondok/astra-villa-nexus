import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Square, Eye, Share2, Car, View as ViewIcon, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import PropertyDetailModal from './PropertyDetailModal';
import Property3DViewModal from './Property3DViewModal';
import { BaseProperty } from '@/types/property';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: string;
  image_urls?: string[];
  description?: string;
  property_features?: any;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

interface EnhancedPropertyCardProps {
  property: Property;
  language: "en" | "id";
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
  onView3D?: (property: any) => void;
}

const EnhancedPropertyCard = ({ 
  property, 
  language, 
  onView, 
  onSave, 
  onShare,
  isSaved = false,
  onView3D
}: EnhancedPropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);

  const text = {
    en: {
      view: "View Details",
      save: "Save",
      share: "Share",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area",
      parking: "Parking",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      view3D: "3D View"
    },
    id: {
      view: "Lihat Detail",
      save: "Simpan",
      share: "Bagikan",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas",
      parking: "Parkir",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      view3D: "Tampilan 3D"
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

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return currentText.forSale;
      case 'rent': return currentText.forRent;
      case 'lease': return currentText.forLease;
      default: return type;
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg';
      case 'rent': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg';
      case 'lease': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-accent to-accent-foreground text-accent-foreground shadow-lg';
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(property.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(property.id);
    }
  };

  const handleViewProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailModal(true);
    if (onView) {
      onView(property.id);
    }
  };

  const handleView3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow3DModal(true);
    if (onView3D) {
      onView3D(property);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property.image_urls?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.image_urls!.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.image_urls!.length - 1 : prev - 1
      );
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
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] sm:hover:scale-105" onClick={handleViewProperty}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image_urls?.[currentImageIndex] || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Property Type Badge - Top Left Corner */}
          <div className="absolute top-3 left-3 z-30">
            <Badge className={`${getListingTypeColor(property.listing_type)} uppercase tracking-wider font-bold text-xs px-3 py-1.5 border-0`}>
              {getListingTypeLabel(property.listing_type)}
            </Badge>
          </div>

          {/* Property Type Badge - Secondary */}
          <div className="absolute top-3 left-3 mt-10 z-20">
            <Badge variant="outline" className="bg-white/95 backdrop-blur-sm text-gray-800 border-white/50 capitalize font-semibold text-xs px-2 py-1">
              {property.property_type}
            </Badge>
          </div>

          {/* 3D View Icon - Centered (appears on hover) */}
          {(property.three_d_model_url || property.virtual_tour_url) && (
            <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-blue-600 shadow-xl rounded-full p-4 backdrop-blur-sm border-2 border-white/50 transform hover:scale-110 transition-all duration-300"
                onClick={handleView3D}
                aria-label="Open 3D View"
              >
                <ViewIcon className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Virtual Tour Badge - Bottom Right */}
          {property.virtual_tour_url && (
            <div className="absolute bottom-3 right-3 z-20">
              <Badge className="bg-black/70 text-white backdrop-blur-sm border-none flex items-center gap-1.5 px-3 py-1.5 font-medium">
                <RotateCcw className="h-3 w-3" />
                <span className="text-xs">Virtual Tour</span>
              </Badge>
            </div>
          )}

          {/* Image Navigation */}
          {property.image_urls && property.image_urls.length > 1 && (
            <>
              {/* Arrow buttons */}
              <button
                onClick={(e) => handleImageNavigation('prev', e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-black/70 hover:scale-110"
              >
                ←
              </button>
              <button
                onClick={(e) => handleImageNavigation('next', e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-black/70 hover:scale-110"
              >
                →
              </button>
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {property.image_urls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Top-right: Favorite & Share */}
          <div className="absolute top-3 right-3 flex gap-2 z-30">
            {/* Favorite button */}
            <Button
              size="sm"
              variant="ghost"
              className={`bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 ${isSaved ? "ring-2 ring-red-400" : ""} hover:scale-110`}
              onClick={handleLikeToggle}
              aria-label={isSaved ? "Remove from favorites" : "Save property"}
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} />
            </Button>
            {/* Share button */}
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-gray-600 shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110"
              onClick={handleShare}
              aria-label="Share property"
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

          {/* Title - allow more lines if needed, shift other content down */}
          <h4 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] mb-1">
            {property.title}
          </h4>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              <span>{property.area_sqm} sqm</span>
            </div>
            {property.property_features?.parking && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{property.property_features.parking}</span>
              </div>
            )}
          </div>

          {/* Features */}
          {property.property_features && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(property.property_features)
                .filter(([key, value]) => value && key !== 'parking')
                .slice(0, 3)
                .map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key.replace('_', ' ')}
                  </Badge>
                ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex w-full mt-3 gap-2 flex-wrap">
            <Button 
              className="flex-1"
              variant="default"
              size="lg"
              onClick={handleViewProperty}
            >
              <Eye className="h-4 w-4 mr-2" />
              {currentText.view}
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                 variant="outline"
                 size="lg"
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

export default EnhancedPropertyCard;
