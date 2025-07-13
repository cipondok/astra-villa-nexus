import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, Filter } from "lucide-react";

interface SlimEnhancedSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const SlimEnhancedSearchPanel = ({ language, onSearch, onLiveSearch }: SlimEnhancedSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
  });

  const text = {
    en: {
      searchPlaceholder: "Search properties by location, type, or title...",
      location: "Location",
      type: "Type",
      listingType: "For Sale/Rent",
      search: "Search",
      advancedFilters: "Filters",
      anyLocation: "Any Location",
      anyType: "Any Type",
      anyListing: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      commercial: "Commercial",
      land: "Land"
    },
    id: {
      searchPlaceholder: "Cari properti berdasarkan lokasi, tipe, atau judul...",
      location: "Lokasi",
      type: "Tipe",
      listingType: "Jual/Sewa",
      search: "Cari",
      advancedFilters: "Filter",
      anyLocation: "Semua Lokasi",
      anyType: "Semua Tipe",
      anyListing: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      apartment: "Apartemen",
      house: "Rumah",
      villa: "Villa",
      commercial: "Komersial",
      land: "Tanah"
    }
  };

  const currentText = text[language];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onLiveSearch?.(value);
  };

  const handleSubmit = () => {
    const searchData = {
      searchQuery,
      ...filters
    };
    onSearch(searchData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 lg:flex-[3]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder={currentText.searchPlaceholder}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:flex-1">
            {/* Location Filter */}
            <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
              <SelectTrigger className="w-24 h-10 text-sm bg-white dark:bg-slate-700">
                <SelectValue placeholder={currentText.location} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{currentText.anyLocation}</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
                <SelectItem value="medan">Medan</SelectItem>
                <SelectItem value="bali">Bali</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Type Filter */}
            <Select value={filters.propertyType} onValueChange={(value) => setFilters({...filters, propertyType: value})}>
              <SelectTrigger className="w-20 h-10 text-sm bg-white dark:bg-slate-700">
                <SelectValue placeholder={currentText.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{currentText.anyType}</SelectItem>
                <SelectItem value="apartment">{currentText.apartment}</SelectItem>
                <SelectItem value="house">{currentText.house}</SelectItem>
                <SelectItem value="villa">{currentText.villa}</SelectItem>
                <SelectItem value="commercial">{currentText.commercial}</SelectItem>
                <SelectItem value="land">{currentText.land}</SelectItem>
              </SelectContent>
            </Select>

            {/* Listing Type Filter */}
            <Select value={filters.listingType} onValueChange={(value) => setFilters({...filters, listingType: value})}>
              <SelectTrigger className="w-20 h-10 text-sm bg-white dark:bg-slate-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{currentText.anyListing}</SelectItem>
                <SelectItem value="sale">{currentText.forSale}</SelectItem>
                <SelectItem value="rent">{currentText.forRent}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4"
            >
              <Search className="h-4 w-4 mr-1" />
              {currentText.search}
            </Button>
            
            <Button 
              variant="outline"
              className="border-gray-300 dark:border-slate-600 h-10 px-3"
              onClick={() => {/* Handle advanced filters */}}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlimEnhancedSearchPanel;