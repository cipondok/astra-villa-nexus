
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star, Eye, Box, Zap, Brain, Sparkles, ArrowRight } from "lucide-react";
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
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg';
      case 'rent':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg';
      case 'new-project':
        return 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 shadow-lg';
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
        className="property-card-ultra group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Ultra Modern Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Advanced AI-Powered Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4">
                <Button
                  size="sm"
                  className="glass-ultra bg-white/20 text-white hover:bg-white/30 border-white/20 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIs3DViewOpen(true);
                  }}
                >
                  <Box className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                  3D View
                </Button>
                <Button
                  size="sm"
                  className="glass-ultra bg-primary/80 text-white hover:bg-primary border-primary/30 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                >
                  <Brain className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                  AI Details
                </Button>
              </div>
            </div>
          </div>
          
          {/* Ultra Modern Status Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
            <Badge className={`${getTypeColor(property.type)} animate-fade-in-scale`}>
              {getTypeLabel(property.type)}
            </Badge>
            {property.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl animate-pulse-glow">
                <Star className="h-3 w-3 mr-1 animate-float" />
                Featured
              </Badge>
            )}
            {property.isHotDeal && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-xl">
                🔥 Hot Deal
              </Badge>
            )}
            <Badge className="glass-ultra bg-black/40 text-white backdrop-blur-sm border-white/20 flex items-center gap-1 w-fit animate-shimmer">
              <Zap className="h-3 w-3" />
              <span>AI Enhanced</span>
            </Badge>
          </div>

          {/* Ultra Modern Action Buttons */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-20">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`w-12 h-12 rounded-full glass-ultra bg-white/10 hover:bg-white/20 transition-all duration-300 micro-bounce ${
                  isLiked ? 'text-red-400 scale-110 animate-pulse-glow' : 'text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full glass-ultra bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-all duration-300 micro-bounce"
                onClick={(e) => {
                  e.stopPropagation();
                  setIs3DViewOpen(true);
                }}
                aria-label="Open 3D View"
              >
                <Box className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Ultra Modern Info Overlays */}
          <div className="absolute bottom-6 right-6 glass-ultra bg-black/40 text-white px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-float" />
            <span className="text-sm font-semibold">{property.rating}</span>
          </div>

          <div className="absolute bottom-6 left-6 glass-ultra bg-black/40 text-white px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
            <Eye className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">{Math.floor(Math.random() * 100) + 20}</span>
          </div>
        </div>

        <CardContent className="p-8 bg-gradient-to-b from-card/95 to-card backdrop-ultra">
          <h3 className="text-2xl font-bold mb-4 text-gradient-ultra group-hover:scale-105 transition-transform duration-300 line-clamp-2">
            {property.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-6">
            <MapPin className="h-5 w-5 mr-3 text-primary animate-pulse" />
            <span className="text-base line-clamp-1">{property.location}</span>
          </div>

          <div className="text-3xl font-bold text-gradient-ultra mb-6 animate-fade-in-scale">
            {property.price}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 group/stat">
                <Bed className="h-5 w-5 text-blue-500 group-hover/stat:scale-110 transition-transform" />
                <span className="font-semibold">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-2 group/stat">
                <Bath className="h-5 w-5 text-cyan-500 group-hover/stat:scale-110 transition-transform" />
                <span className="font-semibold">{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-2 group/stat">
                <Square className="h-5 w-5 text-green-500 group-hover/stat:scale-110 transition-transform" />
                <span className="font-semibold">{property.area}m²</span>
              </div>
            </div>
          </div>

          <Button 
            className="btn-ultra w-full text-lg py-4 group/cta"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Brain className="h-5 w-5 mr-3 group-hover/cta:rotate-12 transition-transform" />
            View AI Details
            <ArrowRight className="h-5 w-5 ml-3 group-hover/cta:translate-x-2 transition-transform" />
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
