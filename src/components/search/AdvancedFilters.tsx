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
  language: "en" | "id" | "zh" | "ja" | "ko";
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

  const currentText = text[language] || text.en;

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

  // Compact chip button style helper
  const chipClass = (isSelected: boolean) => cn(
    "px-2 py-1 rounded-md text-[10px] font-semibold transition-all duration-150 active:scale-95 border",
    isSelected
      ? "bg-primary text-primary-foreground border-primary/50 shadow-sm"
      : "bg-primary/5 dark:bg-primary/10 text-foreground border-primary/15 hover:bg-primary hover:text-primary-foreground hover:border-primary/50"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[96vw] !max-w-[1800px] max-h-[75vh] sm:max-h-[80vh] p-0 flex flex-col bg-card/95 dark:bg-card/90 backdrop-blur-2xl rounded-2xl border border-primary/20 dark:border-primary/15 shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        style={{ width: '96vw', maxWidth: '1800px' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Landscape Layout Container */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Listing Type */}
          <div className="w-32 sm:w-40 lg:w-48 shrink-0 border-r border-primary/10 p-2.5 sm:p-3 bg-primary/5 dark:bg-primary/10 overflow-y-auto flex flex-col">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="h-6 w-6 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <DialogTitle className="text-[11px] sm:text-xs font-bold">{currentText.advancedFilters}</DialogTitle>
            </div>
            
            <Label className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">{currentText.selectListingType}</Label>
            <div className="flex flex-col gap-1">
              {listingTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = filters.listingType === type.value;
                return (
                  <button
                    key={type.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-150 active:scale-95 w-full text-left border",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary/50 shadow-md" 
                        : "bg-card/70 dark:bg-card/50 text-foreground border-primary/15 hover:bg-primary hover:text-primary-foreground hover:border-primary/50"
                    )}
                    onClick={() => handleFilterChange('listingType', type.value)}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Filters Badge */}
            {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length > 0 && (
              <Badge variant="secondary" className="text-[9px] h-5 px-1.5 mt-auto bg-primary/10 border-primary/20">
                {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length} Active
              </Badge>
            )}
          </div>

          {/* Right Content - Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Tabs defaultValue="property" className="flex-1 flex flex-col overflow-hidden">
              {/* Tab List */}
              <div className="px-2.5 sm:px-3 pt-2.5 shrink-0 border-b border-primary/10">
                <TabsList className="w-full h-8 p-0.5 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/15">
                  <TabsTrigger 
                    value="property" 
                    className="flex-1 h-full rounded-md text-[10px] sm:text-xs font-semibold gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Home className="h-3 w-3" />
                    <span className="hidden sm:inline">{currentText.propertyDetails}</span>
                    <span className="sm:hidden">Property</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="price" 
                    className="flex-1 h-full rounded-md text-[10px] sm:text-xs font-semibold gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <DollarSign className="h-3 w-3" />
                    <span className="hidden sm:inline">{currentText.priceAndArea}</span>
                    <span className="sm:hidden">Price</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="flex-1 h-full rounded-md text-[10px] sm:text-xs font-semibold gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="hidden sm:inline">{currentText.features}</span>
                    <span className="sm:hidden">Features</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 sm:px-3 lg:px-5 py-2.5 sm:py-3"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* Property Details Tab */}
                <TabsContent value="property" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {/* Property Type */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.propertyType}</Label>
                        <div className="flex flex-wrap gap-1">
                          <button className={chipClass(filters.propertyType === 'all')} onClick={() => handleFilterChange('propertyType', 'all')}>
                            {currentText.any}
                          </button>
                          {propertyTypes.map((type) => (
                            <button key={type.value} className={chipClass(filters.propertyType === type.value)} onClick={() => handleFilterChange('propertyType', type.value)}>
                              {type.label}
                            </button>
                          ))
                          }
                        </div>
                      </div>

                      {/* Bedrooms */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.bedrooms}</Label>
                        <div className="flex gap-1">
                          {['all', '1', '2', '3', '4', '5'].map((num) => (
                            <button key={num} className={cn(chipClass(filters.bedrooms === num), "flex-1 text-center")} onClick={() => handleFilterChange('bedrooms', num)}>
                              {num === 'all' ? 'Any' : `${num}+`}
                            </button>
                          ))
                          }
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {/* Bathrooms */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.bathrooms}</Label>
                        <div className="flex gap-1">
                          {['all', '1', '2', '3', '4'].map((num) => (
                            <button key={num} className={cn(chipClass(filters.bathrooms === num), "flex-1 text-center")} onClick={() => handleFilterChange('bathrooms', num)}>
                              {num === 'all' ? 'Any' : `${num}+`}
                            </button>
                          ))
                          }
                        </div>
                      </div>

                      {/* Rental Duration - Only for Rent */}
                      {filters.listingType === 'rent' && (
                        <div className="space-y-1.5">
                          <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.rentalDuration}</Label>
                          <div className="flex flex-wrap gap-1">
                            <button className={chipClass(filters.rentalDuration === 'all')} onClick={() => handleFilterChange('rentalDuration', 'all')}>
                              {currentText.any}
                            </button>
                            {rentalDurations.map((duration) => (
                              <button key={duration.value} className={chipClass(filters.rentalDuration === duration.value)} onClick={() => handleFilterChange('rentalDuration', duration.value)}>
                                {duration.label}
                              </button>
                            ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Price & Area Tab */}
                <TabsContent value="price" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
                    {/* Price Range */}
                    <div className="space-y-2.5">
                      <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.priceRange}</Label>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value)}
                        max={10000000000}
                        min={0}
                        step={100000000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground">
                        <span className="px-1.5 py-0.5 bg-primary/5 rounded-md border border-primary/15 font-semibold">{formatPrice(filters.priceRange[0])}</span>
                        <span className="px-1.5 py-0.5 bg-primary/5 rounded-md border border-primary/15 font-semibold">{formatPrice(filters.priceRange[1])}</span>
                      </div>
                    </div>

                    {/* Area Range */}
                    <div className="space-y-2.5">
                      <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.areaRange}</Label>
                      <Slider
                        value={filters.areaRange}
                        onValueChange={(value) => handleFilterChange('areaRange', value)}
                        max={1000}
                        min={0}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground">
                        <span className="px-1.5 py-0.5 bg-primary/5 rounded-md border border-primary/15 font-semibold">{filters.areaRange[0]} sqm</span>
                        <span className="px-1.5 py-0.5 bg-primary/5 rounded-md border border-primary/15 font-semibold">{filters.areaRange[1]} sqm</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="mt-0">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-bold text-foreground">{currentText.features}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                      {availableFeatures.map((feature) => {
                        const isSelected = filters.features.includes(feature);
                        return (
                          <button
                            key={feature}
                            className={cn(
                              chipClass(isSelected),
                              "inline-flex items-center justify-center gap-1 py-1.5"
                            )}
                            onClick={() => handleFeatureToggle(feature)}
                          >
                            {currentText[feature as keyof typeof currentText]}
                            {isSelected && <X className="h-2.5 w-2.5" />}
                          </button>
                        );
                      })
                      }
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Compact Footer */}
        <DialogFooter className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 shrink-0 border-t border-primary/10 bg-primary/5 dark:bg-primary/10">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters} 
            className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground"
          >
            {currentText.clearFilters}
          </Button>
          <div className="flex gap-1.5">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)} 
              className="h-7 text-[10px] px-3 border-primary/20"
            >
              {currentText.cancel}
            </Button>
            <Button 
              size="sm"
              onClick={handleApply} 
              className="h-7 text-[10px] px-4 font-bold shadow-sm"
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
