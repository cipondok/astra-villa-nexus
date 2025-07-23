import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Home, Building2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ResponsiveWebLayout from '@/components/ResponsiveWebLayout';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Property {
  id: string;
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
}

const Search = () => {
  const { isMobile } = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');

  const { data: dbProperties = [], isLoading } = useQuery({
    queryKey: ['search-properties', searchTerm, selectedType, selectedLocation],
    queryFn: async () => {
      let query = supabase.from('properties').select('*');
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      if (selectedType !== 'all') {
        query = query.eq('property_type', selectedType);
      }
      
      if (selectedLocation !== 'all') {
        query = query.ilike('city', `%${selectedLocation}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Transform database properties to match the Property interface
  const properties: Property[] = dbProperties.map(prop => ({
    id: prop.id,
    title: prop.title,
    location: prop.location,
    price: `Rp ${prop.price?.toLocaleString('id-ID') || '0'}`,
    type: prop.property_type || 'unknown',
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    area: prop.area_sqm || 0,
    image: prop.image_urls?.[0] || '/placeholder.svg',
    rating: 4.5,
    featured: false,
    description: prop.description,
    three_d_model_url: prop.three_d_model_url,
    virtual_tour_url: prop.virtual_tour_url,
  }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLocation('all');
    setSearchParams({});
  };

  const content = (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${isMobile ? 'relative' : 'sticky top-0 z-40'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`pl-10 ${isMobile ? 'h-10 text-sm' : 'h-12'}`}
              />
            </div>

            {/* Filters */}
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row space-x-3'} items-start`}>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className={isMobile ? 'h-9 text-sm' : 'w-40'}>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className={isMobile ? 'h-9 text-sm' : 'w-40'}>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="jakarta">Jakarta</SelectItem>
                  <SelectItem value="bali">Bali</SelectItem>
                  <SelectItem value="bandung">Bandung</SelectItem>
                  <SelectItem value="surabaya">Surabaya</SelectItem>
                </SelectContent>
              </Select>

              <div className={`flex ${isMobile ? 'w-full' : ''} space-x-2`}>
                <Button 
                  onClick={handleSearch} 
                  className={isMobile ? 'flex-1 h-9 text-sm' : ''}
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
                
                {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className={isMobile ? 'h-9 text-sm' : ''}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Active Filters */}
        {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {searchTerm && (
                <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                  <SearchIcon className="h-3 w-3 mr-1" />
                  "{searchTerm}"
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                  <Building2 className="h-3 w-3 mr-1" />
                  {selectedType}
                </Badge>
              )}
              {selectedLocation !== 'all' && (
                <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedLocation}
                </Badge>
              )}
            </div>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
              {properties.length} properties found
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={{
                  ...property,
                  id: parseInt(property.id)
                }}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && properties.length === 0 && (searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white mb-2`}>
              No properties found
            </h3>
            <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : ''} mb-4`}>
              Try adjusting your search criteria or browse all properties
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Default State */}
        {!isLoading && properties.length === 0 && !searchTerm && selectedType === 'all' && selectedLocation === 'all' && (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white mb-2`}>
              Start your property search
            </h3>
            <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
              Enter a location, property type, or keyword to find your perfect property
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Responsive web layout for all devices
  return (
    <ResponsiveWebLayout>
      <Navigation />
      {content}
      <ProfessionalFooter language="en" />
    </ResponsiveWebLayout>
  );
};

export default Search;