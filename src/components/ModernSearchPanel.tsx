import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  MapPin, 
  Filter, 
  Home, 
  Building, 
  KeyRound, 
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
  X,
  ChevronRight
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
  
  // Collapsible states for filter categories
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isBedroomsOpen, setIsBedroomsOpen] = useState(false);
  const [isBathroomsOpen, setIsBathroomsOpen] = useState(false);

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

  const searchTypeOptions = [
    { key: "buy", label: currentText.buy, icon: Home },
    { key: "rent", label: currentText.rent, icon: KeyRound },
    { key: "newProjects", label: currentText.newProjects, icon: Building },
    { key: "commercial", label: currentText.commercial, icon: Building2 }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Type Tabs - Fixed alignment */}
      <div className="flex justify-center mb-4">
        <div className="relative bg-white/20 backdrop-blur-md rounded-2xl p-2 border border-white/30 shadow-lg">
          {/* Background slider indicator */}
          <div 
            className={`absolute top-2 h-10 bg-primary rounded-xl transition-all duration-300 ease-out shadow-md`}
            style={{
              width: `${100 / searchTypeOptions.length}%`,
              left: `${(searchTypeOptions.findIndex(opt => opt.key === searchType) * 100) / searchTypeOptions.length}%`,
            }}
          />
          
          {/* Tab buttons with fixed alignment */}
          <div className="relative flex">
            {searchTypeOptions.map((type, index) => (
              <button
                key={type.key}
                className={`relative z-10 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ease-out font-medium text-xs min-w-[90px] h-10 touch-manipulation ${
                  searchType === type.key 
                    ? "text-primary-foreground scale-105" 
                    : "text-foreground/70 hover:text-foreground hover:scale-102 active:scale-95"
                }`}
                onClick={() => setSearchType(type.key)}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
              >
                <type.icon className={`h-3.5 w-3.5 transition-all duration-300 ${
                  searchType === type.key ? 'scale-110' : 'scale-100'
                }`} />
                <span className="whitespace-nowrap text-[10px] leading-tight text-center">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchValue || `${currentText.searchPlaceholder} ${trendingSearches[currentTrendingIndex]}`}
                className="pl-10 pr-10 bg-white/20 border-white/30 text-foreground placeholder:text-foreground/50 transition-all duration-200 h-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {/* Filters with Sheet */}
          <div className="relative">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white/20 border-white/30 text-foreground hover:bg-white/30 h-10 touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {currentText.filters}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-background/40 backdrop-blur-md border-l border-white/20">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {currentText.filters}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-150px)]">
                  {/* Location Category - Collapsible */}
                  <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border border-white/10 rounded-lg hover:bg-white/5 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <MapPinned className="h-5 w-5 text-primary" />
                          <span className="font-medium">{currentText.location}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isLocationOpen ? 'rotate-90' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4 ml-4">
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
                        className="w-full touch-manipulation"
                        disabled={isDetectingLocation}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
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
                            className="ml-auto h-6 w-6 p-0 touch-manipulation"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Price Range Category - Collapsible */}
                  <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border border-white/10 rounded-lg hover:bg-white/5 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-5 w-5 text-primary text-lg">💰</span>
                          <span className="font-medium">{currentText.priceRange}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isPriceOpen ? 'rotate-90' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 ml-4">
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
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Property Type Category - Collapsible */}
                  <Collapsible open={isPropertyTypeOpen} onOpenChange={setIsPropertyTypeOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border border-white/10 rounded-lg hover:bg-white/5 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <Home className="h-5 w-5 text-primary" />
                          <span className="font-medium">{currentText.propertyType}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isPropertyTypeOpen ? 'rotate-90' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 ml-4">
                      <div className="grid grid-cols-2 gap-2">
                        {propertyTypes.map((type) => (
                          <Button
                            key={type.value}
                            variant={propertyType === type.value ? "default" : "outline"}
                            className="justify-start h-12 touch-manipulation"
                            onClick={() => setPropertyType(propertyType === type.value ? "" : type.value)}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <type.icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Bedrooms Category - Collapsible */}
                  <Collapsible open={isBedroomsOpen} onOpenChange={setIsBedroomsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border border-white/10 rounded-lg hover:bg-white/5 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <Bed className="h-5 w-5 text-primary" />
                          <span className="font-medium">{currentText.bedrooms}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isBedroomsOpen ? 'rotate-90' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 ml-4">
                      <div className="flex flex-wrap gap-2">
                        {["1", "2", "3", "4", "5+"].map((num) => (
                          <Button
                            key={num}
                            variant={bedrooms === num ? "default" : "outline"}
                            size="sm"
                            className="min-w-[60px] touch-manipulation"
                            onClick={() => setBedrooms(bedrooms === num ? "" : num)}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <Bed className="h-4 w-4 mr-1" />
                            {num}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Bathrooms Category - Collapsible */}
                  <Collapsible open={isBathroomsOpen} onOpenChange={setIsBathroomsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border border-white/10 rounded-lg hover:bg-white/5 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <Bath className="h-5 w-5 text-primary" />
                          <span className="font-medium">{currentText.bathrooms}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isBathroomsOpen ? 'rotate-90' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 ml-4">
                      <div className="flex flex-wrap gap-2">
                        {["1", "2", "3", "4", "5+"].map((num) => (
                          <Button
                            key={num}
                            variant={bathrooms === num ? "default" : "outline"}
                            size="sm"
                            className="min-w-[60px] touch-manipulation"
                            onClick={() => setBathrooms(bathrooms === num ? "" : num)}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <Bath className="h-4 w-4 mr-1" />
                            {num}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Apply Button */}
                  <Button 
                    onClick={() => {
                      setIsFiltersOpen(false);
                      handleSearch();
                    }}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium mt-6 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 touch-manipulation active:scale-95"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Bot className="h-4 w-4 mr-2 animate-pulse" style={{ animationDuration: '3s' }} />
            {currentText.search}
            <Sparkles className="h-4 w-4 ml-2 animate-bounce" style={{ animationDuration: '2s' }} />
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedState || userLocation || propertyType || bedrooms || bathrooms) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(selectedState || userLocation) && (
              <Badge variant="secondary" className="bg-white/20 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {userLocation ? currentText.nearMe : (selectedArea || selectedCity || selectedState)}
              </Badge>
            )}
            {propertyType && (
              <Badge variant="secondary" className="bg-white/20 text-xs">
                {propertyTypes.find(t => t.value === propertyType)?.label}
              </Badge>
            )}
            {bedrooms && (
              <Badge variant="secondary" className="bg-white/20 text-xs">
                <Bed className="h-3 w-3 mr-1" />
                {bedrooms} {currentText.bedrooms}
              </Badge>
            )}
            {bathrooms && (
              <Badge variant="secondary" className="bg-white/20 text-xs">
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
