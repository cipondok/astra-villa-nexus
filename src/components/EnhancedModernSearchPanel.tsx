import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal, X, Home, Building, MapPin, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import SearchSuggestions from "@/components/search/SearchSuggestions";

interface SearchData {
  query: string;
  listingType: string; // Buy or Rent
  propertyType: string;
  state: string;
  city: string;
  area: string;
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
    listingType: "buy", // Default to buy
    propertyType: "",
    state: "",
    city: "",
    area: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    has3D: false
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Debounce search query for suggestions
  const debouncedQuery = useDebounce(searchData.query, 300);

  // Indonesian provinces data
  const indonesianProvinces = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", 
    "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
    "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
    "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Maluku", "Maluku Utara", "Papua Barat", "Papua"
  ];

  // Cities data for major provinces
  const citiesData: Record<string, string[]> = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
    "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon", "Sukabumi", "Tasikmalaya", "Karawang", "Purwakarta", "Subang"],
    "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Surakarta", "Klaten", "Boyolali"],
    "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Jember"],
    "Banten": ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon", "Lebak", "Pandeglang"],
    "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Klungkung", "Bangli", "Karangasem", "Buleleng"],
    "Sumatera Utara": ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjung Balai", "Sibolga"],
    "Sumatera Barat": ["Padang", "Bukittinggi", "Padang Panjang", "Payakumbuh", "Sawahlunto", "Solok"],
  };

  // Areas data for major cities
  const areasData: Record<string, string[]> = {
    "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran"],
    "Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Pesanggrahan", "Cilandak", "Pasar Minggu", "Jagakarsa"],
    "Jakarta Barat": ["Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Taman Sari", "Cengkareng"],
    "Jakarta Utara": ["Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing"],
    "Jakarta Timur": ["Matraman", "Pulogadung", "Jatinegara", "Cakung", "Duren Sawit", "Kramat Jati"],
    "Bandung": ["Coblong", "Bandung Wetan", "Sumur Bandung", "Andir", "Cicendo", "Cidadap", "Sukajadi"],
    "Surabaya": ["Wonokromo", "Gubeng", "Tegalsari", "Genteng", "Bubutan", "Simokerto", "Pabean Cantian"],
    "Bekasi": ["Bekasi Timur", "Bekasi Barat", "Bekasi Utara", "Bekasi Selatan", "Medan Satria", "Bantargebang"],
    "Tangerang": ["Tangerang Kota", "Karawaci", "Lippo Village", "Gading Serpong", "BSD City", "Alam Sutera"],
  };

  // Update cities when state changes
  useEffect(() => {
    if (searchData.state) {
      const cities = citiesData[searchData.state] || [];
      setAvailableCities(cities);
      if (!cities.includes(searchData.city)) {
        setSearchData(prev => ({ ...prev, city: "", area: "" }));
      }
    } else {
      setAvailableCities([]);
      setSearchData(prev => ({ ...prev, city: "", area: "" }));
    }
  }, [searchData.state]);

  // Update areas when city changes
  useEffect(() => {
    if (searchData.city) {
      const areas = areasData[searchData.city] || [];
      setAvailableAreas(areas);
      if (!areas.includes(searchData.area)) {
        setSearchData(prev => ({ ...prev, area: "" }));
      }
    } else {
      setAvailableAreas([]);
      setSearchData(prev => ({ ...prev, area: "" }));
    }
  }, [searchData.city]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFilters(false);
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
        setShowSuggestions(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
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
    const handleBeforeUnload = () => {
      setShowFilters(false);
      setShowSuggestions(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowFilters(false);
        setShowSuggestions(false);
      }
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
    
    // Check each filter and count non-empty values
    Object.entries(searchData).forEach(([key, value]) => {
      if (key === 'query' || key === 'listingType') return; // Don't count query as a filter
      
      if (key === 'has3D') {
        if (value === true) count++;
      } else {
        if (value && String(value).trim() !== "") count++;
      }
    });

    console.log("🔢 ACTIVE FILTERS COUNT:", count, "Filter data:", searchData);
    setActiveFilters(count);
  }, [searchData]);

  const handleInputChange = (field: keyof SearchData, value: string | boolean) => {
    console.log(`🔄 FILTER CHANGE - ${field}:`, value);
    
    // Update search data immediately
    setSearchData(prev => {
      const newData = { ...prev, [field]: value };
      console.log("📊 NEW SEARCH DATA:", newData);
      return newData;
    });
    
    // Handle query input for suggestions
    if (field === 'query' && typeof value === 'string') {
      setShowSuggestions(value.length >= 2);
      console.log("📝 Query updated - showing suggestions:", value.length >= 2);
    }
  };

  const handleSearch = () => {
    console.log("🔍 ENHANCED SEARCH PANEL - Sending search data:", searchData);
    setShowSuggestions(false);
    
    // Convert to the expected format for the backend
    const searchDataForBackend = {
      ...searchData,
      location: searchData.area ? `${searchData.area}, ${searchData.city}, ${searchData.state}` : 
                searchData.city ? `${searchData.city}, ${searchData.state}` : 
                searchData.state || ""
    };
    
    onSearch(searchDataForBackend);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    console.log("💡 SUGGESTION SELECTED:", suggestion);
    setSearchData(prev => ({ ...prev, query: suggestion.value }));
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
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
      listingType: searchData.listingType, // Keep listing type
      propertyType: "",
      state: "",
      city: "",
      area: "",
      priceRange: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      has3D: false
    });
  };

  // Updated options for bedrooms and bathrooms (1-10 only)
  const propertyTypes = [
    { value: "apartment", label: language === "en" ? "Apartment" : "Apartemen" },
    { value: "house", label: language === "en" ? "House" : "Rumah" },
    { value: "villa", label: language === "en" ? "Villa" : "Villa" },
    { value: "condo", label: language === "en" ? "Condo" : "Kondominium" },
    { value: "townhouse", label: language === "en" ? "Townhouse" : "Ruko" }
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

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const bathroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  return (
    <div className="w-full max-w-6xl mx-auto" ref={containerRef}>
      {/* Backdrop for mobile */}
      {showFilters && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Main Search Bar - iPhone Style */}
      <Card className="card-ios shadow-2xl border-0 overflow-visible rounded-3xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Buy/Rent Tabs - iPhone Style */}
          <div className="mb-6">
            <Tabs value={searchData.listingType} onValueChange={(value) => handleInputChange('listingType', value)}>
              <TabsList className="grid w-full grid-cols-2 max-w-md glass-ios rounded-2xl p-1 h-12">
                <TabsTrigger 
                  value="buy" 
                  className="rounded-xl h-10 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  {language === "en" ? "Buy" : "Beli"}
                </TabsTrigger>
                <TabsTrigger 
                  value="rent"
                  className="rounded-xl h-10 font-semibold text-sm transition-all duration-200 data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  {language === "en" ? "Rent" : "Sewa"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Input Row - iPhone Style */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ios-blue h-5 w-5 z-10" />
              <Input
                ref={searchInputRef}
                placeholder={language === "en" ? "Search properties, locations..." : "Cari properti, lokasi..."}
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                onFocus={() => setShowSuggestions(searchData.query.length >= 2)}
                className="pl-12 h-14 border-0 glass-ios rounded-2xl focus:ring-2 focus:ring-ios-blue focus:ring-offset-0 text-base font-medium placeholder:text-gray-500"
              />
              
              {/* Search Suggestions */}
              <SearchSuggestions
                query={debouncedQuery}
                onSelect={handleSuggestionSelect}
                isVisible={showSuggestions}
                language={language}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 px-6 relative rounded-2xl font-semibold transition-all duration-200 ${
                  showFilters 
                    ? 'bg-ios-blue hover:bg-ios-blue/90 text-white shadow-lg' 
                    : 'glass-ios border-2 border-ios-blue/20 text-ios-blue hover:bg-ios-blue/10'
                }`}
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {language === "en" ? "Filters" : "Filter"}
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-ios-red text-white rounded-full min-w-[20px] h-5">
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              <Button 
                onClick={handleSearch} 
                className="h-14 px-8 bg-gradient-to-r from-ios-blue to-ios-purple hover:from-ios-blue/90 hover:to-ios-purple/90 text-white rounded-2xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Search className="h-5 w-5 mr-2" />
                {language === "en" ? "Search" : "Cari"}
              </Button>
            </div>
          </div>

          {/* Location Selection Row - iPhone Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* State Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-ios-blue" />
                {language === "en" ? "State" : "Provinsi"}
              </label>
              <Select
                value={searchData.state}
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                  <SelectValue placeholder={language === "en" ? "Select state" : "Pilih provinsi"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {indonesianProvinces.map((province) => (
                    <SelectItem key={province} value={province} className="rounded-lg">
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                {language === "en" ? "City" : "Kota"}
              </label>
              <Select
                value={searchData.city}
                onValueChange={(value) => handleInputChange('city', value)}
                disabled={!searchData.state}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium disabled:opacity-50">
                  <SelectValue placeholder={language === "en" ? "Select city" : "Pilih kota"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city} className="rounded-lg">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                {language === "en" ? "Area" : "Area"}
              </label>
              <Select
                value={searchData.area}
                onValueChange={(value) => handleInputChange('area', value)}
                disabled={!searchData.city}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium disabled:opacity-50">
                  <SelectValue placeholder={language === "en" ? "Select area" : "Pilih area"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area} className="rounded-lg">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type, Bedrooms, Bathrooms Row - iPhone Style */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Home className="h-4 w-4 text-ios-blue" />
                {language === "en" ? "Property Type" : "Tipe Properti"}
              </label>
              <Select
                value={searchData.propertyType}
                onValueChange={(value) => handleInputChange('propertyType', value)}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                  <SelectValue placeholder={language === "en" ? "Any type" : "Semua tipe"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="rounded-lg">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Building className="h-4 w-4 text-ios-blue" />
              </label>
              <Select
                value={searchData.bedrooms}
                onValueChange={(value) => handleInputChange('bedrooms', value)}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                  <SelectValue placeholder={language === "en" ? "Bedrooms" : "Kamar Tidur"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {bedroomOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Bath className="h-4 w-4 text-ios-blue" />
              </label>
              <Select
                value={searchData.bathrooms}
                onValueChange={(value) => handleInputChange('bathrooms', value)}
              >
                <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                  <SelectValue placeholder={language === "en" ? "Bathrooms" : "Kamar Mandi"} />
                </SelectTrigger>
                <SelectContent className="dropdown-ios rounded-xl">
                  {bathroomOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display - iPhone Style */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              {searchData.propertyType && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-blue/10 text-ios-blue rounded-full border border-ios-blue/20">
                  <Home className="h-3 w-3" />
                  {propertyTypes.find(t => t.value === searchData.propertyType)?.label}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('propertyType')} />
                </Badge>
              )}
              {searchData.state && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-green/10 text-ios-green rounded-full border border-ios-green/20">
                  <MapPin className="h-3 w-3" />
                  {searchData.area ? `${searchData.area}, ${searchData.city}` : searchData.city ? `${searchData.city}, ${searchData.state}` : searchData.state}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('state')} />
                </Badge>
              )}
              {searchData.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-orange/10 text-ios-orange rounded-full border border-ios-orange/20">
                  {priceRanges.find(p => p.value === searchData.priceRange)?.label}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('priceRange')} />
                </Badge>
              )}
              {searchData.bedrooms && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-purple/10 text-ios-purple rounded-full border border-ios-purple/20">
                  <Building className="h-3 w-3" />
                  {searchData.bedrooms}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('bedrooms')} />
                </Badge>
              )}
              {searchData.bathrooms && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-teal/10 text-ios-teal rounded-full border border-ios-teal/20">
                  <Bath className="h-3 w-3" />
                  {searchData.bathrooms}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('bathrooms')} />
                </Badge>
              )}
              {searchData.furnishing && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-indigo/10 text-ios-indigo rounded-full border border-ios-indigo/20">
                  {furnishingOptions.find(f => f.value === searchData.furnishing)?.label}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('furnishing')} />
                </Badge>
              )}
              {searchData.has3D && (
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-ios-cyan/10 text-ios-cyan rounded-full border border-ios-cyan/20">
                  {language === "en" ? "3D View" : "Tampilan 3D"}
                  <X className="h-3 w-3 cursor-pointer hover:text-ios-red transition-colors" onClick={() => clearFilter('has3D')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs text-ios-red hover:bg-ios-red/10 rounded-full">
                {language === "en" ? "Clear all" : "Hapus semua"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel - iPhone Style */}
      {showFilters && (
        <Card className={`mt-4 card-ios shadow-2xl border-0 animate-fade-in rounded-3xl ${isMobile ? 'fixed inset-x-2 top-32 z-50 max-h-[70vh] overflow-y-auto' : ''}`}>
          <CardContent className="p-6 sm:p-8">
            {isMobile && (
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{language === "en" ? "Filters" : "Filter"}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  {language === "en" ? "Price Range" : "Range Harga"}
                </label>
                <Select
                  value={searchData.priceRange}
                  onValueChange={(value) => handleInputChange('priceRange', value)}
                >
                  <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                    <SelectValue placeholder={language === "en" ? "Any price" : "Semua harga"} />
                  </SelectTrigger>
                  <SelectContent className="dropdown-ios rounded-xl">
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="rounded-lg">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Furnishing */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  {language === "en" ? "Furnishing" : "Perabotan"}
                </label>
                <Select
                  value={searchData.furnishing}
                  onValueChange={(value) => handleInputChange('furnishing', value)}
                >
                  <SelectTrigger className="h-12 glass-ios rounded-xl border-0 font-medium">
                    <SelectValue placeholder={language === "en" ? "Any" : "Semua"} />
                  </SelectTrigger>
                  <SelectContent className="dropdown-ios rounded-xl">
                    {furnishingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6 bg-gray-200" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="has3D"
                  checked={searchData.has3D}
                  onChange={(e) => handleInputChange('has3D', e.target.checked)}
                  className="w-5 h-5 text-ios-blue bg-gray-100 border-gray-300 rounded focus:ring-ios-blue focus:ring-2"
                />
                <label htmlFor="has3D" className="text-sm font-semibold text-gray-700">
                  {language === "en" ? "3D Virtual Tour Available" : "Tersedia Tur Virtual 3D"}
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={clearAllFilters} className="flex-1 sm:flex-none h-12 rounded-xl border-2 border-gray-300 font-semibold">
                  {language === "en" ? "Reset" : "Reset"}
                </Button>
                <Button onClick={handleSearch} className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-ios-blue to-ios-purple hover:from-ios-blue/90 hover:to-ios-purple/90 text-white rounded-xl font-semibold shadow-lg">
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
