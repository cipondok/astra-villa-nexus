import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import { SlidersHorizontal, X } from "lucide-react";

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

  const handleApply = () => {
    const priceRangeString = `${minPrice}-${maxPrice}`;
    onFiltersChange({
      listingType,
      priceRange: minPrice === 0 && maxPrice === 10000000000 ? "" : priceRangeString,
      bedrooms,
      bathrooms,
    });
    setOpen(false);
  };

  const handleClear = () => {
    setListingType("");
    setMinPrice(0);
    setMaxPrice(10000000000);
    setBedrooms("");
    setBathrooms("");
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
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="bg-gradient-to-r from-binance-orange to-yellow-500 px-6 py-3">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              {currentText.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Listing Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
              💰 {currentText.listingType}
            </label>
            <PillToggleGroup
              options={listingTypeOptions}
              value={listingType}
              onChange={(value) => setListingType(typeof value === 'string' ? value : value[0] || '')}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
                💸 {currentText.priceRange}
              </label>
              <span className="text-xs text-binance-light-gray">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </span>
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
              🛏️ {currentText.bedrooms}
            </label>
            <PillToggleGroup
              options={bedroomOptions}
              value={bedrooms}
              onChange={(value) => setBedrooms(typeof value === 'string' ? value : value[0] || '')}
            />
          </div>

          {/* Bathrooms */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-binance-orange flex items-center gap-2">
              🚿 {currentText.bathrooms}
            </label>
            <PillToggleGroup
              options={bathroomOptions}
              value={bathrooms}
              onChange={(value) => setBathrooms(typeof value === 'string' ? value : value[0] || '')}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-binance-light-gray bg-binance-gray px-4 py-2 flex gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="h-8 text-xs border-binance-light-gray text-binance-white hover:bg-binance-light-gray"
          >
            <X className="h-3 w-3 mr-1" />
            {currentText.clear}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-8 text-xs border-binance-light-gray text-binance-white hover:bg-binance-light-gray"
          >
            {currentText.cancel}
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-8 text-xs bg-gradient-to-r from-binance-orange to-yellow-500 hover:from-yellow-500 hover:to-binance-orange text-white font-semibold shadow-lg hover:shadow-binance-orange/50 transition-all duration-300"
          >
            {currentText.apply}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFiltersDialog;
