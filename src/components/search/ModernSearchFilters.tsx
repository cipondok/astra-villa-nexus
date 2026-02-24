
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, X, MapPin, Home, Bed, Bath, Car, Wifi, AirVent, Sofa, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SearchFiltersProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
  onSearch: (filters: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const ModernSearchFilters = ({ language, onSearch, onLiveSearch }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  // Filter states
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const text = {
    en: {
      search: "Search properties, location, or area...",
      filters: "Filters",
      advancedFilters: "Advanced Filters",
      state: "Select State",
      city: "Select City",
      type: "Property Type",
      price: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      furnishing: "Furnishing",
      amenities: "Amenities",
      searchBtn: "Search Properties",
      clearAll: "Clear All",
      activeFilters: "Active Filters",
      showingResults: "Showing results for",
      allTypes: "All Types",
      anyPrice: "Any Price",
      anyBedroom: "Any",
      anyBathroom: "Any",
      furnished: "Furnished",
      unfurnished: "Unfurnished",
      partiallyFurnished: "Partially Furnished",
      anyFurnishing: "Any Furnishing",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      condo: "Condo"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      filters: "Filter",
      advancedFilters: "Filter Lanjutan",
      state: "Pilih Provinsi",
      city: "Pilih Kota",
      type: "Jenis Properti",
      price: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      furnishing: "Perabotan",
      amenities: "Fasilitas",
      searchBtn: "Cari Properti",
      clearAll: "Hapus Semua",
      activeFilters: "Filter Aktif",
      showingResults: "Menampilkan hasil untuk",
      allTypes: "Semua Jenis",
      anyPrice: "Semua Harga",
      anyBedroom: "Semua",
      anyBathroom: "Semua",
      furnished: "Berperabotan",
      unfurnished: "Tidak Berperabotan",
      partiallyFurnished: "Sebagian Berperabotan",
      anyFurnishing: "Semua",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      condo: "Kondominium"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan",
    "North Sulawesi", "South Sulawesi", "West Nusa Tenggara", "East Nusa Tenggara"
  ];

  const propertyTypes = [
    { value: "apartment", label: currentText.apartment },
    { value: "house", label: currentText.house },
    { value: "villa", label: currentText.villa },
    { value: "condo", label: currentText.condo }
  ];

  const amenityOptions = [
    { icon: Car, key: "parking", label: language === "en" ? "Parking" : "Parkir" },
    { icon: Wifi, key: "wifi", label: "WiFi" },
    { icon: AirVent, key: "ac", label: "AC" },
    { icon: Sofa, key: "gym", label: language === "en" ? "Gym" : "Gym" }
  ];

  // Update active filters whenever individual filters change
  useEffect(() => {
    const filters: Record<string, any> = {};
    
    if (selectedState) filters.state = selectedState;
    if (selectedCity) filters.city = selectedCity;
    if (propertyType) filters.propertyType = propertyType;
    if (priceRange) filters.priceRange = priceRange;
    if (bedrooms) filters.bedrooms = bedrooms;
    if (bathrooms) filters.bathrooms = bathrooms;
    if (furnishing) filters.furnishing = furnishing;
    if (amenities.length > 0) filters.amenities = amenities;

    setActiveFilters(filters);
  }, [selectedState, selectedCity, propertyType, priceRange, bedrooms, bathrooms, furnishing, amenities]);

  // Improved live search effect with better debouncing
  useEffect(() => {
    if (onLiveSearch && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        console.log("🔍 LIVE SEARCH - Triggering for:", searchQuery);
        onLiveSearch(searchQuery);
      }, 500); // Reduced from 300ms to 500ms for better typing experience
      return () => clearTimeout(timeoutId);
    } else if (onLiveSearch && searchQuery.length === 0) {
      // Clear search immediately when input is empty
      onLiveSearch("");
    }
  }, [searchQuery, onLiveSearch]);

  const toggleAmenity = (amenityKey: string) => {
    setAmenities(prev => 
      prev.includes(amenityKey) 
        ? prev.filter(a => a !== amenityKey)
        : [...prev, amenityKey]
    );
  };

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      state: selectedState,
      city: selectedCity,
      propertyType,
      priceRange,
      bedrooms,
      bathrooms,
      furnishing,
      amenities
    });
  };

  const clearFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'state':
        setSelectedState("");
        break;
      case 'city':
        setSelectedCity("");
        break;
      case 'propertyType':
        setPropertyType("");
        break;
      case 'priceRange':
        setPriceRange("");
        break;
      case 'bedrooms':
        setBedrooms("");
        break;
      case 'bathrooms':
        setBathrooms("");
        break;
      case 'furnishing':
        setFurnishing("");
        break;
      case 'amenities':
        setAmenities([]);
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setPropertyType("");
    setPriceRange("");
    setBedrooms("");
    setBathrooms("");
    setFurnishing("");
    setAmenities([]);
  };

  const getFilterDisplayValue = (key: string, value: any) => {
    switch (key) {
      case 'propertyType':
        return propertyTypes.find(t => t.value === value)?.label || value;
      case 'amenities':
        return `${value.length} ${language === "en" ? "amenities" : "fasilitas"}`;
      default:
        return value;
    }
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Main Search Card */}
      <Card className="bg-background/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-4">

          {/* Primary Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder={currentText.search}
                className="pl-10 h-12 border-border focus:border-primary focus:ring-primary"
                value={searchQuery}
                onChange={(e) => {
                  console.log("🔤 SEARCH INPUT CHANGED:", e.target.value);
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-12 px-4 border-border hover:bg-muted/50 relative"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {currentText.filters}
                    {activeFilterCount > 0 && (
                      <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                    {showAdvancedFilters ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-primary hover:bg-primary/90"
              >
                <Search className="h-4 w-4 mr-2" />
                {currentText.searchBtn}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {currentText.activeFilters} ({activeFilterCount})
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {currentText.clearAll}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20"
                  >
                    <span className="capitalize">{key}: {getFilterDisplayValue(key, value)}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => clearFilter(key)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <CollapsibleContent className="animate-accordion-down">
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {currentText.advancedFilters}
                </h4>
                
                {/* Main Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* State Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {currentText.state}
                    </label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.state} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {indonesianStates.map((state) => (
                          <SelectItem key={state} value={state} className="hover:bg-primary/10">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Home className="h-3 w-3 inline mr-1" />
                      {currentText.type}
                    </label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.allTypes} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="hover:bg-primary/10">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Bed className="h-3 w-3 inline mr-1" />
                      {currentText.bedrooms}
                    </label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.anyBedroom} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="1" className="hover:bg-primary/10">1</SelectItem>
                        <SelectItem value="2" className="hover:bg-primary/10">2</SelectItem>
                        <SelectItem value="3" className="hover:bg-primary/10">3</SelectItem>
                        <SelectItem value="4+" className="hover:bg-primary/10">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Bath className="h-3 w-3 inline mr-1" />
                      {currentText.bathrooms}
                    </label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.anyBathroom} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="1" className="hover:bg-primary/10">1</SelectItem>
                        <SelectItem value="2" className="hover:bg-primary/10">2</SelectItem>
                        <SelectItem value="3" className="hover:bg-primary/10">3</SelectItem>
                        <SelectItem value="4+" className="hover:bg-primary/10">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Secondary Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {currentText.price}
                    </label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.anyPrice} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="0-1b" className="hover:bg-primary/10">Under Rp 1B</SelectItem>
                        <SelectItem value="1b-5b" className="hover:bg-primary/10">Rp 1B - 5B</SelectItem>
                        <SelectItem value="5b+" className="hover:bg-primary/10">Rp 5B+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Furnishing */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {currentText.furnishing}
                    </label>
                    <Select value={furnishing} onValueChange={setFurnishing}>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder={currentText.anyFurnishing} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="furnished" className="hover:bg-primary/10">{currentText.furnished}</SelectItem>
                        <SelectItem value="unfurnished" className="hover:bg-primary/10">{currentText.unfurnished}</SelectItem>
                        <SelectItem value="partial" className="hover:bg-primary/10">{currentText.partiallyFurnished}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {currentText.amenities}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amenityOptions.map((amenity) => (
                      <Button
                        key={amenity.key}
                        variant={amenities.includes(amenity.key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAmenity(amenity.key)}
                        className={`h-9 px-3 ${
                          amenities.includes(amenity.key)
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'border-border hover:bg-primary/10 hover:border-primary/30'
                        }`}
                      >
                        <amenity.icon className="h-4 w-4 mr-1" />
                        {amenity.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {currentText.clearAll}
                  </Button>
                  <Button 
                    onClick={handleSearch}
                    className="bg-primary hover:bg-primary/90 px-6"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {currentText.searchBtn}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernSearchFilters;
