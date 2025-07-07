import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface PropertyFilters {
  searchQuery: string;
  priceRange: [number, number];
  location: string;
  propertyTypes: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  listingType: string;
  sortBy: string;
}

interface AdvancedPropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const propertyTypes = [
  "apartment", "house", "villa", "townhouse", "condo", "studio", "penthouse", "duplex"
];

const locations = [
  "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang"
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "area_large", label: "Largest Area" },
  { value: "popularity", label: "Most Popular" }
];

const AdvancedPropertyFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  isOpen, 
  onToggle 
}: AdvancedPropertyFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const togglePropertyType = (type: string) => {
    const newTypes = localFilters.propertyTypes.includes(type)
      ? localFilters.propertyTypes.filter(t => t !== type)
      : [...localFilters.propertyTypes, type];
    updateFilter('propertyTypes', newTypes);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.searchQuery) count++;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 50000000000) count++;
    if (localFilters.location) count++;
    if (localFilters.propertyTypes.length > 0) count++;
    if (localFilters.bedrooms) count++;
    if (localFilters.bathrooms) count++;
    if (localFilters.minArea || localFilters.maxArea) count++;
    if (localFilters.listingType !== 'all') count++;
    return count;
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                  setLocalFilters({
                    searchQuery: "",
                    priceRange: [0, 50000000000],
                    location: "",
                    propertyTypes: [],
                    bedrooms: null,
                    bathrooms: null,
                    minArea: null,
                    maxArea: null,
                    listingType: "all",
                    sortBy: "newest"
                  });
                }}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Properties</Label>
              <Input
                id="search"
                placeholder="Search by title, description, or location..."
                value={localFilters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label>Price Range (IDR)</Label>
              <div className="px-3">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  max={50000000000}
                  step={100000000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IDR {(localFilters.priceRange[0] / 1000000000).toFixed(1)}B</span>
                <span>IDR {(localFilters.priceRange[1] / 1000000000).toFixed(1)}B</span>
              </div>
            </div>

            {/* Location and Listing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={localFilters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select value={localFilters.listingType} onValueChange={(value) => updateFilter('listingType', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3">
              <Label>Property Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {propertyTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={localFilters.propertyTypes.includes(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    <Label 
                      htmlFor={type} 
                      className="text-sm font-normal capitalize cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select 
                  value={localFilters.bedrooms?.toString() || ""} 
                  onValueChange={(value) => updateFilter('bedrooms', value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num}+ Bedrooms</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select 
                  value={localFilters.bathrooms?.toString() || ""} 
                  onValueChange={(value) => updateFilter('bathrooms', value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num}+ Bathrooms</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minArea">Min Area (sqm)</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="0"
                  value={localFilters.minArea || ""}
                  onChange={(e) => updateFilter('minArea', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxArea">Max Area (sqm)</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="No limit"
                  value={localFilters.maxArea || ""}
                  onChange={(e) => updateFilter('maxArea', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdvancedPropertyFilters;