import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Calendar,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';

interface FilterOptions {
  priceRange: [number, number];
  propertyTypes: string[];
  bedrooms: number[];
  bathrooms: number[];
  amenities: string[];
  listingType: string;
  dateRange: string;
  sortBy: string;
  location: string;
  areaRange: [number, number];
  features: string[];
}

const EnhancedSearchFilters = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000000000], // IDR
    propertyTypes: [],
    bedrooms: [],
    bathrooms: [],
    amenities: [],
    listingType: 'all',
    dateRange: 'all',
    sortBy: 'newest',
    location: '',
    areaRange: [0, 1000], // m²
    features: [],
  });

  const [savedFilters, setSavedFilters] = useState([
    { name: 'Luxury Villas', count: 23 },
    { name: 'Budget Apartments', count: 156 },
    { name: 'Family Homes', count: 89 },
  ]);

  const propertyTypes = [
    { value: 'villa', label: 'Villa', icon: Home },
    { value: 'apartment', label: 'Apartment', icon: Home },
    { value: 'house', label: 'House', icon: Home },
    { value: 'townhouse', label: 'Townhouse', icon: Home },
    { value: 'condo', label: 'Condo', icon: Home },
    { value: 'land', label: 'Land', icon: Square },
  ];

  const amenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 
    'Air Conditioning', 'WiFi', 'Security', 'Elevator', 'Furnished'
  ];

  const specialFeatures = [
    'Sea View', 'Mountain View', 'City View', 'Corner Unit', 
    'Pet Friendly', 'New Construction', 'Renovated', 'Smart Home'
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B IDR`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M IDR`;
    }
    return `${(price / 1000).toFixed(0)}K IDR`;
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 10000000000],
      propertyTypes: [],
      bedrooms: [],
      bathrooms: [],
      amenities: [],
      listingType: 'all',
      dateRange: 'all',
      sortBy: 'newest',
      location: '',
      areaRange: [0, 1000],
      features: [],
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.bathrooms.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.listingType !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000000) count++;
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 1000) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Enhanced Search Filters</h2>
          <p className="text-gray-400">Advanced property search with multiple filter options</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {getActiveFilterCount()} Active Filters
          </Badge>
          <Button onClick={clearAllFilters} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Basic Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Location & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by location, area, or landmark..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Listing Type</Label>
                  <Select 
                    value={filters.listingType} 
                    onValueChange={(value) => updateFilter('listingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="lease">For Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => updateFilter('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="area-large">Largest Area</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = filters.propertyTypes.includes(type.value);
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => toggleArrayFilter('propertyTypes', type.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={10000000000}
                  step={100000000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bedrooms & Bathrooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Bedrooms & Bathrooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Bedrooms</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={filters.bedrooms.includes(num) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter('bedrooms', num.toString())}
                    >
                      {num}{num === 6 ? '+' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Bathrooms</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={filters.bathrooms.includes(num) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter('bathrooms', num.toString())}
                    >
                      {num}{num === 5 ? '+' : ''}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Area Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="h-5 w-5" />
                Area Size (m²)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={filters.areaRange}
                  onValueChange={(value) => updateFilter('areaRange', value as [number, number])}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.areaRange[0]} m²</span>
                <span>{filters.areaRange[1]}+ m²</span>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => toggleArrayFilter('amenities', amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Special Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => toggleArrayFilter('features', feature)}
                    />
                    <Label htmlFor={feature} className="text-sm cursor-pointer">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Saved Filters & Quick Actions */}
        <div className="space-y-6">
          {/* Saved Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Saved Filters
              </CardTitle>
              <CardDescription>Quick access to frequently used filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedFilters.map((filter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{filter.name}</div>
                    <div className="text-xs text-gray-500">{filter.count} properties</div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Apply
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Save Current Filter
              </Button>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => updateFilter('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>{getActiveFilterCount()}</strong> filters applied
              </div>
              {filters.location && (
                <Badge variant="secondary">Location: {filters.location}</Badge>
              )}
              {filters.propertyTypes.length > 0 && (
                <Badge variant="secondary">
                  {filters.propertyTypes.length} Property Types
                </Badge>
              )}
              {filters.amenities.length > 0 && (
                <Badge variant="secondary">
                  {filters.amenities.length} Amenities
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearchFilters;