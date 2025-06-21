
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Coins, RefreshCw } from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { Property } from '@/services/astraTokenAPI';
import AstraPropertyCard from '@/components/astra/AstraPropertyCard';
import AstraBalanceDisplay from '@/components/astra/AstraBalanceDisplay';
import { useAuth } from '@/contexts/AuthContext';

const AstraMarketplace = () => {
  const { isAuthenticated } = useAuth();
  const { properties, isLoading, fetchProperties } = useAstraToken();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const propertyTypes = ['all', 'villa', 'apartment', 'house', 'condo', 'land'];

  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property =>
        property.property_type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedType]);

  const handleRefresh = () => {
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Coins className="h-8 w-8 text-orange-500" />
                ASTRA Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                Buy premium properties with ASTRA tokens
              </p>
            </div>
            {isAuthenticated && (
              <AstraBalanceDisplay variant="card" showRefresh />
            )}
          </div>

          {!isAuthenticated && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <Coins className="h-5 w-5" />
                  <span className="font-medium">
                    Sign in to view your ASTRA balance and purchase properties
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search properties by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Property Type Filter */}
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {filteredProperties.length} properties found
            {searchTerm && (
              <span className="ml-2 text-orange-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-600 dark:text-gray-300">Loading properties...</p>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <AstraPropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {searchTerm || selectedType !== 'all' 
                    ? 'No properties match your search criteria' 
                    : 'No properties available in the marketplace'
                  }
                </p>
                {(searchTerm || selectedType !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AstraMarketplace;
