import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
      sale: "For Sale",
      rent: "For Rent",
      lease: "For Lease",
      any: "Any",
      pool: "Swimming Pool",
      garage: "Garage",
      garden: "Garden",
      balcony: "Balcony",
      furnished: "Furnished",
      aircon: "Air Conditioning",
      security: "Security",
      gym: "Gym"
    },
    id: {
      advancedFilters: "Filter Lanjutan",
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
      sale: "Dijual",
      rent: "Disewa",
      lease: "Disewakan",
      any: "Semua",
      pool: "Kolam Renang",
      garage: "Garasi",
      garden: "Taman",
      balcony: "Balkon",
      furnished: "Furnished",
      aircon: "AC",
      security: "Keamanan",
      gym: "Gym"
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
    { value: 'sale', label: currentText.sale },
    { value: 'rent', label: currentText.rent },
    { value: 'lease', label: currentText.lease },
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
      propertyType: 'all',
      listingType: 'all',
      priceRange: [0, 10000000000],
      bedrooms: 'all',
      bathrooms: 'all',
      areaRange: [0, 1000],
      location: '',
      features: [],
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
        className="max-w-2xl max-h-[90vh] p-3 sm:p-4 flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-1.5 shrink-0">
          <DialogTitle className="text-xs sm:text-sm font-semibold">{currentText.advancedFilters}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto overscroll-contain"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="space-y-2 sm:space-y-2.5 pb-2">
          {/* Property Type */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between cursor-pointer py-0.5"
              onClick={() => toggleSection('propertyType')}
            >
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.propertyType}</Label>
              {expandedSections.propertyType ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
            <AnimatePresence>
              {expandedSections.propertyType && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-wrap gap-1 sm:gap-1.5"
                  >
                    <Badge
                      variant={filters.propertyType === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFilterChange('propertyType', 'all');
                      }}
                    >
                    {currentText.any}
                  </Badge>
                  {propertyTypes.map((type) => (
                    <Badge
                      key={type.value}
                      variant={filters.propertyType === type.value ? 'default' : 'outline'}
                      className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFilterChange('propertyType', type.value);
                      }}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Listing Type */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between cursor-pointer py-0.5"
              onClick={() => toggleSection('listingType')}
            >
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.listingType}</Label>
              {expandedSections.listingType ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
            <AnimatePresence>
              {expandedSections.listingType && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap gap-1 sm:gap-1.5"
                >
                  <Badge
                    variant={filters.listingType === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                    onClick={() => handleFilterChange('listingType', 'all')}
                  >
                    {currentText.any}
                  </Badge>
                  {listingTypes.map((type) => (
                    <Badge
                      key={type.value}
                      variant={filters.listingType === type.value ? 'default' : 'outline'}
                      className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                      onClick={() => handleFilterChange('listingType', type.value)}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <div 
                className="flex items-center justify-between cursor-pointer py-0.5"
                onClick={() => toggleSection('rooms')}
              >
                <Label className="text-[10px] sm:text-xs font-medium">{currentText.bedrooms}</Label>
                {expandedSections.rooms ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </div>
              <AnimatePresence>
                {expandedSections.rooms && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-wrap gap-1"
                  >
                    {['all', '1', '2', '3', '4', '5'].map((num) => (
                      <Badge
                        key={num}
                        variant={filters.bedrooms === num ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('bedrooms', num)}
                      >
                        {num === 'all' ? currentText.any : `${num}+`}
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.bathrooms}</Label>
              <AnimatePresence>
                {expandedSections.rooms && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-wrap gap-1"
                  >
                    {['all', '1', '2', '3', '4'].map((num) => (
                      <Badge
                        key={num}
                        variant={filters.bathrooms === num ? 'default' : 'outline'}
                        className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                        onClick={() => handleFilterChange('bathrooms', num)}
                      >
                        {num === 'all' ? currentText.any : `${num}+`}
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between cursor-pointer py-0.5"
              onClick={() => toggleSection('price')}
            >
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.priceRange}</Label>
              {expandedSections.price ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
            <AnimatePresence>
              {expandedSections.price && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                    max={10000000000}
                    min={0}
                    step={100000000}
                    className="w-full h-1"
                  />
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Area Range */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between cursor-pointer py-0.5"
              onClick={() => toggleSection('area')}
            >
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.areaRange}</Label>
              {expandedSections.area ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
            <AnimatePresence>
              {expandedSections.area && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Slider
                    value={filters.areaRange}
                    onValueChange={(value) => handleFilterChange('areaRange', value)}
                    max={1000}
                    min={0}
                    step={50}
                    className="w-full h-1"
                  />
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                    <span>{filters.areaRange[0]} sqm</span>
                    <span>{filters.areaRange[1]} sqm</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Features */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between cursor-pointer py-0.5"
              onClick={() => toggleSection('features')}
            >
              <Label className="text-[10px] sm:text-xs font-medium">{currentText.features}</Label>
              {expandedSections.features ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
            <AnimatePresence>
              {expandedSections.features && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap gap-1 sm:gap-1.5"
                >
                  {availableFeatures.map((feature) => (
                    <Badge
                      key={feature}
                      variant={filters.features.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer text-[9px] sm:text-[10px] px-1.5 py-0.5 h-5 sm:h-6 min-h-0 active:scale-95 transition-transform"
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      {currentText[feature as keyof typeof currentText]}
                      {filters.features.includes(feature) && (
                        <X className="h-2.5 w-2.5 ml-0.5" />
                      )}
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
        
        <DialogFooter className="flex gap-1.5 sm:gap-2 pt-2 shrink-0 border-t border-border/50 mt-2">
          <Button variant="outline" onClick={clearFilters} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
            {currentText.clearFilters}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
            {currentText.cancel}
          </Button>
          <Button onClick={handleApply} className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
            {currentText.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilters;
