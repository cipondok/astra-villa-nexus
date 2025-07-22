import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LazyImage from '@/components/ui/lazy-image';
import { 
  Plus, 
  X, 
  ArrowLeftRight, 
  Heart, 
  DollarSign, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Star,
  Eye
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls?: string[];
  property_type: string;
  listing_type: string;
  description?: string;
  status: string;
}

const PropertyComparison = () => {
  const { toast } = useToast();
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error loading properties",
        description: "Failed to fetch properties for comparison.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPropertyToComparison = (property: Property) => {
    if (selectedProperties.length >= 3) {
      toast({
        title: "Maximum limit reached",
        description: "You can compare up to 3 properties at once.",
        variant: "destructive"
      });
      return;
    }

    if (selectedProperties.find(p => p.id === property.id)) {
      toast({
        title: "Property already selected",
        description: "This property is already in the comparison.",
        variant: "destructive"
      });
      return;
    }

    setSelectedProperties(prev => [...prev, property]);
    toast({
      title: "Property added",
      description: `${property.title} added to comparison.`,
    });
  };

  const removePropertyFromComparison = (propertyId: string) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearComparison = () => {
    setSelectedProperties([]);
    toast({
      title: "Comparison cleared",
      description: "All properties removed from comparison.",
    });
  };

  const getImageUrl = (property: Property) => {
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = availableProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ComparisonAttribute = ({ label, values, icon: Icon }: {
    label: string;
    values: (string | number)[];
    icon?: React.ElementType;
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 py-3">
      <div className="grid grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </div>
        {values.map((value, index) => (
          <div key={index} className="text-center">
            <span className="text-sm">{value || 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Property Comparison</h2>
          <p className="text-gray-400">Compare up to 3 properties side by side</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {selectedProperties.length}/3 Selected
          </Badge>
          {selectedProperties.length > 0 && (
            <Button onClick={clearComparison} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Property Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Properties to Compare
          </CardTitle>
          <CardDescription>Search and select properties to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Properties</Label>
              <Input
                id="search"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative">
                    <LazyImage
                      src={getImageUrl(property) || ''}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      {property.property_type}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-1 truncate">{property.title}</h4>
                    <p className="text-lg font-bold text-green-600 mb-1">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        {property.area_sqm}m²
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addPropertyToComparison(property)}
                      disabled={selectedProperties.length >= 3 || selectedProperties.some(p => p.id === property.id)}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {selectedProperties.some(p => p.id === property.id) ? 'Added' : 'Add to Compare'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Property Comparison
            </CardTitle>
            <CardDescription>Side by side comparison of selected properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Property Images and Basic Info */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Property</div>
                  {selectedProperties.map((property, index) => (
                    <div key={property.id} className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePropertyFromComparison(property.id)}
                        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <LazyImage
                        src={getImageUrl(property) || ''}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h4 className="font-semibold text-sm mb-1">{property.title}</h4>
                      <Badge className="text-xs">{property.property_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Attributes */}
              <ComparisonAttribute
                label="Price"
                icon={DollarSign}
                values={selectedProperties.map(p => formatPrice(p.price))}
              />
              
              <ComparisonAttribute
                label="Location"
                icon={MapPin}
                values={selectedProperties.map(p => p.location)}
              />
              
              <ComparisonAttribute
                label="Bedrooms"
                icon={Bed}
                values={selectedProperties.map(p => p.bedrooms)}
              />
              
              <ComparisonAttribute
                label="Bathrooms"
                icon={Bath}
                values={selectedProperties.map(p => p.bathrooms)}
              />
              
              <ComparisonAttribute
                label="Area (m²)"
                icon={Square}
                values={selectedProperties.map(p => p.area_sqm)}
              />
              
              <ComparisonAttribute
                label="Listing Type"
                values={selectedProperties.map(p => p.listing_type)}
              />
              
              <ComparisonAttribute
                label="Price per m²"
                values={selectedProperties.map(p => formatPrice(p.price / p.area_sqm))}
              />

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-4">
                  <div></div>
                  {selectedProperties.map((property) => (
                    <div key={property.id} className="space-y-2">
                      <Button size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <Heart className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProperties.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Properties Selected
            </h3>
            <p className="text-gray-500">
              Search and add properties above to start comparing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyComparison;