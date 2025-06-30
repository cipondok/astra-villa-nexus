import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import IPhoneToggleGroup from "./ui/IPhoneToggleGroup";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import LocationSelector from "./property/LocationSelector";
import PillToggleGroup from "./ui/PillToggleGroup";

// Mock: These should ideally be passed as props or lifted up to parent. For now for demo UX only.
const useSearchUIState = () => {
  // Use parent's state if available
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchCount, setSearchCount] = useState<number | null>(null);

  // For illustration: simulate progress and count updating
  useEffect(() => {
    if (isSearching) {
      setProgress(0);
      setSearchCount(null);
      const interval = setInterval(() => {
        setProgress((val) => {
          if (val < 90) return val + 10;
          return val;
        });
      }, 180);
      const timeout = setTimeout(() => {
        setSearchCount(Math.floor(Math.random()*9) + 10); // random result count
        setProgress(100);
      }, 1800);
      return () => { clearInterval(interval); clearTimeout(timeout);}
    }
  }, [isSearching]);

  // When progress completes, close automatically after a delay
  useEffect(() => {
    if (progress >= 100 && isSearching) {
      const timer = setTimeout(() => setIsSearching(false), 1300);
      return () => clearTimeout(timer);
    }
  }, [progress, isSearching]);

  return {
    isSearching, setIsSearching, progress, searchCount, setSearchCount,
    triggerSearch: () => setIsSearching(true)
  };
};

