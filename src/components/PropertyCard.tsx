
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye, Box, Star } from "lucide-react";
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
      <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105 glow-gold" onClick={handleViewDetails}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <Badge className={`${getTypeColor(property.type)} shadow-lg px-3 py-1 text-xs tracking-wide`}>
              {getTypeLabel(property.type)}
            </Badge>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Badge className="bg-blue-600 text-white shadow-lg flex items-center gap-1">
                <Box className="h-3 w-3" />
                3D Available
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

        <CardContent className="p-6 bg-binance-dark-gray">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg line-clamp-2 text-binance-white flex-1">
              {property.title}
            </h3>
          </div>

          {/* User Rating and Level */}
          {property.posted_by && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-binance-dark-gray/50 to-binance-gray/50 rounded-xl border border-binance-orange/20">
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
          )}
          
          <div className="flex items-center text-binance-orange mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm line-clamp-1 font-medium">{property.location}</span>
          </div>

          <div className="relative price-container mb-4">
            <div className="text-3xl font-black bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight leading-none">
              {property.price}
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-600/10 blur-xl -z-10 rounded-xl"></div>
            <div className="text-xs font-medium text-emerald-600/80 mt-1 tracking-wider uppercase">
              {property.type === 'rent' ? 'Per Month' : 'Total Price'}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-binance-white mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-binance-gray px-2 py-1 rounded">
                <Bed className="h-4 w-4 text-binance-orange" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1 bg-binance-gray px-2 py-1 rounded">
                <Bath className="h-4 w-4 text-binance-orange" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1 bg-binance-gray px-2 py-1 rounded">
                <Square className="h-4 w-4 text-binance-orange" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="btn btn-primary flex-1 font-semibold transition-all duration-300 hover:scale-105" 
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {(property.three_d_model_url || property.virtual_tour_url) && (
              <Button 
                variant="outline"
                className="btn font-semibold transition-all duration-300 hover:scale-105 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" 
                onClick={handleView3D}
              >
                <Box className="h-4 w-4 mr-1" />
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
