import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useOptimizedPropertySearch } from '@/hooks/useOptimizedPropertySearch';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, Database, Zap } from 'lucide-react';

interface OptimizedPropertySearchProps {
  onResultSelect?: (propertyId: string) => void;
  showAnalytics?: boolean;
}

const OptimizedPropertySearch = ({ onResultSelect, showAnalytics = false }: OptimizedPropertySearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const {
    searchResponse,
    filters,
    suggestions,
    updateFilters,
    fetchSuggestions,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    clearCache
  } = useOptimizedPropertySearch();

  const { results, totalCount, page, totalPages, isLoading, error, responseTime, cacheHit } = searchResponse;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateFilters({ searchText: value });
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    updateFilters({ searchText: suggestion });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilters({ amenities: newAmenities.length > 0 ? newAmenities : undefined });
  };

  const amenitiesList = [
    'Pool',
    'Gym',
    'Parking',
    'Security',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Elevator'
  ];

  const SkeletonCard = () => (
    <Card className="h-48">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Optimized Property Search
            </div>
            {showAnalytics && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={cacheHit ? "secondary" : "outline"} className="gap-1">
                  {cacheHit ? <Zap className="h-3 w-3" /> : <Database className="h-3 w-3" />}
                  {cacheHit ? 'Cached' : 'Fresh'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {responseTime}ms
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Input
              placeholder="Search properties by location, title, or description..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <div className="flex items-center gap-3">
              <Select value={filters.sortBy || ''} onValueChange={(value) => updateFilters({ sortBy: value || undefined })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="area_asc">Area: Small to Large</SelectItem>
                  <SelectItem value="area_desc">Area: Large to Small</SelectItem>
                </SelectContent>
              </Select>
              
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Found {totalCount.toLocaleString()} properties
                </p>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilters({ propertyType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.listingType || ''} onValueChange={(value) => updateFilters({ listingType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price"
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              />

              <Input
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              />

              <Select value={filters.minBedrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBedrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.minBathrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBathrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Area Range (sqm)</label>
                  <span className="text-sm text-muted-foreground">
                    {filters.minArea || 0} - {filters.maxArea || 1000} sqm
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.minArea || 0, filters.maxArea || 1000]}
                  onValueChange={(value) => updateFilters({ 
                    minArea: value[0] === 0 ? undefined : value[0],
                    maxArea: value[1] === 1000 ? undefined : value[1]
                  })}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <label className="text-sm font-medium">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities?.includes(amenity) || false}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label
                        htmlFor={amenity}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={clearCache} size="sm">
                Clear Cache
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Search failed: {error}. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((property) => (
                <Card 
                  key={property.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onResultSelect?.(property.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {property.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          ${property.price?.toLocaleString()}
                        </div>
                        <Badge variant="outline">
                          {property.property_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{property.city}, {property.area}</span>
                        <span>{property.bedrooms}BR / {property.bathrooms}BA</span>
                      </div>
                      {property.area_sqm && (
                        <div className="text-xs text-muted-foreground">
                          {property.area_sqm} sqm
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clearing some filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OptimizedPropertySearch;