const AdditionalFilters = ({ language }: { language: "en" | "id" }) => {
  // Placeholder component for "more filters"
  const text = {
    en: "More filters",
    id: "Filter lainnya"
  };
  return (
    <div className="flex items-center space-x-2">
      <SlidersHorizontal className="h-4 w-4" />
      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={text[language]} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="garage">Garage</SelectItem>
          <SelectItem value="garden">Garden</SelectItem>
          <SelectItem value="pool">Swimming Pool</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

interface EnhancedModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  // (Optionally accept isSearching and searchCount as props)
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: EnhancedModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [location, setLocation] = useState("");
  const [has3D, setHas3D] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add state for new filters
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [bedPills, setBedPills] = useState("");
  const [bathPills, setBathPills] = useState("");
  const [smartFacilities, setSmartFacilities] = useState<string[]>([]);

  // Animation state
  const [filtersMounted, setFiltersMounted] = useState(false);

  useEffect(() => {
    if (showAdvanced) setFiltersMounted(true);
  }, [showAdvanced]);

  // Refs to track previous values and prevent duplicate searches
  const lastSearchRef = useRef("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const text = useMemo(() => ({
    en: {
      search: "Search properties, location, or area...",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      location: "Location",
      searchBtn: "Search Properties",
      advancedFilters: "Advanced Filters",
      hideFilters: "Hide Filters",
      allTypes: "All Types",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      townhouse: "Townhouse",
      any: "Any",
      onebed: "1",
      twobed: "2",
      threebed: "3",
      fourbed: "4+",
      jakarta: "Jakarta",
      bali: "Bali",
      surabaya: "Surabaya",
      bandung: "Bandung",
      popular: "Popular searches:",
      clearFilters: "Clear all",
      has3D: "With 3D View"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      propertyType: "Jenis Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      location: "Lokasi",
      searchBtn: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      hideFilters: "Sembunyikan Filter",
      allTypes: "Semua Jenis",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      townhouse: "Rumah Kota",
      any: "Semua",
      onebed: "1",
      twobed: "2",
      threebed: "3",
      fourbed: "4+",
      jakarta: "Jakarta",
      bali: "Bali",
      surabaya: "Surabaya",
      bandung: "Bandung",
      popular: "Pencarian populer:",
      clearFilters: "Hapus semua",
      has3D: "Dengan Tampilan 3D"
    }
  }), [language]);

  const currentText = text[language];

  // Define propertyType options for the toggle group and keep the existing text usage
  const propertyTypeOptions = [
    { value: "", label: currentText.allTypes, colorClass: "bg-gradient-to-r from-blue-400 to-blue-600 text-white" },
    { value: "apartment", label: currentText.apartment, colorClass: "bg-gradient-to-r from-purple-400 to-purple-600 text-white" },
    { value: "house", label: currentText.house, colorClass: "bg-gradient-to-r from-pink-400 to-pink-600 text-white" },
    { value: "villa", label: currentText.villa, colorClass: "bg-gradient-to-r from-orange-400 to-orange-600 text-white" },
    { value: "townhouse", label: currentText.townhouse, colorClass: "bg-gradient-to-r from-green-400 to-green-600 text-white" },
  ];

  // Smart filter options
  const smartFilterCategories = [
    {
      label: language === "id" ? "Dekat Sini" : "Nearby",
      key: "nearby",
      options: [
        { value: "nearby-airport", label: language === "id" ? "Bandara" : "Airport" },
        { value: "nearby-mall", label: language === "id" ? "Mall" : "Shopping Mall" },
        { value: "nearby-hospital", label: language === "id" ? "Rumah Sakit" : "Hospital" },
        { value: "nearby-school", label: language === "id" ? "Sekolah Umum" : "Public School" }
      ]
    },
    {
      label: language === "id" ? "Fasilitas Dalam" : "Indoor Facilities",
      key: "facility",
      options: [
        { value: "gym", label: "Gym" },
        { value: "kolam-renang", label: language === "id" ? "Kolam Renang" : "Swimming Pool" },
        { value: "parkir", label: language === "id" ? "Area Parkir" : "Parking" },
        { value: "keamanan", label: language === "id" ? "Keamanan 24 Jam" : "24h Security" }
      ]
    },
    {
      label: language === "id" ? "Transportasi Umum" : "Transportation",
      key: "transport",
      options: [
        { value: "lrt", label: "LRT" },
        { value: "mrt", label: "MRT" },
        { value: "bus", label: "Bus" },
        { value: "kereta", label: language === "id" ? "KRL" : "Commuter Line" }
      ]
    },
    {
      label: language === "id" ? "Pusat Belanja" : "Shopping",
      key: "shopping",
      options: [
        { value: "mall", label: language === "id" ? "Mall" : "Shopping Mall" },
        { value: "supermarket", label: "Supermarket" },
      ]
    },
    {
      label: language === "id" ? "Area Publik" : "Public Area",
      key: "public",
      options: [
        { value: "public-park", label: language === "id" ? "Taman Kota" : "Park" },
        { value: "public-area", label: language === "id" ? "Fasilitas Umum" : "Facilities" }
      ]
    }
  ];

  // Smart filter multi-select grouping logic
  // Maintain selection state per subcategory
  const [selectedSmartFacilities, setSelectedSmartFacilities] = useState<string[]>([]);

  const handleSmartFacilityToggle = (val: string) => {
    setSelectedSmartFacilities((prev) =>
      prev.includes(val) ? prev.filter((f) => f !== val) : [...prev, val]
    );
  };

  // Improved debounced live search with duplicate prevention
  const debouncedLiveSearch = useCallback((searchTerm: string) => {
    if (!onLiveSearch) return;
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Prevent duplicate searches
    if (lastSearchRef.current === searchTerm) {
      console.log("🔍 PANEL - Skipping duplicate search for:", searchTerm);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        console.log("🔍 PANEL - Live search triggered for:", searchTerm);
        lastSearchRef.current = searchTerm;
        onLiveSearch(searchTerm);
      } else if (searchTerm.trim().length === 0) {
        console.log("🔍 PANEL - Clearing search");
        lastSearchRef.current = "";
        onLiveSearch("");
      }
    }, 2000); // Increased debounce time to prevent rapid firing
  }, [onLiveSearch]);

  // Effect for handling search input changes
  useEffect(() => {
    debouncedLiveSearch(searchQuery);
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedLiveSearch]);

  // use the local search UI state (for demo; ideally passed from parent)
  const {
    isSearching,
    setIsSearching,
    progress,
    searchCount,
    triggerSearch
  } = useSearchUIState();

  // == Call triggerSearch before handleManualSearch to illustrate the popup ==
  const handleManualSearch = useCallback(() => {
    triggerSearch();
    setTimeout(() => {
      const searchData = {
        query: searchQuery.trim(),
        propertyType: propertyType || "",
        bedrooms: bedrooms || "",
        bathrooms: bathrooms || "",
        location: location || "",
        has3D,
      };
      onSearch(searchData);
    }, 600); // add small delay for searching popup to show
  // eslint-disable-next-line
  }, [searchQuery, propertyType, bedrooms, bathrooms, location, has3D, onSearch, triggerSearch]);

  const handleClearFilters = useCallback(() => {
    // This will reset all filter values
    setSearchQuery("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    setHas3D(false);
    setSelectedState("");
    setSelectedCity("");
    setSelectedArea("");
    setBedPills("");
    setBathPills("");
    setSmartFacilities([]);
    lastSearchRef.current = "";
    if (onLiveSearch) {
      onLiveSearch("");
    }
  }, [onLiveSearch]);

  const handlePopularSearch = useCallback((term: string) => {
    console.log("🔥 PANEL - Popular search clicked:", term);
    setSearchQuery(term);
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    setHas3D(false);
    lastSearchRef.current = term;
    const searchData = {
      query: term,
      propertyType: "",
      bedrooms: "",  
      bathrooms: "",
      location: "",
      has3D: false
    };
    onSearch(searchData);
  }, [onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  }, [handleManualSearch]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("🔤 PANEL - Search input changed:", value);
    setSearchQuery(value);
  }, []);

  const hasActiveFilters = searchQuery || propertyType || bedrooms || bathrooms || location || has3D || selectedState || selectedCity || selectedArea || bedPills || bathPills || smartFacilities.length;

  // Pill group change handlers for toggle-off by clicking again
  const handleBedPillsChange = (val: string | string[]) => {
    // If reselecting the same one, clear
    if (bedPills === val) setBedPills("");
    else setBedPills(typeof val === "string" ? val : "");
  };
  const handleBathPillsChange = (val: string | string[]) => {
    if (bathPills === val) setBathPills("");
    else setBathPills(typeof val === "string" ? val : "");
  };

  // Smart facility multi-select
  const handleSmartFacilitiesChange = (val: string | string[]) => {
    setSmartFacilities(Array.isArray(val) ? val : [val]);
  };

  // Smooth filter panel transition classes
  const filterAnimBase =
    "transition-all duration-300 ease-[cubic-bezier(0.55,0,0.1,1)]";
  const filterAnimVisible =
    "opacity-100 translate-y-0 pointer-events-auto scale-100";
  const filterAnimHidden =
    "opacity-0 -translate-y-3 pointer-events-none scale-95";

  // Pull kecamatan from selectedArea (handled in LocationSelector via onAreaChange)
  // Confirmed props: onStateChange, onCityChange, onAreaChange

  return (
    <>
      {/* Search Progress Popup */}
      <Dialog open={isSearching} onOpenChange={setIsSearching}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 border-none p-0 shadow-xl animate-fade-in">
          <div className="flex flex-col items-center justify-center px-8 py-8 space-y-7">
            <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
              {language === "id" ? "Sedang Mencari..." : "Searching..."}
            </h2>
            <Progress value={progress} className="h-3 w-full mb-3" />
            {searchCount !== null
              ? (
                <span className="text-lg font-semibold text-primary">
                  {language === "id"
                    ? `${searchCount} hasil ditemukan`
                    : `${searchCount} results found`
                  }
                </span>
              )
              : (
                <span className="text-muted-foreground animate-pulse">
                  {language === "id"
                    ? "Memproses hasil, tunggu sebentar…"
                    : "Analyzing results, please wait…"
                  }
                </span>
              )
            }
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearching(false)}
              className="mt-6"
            >
              {language === "id" ? "Tutup" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wider Search Panel with Apple-style Design */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <Card className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-colors">
          <CardContent className="p-8">

            {/* Property Type as Apple-style buttons */}
            <IPhoneToggleGroup
              options={[
                { value: "", label: language === "id" ? "Semua Jenis" : "All Types", colorClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" },
                { value: "apartment", label: language === "id" ? "Apartemen" : "Apartment", colorClass: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm" },
                { value: "house", label: language === "id" ? "Rumah" : "House", colorClass: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm" },
                { value: "villa", label: "Villa", colorClass: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm" },
                { value: "townhouse", label: language === "id" ? "Rumah Kota" : "Townhouse", colorClass: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm" },
              ]}
              value={propertyType}
              onChange={setPropertyType}
              className="mb-6"
            />

            {/* Main Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mb-6">
              <div>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={currentText.search}
                    className="pl-12 h-14 text-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>
              <div className="flex">
                <Button
                  onClick={handleManualSearch}
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {currentText.searchBtn}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(v => !v)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-4 py-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAdvanced
                  ? (language === "id" ? "Sembunyikan Filter" : "Hide Filters")
                  : (language === "id" ? "Filter Lanjutan" : "Advanced Filters")}
              </Button>
              {/* Clear all filters button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" />
                  {language === "id" ? "Hapus semua" : "Clear all"}
                </Button>
              )}
            </div>
            
            {/* Animated Advanced Filters Section */}
            <div
              className={`overflow-hidden ${filterAnimBase} ${showAdvanced ? filterAnimVisible : filterAnimHidden}`}
              style={{ minHeight: showAdvanced ? 220 : 0, maxHeight: showAdvanced ? 600 : 0 }}
              onTransitionEnd={() => {
                if (!showAdvanced) setFiltersMounted(false);
              }}
            >
              {filtersMounted && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6 p-6 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  {/* Location Selector */}
                  <div className="md:col-span-3">
                    <LocationSelector
                      selectedState={selectedState}
                      selectedCity={selectedCity}
                      selectedArea={selectedArea}
                      onStateChange={setSelectedState}
                      onCityChange={setSelectedCity}
                      onAreaChange={setSelectedArea}
                      onLocationChange={setLocation}
                    />
                  </div>
                  {/* Bedrooms pills */}
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {language === "id" ? "Kamar Tidur" : "Bedrooms"}
                    </label>
                    <PillToggleGroup
                      options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                        { value: "4+", label: "4+" },
                      ]}
                      value={bedPills}
                      onChange={handleBedPillsChange}
                      multiple={false}
                    />
                  </div>
                  {/* Bathrooms pills */}
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {language === "id" ? "Kamar Mandi" : "Bathrooms"}
                    </label>
                    <PillToggleGroup
                      options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                        { value: "4+", label: "4+" },
                      ]}
                      value={bathPills}
                      onChange={handleBathPillsChange}
                      multiple={false}
                    />
                  </div>
                  {/* Smart Filter grouped pills */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="block mb-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {language === "id" ? "Filter Pintar" : "Smart Filters"}
                    </label>
                    {smartFilterCategories.map((cat) => (
                      <div key={cat.key} className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{cat.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {cat.options.map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => handleSmartFacilityToggle(option.value)}
                              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 
                                ${selectedSmartFacilities.includes(option.value)
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}
                              `}
                              aria-pressed={selectedSmartFacilities.includes(option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular Searches */}
            <div className="text-left">
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium text-sm">
                {language === "id" ? "Pencarian populer:" : "Popular searches:"}
              </p>
              <div className="flex flex-wrap gap-3">
                {
                  (language === "id"
                    ? ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"]
                    : ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung"]
                  ).map((term, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 px-4 py-2 rounded-full"
                      onClick={() => {
                        setSearchQuery(term);
                        setPropertyType("");
                        setBedrooms("");
                        setBathrooms("");
                        setLocation("");
                        setHas3D(false);
                        // You may want to also trigger a search instantly here
                        const searchData = {
                          query: term,
                          propertyType: "",
                          bedrooms: "",
                          bathrooms: "",
                          location: "",
                          has3D: false
                        };
                        triggerSearch();
                        setTimeout(() => onSearch(searchData), 600);
                      }}
                    >
                      {term}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EnhancedModernSearchPanel;
