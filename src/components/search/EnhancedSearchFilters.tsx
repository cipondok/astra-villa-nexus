
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Filter, ChevronDown, Home, Bed, Bath, Car, Wifi, AirVent, Sofa } from "lucide-react";
import { useState } from "react";

interface EnhancedSearchFiltersProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
}

const EnhancedSearchFilters = ({ language, onSearch }: EnhancedSearchFiltersProps) => {
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "State",
      city: "City", 
      area: "Area",
      propertyType: "Property Type",
      listingType: "Listing Type",
      price: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      amenities: "Amenities",
      searchBtn: "Search",
      trending: "Trending Searches",
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
      allTypes: "All Types",
      anyPrice: "Any Price",
      anyBedroom: "Any",
      anyBathroom: "Any",
      filters: "Filters",
      myLocation: "My Location"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Provinsi",
      city: "Kota",
      area: "Area", 
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      price: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      amenities: "Fasilitas",
      searchBtn: "Cari",
      trending: "Pencarian Trending",
      forSale: "Dijual",
      forRent: "Disewa",
      forLease: "Disewakan",
      allTypes: "Semua Jenis",
      anyPrice: "Semua Harga",
      anyBedroom: "Semua",
      anyBathroom: "Semua",
      filters: "Filter",
      myLocation: "Lokasi Saya"
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
    { icon: Sofa, key: "furnished", label: language === "en" ? "Furnished" : "Furnished" }
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

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('Location:', position.coords);
        // You would typically reverse geocode this to get location name
        setSearchQuery("Current Location");
      });
    }
  };

  return (
    <Card className="glass-card-ios shadow-xl border-0">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={currentText.search}
              className="pl-10 h-12 macos-select border-0 text-foreground bg-background/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-primary/10"
              onClick={useMyLocation}
            >
              <MapPin className="h-4 w-4 text-primary" />
            </Button>
          </div>
          
          {/* Compact Location Selectors */}
          <div className="flex gap-2">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="compact-filter filter-dropdown macos-select border-0 bg-background/80">
                <SelectValue placeholder={currentText.state} />
              </SelectTrigger>
              <SelectContent className="macos-select">
                <SelectItem value="">{currentText.state}</SelectItem>
                {indonesianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="compact-filter filter-dropdown macos-select border-0 bg-background/80">
                <SelectValue placeholder={currentText.propertyType} />
              </SelectTrigger>
              <SelectContent className="macos-select">
                <SelectItem value="">{currentText.allTypes}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Popover */}
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="compact-filter btn-secondary-ios border-0 bg-background/80"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {currentText.filters}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 macos-select border-0" align="end">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">{currentText.listingType}</label>
                      <Select value={listingType} onValueChange={setListingType}>
                        <SelectTrigger className="compact-filter macos-select border-0">
                          <SelectValue placeholder={currentText.allTypes} />
                        </SelectTrigger>
                        <SelectContent className="macos-select">
                          <SelectItem value="">{currentText.allTypes}</SelectItem>
                          <SelectItem value="sale">{currentText.forSale}</SelectItem>
                          <SelectItem value="rent">{currentText.forRent}</SelectItem>
                          <SelectItem value="lease">{currentText.forLease}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">{currentText.price}</label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="compact-filter macos-select border-0">
                          <SelectValue placeholder={currentText.anyPrice} />
                        </SelectTrigger>
                        <SelectContent className="macos-select">
                          <SelectItem value="">{currentText.anyPrice}</SelectItem>
                          <SelectItem value="0-1000000000">Under Rp 1B</SelectItem>
                          <SelectItem value="1000000000-5000000000">Rp 1B - 5B</SelectItem>
                          <SelectItem value="5000000000-999999999999">Rp 5B+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">{currentText.bedrooms}</label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger className="compact-filter macos-select border-0">
                          <SelectValue placeholder={currentText.anyBedroom} />
                        </SelectTrigger>
                        <SelectContent className="macos-select">
                          <SelectItem value="">{currentText.anyBedroom}</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">{currentText.bathrooms}</label>
                      <Select value={bathrooms} onValueChange={setBathrooms}>
                        <SelectTrigger className="compact-filter macos-select border-0">
                          <SelectValue placeholder={currentText.anyBathroom} />
                        </SelectTrigger>
                        <SelectContent className="macos-select">
                          <SelectItem value="">{currentText.anyBathroom}</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{currentText.amenities}</label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map((amenity) => (
                        <Button
                          key={amenity.key}
                          variant={amenities.includes(amenity.key) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAmenity(amenity.key)}
                          className="compact-filter btn-secondary-ios"
                        >
                          <amenity.icon className="h-3 w-3 mr-1" />
                          {amenity.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button 
              onClick={handleSearch}
              className="btn-primary-ios px-6 h-10"
            >
              {currentText.searchBtn}
            </Button>
          </div>
        </div>
        
        {/* Trending Searches */}
        <div className="text-left">
          <p className="text-muted-foreground mb-3 font-medium text-sm">{currentText.trending}:</p>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/10 transition-colors text-xs bg-background/60"
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchFilters;
