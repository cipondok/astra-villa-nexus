import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import { SlidersHorizontal, X, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface AdvancedFiltersDialogProps {
  language: "en" | "id";
  listingType: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  onFiltersChange: (filters: {
    listingType: string;
    priceRange: string;
    bedrooms: string;
    bathrooms: string;
  }) => void;
}

const AdvancedFiltersDialog = ({
  language,
  listingType: initialListingType,
  priceRange: initialPriceRange,
  bedrooms: initialBedrooms,
  bathrooms: initialBathrooms,
  onFiltersChange,
}: AdvancedFiltersDialogProps) => {
  const [open, setOpen] = useState(false);
  const [listingType, setListingType] = useState(initialListingType);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000000);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [bathrooms, setBathrooms] = useState(initialBathrooms);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [listingTypeCollapsed, setListingTypeCollapsed] = useState(false);
  const [initialState, setInitialState] = useState({
    listingType: initialListingType,
    minPrice: 0,
    maxPrice: 10000000000,
    bedrooms: initialBedrooms,
    bathrooms: initialBathrooms,
  });

  const text = {
    en: {
      title: "Advanced Filters",
      subtitle: "Refine your property search",
      listingType: "Listing Type",
      forSale: "For Sale",
      forRent: "For Rent",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      apply: "Apply Filters",
      clear: "Clear All",
      cancel: "Cancel",
      activeFilters: "Active",
      any: "Any",
      validationWarning: "Validation Warning",
      filtersApplied: "Filters applied successfully!",
    },
    id: {
      title: "Filter Lanjutan",
      subtitle: "Persempit pencarian properti Anda",
      listingType: "Tipe Listing",
      forSale: "Dijual",
      forRent: "Disewa",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      apply: "Terapkan Filter",
      clear: "Hapus Semua",
      cancel: "Batal",
      activeFilters: "Aktif",
      any: "Semua",
      validationWarning: "Peringatan Validasi",
      filtersApplied: "Filter berhasil diterapkan!",
    },
  };

  const currentText = text[language];

  const listingTypeOptions = [
    { value: "", label: currentText.any },
    { value: "sale", label: `💵 ${currentText.forSale}` },
    { value: "rent", label: `🏠 ${currentText.forRent}` },
  ];

  const bedroomOptions = [
    { value: "", label: currentText.any },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5+", label: "5+" },
  ];

  const bathroomOptions = [
    { value: "", label: currentText.any },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const formatPrice = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)}M`;
    }
    return `Rp ${value.toLocaleString()}`;
  };

  // Validation logic
  const validateFilters = () => {
    const warnings: string[] = [];

    // Price range validation
    if (minPrice >= maxPrice) {
      warnings.push(
        language === "en"
          ? "Minimum price must be less than maximum price"
          : "Harga minimum harus lebih kecil dari harga maksimum"
      );
    }

    // Rental properties with very high prices warning
    if (listingType === "rent" && maxPrice > 5000000000) {
      warnings.push(
        language === "en"
          ? "Rental properties typically have lower price ranges. Consider adjusting."
          : "Properti sewa biasanya memiliki rentang harga lebih rendah. Pertimbangkan untuk menyesuaikan."
      );
    }

    // Sale properties with very low prices warning
    if (listingType === "sale" && maxPrice < 100000000 && maxPrice !== 10000000000) {
      warnings.push(
        language === "en"
          ? "Sale properties typically have higher price ranges. Consider adjusting."
          : "Properti jual biasanya memiliki rentang harga lebih tinggi. Pertimbangkan untuk menyesuaikan."
      );
    }

    // Bedroom/bathroom ratio validation
    if (bedrooms && bathrooms && parseInt(bathrooms.replace('+', '')) > parseInt(bedrooms.replace('+', '')) + 1) {
      warnings.push(
        language === "en"
          ? "More bathrooms than bedrooms is uncommon. Double check your selection."
          : "Lebih banyak kamar mandi daripada kamar tidur tidak umum. Periksa kembali pilihan Anda."
      );
    }

    setValidationWarnings(warnings);
    return warnings;
  };

  // Validate on filter changes
  useEffect(() => {
    if (open) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        validateFilters();
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [listingType, minPrice, maxPrice, bedrooms, bathrooms, open]);

  const handleApply = () => {
    const warnings = validateFilters();
    
    // Allow applying even with warnings, but show them
    if (warnings.length > 0) {
      toast({
        title: currentText.validationWarning,
        description: warnings[0],
        variant: "warning",
      });
    } else {
      toast({
        title: currentText.filtersApplied,
        description: language === "en" 
          ? "Your search filters have been updated." 
          : "Filter pencarian Anda telah diperbarui.",
        variant: "success",
      });
    }

    const priceRangeString = `${minPrice}-${maxPrice}`;
    onFiltersChange({
      listingType,
      priceRange: minPrice === 0 && maxPrice === 10000000000 ? "" : priceRangeString,
      bedrooms,
      bathrooms,
    });
    
    // Update initial state after applying
    setInitialState({
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
    });
    
    setOpen(false);
  };

  const handleCancel = () => {
    // Reset to initial state when canceling
    setListingType(initialState.listingType);
    setMinPrice(initialState.minPrice);
    setMaxPrice(initialState.maxPrice);
    setBedrooms(initialState.bedrooms);
    setBathrooms(initialState.bathrooms);
    setValidationWarnings([]);
    setOpen(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset to initial state when closing dialog
      setListingType(initialState.listingType);
      setMinPrice(initialState.minPrice);
      setMaxPrice(initialState.maxPrice);
      setBedrooms(initialState.bedrooms);
      setBathrooms(initialState.bathrooms);
      setValidationWarnings([]);
    } else {
      // Store current state when opening
      setInitialState({
        listingType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
      });
    }
    setOpen(isOpen);
  };

  const handleClear = () => {
    setListingType("");
    setMinPrice(0);
    setMaxPrice(10000000000);
    setBedrooms("");
    setBathrooms("");
    setValidationWarnings([]);
    toast({
      title: language === "en" ? "Filters Cleared" : "Filter Dihapus",
      description: language === "en" 
        ? "All filters have been reset." 
        : "Semua filter telah direset.",
    });
  };

  const activeFilterCount = [
    listingType,
    minPrice !== 0 || maxPrice !== 10000000000,
    bedrooms,
    bathrooms,
  ].filter(Boolean).length;

  useEffect(() => {
    setListingType(initialListingType);
    setBedrooms(initialBedrooms);
    setBathrooms(initialBathrooms);
  }, [initialListingType, initialBedrooms, initialBathrooms]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative h-12 bg-binance-gray border-binance-light-gray text-binance-white hover:bg-binance-light-gray hover:border-binance-orange transition-all duration-300"
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{currentText.title}</span>
          <span className="sm:hidden">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-binance-orange text-white border-0 animate-pulse">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-binance-dark-gray border-binance-light-gray text-binance-white p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-gradient-to-r from-binance-orange to-yellow-500 px-6 py-3"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </motion.div>
              {currentText.title}
            </DialogTitle>
          </DialogHeader>
        </motion.div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Validation Warnings */}
          <AnimatePresence mode="wait">
            {validationWarnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {warning}
                        </motion.li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            {validationWarnings.length === 0 && !isValidating && activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-green-500/10 border-green-500/50 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {language === "en" 
                      ? "Your filters look good! Ready to apply." 
                      : "Filter Anda terlihat bagus! Siap diterapkan."}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listing Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button
              onClick={() => setListingTypeCollapsed(!listingTypeCollapsed)}
              className="w-full text-sm font-semibold text-binance-orange flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2">
                💰 {currentText.listingType}
                {listingType && listingTypeCollapsed && (
                  <Badge variant="secondary" className="text-xs">
                    {listingTypeOptions.find(opt => opt.value === listingType)?.label}
                  </Badge>
                )}
              </span>
              {listingTypeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {!listingTypeCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <PillToggleGroup
                    options={listingTypeOptions}
                    value={listingType}
                    onChange={(value) => {
                      const newValue = typeof value === 'string' ? value : value[0] || '';
                      setListingType(newValue);
                      if (newValue) {
                        setListingTypeCollapsed(true);
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Price Range */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
                💸 {currentText.priceRange}
              </label>
              <motion.span
                key={`${minPrice}-${maxPrice}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs text-binance-light-gray"
              >
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </motion.span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-binance-light-gray mb-2 block">Min Price</label>
                <Slider
                  value={[minPrice]}
                  onValueChange={(value) => setMinPrice(value[0])}
                  min={0}
                  max={10000000000}
                  step={100000000}
                  className="w-full transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-xs text-binance-light-gray mb-2 block">Max Price</label>
                <Slider
                  value={[maxPrice]}
                  onValueChange={(value) => setMaxPrice(value[0])}
                  min={0}
                  max={10000000000}
                  step={100000000}
                  className="w-full transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>

          {/* Bedrooms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
              🛏️ {currentText.bedrooms}
            </label>
            <PillToggleGroup
              options={bedroomOptions}
              value={bedrooms}
              onChange={(value) => setBedrooms(typeof value === 'string' ? value : value[0] || '')}
            />
          </motion.div>

          {/* Bathrooms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
              🚿 {currentText.bathrooms}
            </label>
            <PillToggleGroup
              options={bathroomOptions}
              value={bathrooms}
              onChange={(value) => setBathrooms(typeof value === 'string' ? value : value[0] || '')}
            />
          </motion.div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-binance-light-gray bg-binance-gray px-4 py-2 flex gap-2"
        >
          <Button
            variant="outline"
            onClick={handleClear}
            className="h-8 text-xs border-binance-light-gray text-binance-white hover:bg-binance-light-gray transition-all duration-200 hover:scale-105"
          >
            <X className="h-3 w-3 mr-1" />
            {currentText.clear}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-8 text-xs border-binance-light-gray text-binance-white hover:bg-binance-light-gray transition-all duration-200 hover:scale-105"
          >
            {currentText.cancel}
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-8 text-xs bg-gradient-to-r from-binance-orange to-yellow-500 hover:from-yellow-500 hover:to-binance-orange text-white font-semibold shadow-lg hover:shadow-binance-orange/50 transition-all duration-300 hover:scale-105"
          >
            {currentText.apply}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFiltersDialog;
