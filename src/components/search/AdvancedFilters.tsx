import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, ChevronDown, ChevronUp, Home, DollarSign, Sparkles, ShoppingBag, Key, Rocket, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  language: "en" | "id";
  onFiltersChange: (filters: any) => void;
  onSearch: (searchData: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedFilters = ({ language, onFiltersChange, onSearch, open, onOpenChange }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState({
    propertyType: 'all',
    listingType: 'all',
    priceRange: [0, 10000000000],
    bedrooms: 'all',
    bathrooms: 'all',
    areaRange: [0, 1000],
    location: '',
    features: [] as string[],
    rentalDuration: 'all',
  });
  
  const [expandedSections, setExpandedSections] = useState({
    propertyType: true,
    listingType: true,
    price: true,
    rooms: true,
    area: true,
    features: true,
  });

  const text = {
    en: {
      advancedFilters: "Advanced Filters",
      selectListingType: "Select Listing Type",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      areaRange: "Area (sqm)",
      features: "Features",
      apply: "Apply Filters",
      cancel: "Cancel",
      clearFilters: "Clear All",
      filtersApplied: "Filters applied successfully",
      filtersCleared: "All filters cleared",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      all: "All",
      sale: "For Sale",
      rent: "For Rent",
      lease: "For Lease",
      newProject: "New Project",
      any: "Any",
      pool: "Swimming Pool",
      garage: "Garage",
      garden: "Garden",
      balcony: "Balcony",
      furnished: "Furnished",
      aircon: "Air Conditioning",
      security: "Security",
      gym: "Gym",
      propertyDetails: "Property Details",
      priceAndArea: "Price & Area",
      rentalDuration: "Rental Duration",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly"
    },
    id: {
      advancedFilters: "Filter Lanjutan",
      selectListingType: "Pilih Tipe Listing",
      propertyType: "Tipe Properti",
      listingType: "Tipe Listing",
      priceRange: "Rentang Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      areaRange: "Luas (sqm)",
      features: "Fasilitas",
      apply: "Terapkan Filter",
      cancel: "Batal",
      clearFilters: "Hapus Semua",
      filtersApplied: "Filter berhasil diterapkan",
      filtersCleared: "Semua filter dihapus",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      all: "Semua",
      sale: "Dijual",
      rent: "Disewa",
      lease: "Disewakan",
      newProject: "Proyek Baru",
      any: "Semua",
      pool: "Kolam Renang",
      garage: "Garasi",
      garden: "Taman",
      balcony: "Balkon",
      furnished: "Furnished",
      aircon: "AC",
      security: "Keamanan",
      gym: "Gym",
      propertyDetails: "Detail Properti",
      priceAndArea: "Harga & Luas",
      rentalDuration: "Durasi Sewa",
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      yearly: "Tahunan"
    }
  };

  const currentText = text[language];

  const propertyTypes = [
    { value: 'villa', label: currentText.villa },
    { value: 'apartment', label: currentText.apartment },
    { value: 'house', label: currentText.house },
    { value: 'townhouse', label: currentText.townhouse },
    { value: 'land', label: currentText.land },
  ];

  const listingTypes = [
    { value: 'all', label: currentText.all, icon: Layers },
    { value: 'sale', label: currentText.sale, icon: ShoppingBag },
    { value: 'rent', label: currentText.rent, icon: Key },
    { value: 'new_project', label: currentText.newProject, icon: Rocket },
  ];

  const rentalDurations = [
    { value: 'daily', label: currentText.daily },
    { value: 'weekly', label: currentText.weekly },
    { value: 'monthly', label: currentText.monthly },
    { value: 'yearly', label: currentText.yearly },
  ];

  const availableFeatures = [
    'pool', 'garage', 'garden', 'balcony', 'furnished', 'aircon', 'security', 'gym'
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    handleFilterChange('features', newFeatures);
  };

  const handleApply = () => {
    onSearch(filters);
    toast.success(currentText.filtersApplied);
    onOpenChange(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      state: '',
      city: '',
      area: '',
      propertyType: 'all',
      listingType: 'all',
      priceRange: [0, 10000000000],
      bedrooms: 'all',
      bathrooms: 'all',
      parking: '',
      minArea: '',
      maxArea: '',
      minPrice: 0,
      maxPrice: 0,
      areaRange: [0, 1000],
      features: [],
      facilities: [],
      yearBuilt: '',
      condition: '',
      floorLevel: '',
      landSize: '',
      stories: '',
      furnishing: '',
      checkInDate: null,
      checkOutDate: null,
      rentalDuration: 'all',
      tripPurpose: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    toast.success(currentText.filtersCleared);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[96vw] !max-w-[1800px] max-h-[75vh] sm:max-h-[80vh] p-0 flex flex-col bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/40 shadow-2xl"
        style={{ width: '96vw', maxWidth: '1800px' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Landscape Layout Container */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Listing Type */}
          <div className="w-36 sm:w-44 lg:w-52 shrink-0 border-r border-border/30 p-3 sm:p-4 bg-muted/30 overflow-y-auto flex flex-col">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xs sm:text-sm font-semibold">{currentText.advancedFilters}</DialogTitle>
              </div>
            </div>
            
            <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{currentText.selectListingType}</Label>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {listingTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = filters.listingType === type.value;
                return (
                  <button
                    key={type.value}
                    className={cn(
                      "flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 w-full text-left",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-background/80 text-foreground border border-border/50 hover:border-primary/50 hover:bg-accent"
                    )}
                    onClick={() => handleFilterChange('listingType', type.value)}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Filters Badge */}
            {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length > 0 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs h-5 sm:h-6 px-2 mt-auto">
                {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length} Active
              </Badge>
            )}
          </div>

          {/* Right Content - Tabs in Landscape */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Tabs defaultValue="property" className="flex-1 flex flex-col overflow-hidden">
              {/* Tab List - Horizontal Landscape Style */}
              <div className="px-3 sm:px-4 pt-3 shrink-0 border-b border-border/20">
                <TabsList className="w-full h-9 sm:h-10 p-1 bg-muted/50 rounded-xl border border-border/30">
                  <TabsTrigger 
                    value="property" 
                    className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{currentText.propertyDetails}</span>
                    <span className="sm:hidden">Property</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="price" 
                    className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{currentText.priceAndArea}</span>
                    <span className="sm:hidden">Price</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{currentText.features}</span>
                    <span className="sm:hidden">Features</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content - Scrollable Landscape Grid */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 lg:px-6 py-3 sm:py-4"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* Property Details Tab - Landscape Grid Layout */}
                <TabsContent value="property" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Property Type */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.propertyType}</Label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <button
                            className={cn(
                              "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                              filters.propertyType === 'all' 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50 hover:bg-accent"
                            )}
                            onClick={() => handleFilterChange('propertyType', 'all')}
                          >
                            {currentText.any}
                          </button>
                          {propertyTypes.map((type) => (
                            <button
                              key={type.value}
                              className={cn(
                                "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                                filters.propertyType === type.value 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50 hover:bg-accent"
                              )}
                              onClick={() => handleFilterChange('propertyType', type.value)}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bedrooms */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.bedrooms}</Label>
                        <div className="flex gap-1">
                          {['all', '1', '2', '3', '4', '5'].map((num) => (
                            <button
                              key={num}
                              className={cn(
                                "flex-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                                filters.bedrooms === num 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50"
                              )}
                              onClick={() => handleFilterChange('bedrooms', num)}
                            >
                              {num === 'all' ? 'Any' : `${num}+`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Bathrooms */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.bathrooms}</Label>
                        <div className="flex gap-1">
                          {['all', '1', '2', '3', '4'].map((num) => (
                            <button
                              key={num}
                              className={cn(
                                "flex-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                                filters.bathrooms === num 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50"
                              )}
                              onClick={() => handleFilterChange('bathrooms', num)}
                            >
                              {num === 'all' ? 'Any' : `${num}+`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rental Duration - Only for Rent */}
                      {filters.listingType === 'rent' && (
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.rentalDuration}</Label>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <button
                              className={cn(
                                "px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                                filters.rentalDuration === 'all' 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50"
                              )}
                              onClick={() => handleFilterChange('rentalDuration', 'all')}
                            >
                              {currentText.any}
                            </button>
                            {rentalDurations.map((duration) => (
                              <button
                                key={duration.value}
                                className={cn(
                                  "px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                                  filters.rentalDuration === duration.value 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50"
                                )}
                                onClick={() => handleFilterChange('rentalDuration', duration.value)}
                              >
                                {duration.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Price & Area Tab - Landscape Grid */}
                <TabsContent value="price" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.priceRange}</Label>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value)}
                        max={10000000000}
                        min={0}
                        step={100000000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-muted/50 rounded-lg border border-border/30">{formatPrice(filters.priceRange[0])}</span>
                        <span className="px-2 py-1 bg-muted/50 rounded-lg border border-border/30">{formatPrice(filters.priceRange[1])}</span>
                      </div>
                    </div>

                    {/* Area Range */}
                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.areaRange}</Label>
                      <Slider
                        value={filters.areaRange}
                        onValueChange={(value) => handleFilterChange('areaRange', value)}
                        max={1000}
                        min={0}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-muted/50 rounded-lg border border-border/30">{filters.areaRange[0]} sqm</span>
                        <span className="px-2 py-1 bg-muted/50 rounded-lg border border-border/30">{filters.areaRange[1]} sqm</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Features Tab - Landscape Grid */}
                <TabsContent value="features" className="mt-0">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-foreground">{currentText.features}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                      {availableFeatures.map((feature) => {
                        const isSelected = filters.features.includes(feature);
                        return (
                          <button
                            key={feature}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 active:scale-95",
                              isSelected 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50 hover:bg-accent"
                            )}
                            onClick={() => handleFeatureToggle(feature)}
                          >
                            {currentText[feature as keyof typeof currentText]}
                            {isSelected && <X className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Compact Footer */}
        <DialogFooter className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 shrink-0 border-t border-border/30 bg-muted/20">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters} 
            className="h-8 text-xs px-3 text-muted-foreground hover:text-foreground"
          >
            {currentText.clearFilters}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)} 
              className="h-8 text-xs px-4"
            >
              {currentText.cancel}
            </Button>
            <Button 
              size="sm"
              onClick={handleApply} 
              className="h-8 text-xs px-5 font-medium shadow-sm"
            >
              {currentText.apply}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilters;
