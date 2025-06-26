
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Bed, Bath, Car, Wifi, AirVent, Sofa, Brain, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
}

const SearchFilters = ({ language, onSearch }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "Select State",
      city: "Select City", 
      area: "Select Area",
      propertyType: "Property Type",
      listingType: "Listing Type",
      price: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      amenities: "Amenities",
      searchBtn: "Search Properties",
      trending: "Trending Searches",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      allTypes: "All Types",
      anyPrice: "Any Price",
      anyBedroom: "Any",
      anyBathroom: "Any"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Pilih Provinsi",
      city: "Pilih Kota",
      area: "Pilih Area", 
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      price: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      amenities: "Fasilitas",
      searchBtn: "Cari Properti",
      trending: "Pencarian Trending",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      allTypes: "Semua Jenis",
      anyPrice: "Semua Harga",
      anyBedroom: "Semua",
      anyBathroom: "Semua"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan",
    "North Sulawesi", "South Sulawesi", "West Nusa Tenggara", "East Nusa Tenggara"
  ];

  const propertyTypes = [
    { value: "house", label: language === "en" ? "House" : "Rumah" },
    { value: "apartment", label: language === "en" ? "Apartment" : "Apartemen" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "condo", label: "Condo" },
    { value: "land", label: language === "en" ? "Land" : "Tanah" },
    { value: "commercial", label: language === "en" ? "Commercial" : "Komersial" }
  ];

  const trendingSearches = language === "en" 
    ? ["Jakarta Apartment", "Bali Villa", "Surabaya House", "Bandung Boarding", "Office Space", "Landed House"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung", "Ruang Kantor", "Rumah Tapak"];

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
    const searchFilters = {
      query: searchQuery,
      state: selectedState,
      city: selectedCity,
      area: selectedArea,
      propertyType: propertyType,
      listingType: listingType,
      priceRange,
      bedrooms,
      bathrooms,
      amenities
    };
    
    console.log('Search filters:', searchFilters);
    onSearch(searchFilters);
  };

  return (
    <Card className="glass-card border-0 shadow-2xl">
      <CardContent className="p-8">
        {/* AI-Powered Search Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">AI-Powered Property Search</h2>
          </div>
          <p className="text-muted-foreground">Find your perfect property with intelligent recommendations</p>
        </div>

        {/* Main Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={currentText.search}
                className="input-modern pl-12 h-14 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-3 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="input-modern h-14 border-border/20">
              <SelectValue placeholder={currentText.state} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.state}</SelectItem>
              {indonesianStates.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="input-modern h-14 border-border/20">
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.allTypes}</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSearch}
            className="btn-modern h-14 text-base font-semibold"
          >
            <Zap className="h-5 w-5 mr-2" />
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Advanced AI Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="input-modern h-12 border-border/20">
              <SelectValue placeholder={currentText.listingType} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.allTypes}</SelectItem>
              <SelectItem value="sale">{currentText.forSale}</SelectItem>
              <SelectItem value="rent">{currentText.forRent}</SelectItem>
              <SelectItem value="lease">{currentText.forLease}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="input-modern h-12 border-border/20">
              <SelectValue placeholder={currentText.price} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.anyPrice}</SelectItem>
              <SelectItem value="0-1000000000">Under Rp 1B</SelectItem>
              <SelectItem value="1000000000-5000000000">Rp 1B - 5B</SelectItem>
              <SelectItem value="5000000000-999999999999">Rp 5B+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="input-modern h-12 border-border/20">
              <SelectValue placeholder={currentText.bedrooms} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.anyBedroom}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger className="input-modern h-12 border-border/20">
              <SelectValue placeholder={currentText.bathrooms} />
            </SelectTrigger>
            <SelectContent className="glass-modern border-border/20">
              <SelectItem value="">{currentText.anyBathroom}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            {amenityOptions.map((amenity) => (
              <Button
                key={amenity.key}
                variant={amenities.includes(amenity.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity(amenity.key)}
                className="h-12 px-4 glass-modern border-border/20 hover:bg-primary/10"
              >
                <amenity.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{amenity.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* AI-Enhanced Trending Searches */}
        <div className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-500" />
            <p className="text-muted-foreground font-medium">{currentText.trending}:</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer glass-modern bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300 border-border/20 px-4 py-2"
                onClick={() => setSearchQuery(term)}
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
