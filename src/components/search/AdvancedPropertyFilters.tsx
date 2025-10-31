import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface PropertyFilters {
  searchQuery: string;
  priceRange: [number, number];
  location: string;
  propertyTypes: string[];
  bedrooms: string | null;
  bathrooms: string | null;
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
    if (localFilters.location && localFilters.location !== 'all') count++;
    if (localFilters.propertyTypes.length > 0) count++;
    if (localFilters.bedrooms) count++;
    if (localFilters.bathrooms) count++;
    if (localFilters.minArea || localFilters.maxArea) count++;
    if (localFilters.listingType !== 'all') count++;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 text-xs font-medium px-3"
        >
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0.5">{getActiveFiltersCount()}</Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <Filter className="h-6 w-6" />
              <span>Advanced Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-sm px-2 py-1">{getActiveFiltersCount()}</Badge>
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
                  location: "all",
                  propertyTypes: [],
                  bedrooms: null,
                  bathrooms: null,
                  minArea: null,
                  maxArea: null,
                  listingType: "all",
                  sortBy: "newest"
                });
              }}
              className="h-10 px-4"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 p-6">
            {/* Search Query */}
            <div className="space-y-3">
              <Label htmlFor="search" className="text-base font-medium">Search Properties</Label>
              <Input
                id="search"
                placeholder="Search by title, description, or location..."
                value={localFilters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Price Range (IDR)</Label>
              <div className="px-4 py-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  max={50000000000}
                  step={100000000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-base text-muted-foreground font-medium px-2">
                <span>IDR {(localFilters.priceRange[0] / 1000000000).toFixed(1)}B</span>
                <span>IDR {(localFilters.priceRange[1] / 1000000000).toFixed(1)}B</span>
              </div>
            </div>

            {/* Location and Listing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Location</Label>
                <Select value={localFilters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger className="bg-background h-12 text-base">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="all" className="text-base py-3">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location} className="text-base py-3">{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Listing Type</Label>
                <Select value={localFilters.listingType} onValueChange={(value) => updateFilter('listingType', value)}>
                  <SelectTrigger className="bg-background h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="all" className="text-base py-3">All Types</SelectItem>
                    <SelectItem value="sale" className="text-base py-3">For Sale</SelectItem>
                    <SelectItem value="rent" className="text-base py-3">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Property Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {propertyTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={type}
                      checked={localFilters.propertyTypes.includes(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                      className="h-5 w-5"
                    />
                    <Label 
                      htmlFor={type} 
                      className="text-base font-normal capitalize cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Bedrooms</Label>
                <Select 
                  value={localFilters.bedrooms || ""} 
                  onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? null : value)}
                >
                  <SelectTrigger className="bg-background h-12 text-base">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="any" className="text-base py-3">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-base py-3">{num}+ Bedrooms</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Bathrooms</Label>
                <Select 
                  value={localFilters.bathrooms || ""} 
                  onValueChange={(value) => updateFilter('bathrooms', value === 'any' ? null : value)}
                >
                  <SelectTrigger className="bg-background h-12 text-base">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="any" className="text-base py-3">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-base py-3">{num}+ Bathrooms</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="minArea" className="text-base font-medium">Min Area (sqm)</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="0"
                  value={localFilters.minArea || ""}
                  onChange={(e) => updateFilter('minArea', e.target.value ? parseInt(e.target.value) : null)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="maxArea" className="text-base font-medium">Max Area (sqm)</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="No limit"
                  value={localFilters.maxArea || ""}
                  onChange={(e) => updateFilter('maxArea', e.target.value ? parseInt(e.target.value) : null)}
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Sort By</Label>
              <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="bg-background h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-background p-6 border-t flex gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onToggle()}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button 
              size="lg"
              onClick={() => onToggle()}
              className="flex-1 h-12"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default AdvancedPropertyFilters;