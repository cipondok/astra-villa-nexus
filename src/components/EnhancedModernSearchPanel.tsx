
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
  bedrooms: string;
  bathrooms: string;
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
    bedrooms: "",
    bathrooms: "",
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

  // Count active filters
  useEffect(() => {
    const count = Object.entries(searchData).filter(([key, value]) => {
      if (key === 'query') return false;
      if (key === 'has3D') return value === true;
      return value !== "";
    }).length;
    setActiveFilters(count);
  }, [searchData]);

  const handleInputChange = (field: keyof SearchData, value: string | boolean) => {
    const newSearchData = { ...searchData, [field]: value };
    setSearchData(newSearchData);
    
    if (field === 'query' && typeof value === 'string') {
      onLiveSearch(value);
    }
  };

  const handleSearch = () => {
    onSearch(searchData);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const clearFilter = (field: keyof SearchData) => {
    handleInputChange(field, field === 'has3D' ? false : "");
  };

  const clearAllFilters = () => {
    setSearchData({
      query: searchData.query,
      propertyType: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
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
    { value: "jakarta", label: "Jakarta" },
    { value: "surabaya", label: "Surabaya" },
    { value: "bandung", label: "Bandung" },
    { value: "medan", label: "Medan" },
    { value: "bali", label: "Bali" }
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
                  <Badge variant="secondary" className="ml-2">
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
                  {locations.find(l => l.value === searchData.location)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('location')} />
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
                  onValueChange={(value) => handleInputChange('propertyType', value)}
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
                  onValueChange={(value) => handleInputChange('location', value)}
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

              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {language === "en" ? "Bedrooms" : "Kamar Tidur"}
                </label>
                <Select
                  value={searchData.bedrooms}
                  onValueChange={(value) => handleInputChange('bedrooms', value)}
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
                  onValueChange={(value) => handleInputChange('bathrooms', value)}
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
                  onChange={(e) => handleInputChange('has3D', e.target.checked)}
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
