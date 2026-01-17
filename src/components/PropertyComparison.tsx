import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, BarChart3, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSecureProperties } from "@/hooks/useSecureProperties";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  listing_type: string;
  image_urls?: string[];
}

const ComparisonRow = ({ label, values }: { label: string; values: (string | number)[] }) => (
  <div className="grid grid-cols-4 gap-3 py-2 border-b border-border/50">
    <div className="text-xs font-medium">{label}</div>
    {values.map((value, index) => (
      <div key={index} className="text-xs text-muted-foreground">
        {value || 'N/A'}
      </div>
    ))}
  </div>
);

export const PropertyComparison = () => {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use secure properties hook
  const { data: availableProperties = [], isLoading, error } = useSecureProperties({
    search: searchTerm,
    limit: 20
  });

  // Handle errors from the secure properties hook
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading properties",
        description: error.message.includes('Authentication required') 
          ? "Please log in to view and compare properties." 
          : "Failed to fetch properties for comparison.",
        variant: "destructive"
      });
    }
  }, [error]);

  const formatPrice = (price: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToComparison = (property: Property) => {
    if (selectedProperties.length >= 3) {
      toast({
        title: "Maximum properties reached",
        description: "You can compare up to 3 properties at once.",
        variant: "destructive"
      });
      return;
    }

    if (selectedProperties.find(p => p.id === property.id)) {
      toast({
        title: "Property already added",
        description: "This property is already in your comparison list.",
        variant: "destructive"
      });
      return;
    }

    setSelectedProperties(prev => [...prev, property]);
    toast({
      title: "Property added",
      description: `${property.title} has been added to comparison.`,
    });
  };

  const handleRemoveFromComparison = (propertyId: string) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const handleClearComparison = () => {
    setSelectedProperties([]);
    toast({
      title: "Comparison cleared",
      description: "All properties removed from comparison.",
    });
  };

  const filteredProperties = availableProperties.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading or authentication message
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-xs text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && error.message.includes('Authentication required')) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-3">
            <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto" />
          </div>
          <h3 className="text-sm font-semibold mb-1">Authentication Required</h3>
          <p className="text-xs text-muted-foreground mb-3">Please log in to view and compare properties.</p>
          <Button size="sm" onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            Property Comparison Tool
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Compare up to 3 properties side by side</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {selectedProperties.length}/3 Selected
            </Badge>
            {selectedProperties.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearComparison}
                className="h-6 text-[10px]"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Add Properties Section */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">
            Add Properties to Compare
          </CardTitle>
          <CardDescription className="text-[11px]">Search and select properties to compare</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <div>
              <Label htmlFor="search" className="text-xs">Search Properties</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by property name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {searchTerm ? 'No properties found matching your search.' : 'No properties available for comparison.'}
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-xs font-medium">{property.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{property.location}</p>
                      <p className="text-[11px] font-medium text-primary">{formatPrice(property.price)}</p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{property.bedrooms} bed</span>
                        <span className="text-[10px] text-muted-foreground">{property.bathrooms} bath</span>
                        <span className="text-[10px] text-muted-foreground">{property.area_sqm} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.image_urls && property.image_urls[0] && (
                        <img
                          src={property.image_urls[0]}
                          alt={property.title}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      )}
                      <Button
                        onClick={() => handleAddToComparison(property)}
                        disabled={selectedProperties.length >= 3 || selectedProperties.some(p => p.id === property.id)}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                      >
                        {selectedProperties.some(p => p.id === property.id) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedProperties.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Property Comparison</CardTitle>
            <CardDescription className="text-[11px]">Side by side comparison of selected properties</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              {/* Property Images and Basic Info */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-xs font-medium">Property</div>
                {selectedProperties.map((property, index) => (
                  <div key={property.id} className="relative">
                    {property.image_urls && property.image_urls[0] ? (
                      <img
                        src={property.image_urls[0]}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground">No Image</span>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-5 w-5 p-0"
                      onClick={() => handleRemoveFromComparison(property.id)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                    <h3 className="text-xs font-medium mt-1.5">{property.title}</h3>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="space-y-2">
                <ComparisonRow
                  label="Price"
                  values={selectedProperties.map(p => formatPrice(p.price))}
                />
                <ComparisonRow
                  label="Location"
                  values={selectedProperties.map(p => p.location)}
                />
                <ComparisonRow
                  label="Bedrooms"
                  values={selectedProperties.map(p => p.bedrooms)}
                />
                <ComparisonRow
                  label="Bathrooms"
                  values={selectedProperties.map(p => p.bathrooms)}
                />
                <ComparisonRow
                  label="Area (m²)"
                  values={selectedProperties.map(p => p.area_sqm)}
                />
                <ComparisonRow
                  label="Type"
                  values={selectedProperties.map(p => p.listing_type)}
                />
                <ComparisonRow
                  label="Price per m²"
                  values={selectedProperties.map(p => formatPrice(p.price / p.area_sqm))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                {selectedProperties.map((property) => (
                  <Button
                    key={property.id}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-[10px]"
                    onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                  >
                    View Details
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyComparison;