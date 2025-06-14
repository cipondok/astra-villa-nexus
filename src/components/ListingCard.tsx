
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Box, Axis3d } from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface ListingCardProps {
  property: any;
  text: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (id: string) => void;
  onView3D: (property: any) => void;
}

const ListingCard = ({ property, text, isFavorite, onToggleFavorite, onViewDetails, onView3D }: ListingCardProps) => {
  const getPropertyTypeColor = (type: string) => {
    const colors = {
      villa: 'bg-purple-100 text-purple-800',
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      commercial: 'bg-orange-100 text-orange-800',
      land: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card key={`${property.id}-${property.title}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <img
          src={property.image_urls?.[0] || property.images?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"}
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onViewDetails(property.id)}
        />

        {(property.three_d_model_url || property.virtual_tour_url) && (
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <Button
              size="sm"
              className="bg-white/90 text-gray-800 hover:bg-white flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onView3D(property);
              }}
            >
              <Box className="h-4 w-4 mr-1" />
              {text.view3D}
            </Button>
          </div>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
        >
          <Heart 
            className={`h-4 w-4 ${
              isFavorite
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600'
            }`} 
          />
        </Button>
        <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
          {property.listing_type === 'sale' ? text.forSale : text.forRent}
        </Badge>
        
        {(property.three_d_model_url || property.virtual_tour_url) && (
            <Badge className="absolute bottom-4 left-4 bg-black/70 text-white backdrop-blur-sm flex items-center gap-1">
                <Axis3d className="h-4 w-4" />
                <span>3D</span>
            </Badge>
        )}
      </div>
      
      <CardHeader className="pb-4 cursor-pointer" onClick={() => onViewDetails(property.id)}>
        <CardTitle className="text-xl line-clamp-2">{property.title}</CardTitle>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm line-clamp-1">
            {property.location || `${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, '')}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {property.price ? formatIDR(property.price) : text.contactForPrice}
          </span>
          <Badge 
            variant="outline" 
            className={getPropertyTypeColor(property.property_type)}
          >
            {property.property_type}
          </Badge>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-6">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms || 0} {text.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms || 0} {text.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area_sqm || 0} {text.area}</span>
          </div>
        </div>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onViewDetails(property.id)}>
          {text.viewDetails}
        </Button>
      </CardContent>
    </Card>
  )
};

export default ListingCard;
