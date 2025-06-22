
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Bed, Bath } from "lucide-react";

interface SearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const text = {
    en: {
      search: "Search properties, location, or area...",
      state: "Select State",
      type: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      searchBtn: "Search",
      trending: "Popular Searches",
      allTypes: "All Types",
      anyBedroom: "Any",
      anyBathroom: "Any",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      condo: "Condo"
    },
    id: {
      search: "Cari properti, lokasi, atau area...",
      state: "Pilih Provinsi",
      type: "Jenis Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      searchBtn: "Cari",
      trending: "Pencarian Populer",
      allTypes: "Semua Jenis",
      anyBedroom: "Semua",
      anyBathroom: "Semua",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      condo: "Kondominium"
    }
  };

  const currentText = text[language];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", 
    "North Sumatra", "South Sumatra", "West Sumatra", "Riau"
  ];

  const propertyTypes = [
    { value: "apartment", label: currentText.apartment },
    { value: "house", label: currentText.house },
    { value: "villa", label: currentText.villa },
    { value: "condo", label: currentText.condo }
  ];

  const trendingSearches = language === "en" 
    ? ["Jakarta Apartment", "Bali Villa", "Surabaya House", "Modern Condo"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kondo Modern"];

  const handleSearch = () => {
    const searchData = {
      query: searchQuery,
      state: selectedState,
      propertyType,
      bedrooms,
      bathrooms
    };
    
    console.log('Search data:', searchData);
    onSearch(searchData);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch && value.length >= 2) {
      onLiveSearch(value);
    } else if (onLiveSearch && value.length === 0) {
      onLiveSearch("");
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    onSearch({ query: term });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-6">
          {/* Main Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={currentText.search}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={currentText.state} />
              </SelectTrigger>
              <SelectContent>
                {indonesianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={currentText.type} />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={currentText.bedrooms} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4+</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.searchBtn}
            </Button>
          </div>
          
          {/* Trending Searches */}
          <div className="text-left">
            <p className="text-gray-600 mb-3 font-medium">{currentText.trending}:</p>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedModernSearchPanel;
