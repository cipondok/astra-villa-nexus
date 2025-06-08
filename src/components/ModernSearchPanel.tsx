
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  AirVent, 
  Sofa, 
  Filter, 
  Bot, 
  Home, 
  Building, 
  Building2,
  Castle,
  TreePine,
  Locate,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface ModernSearchPanelProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
}

const ModernSearchPanel = ({ language, onSearch }: ModernSearchPanelProps) => {
  const [propertyType, setPropertyType] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000000000]);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent", 
      newProject: "New Project",
      commercial: "Commercial",
      preLaunch: "Pre-Launch",
      search: "Search properties, location...",
      searchBtn: "AI Search",
      state: "Select State",
      city: "Select City",
      area: "Select Area",
      propertyType: "Property Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      filters: "Filters",
      anyPrice: "Any Price",
      anyBed: "Any",
      anyBath: "Any",
      allTypes: "All Types",
      detectLocation: "Detect Location",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      townhouse: "Townhouse",
      commercial: "Commercial"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProject: "Proyek Baru", 
      commercial: "Komersial",
      preLaunch: "Pra-Peluncuran",
      search: "Cari properti, lokasi...",
      searchBtn: "Pencarian AI",
      state: "Pilih Provinsi",
      city: "Pilih Kota",
      area: "Pilih Area",
      propertyType: "Jenis Properti",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi", 
      filters: "Filter",
      anyPrice: "Semua Harga",
      anyBed: "Semua",
      anyBath: "Semua",
      allTypes: "Semua Jenis",
      detectLocation: "Deteksi Lokasi",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      townhouse: "Rumah Teres",
      commercial: "Komersial"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan"
  ];

  const citiesByState: { [key: string]: string[] } = {
    "DKI Jakarta": ["Central Jakarta", "North Jakarta", "South Jakarta", "East Jakarta", "West Jakarta"],
    "West Java": ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon"],
    "East Java": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Mojokerto"],
    "Central Java": ["Semarang", "Solo", "Yogyakarta", "Magelang", "Pekalongan"],
    "Bali": ["Denpasar", "Ubud", "Sanur", "Kuta", "Seminyak"]
  };

  const areasByCity: { [key: string]: string[] } = {
    "Central Jakarta": ["Menteng", "Gambir", "Tanah Abang", "Kemayoran"],
    "Bandung": ["Dago", "Cihampelas", "Pasteur", "Setiabudi"],
    "Surabaya": ["Gubeng", "Wonokromo", "Tegalsari", "Genteng"]
  };

  const propertyTypeIcons = {
    apartment: Building,
    house: Home,
    villa: Castle,
    townhouse: Building2,
    commercial: TreePine
  };

  const propertyTypes = [
    { value: "all", label: currentText.allTypes, icon: Home },
    { value: "apartment", label: currentText.apartment, icon: Building },
    { value: "house", label: currentText.house, icon: Home },
    { value: "villa", label: currentText.villa, icon: Castle },
    { value: "townhouse", label: currentText.townhouse, icon: Building2 },
    { value: "commercial", label: currentText.commercial, icon: TreePine }
  ];

  const amenityOptions = [
    { icon: Car, key: "parking", label: language === "en" ? "Parking" : "Parkir" },
    { icon: Wifi, key: "wifi", label: "WiFi" },
    { icon: AirVent, key: "ac", label: "AC" },
    { icon: Sofa, key: "gym", label: language === "en" ? "Gym" : "Gym" }
  ];

  const toggleAmenity = (amenityKey: string) => {
    setAmenities(prev => 
      prev.includes(amenityKey) 
        ? prev.filter(a => a !== amenityKey)
        : [...prev, amenityKey]
    );
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location detected:", position.coords);
          // Here you would implement reverse geocoding to get the location name
          setSearchQuery("Current Location");
        },
        (error) => {
          console.error("Error detecting location:", error);
        }
      );
    }
  };

  const handleSearch = () => {
    onSearch({
      propertyType,
      query: searchQuery,
      state: selectedState,
      city: selectedCity,
      area: selectedArea,
      priceRange,
      bedrooms,
      bathrooms,
      amenities,
      selectedPropertyType
    });
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)}M`;
    } else {
      return `Rp ${(value / 1000).toFixed(0)}K`;
    }
  };

  return (
    <Card className="bg-blue-sky-light-transparent backdrop-blur-sm shadow-2xl border-0 max-w-6xl mx-auto">
      <CardContent className="p-6 space-y-4">
        {/* Line 1: Property Type Tabs with Icons */}
        <div className="flex justify-center">
          <Tabs value={propertyType} onValueChange={setPropertyType} className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="buy" className="text-sm font-medium text-blue-titanium-dark data-[state=active]:bg-white/30 flex items-center gap-2">
                <Home className="h-4 w-4" />
                {currentText.buy}
              </TabsTrigger>
              <TabsTrigger value="rent" className="text-sm font-medium text-blue-titanium-dark data-[state=active]:bg-white/30 flex items-center gap-2">
                <Building className="h-4 w-4" />
                {currentText.rent}
              </TabsTrigger>
              <TabsTrigger value="new-project" className="text-sm font-medium text-blue-titanium-dark data-[state=active]:bg-white/30 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {currentText.newProject}
              </TabsTrigger>
              <TabsTrigger value="commercial" className="text-sm font-medium text-blue-titanium-dark data-[state=active]:bg-white/30 flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                {currentText.commercial}
              </TabsTrigger>
              <TabsTrigger value="pre-launch" className="text-sm font-medium text-blue-titanium-dark data-[state=active]:bg-white/30 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {currentText.preLaunch}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Line 2: Search Input with Location Detection and AI Search Button */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-titanium/70" />
            <Input
              placeholder={currentText.search}
              className="pl-10 pr-12 h-12 text-base bg-white/20 border-white/30 text-blue-titanium-dark placeholder:text-blue-titanium/70 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={detectLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20"
              title={currentText.detectLocation}
            >
              <Locate className="h-4 w-4 text-blue-titanium/70" />
            </Button>
          </div>
          <Button 
            onClick={handleSearch}
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold shadow-lg animate-pulse"
          >
            <Bot className="h-5 w-5 mr-2 animate-spin" />
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Line 3: Location Selection (State → City → Area) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={selectedState} onValueChange={(value) => {
            setSelectedState(value);
            setSelectedCity("");
            setSelectedArea("");
          }}>
            <SelectTrigger className="h-11 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <MapPin className="h-4 w-4 mr-2 text-blue-titanium/70" />
              <SelectValue placeholder={currentText.state} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {indonesianStates.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCity} onValueChange={(value) => {
            setSelectedCity(value);
            setSelectedArea("");
          }} disabled={!selectedState}>
            <SelectTrigger className="h-11 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <SelectValue placeholder={currentText.city} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {selectedState && citiesByState[selectedState]?.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedArea} onValueChange={setSelectedArea} disabled={!selectedCity}>
            <SelectTrigger className="h-11 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <SelectValue placeholder={currentText.area} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {selectedCity && areasByCity[selectedCity]?.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line 4: Property Type and Quick Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/30">
          <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
            <SelectTrigger className="h-9 w-40 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="h-9 w-24 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <Bed className="h-4 w-4 mr-1" />
              <SelectValue placeholder={currentText.anyBed} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="any">{currentText.anyBed}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger className="h-9 w-24 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm">
              <Bath className="h-4 w-4 mr-1" />
              <SelectValue placeholder={currentText.anyBath} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="any">{currentText.anyBath}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-white/20 border-white/30 text-blue-titanium-dark backdrop-blur-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                {currentText.filters}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{currentText.filters}</SheetTitle>
                <SheetDescription>
                  Adjust your search filters
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Price Range Slider */}
                <div>
                  <label className="text-sm font-medium mb-3 block">{currentText.priceRange}</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000000000}
                    min={0}
                    step={100000000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenityOptions.map((amenity) => (
                      <Button
                        key={amenity.key}
                        variant={amenities.includes(amenity.key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAmenity(amenity.key)}
                        className="h-9 px-3"
                      >
                        <amenity.icon className="h-4 w-4 mr-1" />
                        <span className="text-xs">{amenity.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSearchPanel;
