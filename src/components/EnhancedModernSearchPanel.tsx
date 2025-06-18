
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, X, Home, Building, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchData {
  query: string;
  propertyType: string;
  location: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  furnishing: string;
  has3D: boolean;
}

interface EnhancedModernSearchPanelProps {
  language: string;
  onSearch: (searchData: SearchData) => void;
  onLiveSearch: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: EnhancedModernSearchPanelProps) => {
  const [searchData, setSearchData] = useState<SearchData>({
    query: "",
    propertyType: "",
    location: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    has3D: false
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when filters are open on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showFilters, isMobile]);

  // Auto-close filters on route change or page refresh
  useEffect(() => {
    const handleBeforeUnload = () => setShowFilters(false);
    const handleVisibilityChange = () => {
      if (document.hidden) setShowFilters(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Count active filters - Fixed to properly count non-empty values and 3D checkbox
  useEffect(() => {
    let count = 0;
    
    if (searchData.propertyType && searchData.propertyType.trim() !== "") {
      console.log("✅ Property Type selected:", searchData.propertyType);
      count++;
    }
    if (searchData.location && searchData.location.trim() !== "") {
      console.log("✅ Location selected:", searchData.location);
      count++;
    }
    if (searchData.priceRange && searchData.priceRange.trim() !== "") {
      console.log("✅ Price Range selected:", searchData.priceRange);
      count++;
    }
    if (searchData.bedrooms && searchData.bedrooms.trim() !== "") {
      console.log("✅ Bedrooms selected:", searchData.bedrooms);
      count++;
    }
    if (searchData.bathrooms && searchData.bathrooms.trim() !== "") {
      console.log("✅ Bathrooms selected:", searchData.bathrooms);
      count++;
    }
    if (searchData.furnishing && searchData.furnishing.trim() !== "") {
      console.log("✅ Furnishing selected:", searchData.furnishing);
      count++;
    }
    if (searchData.has3D === true) {
      console.log("✅ 3D Tour selected:", searchData.has3D);
      count++;
    }

    console.log("🔢 ACTIVE FILTERS COUNT:", count, "Filter data:", searchData);
    setActiveFilters(count);
  }, [searchData]);

  const handleInputChange = (field: keyof SearchData, value: string | boolean) => {
    console.log(`🔄 FILTER CHANGE - ${field}:`, value);
    const newSearchData = { ...searchData, [field]: value };
    setSearchData(newSearchData);
    
    // Remove live search - only update query in state
    if (field === 'query' && typeof value === 'string') {
      console.log("📝 Query updated but not searching automatically");
    }
  };

  const handleSearch = () => {
    console.log("🔍 ENHANCED SEARCH PANEL - Sending search data:", searchData);
    onSearch(searchData);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const clearFilter = (field: keyof SearchData) => {
    console.log(`🧹 CLEARING FILTER: ${field}`);
    handleInputChange(field, field === 'has3D' ? false : "");
  };

  const clearAllFilters = () => {
    console.log("🧹 CLEARING ALL FILTERS");
    setSearchData({
      query: searchData.query, // Keep search query
      propertyType: "",
      location: "",
      priceRange: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      has3D: false
    });
  };

  const propertyTypes = [
    { value: "apartment", label: language === "en" ? "Apartment" : "Apartemen" },
    { value: "house", label: language === "en" ? "House" : "Rumah" },
    { value: "villa", label: language === "en" ? "Villa" : "Villa" },
    { value: "condo", label: language === "en" ? "Condo" : "Kondominium" },
    { value: "townhouse", label: language === "en" ? "Townhouse" : "Ruko" }
  ];

  const locations = [
    { value: "DKI Jakarta", label: "DKI Jakarta" },
    { value: "West Java", label: "West Java" },
    { value: "East Java", label: "East Java" },
    { value: "Central Java", label: "Central Java" },
    { value: "Bali", label: "Bali" },
    { value: "North Sumatra", label: "North Sumatra" }
  ];

  const priceRanges = [
    { value: "0-1b", label: language === "en" ? "Under Rp 1B" : "Di bawah Rp 1M" },
    { value: "1b-5b", label: language === "en" ? "Rp 1B - 5B" : "Rp 1M - 5M" },
    { value: "5b+", label: language === "en" ? "Rp 5B+" : "Rp 5M+" }
  ];

  const furnishingOptions = [
    { value: "furnished", label: language === "en" ? "Furnished" : "Berperabotan" },
    { value: "unfurnished", label: language === "en" ? "Unfurnished" : "Tidak Berperabotan" },
    { value: "partial", label: language === "en" ? "Partially Furnished" : "Sebagian Berperabotan" }
  ];

  const bedroomOptions = ["1", "2", "3", "4", "5+"];
  const bathroomOptions = ["1", "2", "3", "4+"];

  return (
    <div className="w-full max-w-6xl mx-auto" ref={containerRef}>
      {/* Backdrop for mobile */}
      {showFilters && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Main Search Bar */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Input
                placeholder={language === "en" ? "Search properties, locations..." : "Cari properti, lokasi..."}
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white text-base"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-4 relative ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {language === "en" ? "Filters" : "Filter"}
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-red-500 text-white">
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              <Button onClick={handleSearch} className="h-12 px-6 bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2" />
                {language === "en" ? "Search" : "Cari"}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {searchData.propertyType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {propertyTypes.find(t => t.value === searchData.propertyType)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('propertyType')} />
                </Badge>
              )}
              {searchData.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locations.find(l => l.value === searchData.location)?.label || searchData.location}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('location')} />
                </Badge>
              )}
              {searchData.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceRanges.find(p => p.value === searchData.priceRange)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('priceRange')} />
                </Badge>
              )}
              {searchData.bedrooms && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {searchData.bedrooms} {language === "en" ? "Bed" : "KT"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('bedrooms')} />
                </Badge>
              )}
              {searchData.bathrooms && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {searchData.bathrooms} {language === "en" ? "Bath" : "KM"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('bathrooms')} />
                </Badge>
              )}
              {searchData.furnishing && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {furnishingOptions.find(f => f.value === searchData.furnishing)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('furnishing')} />
                </Badge>
              )}
              {searchData.has3D && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {language === "en" ? "3D View" : "Tampilan 3D"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('has3D')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
                {language === "en" ? "Clear all" : "Hapus semua"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className={`mt-4 bg-white/98 backdrop-blur-sm shadow-xl border-0 animate-fade-in ${isMobile ? 'fixed inset-x-2 top-32 z-50 max-h-[70vh] overflow-y-auto' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{language === "en" ? "Filters" : "Filter"}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {language === "en" ? "Property Type" : "Tipe Properti"}
                </label>
                <Select
                  value={searchData.propertyType}
                  onValueChange={(value) => {
                    console.log("🏠 Property Type selected:", value);
                    handleInputChange('propertyType', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any type" : "Semua tipe"} />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === "en" ? "Location" : "Lokasi"}
                </label>
                <Select
                  value={searchData.location}
                  onValueChange={(value) => {
                    console.log("📍 Location selected:", value);
                    handleInputChange('location', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any location" : "Semua lokasi"} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Price Range" : "Range Harga"}
                </label>
                <Select
                  value={searchData.priceRange}
                  onValueChange={(value) => {
                    console.log("💰 Price Range selected:", value);
                    handleInputChange('priceRange', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any price" : "Semua harga"} />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Furnishing */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Furnishing" : "Perabotan"}
                </label>
                <Select
                  value={searchData.furnishing}
                  onValueChange={(value) => {
                    console.log("🪑 Furnishing selected:", value);
                    handleInputChange('furnishing', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any" : "Semua"} />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {language === "en" ? "Bedrooms" : "Kamar Tidur"}
                </label>
                <Select
                  value={searchData.bedrooms}
                  onValueChange={(value) => {
                    console.log("🛏️ Bedrooms selected:", value);
                    handleInputChange('bedrooms', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any" : "Semua"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} {language === "en" ? "Bedroom" : "Kamar"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Bathrooms" : "Kamar Mandi"}
                </label>
                <Select
                  value={searchData.bathrooms}
                  onValueChange={(value) => {
                    console.log("🚿 Bathrooms selected:", value);
                    handleInputChange('bathrooms', value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={language === "en" ? "Any" : "Semua"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} {language === "en" ? "Bathroom" : "Kamar Mandi"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has3D"
                  checked={searchData.has3D}
                  onChange={(e) => {
                    console.log("🏢 3D Tour selected:", e.target.checked);
                    handleInputChange('has3D', e.target.checked);
                  }}
                  className="rounded"
                />
                <label htmlFor="has3D" className="text-sm font-medium">
                  {language === "en" ? "3D Virtual Tour Available" : "Tersedia Tur Virtual 3D"}
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAllFilters} className="flex-1 sm:flex-none">
                  {language === "en" ? "Reset" : "Reset"}
                </Button>
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  {language === "en" ? "Apply Filters" : "Terapkan Filter"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedModernSearchPanel;
