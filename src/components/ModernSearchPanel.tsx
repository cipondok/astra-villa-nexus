
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Filter, 
  Home, 
  Building, 
  Car, 
  Bed,
  Bath,
  Square,
  Bot,
  Sparkles,
  ChevronDown,
  MapPinned,
  TrendingUp,
  Rocket,
  Building2,
  Navigation,
  X
} from "lucide-react";

interface ModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (data: any) => void;
}

const ModernSearchPanel = ({ language, onSearch }: ModernSearchPanelProps) => {
  const [searchType, setSearchType] = useState("buy");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState([100000000, 1000000000]); // 100 juta to 1 milyar
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent", 
      newProjects: "New Projects",
      preLaunching: "Pre-launching",
      commercial: "Commercial",
      searchPlaceholder: "Search properties...",
      location: "Location",
      nearMe: "Near Me",
      priceRange: "Price Range",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      filters: "Filters",
      search: "AI Search",
      detectLocation: "Detect My Location",
      selectState: "Select State",
      selectCity: "Select City",
      selectArea: "Select Area",
      villa: "Villa",
      apartment: "Apartment", 
      house: "House",
      condo: "Condo",
      townhouse: "Townhouse",
      land: "Land",
      trending: "Trending Searches",
      close: "Close",
      categories: "Categories",
      applyFilters: "Apply Filters"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProjects: "Proyek Baru",
      preLaunching: "Pra-Peluncuran",
      commercial: "Komersial",
      searchPlaceholder: "Cari properti...",
      location: "Lokasi",
      nearMe: "Dekat Saya",
      priceRange: "Rentang Harga",
      propertyType: "Tipe Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      filters: "Filter",
      search: "Pencarian AI",
      detectLocation: "Deteksi Lokasi Saya",
      selectState: "Pilih Provinsi",
      selectCity: "Pilih Kota",
      selectArea: "Pilih Area",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah", 
      condo: "Kondominium",
      townhouse: "Rumah Susun",
      land: "Tanah",
      trending: "Pencarian Trending",
      close: "Tutup",
      categories: "Kategori",
      applyFilters: "Terapkan Filter"
    }
  };

  const currentText = text[language];

  const trendingSearches = [
    "Villa in Bali",
    "Apartment Jakarta Selatan", 
    "House in Bandung",
    "Luxury Condo Surabaya",
    "Land in Yogyakarta",
    "Modern House Jakarta",
    "Beachfront Villa Bali",
    "Office Space Jakarta"
  ];

  const states = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Bali"];
  const cities = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur"],
    "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor", "Tangerang"],
    "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta", "Magelang"],
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
    "Bali": ["Denpasar", "Ubud", "Sanur", "Canggu", "Seminyak"]
  };

  const areas = {
    "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang", "Kemayoran"],
    "Jakarta Selatan": ["Kebayoran Baru", "Senayan", "Pondok Indah", "Kemang"],
    "Jakarta Utara": ["Kelapa Gading", "Pantai Indah Kapuk", "Ancol", "Sunter"],
    "Jakarta Barat": ["Grogol", "Kebon Jeruk", "Cengkareng", "Kalideres"],
    "Jakarta Timur": ["Cakung", "Kramat Jati", "Jatinegara", "Duren Sawit"],
    "Bandung": ["Dago", "Braga", "Cihampelas", "Pasteur"],
    "Bekasi": ["Harapan Indah", "Galaxy", "Kemang Pratama", "Summarecon"],
    "Depok": ["Margonda", "UI", "Cinere", "Limo"],
    "Bogor": ["Bogor Tengah", "Tanah Sareal", "Dramaga", "Sentul"],
    "Tangerang": ["BSD", "Alam Sutera", "Gading Serpong", "Karawaci"],
    "Surabaya": ["Gubeng", "Wonokromo", "Tegalsari", "Genteng"],
    "Malang": ["Klojen", "Blimbing", "Lowokwaru", "Sukun"],
    "Sidoarjo": ["Waru", "Taman", "Gedangan", "Buduran"],
    "Gresik": ["Kebomas", "Manyar", "Duduksampeyan", "Cerme"],
    "Denpasar": ["Denpasar Barat", "Denpasar Timur", "Denpasar Selatan", "Denpasar Utara"],
    "Ubud": ["Ubud Center", "Mas", "Peliatan", "Petulu"],
    "Sanur": ["Sanur Kauh", "Sanur Kaja", "Renon", "Sesetan"],
    "Canggu": ["Batu Bolong", "Echo Beach", "Berawa", "Pererenan"],
    "Seminyak": ["Seminyak Center", "Petitenget", "Oberoi", "Laksmana"]
  };

  const propertyTypes = [
    { value: "villa", label: currentText.villa, icon: Home },
    { value: "apartment", label: currentText.apartment, icon: Building },
    { value: "house", label: currentText.house, icon: Home },
    { value: "condo", label: currentText.condo, icon: Building },
    { value: "townhouse", label: currentText.townhouse, icon: Home },
    { value: "land", label: currentText.land, icon: Square }
  ];

  // Auto-cycling trending searches
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingSearches.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [trendingSearches.length]);

  const handleSearch = () => {
    const searchData = {
      type: searchType,
      location: userLocation ? 
        { nearMe: true, coordinates: userLocation } : 
        { state: selectedState, city: selectedCity, area: selectedArea },
      priceRange,
      propertyType,
      bedrooms,
      bathrooms,
      searchQuery: searchValue
    };
    onSearch(searchData);
  };

  const detectNearMe = async () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setSelectedState("");
          setSelectedCity("");
          setSelectedArea("");
          console.log("Location detected:", location);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error detecting location:", error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      console.error("Geolocation not supported");
      setIsDetectingLocation(false);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    setSelectedArea("");
    setUserLocation(null);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedArea("");
  };

  const getAvailableCities = () => {
    return selectedState ? cities[selectedState as keyof typeof cities] || [] : [];
  };

  const getAvailableAreas = () => {
    return selectedCity ? areas[selectedCity as keyof typeof areas] || [] : [];
  };

  const getLocationDisplayText = () => {
    if (userLocation) return currentText.nearMe;
    if (selectedArea) return selectedArea;
    if (selectedCity) return selectedCity;
    if (selectedState) return selectedState;
    return currentText.location;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}M`; // Milyar
    } else if (price >= 1000000) {
      return `${Math.round(price / 1000000)}jt`; // Juta
    }
    return price.toLocaleString();
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Type Tabs - Now with 5 tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 overflow-x-auto">
          {[
            { key: "buy", label: currentText.buy, icon: Home },
            { key: "rent", label: currentText.rent, icon: Car },
            { key: "newProjects", label: currentText.newProjects, icon: Building },
            { key: "preLaunching", label: currentText.preLaunching, icon: Rocket },
            { key: "commercial", label: currentText.commercial, icon: Building2 }
          ].map((type) => (
            <Button
              key={type.key}
              variant={searchType === type.key ? "default" : "ghost"}
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${
                searchType === type.key 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-foreground/70 hover:text-foreground hover:bg-white/10"
              }`}
              onClick={() => setSearchType(type.key)}
            >
              <type.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchValue || `${currentText.searchPlaceholder} ${trendingSearches[currentTrendingIndex]}`}
                className="pl-10 pr-10 bg-white/20 border-white/30 text-foreground placeholder:text-foreground/50 transition-all duration-200"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {/* Location Selection with Near Me */}
          <div className="relative">
            <div className="flex gap-2">
              <Select value={selectedArea || selectedCity || selectedState} onValueChange={() => {}}>
                <SelectTrigger className="flex-1 bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4" />
                    <span className="truncate">
                      {getLocationDisplayText()}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 text-xs font-medium text-gray-700 border-b">Select Location</div>
                  {/* States */}
                  {!selectedState && !userLocation && states.map((state) => (
                    <SelectItem key={state} value={state} onClick={() => handleStateChange(state)}>
                      📍 {state}
                    </SelectItem>
                  ))}
                  {/* Cities */}
                  {selectedState && !selectedCity && getAvailableCities().map((city) => (
                    <SelectItem key={city} value={city} onClick={() => handleCityChange(city)}>
                      🏙️ {city}
                    </SelectItem>
                  ))}
                  {/* Areas */}
                  {selectedState && selectedCity && getAvailableAreas().map((area) => (
                    <SelectItem key={area} value={area} onClick={() => setSelectedArea(area)}>
                      📍 {area}
                    </SelectItem>
                  ))}
                  {/* Back options */}
                  {selectedCity && (
                    <SelectItem value="back-to-city" onClick={() => setSelectedCity("")}>
                      ← Back to Cities
                    </SelectItem>
                  )}
                  {selectedState && !selectedCity && (
                    <SelectItem value="back-to-state" onClick={() => setSelectedState("")}>
                      ← Back to States
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {/* Near Me Button */}
              <Button
                variant={userLocation ? "default" : "outline"}
                size="sm"
                onClick={detectNearMe}
                disabled={isDetectingLocation}
                className={`bg-white/20 border-white/30 hover:bg-white/30 px-3 ${
                  userLocation ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {isDetectingLocation ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Filters with Sheet */}
          <div className="relative">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white/20 border-white/30 text-foreground hover:bg-white/30"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {currentText.filters}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-md border-l border-white/20">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {currentText.filters}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-150px)]">
                  {/* Location Category */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b border-white/10 pb-2">
                      📍 {currentText.location}
                    </h3>
                    
                    {!userLocation && (
                      <div className="space-y-3">
                        <Select value={selectedState} onValueChange={handleStateChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={currentText.selectState} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedState && getAvailableCities().length > 0 && (
                          <Select value={selectedCity} onValueChange={handleCityChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={currentText.selectCity} />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableCities().map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {selectedCity && getAvailableAreas().length > 0 && (
                          <Select value={selectedArea} onValueChange={setSelectedArea}>
                            <SelectTrigger>
                              <SelectValue placeholder={currentText.selectArea} />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableAreas().map((area) => (
                                <SelectItem key={area} value={area}>{area}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}

                    <Button 
                      variant={userLocation ? "default" : "outline"} 
                      onClick={detectNearMe} 
                      className="w-full"
                      disabled={isDetectingLocation}
                    >
                      {isDetectingLocation ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4 mr-2" />
                          {currentText.detectLocation}
                        </>
                      )}
                    </Button>

                    {userLocation && (
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          {currentText.nearMe} - Location detected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserLocation(null)}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Range Category */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b border-white/10 pb-2">
                      💰 {currentText.priceRange}
                    </h3>
                    <div className="px-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000000000} // 1 milyar
                        min={100000000}  // 100 juta
                        step={10000000}  // 10 juta
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>Rp {formatPrice(priceRange[0])}</span>
                        <span>Rp {formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Type Category */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b border-white/10 pb-2">
                      🏠 {currentText.propertyType}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {propertyTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={propertyType === type.value ? "default" : "outline"}
                          className="justify-start h-12"
                          onClick={() => setPropertyType(propertyType === type.value ? "" : type.value)}
                        >
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms Category */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b border-white/10 pb-2">
                      🛏️ {currentText.bedrooms}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5+"].map((num) => (
                        <Button
                          key={num}
                          variant={bedrooms === num ? "default" : "outline"}
                          size="sm"
                          className="min-w-[60px]"
                          onClick={() => setBedrooms(bedrooms === num ? "" : num)}
                        >
                          <Bed className="h-4 w-4 mr-1" />
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms Category */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b border-white/10 pb-2">
                      🚿 {currentText.bathrooms}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["1", "2", "3", "4", "5+"].map((num) => (
                        <Button
                          key={num}
                          variant={bathrooms === num ? "default" : "outline"}
                          size="sm"
                          className="min-w-[60px]"
                          onClick={() => setBathrooms(bathrooms === num ? "" : num)}
                        >
                          <Bath className="h-4 w-4 mr-1" />
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button 
                    onClick={() => {
                      setIsFiltersOpen(false);
                      handleSearch();
                    }}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {currentText.applyFilters}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-1000 hover:scale-105"
          >
            <Bot className="h-5 w-5 mr-2 animate-pulse" style={{ animationDuration: '3s' }} />
            {currentText.search}
            <Sparkles className="h-4 w-4 ml-2 animate-bounce" style={{ animationDuration: '2s' }} />
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedState || userLocation || propertyType || bedrooms || bathrooms) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {(selectedState || userLocation) && (
              <Badge variant="secondary" className="bg-white/20">
                <MapPin className="h-3 w-3 mr-1" />
                {userLocation ? currentText.nearMe : (selectedArea || selectedCity || selectedState)}
              </Badge>
            )}
            {propertyType && (
              <Badge variant="secondary" className="bg-white/20">
                {propertyTypes.find(t => t.value === propertyType)?.label}
              </Badge>
            )}
            {bedrooms && (
              <Badge variant="secondary" className="bg-white/20">
                <Bed className="h-3 w-3 mr-1" />
                {bedrooms} {currentText.bedrooms}
              </Badge>
            )}
            {bathrooms && (
              <Badge variant="secondary" className="bg-white/20">
                <Bath className="h-3 w-3 mr-1" />
                {bathrooms} {currentText.bathrooms}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSearchPanel;
