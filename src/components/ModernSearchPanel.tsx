
import { useState } from "react";
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
  MapPinned
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
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent", 
      newProjects: "New Projects",
      searchPlaceholder: "Search properties...",
      location: "Location",
      priceRange: "Price Range",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      filters: "Filters",
      search: "AI Search",
      detectLocation: "Detect Location",
      selectState: "Select State",
      selectCity: "Select City",
      selectArea: "Select Area",
      villa: "Villa",
      apartment: "Apartment", 
      house: "House",
      condo: "Condo",
      townhouse: "Townhouse",
      land: "Land"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProjects: "Proyek Baru", 
      searchPlaceholder: "Cari properti...",
      location: "Lokasi",
      priceRange: "Rentang Harga",
      propertyType: "Tipe Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      filters: "Filter",
      search: "Pencarian AI",
      detectLocation: "Deteksi Lokasi",
      selectState: "Pilih Provinsi",
      selectCity: "Pilih Kota",
      selectArea: "Pilih Area",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah", 
      condo: "Kondominium",
      townhouse: "Rumah Susun",
      land: "Tanah"
    }
  };

  const currentText = text[language];

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
    "Bandung": ["Dago", "Braga", "Cihampelas", "Pasteur"],
    "Surabaya": ["Gubeng", "Wonokromo", "Tegalsari", "Genteng"]
  };

  const propertyTypes = [
    { value: "villa", label: currentText.villa, icon: Home },
    { value: "apartment", label: currentText.apartment, icon: Building },
    { value: "house", label: currentText.house, icon: Home },
    { value: "condo", label: currentText.condo, icon: Building },
    { value: "townhouse", label: currentText.townhouse, icon: Home },
    { value: "land", label: currentText.land, icon: Square }
  ];

  const handleSearch = () => {
    const searchData = {
      type: searchType,
      location: { state: selectedState, city: selectedCity, area: selectedArea },
      priceRange,
      propertyType,
      bedrooms,
      bathrooms
    };
    onSearch(searchData);
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log("Location detected:", position.coords);
        // You would typically use a geocoding service here
        setSelectedState("DKI Jakarta");
        setSelectedCity("Jakarta Selatan");
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Type Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
          {[
            { key: "buy", label: currentText.buy, icon: Home },
            { key: "rent", label: currentText.rent, icon: Car },
            { key: "newProjects", label: currentText.newProjects, icon: Building }
          ].map((type) => (
            <Button
              key={type.key}
              variant={searchType === type.key ? "default" : "ghost"}
              className={`flex items-center gap-2 rounded-full px-6 py-2 transition-all ${
                searchType === type.key 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-foreground/70 hover:text-foreground hover:bg-white/10"
              }`}
              onClick={() => setSearchType(type.key)}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={currentText.searchPlaceholder}
                className="pl-10 bg-white/20 border-white/30 text-foreground placeholder:text-foreground/50"
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between bg-white/20 border-white/30 text-foreground hover:bg-white/30"
              onClick={detectLocation}
            >
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                <span>{selectedArea || selectedCity || selectedState || currentText.location}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <Sheet>
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
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>{currentText.filters}</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 py-6">
                {/* Location Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{currentText.location}</label>
                  
                  <Select value={selectedState} onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                    setSelectedArea("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentText.selectState} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedState && (
                    <Select value={selectedCity} onValueChange={(value) => {
                      setSelectedCity(value);
                      setSelectedArea("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={currentText.selectCity} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities[selectedState as keyof typeof cities]?.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {selectedCity && areas[selectedCity as keyof typeof areas] && (
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                      <SelectTrigger>
                        <SelectValue placeholder={currentText.selectArea} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas[selectedCity as keyof typeof areas]?.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button variant="outline" onClick={detectLocation} className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    {currentText.detectLocation}
                  </Button>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{currentText.priceRange}</label>
                  <div className="px-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={50000000}
                      min={0}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Rp {priceRange[0].toLocaleString()}</span>
                      <span>Rp {priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{currentText.propertyType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={propertyType === type.value ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setPropertyType(propertyType === type.value ? "" : type.value)}
                      >
                        <type.icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{currentText.bedrooms}</label>
                  <div className="flex gap-2">
                    {["1", "2", "3", "4", "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={bedrooms === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBedrooms(bedrooms === num ? "" : num)}
                      >
                        <Bed className="h-4 w-4 mr-1" />
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{currentText.bathrooms}</label>
                  <div className="flex gap-2">
                    {["1", "2", "3", "4", "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={bathrooms === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBathrooms(bathrooms === num ? "" : num)}
                      >
                        <Bath className="h-4 w-4 mr-1" />
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Bot className="h-5 w-5 mr-2 animate-pulse" />
            {currentText.search}
            <Sparkles className="h-4 w-4 ml-2 animate-bounce" />
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedState || propertyType || bedrooms || bathrooms) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedState && (
              <Badge variant="secondary" className="bg-white/20">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedArea || selectedCity || selectedState}
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
