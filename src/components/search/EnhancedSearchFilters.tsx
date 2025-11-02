
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Filter, ChevronDown, Home, Bed, Bath, Car, Wifi, AirVent, Sofa, Shield, Droplets, Tv, Wind, Warehouse, Building2 } from "lucide-react";
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
  const [facilities, setFacilities] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFacilities, setShowFacilities] = useState(false);

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
      myLocation: "My Location",
      facilities: "Facilities",
      buyFacilities: "For Buy",
      rentFacilities: "For Rent"
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
      myLocation: "Lokasi Saya",
      facilities: "Fasilitas",
      buyFacilities: "Untuk Beli",
      rentFacilities: "Untuk Sewa"
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

  const buyFacilityOptions = [
    { icon: Car, key: "parking", label: language === "en" ? "Parking" : "Parkir" },
    { icon: Shield, key: "security", label: language === "en" ? "Security" : "Keamanan" },
    { icon: Droplets, key: "pool", label: language === "en" ? "Pool" : "Kolam Renang" },
    { icon: Building2, key: "elevator", label: language === "en" ? "Elevator" : "Lift" },
    { icon: Warehouse, key: "storage", label: language === "en" ? "Storage" : "Gudang" }
  ];

  const rentFacilityOptions = [
    { icon: AirVent, key: "ac", label: "AC" },
    { icon: Wind, key: "water_heater", label: language === "en" ? "Water Heater" : "Pemanas Air" },
    { icon: Wifi, key: "wifi", label: "WiFi" },
    { icon: Tv, key: "tv_cable", label: language === "en" ? "TV Cable" : "TV Kabel" },
    { icon: Sofa, key: "furnished", label: language === "en" ? "Furnished" : "Furnished" }
  ];

  const toggleAmenity = (amenityKey: string) => {
    setAmenities(prev => 
      prev.includes(amenityKey) 
        ? prev.filter(a => a !== amenityKey)
        : [...prev, amenityKey]
    );
  };

  const toggleFacility = (facilityKey: string) => {
    setFacilities(prev => 
      prev.includes(facilityKey) 
        ? prev.filter(f => f !== facilityKey)
        : [...prev, facilityKey]
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
      amenities,
      facilities
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
      <CardContent className="p-3 md:p-6">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 md:top-3 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={currentText.search}
              className="pl-9 md:pl-10 h-10 md:h-12 macos-select border-0 text-sm md:text-base text-foreground bg-background/80 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1.5 md:right-2 top-1.5 md:top-2 h-7 md:h-8 w-7 md:w-8 p-0 hover:bg-primary/10 rounded-lg"
              onClick={useMyLocation}
            >
              <MapPin className="h-3.5 md:h-4 w-3.5 md:w-4 text-primary" />
            </Button>
          </div>
          
          {/* Compact Location Selectors */}
          <div className="flex gap-1.5 md:gap-2">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="compact-filter filter-dropdown macos-select border-0 bg-background/80 h-10 md:h-12 text-xs md:text-sm rounded-xl">
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
              <SelectTrigger className="compact-filter filter-dropdown macos-select border-0 bg-background/80 h-10 md:h-12 text-xs md:text-sm rounded-xl">
                <SelectValue placeholder={currentText.propertyType} />
              </SelectTrigger>
              <SelectContent className="macos-select">
                <SelectItem value="">{currentText.allTypes}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Facilities Popover */}
            <Popover open={showFacilities} onOpenChange={setShowFacilities}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="compact-filter btn-secondary-ios border-0 bg-background/80 h-10 md:h-12 rounded-xl text-xs md:text-sm"
                >
                  <Building2 className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{currentText.facilities}</span>
                  <ChevronDown className="h-3.5 md:h-4 w-3.5 md:w-4 ml-1 md:ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 macos-select border-0 rounded-2xl" align="end">
                <div className="space-y-3 md:space-y-4">
                  {/* Buy Facilities */}
                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{currentText.buyFacilities}</label>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {buyFacilityOptions.map((facility) => (
                        <Button
                          key={facility.key}
                          variant={facilities.includes(facility.key) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFacility(facility.key)}
                          className="compact-filter btn-secondary-ios h-8 md:h-9 text-xs rounded-lg"
                        >
                          <facility.icon className="h-3 w-3 mr-1" />
                          {facility.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Rent Facilities */}
                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{currentText.rentFacilities}</label>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {rentFacilityOptions.map((facility) => (
                        <Button
                          key={facility.key}
                          variant={facilities.includes(facility.key) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFacility(facility.key)}
                          className="compact-filter btn-secondary-ios h-8 md:h-9 text-xs rounded-lg"
                        >
                          <facility.icon className="h-3 w-3 mr-1" />
                          {facility.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Advanced Filters Popover */}
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="compact-filter btn-secondary-ios border-0 bg-background/80 h-10 md:h-12 rounded-xl text-xs md:text-sm"
                >
                  <Filter className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{currentText.filters}</span>
                  <ChevronDown className="h-3.5 md:h-4 w-3.5 md:w-4 ml-1 md:ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 macos-select border-0 rounded-2xl" align="end">
                <div className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-foreground mb-1 block">{currentText.listingType}</label>
                      <Select value={listingType} onValueChange={setListingType}>
                        <SelectTrigger className="compact-filter macos-select border-0 h-9 md:h-10 text-xs md:text-sm rounded-lg">
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
                      <label className="text-xs md:text-sm font-medium text-foreground mb-1 block">{currentText.price}</label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="compact-filter macos-select border-0 h-9 md:h-10 text-xs md:text-sm rounded-lg">
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
                      <label className="text-xs md:text-sm font-medium text-foreground mb-1 block">{currentText.bedrooms}</label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger className="compact-filter macos-select border-0 h-9 md:h-10 text-xs md:text-sm rounded-lg">
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
                      <label className="text-xs md:text-sm font-medium text-foreground mb-1 block">{currentText.bathrooms}</label>
                      <Select value={bathrooms} onValueChange={setBathrooms}>
                        <SelectTrigger className="compact-filter macos-select border-0 h-9 md:h-10 text-xs md:text-sm rounded-lg">
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
                    <label className="text-xs md:text-sm font-medium text-foreground mb-2 block">{currentText.amenities}</label>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {amenityOptions.map((amenity) => (
                        <Button
                          key={amenity.key}
                          variant={amenities.includes(amenity.key) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAmenity(amenity.key)}
                          className="compact-filter btn-secondary-ios h-8 md:h-9 text-xs rounded-lg"
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
              className="btn-primary-ios px-4 md:px-6 h-10 md:h-12 text-xs md:text-sm rounded-xl shadow-md"
            >
              <span className="hidden sm:inline">{currentText.searchBtn}</span>
              <Search className="h-4 w-4 sm:hidden" />
            </Button>
          </div>
        </div>
        
        {/* Trending Searches */}
        <div className="text-left">
          <p className="text-muted-foreground mb-2 md:mb-3 font-medium text-xs md:text-sm">{currentText.trending}:</p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/10 transition-colors text-[10px] md:text-xs bg-background/60 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md"
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
