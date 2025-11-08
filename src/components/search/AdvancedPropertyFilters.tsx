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
  Bed, Bath, Maximize2, SortAsc, Building2, Sparkles
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

const filterPresets = [
  {
    id: 'luxury',
    name: 'Luxury Properties',
    icon: '💎',
    description: 'High-end properties with premium features',
    filters: {
      priceRange: [5000000000, 50000000000] as [number, number],
      propertyTypes: ['villa', 'penthouse'],
      bedrooms: '3',
      bathrooms: '3',
      minArea: 200,
      listingType: 'all',
    }
  },
  {
    id: 'budget',
    name: 'Budget Friendly',
    icon: '💰',
    description: 'Affordable options for smart buyers',
    filters: {
      priceRange: [0, 2000000000] as [number, number],
      propertyTypes: ['apartment', 'studio'],
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      listingType: 'all',
    }
  },
  {
    id: 'family',
    name: 'Family Homes',
    icon: '🏡',
    description: 'Spacious homes perfect for families',
    filters: {
      priceRange: [2000000000, 10000000000] as [number, number],
      propertyTypes: ['house', 'townhouse'],
      bedrooms: '3',
      bathrooms: '2',
      minArea: 150,
      listingType: 'all',
    }
  },
  {
    id: 'investment',
    name: 'Investment Properties',
    icon: '📈',
    description: 'Great rental income potential',
    filters: {
      priceRange: [1000000000, 5000000000] as [number, number],
      propertyTypes: ['apartment', 'condo'],
      bedrooms: '2',
      bathrooms: '1',
      minArea: 50,
      listingType: 'all',
    }
  },
  {
    id: 'modern',
    name: 'Modern Living',
    icon: '🏢',
    description: 'Contemporary design and amenities',
    filters: {
      priceRange: [3000000000, 15000000000] as [number, number],
      propertyTypes: ['condo', 'penthouse', 'duplex'],
      bedrooms: '2',
      bathrooms: '2',
      minArea: 100,
      listingType: 'all',
    }
  },
  {
    id: 'rental',
    name: 'For Rent',
    icon: '🔑',
    description: 'Available rental properties',
    filters: {
      priceRange: [0, 50000000000] as [number, number],
      propertyTypes: [],
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      listingType: 'rent',
    }
  },
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

  const applyPreset = (presetId: string) => {
    const preset = filterPresets.find(p => p.id === presetId);
    if (!preset) return;

    const newFilters = {
      ...localFilters,
      ...preset.filters,
      maxArea: localFilters.maxArea, // Keep max area
      sortBy: localFilters.sortBy, // Keep sort preference
    };
    
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
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
          variant="default"
          className="relative group overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-2.5 font-semibold animate-in zoom-in-50 duration-500"
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          
          <div className="relative flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-1 bg-white text-primary px-2 py-0.5 text-xs font-bold animate-pulse">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden p-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-xl border-2 border-primary/20 shadow-2xl shadow-primary/10 animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
        {/* Decorative background blur elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <DialogHeader className="relative p-6 pb-4 sticky top-0 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 backdrop-blur-xl z-10 border-b border-primary/10 shadow-lg">
          <DialogTitle className="flex items-center justify-between text-2xl animate-in fade-in-0 slide-in-from-left-3 duration-500">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl animate-in zoom-in-50 duration-500 delay-100 group">
                <Filter className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-xl blur-md group-hover:blur-lg transition-all"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Advanced Filters
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  🎯 Refine your search with precision
                </span>
              </div>
              {getActiveFiltersCount() > 0 && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 text-sm font-bold shadow-lg animate-in zoom-in-50 duration-300 delay-200">
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
              className="h-10 px-4 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-105 rounded-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative overflow-y-auto max-h-[calc(92vh-180px)] px-6 py-6 space-y-6">
          {/* Filter Presets */}
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <Label className="text-lg font-bold">Quick Presets</Label>
                <p className="text-xs text-muted-foreground">Popular filter combinations</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                6 Presets
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterPresets.map((preset, index) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="group relative p-5 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-primary/5 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 text-left hover:scale-[1.03] animate-in fade-in-0 slide-in-from-bottom-3"
                  style={{ 
                    animationDelay: `${300 + index * 80}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></div>
                  
                  <div className="relative flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                      <div className="relative text-4xl p-3 bg-gradient-to-br from-background to-muted rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {preset.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors duration-300">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-in zoom-in-50">
                      <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent h-px animate-in fade-in-0 duration-500 delay-700" />
          
          {/* Search Query */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-2 border-primary/10 animate-in fade-in-50 slide-in-from-bottom-3 duration-500 delay-800 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-transparent rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="search" className="text-base font-bold">Search Properties</Label>
                <p className="text-xs text-muted-foreground">Keywords, location, or features</p>
              </div>
            </div>
            <Input
              id="search"
              placeholder="e.g., Modern apartment near beach, 3 bedroom villa..."
              value={localFilters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="h-14 text-base border-2 border-primary/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 bg-background/50 backdrop-blur-sm transition-all duration-300 rounded-xl placeholder:text-muted-foreground/60"
            />
          </div>

          <Separator className="my-6 animate-in fade-in-0 duration-500 delay-900" />

          {/* Price Range */}
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 animate-in fade-in-50 slide-in-from-bottom-3 duration-500 delay-1000 transition-all hover:shadow-md"
          >
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