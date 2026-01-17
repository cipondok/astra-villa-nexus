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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold">Enhanced Search Filters</h2>
          <p className="text-[11px] text-muted-foreground">Advanced property search with multiple filter options</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] text-primary border-primary/50">
            {getActiveFilterCount()} Active Filters
          </Badge>
          <Button onClick={clearAllFilters} variant="outline" size="sm" className="h-7 text-[10px]">
            <Trash2 className="h-3 w-3 mr-1.5" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Filters */}
        <div className="lg:col-span-2 space-y-3">
          {/* Location & Basic Search */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4 text-primary" />
                Location & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <Label className="text-xs">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                  <Input
                    placeholder="Search by location, area, or landmark..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Listing Type</Label>
                  <Select 
                    value={filters.listingType} 
                    onValueChange={(value) => updateFilter('listingType', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
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
                  <Label className="text-xs">Sort By</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => updateFilter('sortBy', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
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
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-primary" />
                Property Type
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = filters.propertyTypes.includes(type.value);
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/10'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => toggleArrayFilter('propertyTypes', type.value)}
                    >
                      <CardContent className="p-2.5 text-center">
                        <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <span className="text-[10px] font-medium">{type.label}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="px-1">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={10000000000}
                  step={100000000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bedrooms & Bathrooms */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bed className="h-4 w-4 text-primary" />
                Bedrooms & Bathrooms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <Label className="text-xs mb-1.5 block">Bedrooms</Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      className="h-7 text-[10px] px-2.5"
                      variant={filters.bedrooms.includes(num) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter('bedrooms', num.toString())}
                    >
                      {num}{num === 6 ? '+' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Bathrooms</Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      className="h-7 text-[10px] px-2.5"
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
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Square className="h-4 w-4 text-primary" />
                Area Size (m²)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="px-1">
                <Slider
                  value={filters.areaRange}
                  onValueChange={(value) => updateFilter('areaRange', value as [number, number])}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{filters.areaRange[0]} m²</span>
                <span>{filters.areaRange[1]}+ m²</span>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-1.5">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => toggleArrayFilter('amenities', amenity)}
                    />
                    <Label htmlFor={amenity} className="text-[10px] cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Features */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-primary" />
                Special Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-1.5">
                    <Checkbox
                      id={feature}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => toggleArrayFilter('features', feature)}
                    />
                    <Label htmlFor={feature} className="text-[10px] cursor-pointer">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Saved Filters & Quick Actions */}
        <div className="space-y-3">
          {/* Saved Filters */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-primary" />
                Saved Filters
              </CardTitle>
              <CardDescription className="text-[10px]">Quick access to frequently used filters</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {savedFilters.map((filter, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                  <div>
                    <div className="text-xs font-medium">{filter.name}</div>
                    <div className="text-[10px] text-muted-foreground">{filter.count} properties</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]">
                    Apply
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full h-7 text-[10px]">
                <Plus className="h-3 w-3 mr-1.5" />
                Save Current Filter
              </Button>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => updateFilter('dateRange', value)}
              >
                <SelectTrigger className="h-8 text-xs">
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
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Filter Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              <div className="text-[11px]">
                <strong>{getActiveFilterCount()}</strong> filters applied
              </div>
              {filters.location && (
                <Badge variant="secondary" className="text-[10px]">Location: {filters.location}</Badge>
              )}
              {filters.propertyTypes.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {filters.propertyTypes.length} Property Types
                </Badge>
              )}
              {filters.amenities.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
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