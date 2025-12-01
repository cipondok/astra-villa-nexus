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
        className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] sm:max-h-[90vh] p-0 flex flex-col bg-background rounded-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between border-b border-border px-3 sm:px-6 py-2 sm:py-4 shrink-0 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15">
          <div>
            <DialogTitle className="text-sm sm:text-lg font-bold">{currentText.advancedFilters}</DialogTitle>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Refine your property search</p>
          </div>
          <Badge variant="secondary" className="text-[9px] sm:text-xs font-semibold h-5 sm:h-6 px-1.5 sm:px-2">
            {Object.values(filters).filter(v => v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length} Active
          </Badge>
        </div>

        {/* Listing Type Selection - Compact */}
        <div className="px-2 sm:px-6 pt-2 sm:pt-4 pb-2 sm:pb-3 border-b border-border/50 bg-muted/20">
          <Label className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-3 block">{currentText.selectListingType}</Label>
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {listingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={filters.listingType === type.value ? "default" : "outline"}
                  className={cn(
                    "h-auto py-1.5 sm:py-3 px-1 sm:px-2 flex flex-col items-center gap-0.5 sm:gap-1.5 transition-all text-[9px] sm:text-xs",
                    filters.listingType === type.value && "ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 shadow-md"
                  )}
                  onClick={() => handleFilterChange('listingType', type.value)}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  <span className="font-semibold truncate">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Tabbed Filters - Compact */}
        <div className="flex-1 overflow-hidden px-2 sm:px-6 pt-2 sm:pt-3">
          <Tabs defaultValue="property" className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-3 h-7 sm:h-10 bg-muted/30 mb-2 sm:mb-3">
              <TabsTrigger value="property" className="text-[9px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 sm:px-3">
                <Home className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1.5" />
                <span className="hidden xs:inline">{currentText.propertyDetails}</span>
                <span className="xs:hidden">Property</span>
              </TabsTrigger>
              <TabsTrigger value="price" className="text-[9px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 sm:px-3">
                <DollarSign className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1.5" />
                <span className="hidden xs:inline">{currentText.priceAndArea}</span>
                <span className="xs:hidden">Price</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="text-[9px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 sm:px-3">
                <Sparkles className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1.5" />
                <span className="hidden xs:inline">{currentText.features}</span>
                <span className="xs:hidden">Features</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto overscroll-contain pb-2 sm:pb-3"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Property Details Tab */}
              <TabsContent value="property" className="mt-0 space-y-2 sm:space-y-4">
                {/* Property Type */}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.propertyType}</Label>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={filters.propertyType === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                      onClick={() => handleFilterChange('propertyType', 'all')}
                    >
                      {currentText.any}
                    </Badge>
                    {propertyTypes.map((type) => (
                      <Badge
                        key={type.value}
                        variant={filters.propertyType === type.value ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('propertyType', type.value)}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.bedrooms}</Label>
                  <div className="flex flex-wrap gap-1">
                    {['all', '1', '2', '3', '4', '5'].map((num) => (
                      <Badge
                        key={num}
                        variant={filters.bedrooms === num ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('bedrooms', num)}
                      >
                        {num === 'all' ? currentText.any : `${num}+`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.bathrooms}</Label>
                  <div className="flex flex-wrap gap-1">
                    {['all', '1', '2', '3', '4'].map((num) => (
                      <Badge
                        key={num}
                        variant={filters.bathrooms === num ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('bathrooms', num)}
                      >
                        {num === 'all' ? currentText.any : `${num}+`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rental Duration - Only for Rent */}
                {filters.listingType === 'rent' && (
                  <div className="space-y-1 sm:space-y-2 pt-2 sm:pt-3 border-t border-border/50">
                    <Label className="text-[10px] sm:text-xs font-semibold">{currentText.rentalDuration}</Label>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={filters.rentalDuration === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('rentalDuration', 'all')}
                      >
                        {currentText.any}
                      </Badge>
                      {rentalDurations.map((duration) => (
                        <Badge
                          key={duration.value}
                          variant={filters.rentalDuration === duration.value ? 'default' : 'outline'}
                          className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                          onClick={() => handleFilterChange('rentalDuration', duration.value)}
                        >
                          {duration.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Price & Area Tab */}
              <TabsContent value="price" className="mt-0 space-y-2 sm:space-y-4">
                {/* Price Range */}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.priceRange}</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                    max={10000000000}
                    min={0}
                    step={100000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>

                {/* Area Range */}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.areaRange}</Label>
                  <Slider
                    value={filters.areaRange}
                    onValueChange={(value) => handleFilterChange('areaRange', value)}
                    max={1000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground">
                    <span>{filters.areaRange[0]} sqm</span>
                    <span>{filters.areaRange[1]} sqm</span>
                  </div>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs font-semibold">{currentText.features}</Label>
                  <div className="flex flex-wrap gap-1">
                    {availableFeatures.map((feature) => (
                      <Badge
                        key={feature}
                        variant={filters.features.includes(feature) ? "default" : "outline"}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-7 active:scale-95 transition-transform"
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        {currentText[feature as keyof typeof currentText]}
                        {filters.features.includes(feature) && (
                          <X className="h-2 w-2 sm:h-2.5 sm:w-2.5 ml-0.5 sm:ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Compact Footer */}
        <DialogFooter className="flex gap-1.5 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 shrink-0 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={clearFilters} className="h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3">
            {currentText.clearFilters}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3">
            {currentText.cancel}
          </Button>
          <Button onClick={handleApply} className="flex-1 h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3 font-semibold">
            {currentText.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilters;
