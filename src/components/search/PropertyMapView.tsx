import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, ZoomOut, Layers, Eye } from "lucide-react";
import { BaseProperty } from "@/types/property";

interface PropertyMapViewProps {
  properties: BaseProperty[];
  onPropertyClick: (property: BaseProperty) => void;
}

// Mock coordinates for Indonesian cities (in a real app, these would come from your geocoding service)
const getCityCoordinates = (location: string) => {
  const coordinates: { [key: string]: [number, number] } = {
    'Jakarta': [-6.2088, 106.8456],
    'Surabaya': [-7.2575, 112.7521],
    'Bandung': [-6.9175, 107.6191],
    'Medan': [3.5952, 98.6722],
    'Semarang': [-7.0051, 110.4381],
    'Makassar': [-5.1477, 119.4327],
    'Palembang': [-2.9761, 104.7754],
    'Tangerang': [-6.1783, 106.6319],
  };
  
  // Default to Jakarta if location not found
  for (const [city, coords] of Object.entries(coordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  return [-6.2088, 106.8456]; // Default Jakarta coordinates
};

const PropertyMapView = ({ properties, onPropertyClick }: PropertyMapViewProps) => {
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Jakarta default

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `IDR ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `IDR ${(price / 1000000).toFixed(1)}M`;
    }
    return `IDR ${(price / 1000).toFixed(0)}K`;
  };

  const getImageUrl = (property: BaseProperty) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    if (property.thumbnail_url) {
      return property.thumbnail_url;
    }
    return "/placeholder.svg";
  };

  // Group properties by approximate location for better map display
  const groupedProperties = properties.reduce((acc, property) => {
    const coords = getCityCoordinates(property.location) as [number, number];
    const key = `${coords[0].toFixed(2)}_${coords[1].toFixed(2)}`;
    
    if (!acc[key]) {
      acc[key] = {
        coordinates: coords,
        properties: []
      };
    }
    acc[key].properties.push(property);
    return acc;
  }, {} as { [key: string]: { coordinates: [number, number], properties: BaseProperty[] } });

  useEffect(() => {
    // Center map on first property if available
    if (properties.length > 0) {
      const firstCoords = getCityCoordinates(properties[0].location) as [number, number];
      setCenter(firstCoords);
    }
  }, [properties]);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No properties found matching your criteria</div>
        <div className="text-sm text-muted-foreground mt-2">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Container */}
      <div className="lg:col-span-2 relative">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full relative">
            {/* Map Placeholder - In a real app, this would be a proper map component */}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 relative overflow-hidden">
              {/* Map Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Property Markers */}
              {Object.entries(groupedProperties).map(([key, group]) => {
                const isSelected = selectedProperty && group.properties.some(p => p.id === selectedProperty.id);
                return (
                  <div
                    key={key}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${50 + (group.coordinates[1] - center[1]) * 100}%`,
                      top: `${50 - (group.coordinates[0] - center[0]) * 100}%`,
                    }}
                    onClick={() => setSelectedProperty(group.properties[0])}
                  >
                    <div className={`relative ${isSelected ? 'z-20' : 'z-10'}`}>
                      <div 
                        className={`
                          px-3 py-2 rounded-lg shadow-lg transition-all duration-300 
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground scale-110' 
                            : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105'
                          }
                          border border-border
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {group.properties.length > 1 ? `${group.properties.length} properties` : formatPrice(group.properties[0].price)}
                          </span>
                        </div>
                      </div>
                      {/* Pointer */}
                      <div 
                        className={`
                          absolute left-1/2 top-full transform -translate-x-1/2 
                          w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent
                          ${isSelected ? 'border-t-primary' : 'border-t-background'}
                          transition-all duration-300
                        `}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-lg"
                  onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-lg"
                  onClick={() => setZoom(prev => Math.max(prev - 1, 8))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-lg"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>

              {/* Map Attribution */}
              <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                Interactive Map View • {properties.length} properties
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details Sidebar */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {selectedProperty ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img
                    src={getImageUrl(selectedProperty)}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={selectedProperty.listing_type === 'sale' ? 'default' : 'secondary'}
                    >
                      {selectedProperty.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedProperty.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{selectedProperty.location}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-4">
                    {formatPrice(selectedProperty.price)}
                    {selectedProperty.listing_type === 'rent' && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>

                {selectedProperty.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedProperty.description}
                  </p>
                )}

                <Button 
                  className="w-full"
                  onClick={() => onPropertyClick(selectedProperty)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Select a Property</h3>
              <p className="text-sm text-muted-foreground">
                Click on any marker on the map to view property details
              </p>
            </CardContent>
          </Card>
        )}

        {/* Properties List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">All Properties ({properties.length})</h4>
          {properties.slice(0, 5).map((property) => (
            <Card 
              key={property.id} 
              className={`cursor-pointer transition-all ${
                selectedProperty?.id === property.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <img
                    src={getImageUrl(property)}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm line-clamp-1">{property.title}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-1">{property.location}</p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {properties.length > 5 && (
            <div className="text-center text-sm text-muted-foreground py-2">
              +{properties.length - 5} more properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyMapView;