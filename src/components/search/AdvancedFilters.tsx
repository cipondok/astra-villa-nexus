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
        className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[85vh] sm:max-h-[90vh] p-0 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Modern Header - Google-style */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{currentText.advancedFilters}</DialogTitle>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Refine your property search</p>
            </div>
          </div>
          {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length > 0 && (
            <Badge className="bg-primary/10 text-primary border-0 text-[10px] sm:text-xs font-medium h-6 sm:h-7 px-2 sm:px-3">
              {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length} Active
            </Badge>
          )}
        </div>

        {/* Listing Type Selection - Modern Pill Style */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
          <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{currentText.selectListingType}</Label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {listingTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = filters.listingType === type.value;
              return (
                <button
                  key={type.value}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
                    "border-2 active:scale-95",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  onClick={() => handleFilterChange('listingType', type.value)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tabbed Filters - Modern Style */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 pt-4 sm:pt-5">
          <Tabs defaultValue="property" className="h-full flex flex-col">
            <TabsList className="w-full h-10 sm:h-11 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger value="property" className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                <Home className="h-4 w-4 mr-1.5" />
                <span className="hidden xs:inline">{currentText.propertyDetails}</span>
                <span className="xs:hidden">Property</span>
              </TabsTrigger>
              <TabsTrigger value="price" className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                <DollarSign className="h-4 w-4 mr-1.5" />
                <span className="hidden xs:inline">{currentText.priceAndArea}</span>
                <span className="xs:hidden">Price</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex-1 h-full rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span className="hidden xs:inline">{currentText.features}</span>
                <span className="xs:hidden">Features</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto overscroll-contain pb-4"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Property Details Tab */}
              <TabsContent value="property" className="mt-0 space-y-5">
                {/* Property Type - Modern Chips */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.propertyType}</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={cn(
                        "px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                        filters.propertyType === 'all' 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                      )}
                      onClick={() => handleFilterChange('propertyType', 'all')}
                    >
                      {currentText.any}
                    </button>
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        className={cn(
                          "px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                          filters.propertyType === type.value 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        )}
                        onClick={() => handleFilterChange('propertyType', type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms - Modern Chips */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.bedrooms}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['all', '1', '2', '3', '4', '5'].map((num) => (
                      <button
                        key={num}
                        className={cn(
                          "w-12 h-10 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                          filters.bedrooms === num 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        )}
                        onClick={() => handleFilterChange('bedrooms', num)}
                      >
                        {num === 'all' ? 'Any' : `${num}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms - Modern Chips */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.bathrooms}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['all', '1', '2', '3', '4'].map((num) => (
                      <button
                        key={num}
                        className={cn(
                          "w-12 h-10 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                          filters.bathrooms === num 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
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
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.rentalDuration}</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={cn(
                          "px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                          filters.rentalDuration === 'all' 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        )}
                        onClick={() => handleFilterChange('rentalDuration', 'all')}
                      >
                        {currentText.any}
                      </button>
                      {rentalDurations.map((duration) => (
                        <button
                          key={duration.value}
                          className={cn(
                            "px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                            filters.rentalDuration === duration.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                          )}
                          onClick={() => handleFilterChange('rentalDuration', duration.value)}
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Price & Area Tab */}
              <TabsContent value="price" className="mt-0 space-y-6">
                {/* Price Range */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.priceRange}</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                    max={10000000000}
                    min={0}
                    step={100000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{formatPrice(filters.priceRange[0])}</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>

                {/* Area Range */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.areaRange}</Label>
                  <Slider
                    value={filters.areaRange}
                    onValueChange={(value) => handleFilterChange('areaRange', value)}
                    max={1000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{filters.areaRange[0]} sqm</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{filters.areaRange[1]} sqm</span>
                  </div>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentText.features}</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableFeatures.map((feature) => {
                      const isSelected = filters.features.includes(feature);
                      return (
                        <button
                          key={feature}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 active:scale-95",
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
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
        
        {/* Modern Footer */}
        <DialogFooter className="flex gap-3 px-4 sm:px-6 py-4 shrink-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <Button 
            variant="ghost" 
            onClick={clearFilters} 
            className="h-10 text-sm px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {currentText.clearFilters}
          </Button>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="h-10 text-sm px-5 border-gray-200 dark:border-gray-700"
          >
            {currentText.cancel}
          </Button>
          <Button 
            onClick={handleApply} 
            className="h-10 text-sm px-6 font-medium shadow-md"
          >
            {currentText.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilters;
