
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box } from "lucide-react";
import { useState } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import Property3DViewModal from "./Property3DViewModal";
import { BaseProperty } from "@/types/property";

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
  virtual_tour_url
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
  };

  console.log('PropertyCard - Rendering with showDetailModal:', showDetailModal);
  console.log('PropertyCard - Rendering with show3DModal:', show3DModal);

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
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
          
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
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
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative price-display mb-2">
            <div className="text-3xl font-black bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight leading-none">
              {formatPrice(price)}
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/15 via-green-500/15 to-emerald-600/15 blur-lg -z-10 rounded-lg"></div>
            {listing_type === 'rent' && (
              <div className="text-xs font-semibold text-emerald-600/90 mt-1 tracking-wider uppercase">
                Per Month
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
    </>
  );
};

export default PropertyCard;
