import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Bed, Bath, Car, Wifi, AirVent, Sofa, Filter } from "lucide-react";
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
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent",
      newProject: "New Project",
      commercial: "Commercial",
      preLaunch: "Pre-Launch",
      search: "Search properties, location...",
      searchBtn: "Search",
      state: "State",
      city: "City", 
      area: "Area",
      propertyType: "Property Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      filters: "Filters",
      anyPrice: "Any Price",
      anyBed: "Any",
      anyBath: "Any",
      allTypes: "All Types"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      newProject: "Proyek Baru",
      commercial: "Komersial",
      preLaunch: "Pra-Peluncuran",
      search: "Cari properti, lokasi...",
      searchBtn: "Cari",
      state: "Provinsi",
      city: "Kota",
      area: "Area",
      propertyType: "Jenis Properti",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      filters: "Filter",
      anyPrice: "Semua Harga",
      anyBed: "Semua",
      anyBath: "Semua",
      allTypes: "Semua Jenis"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan"
  ];

  const propertyTypes = [
    { value: "all", label: currentText.allTypes },
    { value: "apartment", label: language === "en" ? "Apartment" : "Apartemen" },
    { value: "house", label: language === "en" ? "House" : "Rumah" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: language === "en" ? "Townhouse" : "Rumah Teres" }
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
      amenities
    });
  };

  return (
    <Card className="bg-blue-sky-light-transparent backdrop-blur-sm shadow-2xl border-0 max-w-6xl mx-auto">
      <CardContent className="p-6 space-y-4">
        {/* Line 1: Property Type Tabs */}
        <div className="flex justify-center">
          <Tabs value={propertyType} onValueChange={setPropertyType} className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="buy" className="text-sm font-medium text-white data-[state=active]:bg-white/30 data-[state=active]:text-white">
                {currentText.buy}
              </TabsTrigger>
              <TabsTrigger value="rent" className="text-sm font-medium text-white data-[state=active]:bg-white/30 data-[state=active]:text-white">
                {currentText.rent}
              </TabsTrigger>
              <TabsTrigger value="new-project" className="text-sm font-medium text-white data-[state=active]:bg-white/30 data-[state=active]:text-white">
                {currentText.newProject}
              </TabsTrigger>
              <TabsTrigger value="commercial" className="text-sm font-medium text-white data-[state=active]:bg-white/30 data-[state=active]:text-white">
                {currentText.commercial}
              </TabsTrigger>
              <TabsTrigger value="pre-launch" className="text-sm font-medium text-white data-[state=active]:bg-white/30 data-[state=active]:text-white">
                {currentText.preLaunch}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Line 2: Search Input and Button */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <Input
              placeholder={currentText.search}
              className="pl-10 h-12 text-base bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold shadow-lg"
          >
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Line 3: Location and Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="h-11 bg-white/20 border-white/30 text-white backdrop-blur-sm">
              <MapPin className="h-4 w-4 mr-2 text-white/70" />
              <SelectValue placeholder={currentText.state} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {indonesianStates.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={currentText.city} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <SelectItem value="jakarta">Jakarta</SelectItem>
              <SelectItem value="surabaya">Surabaya</SelectItem>
              <SelectItem value="bandung">Bandung</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={currentText.area} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <SelectItem value="central">Central</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={currentText.priceRange} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <SelectItem value="any">{currentText.anyPrice}</SelectItem>
              <SelectItem value="0-1b">Under Rp 1B</SelectItem>
              <SelectItem value="1b-5b">Rp 1B - 5B</SelectItem>
              <SelectItem value="5b+">{language === "en" ? "Above" : "Di atas"} Rp 5B</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line 4: Search Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/30">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white/70" />
            <span className="text-sm font-medium text-white/90">
              {currentText.filters}:
            </span>
          </div>
          
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="h-9 w-24">
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
            <SelectTrigger className="h-9 w-24">
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

          <div className="flex gap-2">
            {amenityOptions.map((amenity) => (
              <Button
                key={amenity.key}
                variant={amenities.includes(amenity.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity(amenity.key)}
                className="h-9 px-3"
              >
                <amenity.icon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">{amenity.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernSearchPanel;
