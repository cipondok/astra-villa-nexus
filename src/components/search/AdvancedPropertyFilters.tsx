import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  X, Filter, RotateCcw, Search, DollarSign, MapPin, Home, 
  Bed, Bath, Maximize2, SortAsc, Building2, Sparkles, Map, List, Save, Trash2, Loader2, ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePropertyCount } from "@/hooks/usePropertyCount";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { useSmartFilterSuggestions } from "@/hooks/useSmartFilterSuggestions";
import { useCollaborativeRecommendations } from "@/hooks/useCollaborativeRecommendations";
import { SavePresetDialog } from "./SavePresetDialog";
import { FilterMapView } from "./FilterMapView";

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
  const [activeTab, setActiveTab] = useState<"filters" | "map">("filters");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [currentFilterId, setCurrentFilterId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    location: true,
    propertyTypes: false,
    rooms: false,
    area: false,
    sort: false,
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const { count, isLoading: countLoading } = usePropertyCount(localFilters);
  const { savedPresets, savePreset, deletePreset, loadPreset } = useFilterPresets();
  const { suggestions, isLoading: suggestionsLoading, trackFilterUsage } = useSmartFilterSuggestions(localFilters);
  const { recommendations, trackSequence } = useCollaborativeRecommendations(currentFilterId, sessionId);

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

  const handleSavePreset = (name: string) => {
    savePreset(name, localFilters);
  };

  const handleLoadPreset = (presetId: string) => {
    const presetFilters = loadPreset(presetId);
    if (presetFilters) {
      const newFilters = { ...localFilters, ...presetFilters };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const handleApplySmartSuggestion = (suggestionFilters: Partial<PropertyFilters>) => {
    const newFilters = { ...localFilters, ...suggestionFilters };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApplyFilters = async () => {
    const filterId = await trackFilterUsage(localFilters);
    if (currentFilterId && filterId) {
      await trackSequence(currentFilterId, filterId);
    }
    setCurrentFilterId(filterId);
    onToggle();
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
          className="relative group overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all rounded-full px-4 py-1.5 text-sm font-medium"
        >
          <div className="relative flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-1 bg-white text-primary px-1.5 py-0 text-xs font-bold">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-background/95 backdrop-blur-sm border border-border">
        <DialogHeader className="relative px-4 py-3 sticky top-0 bg-background/98 backdrop-blur-sm z-10 border-b">
          <DialogTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base">Filters</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {count !== null && (
                    <span className="text-primary font-medium">
                      {countLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : (
                        `${count} results`
                      )}
                    </span>
                  )}
                </div>
              </div>
              {getActiveFiltersCount() > 0 && (
                <Badge className="bg-primary text-white px-2 py-0.5 text-xs font-semibold ml-auto">
                  {getActiveFiltersCount()}
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
              className="h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive rounded-lg"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </DialogTitle>
          
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "filters" | "map")} className="mt-2">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="filters" className="gap-1.5 text-xs">
                <List className="h-3 w-3" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-1.5 text-xs">
                <Map className="h-3 w-3" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="relative overflow-y-auto max-h-[calc(90vh-180px)]">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="filters" className="px-4 py-3 space-y-3 m-0">
          
          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <Label className="text-sm font-semibold">Smart Suggestions</Label>
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs ml-auto">
                  AI
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleApplySmartSuggestion(suggestion.filters)}
                    className="group p-2.5 rounded-lg border border-accent/30 bg-background hover:border-accent hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xl">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs mb-0.5 group-hover:text-accent transition-colors truncate">
                          {suggestion.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {suggestion.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent shrink-0">
                        {suggestion.usageCount}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && <Separator className="my-3" />}

          {/* Collaborative Recommendations */}
          {recommendations.length > 0 && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <Label className="text-sm font-semibold">Users Also Searched</Label>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs ml-auto">
                    Similar
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleApplySmartSuggestion(rec.filters)}
                      className="group p-2.5 rounded-lg border border-blue-500/30 bg-background hover:border-blue-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-xl">
                          {rec.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs mb-0.5 group-hover:text-blue-600 transition-colors truncate">
                            {rec.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {rec.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600 shrink-0">
                          {rec.matchCount}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <Separator className="my-3" />
            </>
          )}
          
          {/* Filter Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <Label className="text-sm font-semibold">Quick Presets</Label>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs ml-auto">
                6
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filterPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="group p-2.5 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-xl shrink-0">
                      {preset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs mb-0.5 group-hover:text-primary transition-colors truncate">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-3" />
          
          {/* Search Query - Collapsible */}
          <Collapsible open={expandedSections.search} onOpenChange={() => toggleSection('search')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-primary" />
                <Label className="text-sm font-semibold cursor-pointer">Search</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.search ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="p-3 rounded-lg bg-muted/30 border border-primary/10">
                <Input
                  placeholder="e.g., Modern apartment, 3 BR villa..."
                  value={localFilters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  className="h-9 text-sm border-primary/20 focus:border-primary/40 bg-background"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Price Range - Collapsible */}
          <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                <Label className="text-sm font-semibold cursor-pointer">Price Range</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="px-2 py-3">
                  <Slider
                    value={localFilters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value)}
                    max={50000000000}
                    step={100000000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center bg-background rounded-lg p-2 text-xs">
                  <div className="text-center flex-1">
                    <p className="text-muted-foreground">Min</p>
                    <p className="font-bold text-green-600">
                      IDR {(localFilters.priceRange[0] / 1000000000).toFixed(1)}B
                    </p>
                  </div>
                  <div className="h-6 w-px bg-border mx-2" />
                  <div className="text-center flex-1">
                    <p className="text-muted-foreground">Max</p>
                    <p className="font-bold text-green-600">
                      IDR {(localFilters.priceRange[1] / 1000000000).toFixed(1)}B
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Location and Listing Type - Collapsible */}
          <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <Label className="text-sm font-semibold cursor-pointer">Location & Type</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.location ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <Label className="text-sm font-semibold">Location</Label>
                  </div>
                  <Select value={localFilters.location} onValueChange={(value) => updateFilter('location', value)}>
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-[100]">
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-purple-600" />
                    <Label className="text-sm font-semibold">Listing Type</Label>
                  </div>
                  <Select value={localFilters.listingType} onValueChange={(value) => updateFilter('listingType', value)}>
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-[100]">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Property Types - Collapsible */}
          <Collapsible open={expandedSections.propertyTypes} onOpenChange={() => toggleSection('propertyTypes')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Home className="h-3.5 w-3.5 text-orange-600" />
                <Label className="text-sm font-semibold cursor-pointer">Property Types</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.propertyTypes ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {propertyTypes.map((type) => (
                    <div 
                      key={type} 
                      className={`flex items-center space-x-1.5 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                        localFilters.propertyTypes.includes(type) 
                          ? 'bg-orange-500/10 border-orange-500/40' 
                          : 'bg-background border-border hover:border-orange-500/30'
                      }`}
                      onClick={() => togglePropertyType(type)}
                    >
                      <Checkbox
                        id={type}
                        checked={localFilters.propertyTypes.includes(type)}
                        className="h-3.5 w-3.5"
                      />
                      <Label 
                        htmlFor={type} 
                        className="text-xs font-medium capitalize cursor-pointer flex-1"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Bedrooms and Bathrooms - Collapsible */}
          <Collapsible open={expandedSections.rooms} onOpenChange={() => toggleSection('rooms')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Bed className="h-3.5 w-3.5 text-pink-600" />
                <Label className="text-sm font-semibold cursor-pointer">Bedrooms & Bathrooms</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.rooms ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-pink-600" />
                    <Label className="text-sm font-semibold">Bedrooms</Label>
                  </div>
                  <Select 
                    value={localFilters.bedrooms || ""} 
                    onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? null : value)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-[100]">
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-3.5 w-3.5 text-cyan-600" />
                    <Label className="text-sm font-semibold">Bathrooms</Label>
                  </div>
                  <Select 
                    value={localFilters.bathrooms || ""} 
                    onValueChange={(value) => updateFilter('bathrooms', value === 'any' ? null : value)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-[100]">
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Area Range - Collapsible */}
          <Collapsible open={expandedSections.area} onOpenChange={() => toggleSection('area')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
                <Label className="text-sm font-semibold cursor-pointer">Area Range</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.area ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
                    <Label htmlFor="minArea" className="text-sm font-semibold">Min Area (sqm)</Label>
                  </div>
                  <Input
                    id="minArea"
                    type="number"
                    placeholder="0"
                    value={localFilters.minArea || ""}
                    onChange={(e) => updateFilter('minArea', e.target.value ? parseInt(e.target.value) : null)}
                    className="h-9 text-sm bg-background"
                  />
                </div>

                <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
                    <Label htmlFor="maxArea" className="text-sm font-semibold">Max Area (sqm)</Label>
                  </div>
                  <Input
                    id="maxArea"
                    type="number"
                    placeholder="No limit"
                    value={localFilters.maxArea || ""}
                    onChange={(e) => updateFilter('maxArea', e.target.value ? parseInt(e.target.value) : null)}
                    className="h-9 text-sm bg-background"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3" />

          {/* Sort Options - Collapsible */}
          <Collapsible open={expandedSections.sort} onOpenChange={() => toggleSection('sort')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <SortAsc className="h-3.5 w-3.5 text-indigo-600" />
                <Label className="text-sm font-semibold cursor-pointer">Sort By</Label>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.sort ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="h-9 text-sm bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-[100]">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Saved Presets Section */}
          {savedPresets.length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5 text-accent" />
                    <Label className="text-sm font-semibold">My Presets</Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {savedPresets.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-md bg-background border border-border hover:border-accent/40 transition-all group"
                    >
                      <button
                        onClick={() => handleLoadPreset(preset.id)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium text-xs group-hover:text-accent transition-colors truncate">
                          {preset.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePreset(preset.id)}
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
            </TabsContent>

            <TabsContent value="map" className="m-0 h-[calc(90vh-180px)]">
              <div className="w-full h-full p-3">
                <FilterMapView filters={localFilters} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="sticky bottom-0 bg-background/98 backdrop-blur-sm px-4 py-3 border-t flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="gap-1.5 text-xs"
          >
            <Save className="h-3 w-3" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggle()}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleApplyFilters}
            className="flex-1 text-xs bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
          >
            Apply
          </Button>
        </div>

        <SavePresetDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          onSave={handleSavePreset}
        />
        </DialogContent>
    </Dialog>
  );
};

export default AdvancedPropertyFilters;