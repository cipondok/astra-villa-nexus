
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useState } from "react";
import LocationSelector from "@/components/location/LocationSelector";

interface SearchFiltersProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
}

const SearchFilters = ({ language, onSearch }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "Select State",
      city: "Select City", 
      propertyType: "Property Type",
      listingType: "Listing Type",
      price: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      searchBtn: "🔍 Search Properties",
      forSale: "For Sale",
      forRent: "For Rent",
      allTypes: "All Types",
      anyPrice: "Any Price",
      anyBedroom: "Any",
      anyBathroom: "Any"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Pilih Provinsi",
      city: "Pilih Kota",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      price: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      searchBtn: "🔍 Cari Properti",
      forSale: "Dijual",
      forRent: "Disewa",
      allTypes: "Semua Jenis",
      anyPrice: "Semua Harga",
      anyBedroom: "Semua",
      anyBathroom: "Semua"
    }
  };

  const currentText = text[language];

  // Location handling is now done by LocationSelector component

  const propertyTypes = [
    { value: "house", label: language === "en" ? "🏠 House" : "🏠 Rumah" },
    { value: "apartment", label: language === "en" ? "🏢 Apartment" : "🏢 Apartemen" },
    { value: "villa", label: "🏖️ Villa" },
    { value: "townhouse", label: "🏘️ Townhouse" },
    { value: "condo", label: "🌆 Condo" },
    { value: "land", label: language === "en" ? "🌿 Land" : "🌿 Tanah" },
    { value: "commercial", label: language === "en" ? "🏬 Commercial" : "🏬 Komersial" }
  ];

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity("all"); // Reset city when province changes
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleSearch = () => {
    const searchFilters = {
      query: searchQuery,
      state: selectedProvince !== "all" ? selectedProvince : "",
      city: selectedCity !== "all" ? selectedCity : "",
      propertyType: propertyType,
      listingType: listingType,
      priceRange,
      bedrooms,
      bathrooms
    };
    
    console.log('Search filters:', searchFilters);
    onSearch(searchFilters);
  };

  return (
    <Card className="enhanced-card glow-gold border-binance-orange/30 backdrop-blur-lg">
      <CardContent className="p-8">
        {/* Main Search Bar */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-binance-orange" />
            <Input
              placeholder={currentText.search}
              className="enhanced-input pl-12 h-12 bg-binance-gray border-binance-light-gray text-binance-white placeholder:text-binance-light-gray"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationSelector
              selectedProvince={selectedProvince}
              selectedCity={selectedCity}
              onProvinceChange={handleProvinceChange}
              onCityChange={handleCityChange}
              showLabel={false}
              className="grid grid-cols-2 gap-2"
            />
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-12 bg-binance-gray border-binance-light-gray text-binance-white">
                <SelectValue placeholder={`🏠 ${currentText.propertyType}`} />
              </SelectTrigger>
              <SelectContent className="bg-binance-dark-gray border-binance-gray">
                <SelectItem value="" className="text-binance-white hover:bg-binance-gray">{currentText.allTypes}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-binance-white hover:bg-binance-gray">{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSearch}
            className="btn btn-primary h-12 font-bold text-lg glow-gold"
          >
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger className="h-10 bg-binance-gray border-binance-light-gray text-binance-white">
              <SelectValue placeholder={`💰 ${currentText.listingType}`} />
            </SelectTrigger>
            <SelectContent className="bg-binance-dark-gray border-binance-gray">
              <SelectItem value="" className="text-binance-white hover:bg-binance-gray">{currentText.allTypes}</SelectItem>
              <SelectItem value="sale" className="text-binance-white hover:bg-binance-gray">💵 {currentText.forSale}</SelectItem>
              <SelectItem value="rent" className="text-binance-white hover:bg-binance-gray">🏠 {currentText.forRent}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="h-10 bg-binance-gray border-binance-light-gray text-binance-white">
              <SelectValue placeholder={`💸 ${currentText.price}`} />
            </SelectTrigger>
            <SelectContent className="bg-binance-dark-gray border-binance-gray">
              <SelectItem value="" className="text-binance-white hover:bg-binance-gray">{currentText.anyPrice}</SelectItem>
              <SelectItem value="0-1000000000" className="text-binance-white hover:bg-binance-gray">Under Rp 1B</SelectItem>
              <SelectItem value="1000000000-5000000000" className="text-binance-white hover:bg-binance-gray">Rp 1B - 5B</SelectItem>
              <SelectItem value="5000000000-999999999999" className="text-binance-white hover:bg-binance-gray">Rp 5B+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="h-10 bg-binance-gray border-binance-light-gray text-binance-white">
              <SelectValue placeholder={`🛏️ ${currentText.bedrooms}`} />
            </SelectTrigger>
            <SelectContent className="bg-binance-dark-gray border-binance-gray">
              <SelectItem value="" className="text-binance-white hover:bg-binance-gray">{currentText.anyBedroom}</SelectItem>
              <SelectItem value="1" className="text-binance-white hover:bg-binance-gray">1</SelectItem>
              <SelectItem value="2" className="text-binance-white hover:bg-binance-gray">2</SelectItem>
              <SelectItem value="3" className="text-binance-white hover:bg-binance-gray">3</SelectItem>
              <SelectItem value="4+" className="text-binance-white hover:bg-binance-gray">4+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger className="h-10 bg-binance-gray border-binance-light-gray text-binance-white">
              <SelectValue placeholder={`🚿 ${currentText.bathrooms}`} />
            </SelectTrigger>
            <SelectContent className="bg-binance-dark-gray border-binance-gray">
              <SelectItem value="" className="text-binance-white hover:bg-binance-gray">{currentText.anyBathroom}</SelectItem>
              <SelectItem value="1" className="text-binance-white hover:bg-binance-gray">1</SelectItem>
              <SelectItem value="2" className="text-binance-white hover:bg-binance-gray">2</SelectItem>
              <SelectItem value="3" className="text-binance-white hover:bg-binance-gray">3</SelectItem>
              <SelectItem value="4+" className="text-binance-white hover:bg-binance-gray">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
