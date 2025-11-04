import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, Filter, RotateCcw, Search, DollarSign, MapPin, Home, 
  Bed, Bath, Maximize2, SortAsc, Building2 
} from "lucide-react";
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-background to-muted/20">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm z-10 border-b border-primary/20">
          <DialogTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Advanced Filters</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Refine your property search
                </span>
              </div>
              {getActiveFiltersCount() > 0 && (
                <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                  {getActiveFiltersCount()} Active
                </Badge>
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
              className="h-10 px-4 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6 space-y-8">
          {/* Search Query */}
          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <Label htmlFor="search" className="text-base font-semibold">Search Properties</Label>
            </div>
            <Input
              id="search"
              placeholder="Search by title, description, or location..."
              value={localFilters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="h-12 text-base border-primary/20 focus:ring-2 focus:ring-primary/20 bg-background"
            />
          </div>

          <Separator className="my-6" />

          {/* Price Range */}
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <Label className="text-base font-semibold">Price Range</Label>
            </div>
            <div className="px-4 py-4">
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value)}
                max={50000000000}
                step={100000000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center bg-background/50 rounded-lg p-3 border border-green-500/10">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">Min</p>
                <p className="text-lg font-bold text-green-600">
                  IDR {(localFilters.priceRange[0] / 1000000000).toFixed(1)}B
                </p>
              </div>
              <div className="h-8 w-px bg-border mx-4" />
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">Max</p>
                <p className="text-lg font-bold text-green-600">
                  IDR {(localFilters.priceRange[1] / 1000000000).toFixed(1)}B
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Location and Listing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <Label className="text-base font-semibold">Location</Label>
              </div>
              <Select value={localFilters.location} onValueChange={(value) => updateFilter('location', value)}>
                <SelectTrigger className="bg-background h-12 text-base border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all" className="text-base py-3 hover:bg-blue-500/10">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location} className="text-base py-3 hover:bg-blue-500/10">{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <Label className="text-base font-semibold">Listing Type</Label>
              </div>
              <Select value={localFilters.listingType} onValueChange={(value) => updateFilter('listingType', value)}>
                <SelectTrigger className="bg-background h-12 text-base border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all" className="text-base py-3 hover:bg-purple-500/10">All Types</SelectItem>
                  <SelectItem value="sale" className="text-base py-3 hover:bg-purple-500/10">For Sale</SelectItem>
                  <SelectItem value="rent" className="text-base py-3 hover:bg-purple-500/10">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Property Types */}
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/10">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              <Label className="text-base font-semibold">Property Types</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {propertyTypes.map((type) => (
                <div 
                  key={type} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    localFilters.propertyTypes.includes(type) 
                      ? 'bg-orange-500/10 border-orange-500/50 shadow-sm' 
                      : 'bg-background border-orange-500/10 hover:border-orange-500/30'
                  }`}
                  onClick={() => togglePropertyType(type)}
                >
                  <Checkbox
                    id={type}
                    checked={localFilters.propertyTypes.includes(type)}
                    className="h-5 w-5 border-orange-500/30"
                  />
                  <Label 
                    htmlFor={type} 
                    className="text-sm font-medium capitalize cursor-pointer flex-1"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-pink-500/5 to-transparent border border-pink-500/10">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-pink-600" />
                <Label className="text-base font-semibold">Bedrooms</Label>
              </div>
              <Select 
                value={localFilters.bedrooms || ""} 
                onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? null : value)}
              >
                <SelectTrigger className="bg-background h-12 text-base border-pink-500/20 hover:border-pink-500/40 transition-colors">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="any" className="text-base py-3 hover:bg-pink-500/10">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-base py-3 hover:bg-pink-500/10">{num}+ Bedrooms</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/10">
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-cyan-600" />
                <Label className="text-base font-semibold">Bathrooms</Label>
              </div>
              <Select 
                value={localFilters.bathrooms || ""} 
                onValueChange={(value) => updateFilter('bathrooms', value === 'any' ? null : value)}
              >
                <SelectTrigger className="bg-background h-12 text-base border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="any" className="text-base py-3 hover:bg-cyan-500/10">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-base py-3 hover:bg-cyan-500/10">{num}+ Bathrooms</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Area Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/10">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-teal-600" />
                <Label htmlFor="minArea" className="text-base font-semibold">Min Area (sqm)</Label>
              </div>
              <Input
                id="minArea"
                type="number"
                placeholder="0"
                value={localFilters.minArea || ""}
                onChange={(e) => updateFilter('minArea', e.target.value ? parseInt(e.target.value) : null)}
                className="h-12 text-base border-teal-500/20 focus:ring-2 focus:ring-teal-500/20 bg-background"
              />
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/10">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-teal-600" />
                <Label htmlFor="maxArea" className="text-base font-semibold">Max Area (sqm)</Label>
              </div>
              <Input
                id="maxArea"
                type="number"
                placeholder="No limit"
                value={localFilters.maxArea || ""}
                onChange={(e) => updateFilter('maxArea', e.target.value ? parseInt(e.target.value) : null)}
                className="h-12 text-base border-teal-500/20 focus:ring-2 focus:ring-teal-500/20 bg-background"
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Sort Options */}
          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10">
            <div className="flex items-center gap-2">
              <SortAsc className="h-5 w-5 text-indigo-600" />
              <Label className="text-base font-semibold">Sort By</Label>
            </div>
            <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="bg-background h-12 text-base border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-3 hover:bg-indigo-500/10">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent p-6 border-t flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onToggle()}
            className="flex-1 h-12 text-base font-semibold hover:bg-muted transition-colors"
          >
            Cancel
          </Button>
          <Button 
            size="lg"
            onClick={() => onToggle()}
            className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedPropertyFilters;