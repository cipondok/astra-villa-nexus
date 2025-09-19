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
  <div className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
    <div className="font-medium text-gray-700">{label}</div>
    {values.map((value, index) => (
      <div key={index} className="text-gray-600">
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && error.message.includes('Authentication required')) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view and compare properties.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Property Comparison Tool
          </CardTitle>
          <p className="text-gray-400">Compare up to 3 properties side by side</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selectedProperties.length}/3 Selected
            </Badge>
            {selectedProperties.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearComparison}
                className="h-7"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Add Properties Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Add Properties to Compare
          </CardTitle>
          <CardDescription>Search and select properties to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Properties</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by property name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No properties found matching your search.' : 'No properties available for comparison.'}
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <p className="text-sm font-medium text-blue-600">{formatPrice(property.price)}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-500">{property.bedrooms} bed</span>
                        <span className="text-xs text-gray-500">{property.bathrooms} bath</span>
                        <span className="text-xs text-gray-500">{property.area_sqm} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.image_urls && property.image_urls[0] && (
                        <img
                          src={property.image_urls[0]}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <Button
                        onClick={() => handleAddToComparison(property)}
                        disabled={selectedProperties.length >= 3 || selectedProperties.some(p => p.id === property.id)}
                        size="sm"
                        variant="outline"
                      >
                        {selectedProperties.some(p => p.id === property.id) ? 'Added' : 'Add to Compare'}
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
          <CardHeader>
            <CardTitle>Property Comparison</CardTitle>
            <CardDescription>Side by side comparison of selected properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Property Images and Basic Info */}
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium text-gray-700">Property</div>
                {selectedProperties.map((property, index) => (
                  <div key={property.id} className="relative">
                    {property.image_urls && property.image_urls[0] ? (
                      <img
                        src={property.image_urls[0]}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => handleRemoveFromComparison(property.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <h3 className="font-medium mt-2 text-sm">{property.title}</h3>
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
              <div className="flex gap-2 pt-4">
                {selectedProperties.map((property) => (
                  <Button
                    key={property.id}
                    variant="outline"
                    className="flex-1"
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