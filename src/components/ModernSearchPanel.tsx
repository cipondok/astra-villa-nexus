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

interface ModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  // (Optionally accept isSearching and searchCount as props)
}

const ModernSearchPanel = ({ language, onSearch, onLiveSearch }: ModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [location, setLocation] = useState("");
  const [has3D, setHas3D] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

  const popularSearches = useMemo(() => 
    language === "en" 
      ? ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung"]
      : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"]
  , [language]);

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
    console.log("🧹 PANEL - Clearing all filters");
    setSearchQuery("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setLocation("");
    setHas3D(false);
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

  const hasActiveFilters = searchQuery || propertyType || bedrooms || bathrooms || location || has3D;

  return (
    <>
      {/* Search Progress Popup */}
      <Dialog open={isSearching} onOpenChange={setIsSearching}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-gray-900/90 border-none p-0 shadow-xl animate-fade-in">
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

      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-2xl max-w-6xl mx-auto transition-colors">
        <CardContent className="p-6">

          {/* Property Type as colorful iPhone-style buttons (already at top) */}
          <IPhoneToggleGroup
            options={[
              { value: "", label: language === "id" ? "Semua Jenis" : "All Types", colorClass: "bg-gradient-to-r from-blue-400 to-blue-600 text-white" },
              { value: "apartment", label: language === "id" ? "Apartemen" : "Apartment", colorClass: "bg-gradient-to-r from-purple-400 to-purple-600 text-white" },
              { value: "house", label: language === "id" ? "Rumah" : "House", colorClass: "bg-gradient-to-r from-pink-400 to-pink-600 text-white" },
              { value: "villa", label: "Villa", colorClass: "bg-gradient-to-r from-orange-400 to-orange-600 text-white" },
              { value: "townhouse", label: language === "id" ? "Rumah Kota" : "Townhouse", colorClass: "bg-gradient-to-r from-green-400 to-green-600 text-white" },
            ]}
            value={propertyType}
            onChange={setPropertyType}
            className="mb-3"
          />

          {/* Main Search Bar: wider layout, button also wide on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={language === "id"
                    ? "Cari properti, lokasi, atau area..."
                    : "Search properties, location, or area..."}
                  className="pl-10 h-12 text-gray-700 dark:text-gray-200"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                />
              </div>
            </div>
            <div />
            <div className="md:col-span-1 flex">
              <Button
                onClick={handleManualSearch}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {language === "id" ? "Cari Properti" : "Search Properties"}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced
                ? (language === "id" ? "Sembunyikan Filter" : "Hide Filters")
                : (language === "id" ? "Filter Lanjutan" : "Advanced Filters")
              }
            </Button>
            {(searchQuery || propertyType || bedrooms || bathrooms || location || has3D) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setPropertyType("");
                  setBedrooms("");
                  setBathrooms("");
                  setLocation("");
                  setHas3D(false);
                  // also: clear advanced filter state, if any
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                {language === "id" ? "Hapus semua" : "Clear all"}
              </Button>
            )}
          </div>
          {/* Advanced Filters, now easier layout and with "More filters" dropdown */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg">
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "id" ? "Kamar Tidur" : "Bedrooms"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "id" ? "Kamar Mandi" : "Bathrooms"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "id" ? "Lokasi" : "Location"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jakarta">{language === "id" ? "Jakarta" : "Jakarta"}</SelectItem>
                  <SelectItem value="bali">{language === "id" ? "Bali" : "Bali"}</SelectItem>
                  <SelectItem value="surabaya">{language === "id" ? "Surabaya" : "Surabaya"}</SelectItem>
                  <SelectItem value="bandung">{language === "id" ? "Bandung" : "Bandung"}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2 justify-center pt-2">
                <Checkbox id="has3D" checked={has3D} onCheckedChange={val => setHas3D(!!val)} />
                <Label htmlFor="has3D" className="text-sm font-medium">{language === "id" ? "Dengan Tampilan 3D" : "With 3D View"}</Label>
              </div>

              {/* NEW Additional Filters */}
              <div className="flex justify-center pt-2">
                <AdditionalFilters language={language} />
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="text-left">
            <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {language === "id" ? "Pencarian populer:" : "Popular searches:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {
                (language === "id"
                  ? ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung"]
                  : ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung"]
                ).map((term, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
    </>
  );
};

export default ModernSearchPanel;
