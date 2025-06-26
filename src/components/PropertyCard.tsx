
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Eye, Box, Zap, Brain } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyViewer3D from "./PropertyViewer3D";

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
  rating: number;
  featured?: boolean;
  isHotDeal?: boolean;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
      case 'rent':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
      case 'new-project':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0';
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
    <>
      <Card 
        className="property-card-modern group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Modern Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* AI-Powered Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-3">
                <Button
                  size="sm"
                  className="glass-modern bg-white/20 text-white hover:bg-white/30 border-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIs3DViewOpen(true);
                  }}
                >
                  <Box className="h-4 w-4 mr-2" />
                  3D View
                </Button>
                <Button
                  size="sm"
                  className="glass-modern bg-purple-600/80 text-white hover:bg-purple-600 border-purple-400/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Details
                </Button>
              </div>
            </div>
          </div>
          
          {/* Modern Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <Badge className={`${getTypeColor(property.type)} shadow-lg`}>
              {getTypeLabel(property.type)}
            </Badge>
            {property.featured && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {property.isHotDeal && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse shadow-lg">
                🔥 Hot Deal
              </Badge>
            )}
            <Badge className="glass-modern bg-black/40 text-white backdrop-blur-sm border-white/20 flex items-center gap-1 w-fit">
              <Zap className="h-3 w-3" />
              <span>AI Enhanced</span>
            </Badge>
          </div>

          {/* Modern Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`w-10 h-10 rounded-full glass-modern bg-white/10 hover:bg-white/20 transition-all duration-300 ${
                  isLiked ? 'text-red-400 scale-110' : 'text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full glass-modern bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setIs3DViewOpen(true);
                }}
                aria-label="Open 3D View"
              >
                <Box className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Modern Info Overlays */}
          <div className="absolute bottom-4 right-4 glass-modern bg-black/40 text-white px-3 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>

          <div className="absolute bottom-4 left-4 glass-modern bg-black/40 text-white px-3 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span className="text-xs">{Math.floor(Math.random() * 100) + 20}</span>
          </div>
        </div>

        <CardContent className="p-6 bg-gradient-to-b from-card/95 to-card">
          <h3 className="text-xl font-bold mb-3 text-gradient group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {property.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>

          <div className="text-2xl font-bold text-gradient mb-4">
            {property.price}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-blue-500" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-cyan-500" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-green-500" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>

          <Button 
            className="btn-modern w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            View AI Details
          </Button>
        </CardContent>
      </Card>

      {/* 3D Property Viewer Modal */}
      <PropertyViewer3D
        isOpen={is3DViewOpen}
        onClose={() => setIs3DViewOpen(false)}
        propertyId={String(property.id)}
        propertyTitle={property.title}
      />
    </>
  );
};

export default PropertyCard;
