
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-binance-green text-white';
      case 'rent':
        return 'bg-binance-orange text-black font-semibold';
      case 'new-project':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold';
      default:
        return 'bg-binance-gray text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'For Sale';
      case 'rent':
        return 'For Rent';
      case 'new-project':
        return 'New Project';
      default:
        return type;
    }
  };

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card className="enhanced-card group cursor-pointer transition-all duration-300 hover:scale-105 glow-gold">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getTypeColor(property.type)} shadow-lg`}>
            {getTypeLabel(property.type)}
          </Badge>
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

      <CardContent className="p-6 bg-binance-dark-gray" onClick={handleViewDetails}>
        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-binance-white">
          {property.title}
        </h3>
        
        <div className="flex items-center text-binance-orange mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm line-clamp-1 font-medium">{property.location}</span>
        </div>

        <div className="price text-2xl font-bold text-binance-orange mb-4 glow-gold">
          {property.price}
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

        <Button 
          className="btn btn-primary w-full font-semibold transition-all duration-300 hover:scale-105" 
          onClick={handleViewDetails}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
