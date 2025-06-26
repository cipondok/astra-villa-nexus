
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Bed, Bath, Car, Wifi, AirVent, Sofa, DollarSign, Sparkles, Zap, ArrowRight, Star, TrendingUp, BarChart3 } from "lucide-react";
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
      trending: "AI Trending Searches",
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
      trending: "Pencarian AI Trending",
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
    ? ["Jakarta Luxury", "Bali Beachfront", "Smart Homes", "Green Buildings", "AI Properties", "Virtual Tours"]
    : ["Jakarta Mewah", "Bali Tepi Pantai", "Rumah Pintar", "Bangunan Hijau", "Properti AI", "Tur Virtual"];

  const amenityOptions = [
    { icon: Car, key: "parking", label: language === "en" ? "Smart Parking" : "Parkir Pintar" },
    { icon: Wifi, key: "wifi", label: "Ultra WiFi" },
    { icon: AirVent, key: "ac", label: "Climate AI" },
    { icon: Sofa, key: "gym", label: language === "en" ? "AI Gym" : "Gym AI" }
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
    <Card className="binance-card border-0 shadow-2xl animate-binance-scale-in">
      <CardContent className="p-12">
        {/* Binance-Style Trading Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black animate-binance-glow">
              <BarChart3 className="h-8 w-8 animate-binance-float" />
            </div>
            <h2 className="text-4xl font-bold text-gradient-binance">Professional Property Trading</h2>
          </div>
          <p className="text-muted-foreground text-xl">Advanced trading platform with institutional-grade features</p>
        </div>

        {/* Binance-Style Main Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="relative group">
              <Search className="absolute left-6 top-6 h-6 w-6 text-muted-foreground group-hover:text-yellow-400 transition-colors" />
              <Input
                placeholder={currentText.search}
                className="input-binance pl-16 h-16 text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-4 p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 animate-binance-glow">
                <Sparkles className="h-5 w-5 text-black animate-binance-float" />
              </div>
            </div>
          </div>
          
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="input-binance h-16 border-border/20 text-lg">
              <SelectValue placeholder={currentText.state} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.state}</SelectItem>
              {indonesianStates.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="input-binance h-16 border-border/20 text-lg">
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.allTypes}</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSearch}
            className="btn-binance h-16 text-xl font-bold group"
          >
            <Zap className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
            {currentText.searchBtn}
            <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        {/* Binance-Style Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="input-binance h-14 border-border/20">
              <SelectValue placeholder={currentText.listingType} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.allTypes}</SelectItem>
              <SelectItem value="sale">{currentText.forSale}</SelectItem>
              <SelectItem value="rent">{currentText.forRent}</SelectItem>
              <SelectItem value="lease">{currentText.forLease}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="input-binance h-14 border-border/20">
              <SelectValue placeholder={currentText.price} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.anyPrice}</SelectItem>
              <SelectItem value="0-1000000000">Under Rp 1B</SelectItem>
              <SelectItem value="1000000000-5000000000">Rp 1B - 5B</SelectItem>
              <SelectItem value="5000000000-999999999999">Rp 5B+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="input-binance h-14 border-border/20">
              <SelectValue placeholder={currentText.bedrooms} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.anyBedroom}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger className="input-binance h-14 border-border/20">
              <SelectValue placeholder={currentText.bathrooms} />
            </SelectTrigger>
            <SelectContent className="binance-card border-border/20">
              <SelectItem value="">{currentText.anyBathroom}</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4+">4+</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3">
            {amenityOptions.map((amenity) => (
              <Button
                key={amenity.key}
                variant={amenities.includes(amenity.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity(amenity.key)}
                className="h-14 px-6 glass-binance border-border/20 hover:bg-yellow-400/10 transition-all duration-300 group micro-bounce-binance"
              >
                <amenity.icon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline font-medium">{amenity.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Binance-Style Trending Searches */}
        <div className="text-left">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-yellow-400 animate-binance-glow" />
            <p className="text-muted-foreground font-semibold text-xl">{currentText.trending}:</p>
          </div>
          <div className="flex flex-wrap gap-4 stagger-binance">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer glass-binance bg-gradient-to-r from-yellow-400/10 to-green-400/10 hover:from-yellow-400/20 hover:to-green-400/20 transition-all duration-300 border-border/20 px-6 py-3 text-base font-medium group micro-bounce-binance"
                onClick={() => setSearchQuery(term)}
              >
                <Star className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
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
