import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Home, DollarSign, Filter, X, Bed, Bath } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
interface EnhancedModernSearchPanelProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const EnhancedModernSearchPanel = ({ language, onSearch, onLiveSearch }: EnhancedModernSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
  });

  const { t } = useTranslation();

  const currentText = {
    searchPlaceholder: t('modernSearch.searchPlaceholder'),
    location: t('modernSearch.location'),
    propertyType: t('modernSearch.propertyType'),
    listingType: t('modernSearch.listingType'),
    priceRange: t('modernSearch.priceRange'),
    bedrooms: t('modernSearch.bedrooms'),
    bathrooms: t('modernSearch.bathrooms'),
    amenities: t('modernSearch.amenities'),
    search: t('modernSearch.search'),
    advancedFilters: t('modernSearch.advancedFilters'),
    clearAll: t('modernSearch.clearAll'),
    from: t('modernSearch.from'),
    to: t('modernSearch.to'),
    any: t('modernSearch.any'),
    forSale: t('modernSearch.forSale'),
    forRent: t('modernSearch.forRent'),
    villa: t('modernSearch.villa'),
    apartment: t('modernSearch.apartment'),
    house: t('modernSearch.house'),
    townhouse: t('modernSearch.townhouse'),
    land: t('modernSearch.land'),
    pool: t('modernSearch.pool'),
    garage: t('modernSearch.garage'),
    garden: t('modernSearch.garden'),
    security: t('modernSearch.security'),
    gym: t('modernSearch.gym'),
    furnished: t('modernSearch.furnished'),
  };

  const propertyTypes = [
    { value: 'villa', label: currentText.villa, icon: '🏖️' },
    { value: 'apartment', label: currentText.apartment, icon: '🏢' },
    { value: 'house', label: currentText.house, icon: '🏠' },
    { value: 'townhouse', label: currentText.townhouse, icon: '🏘️' },
    { value: 'land', label: currentText.land, icon: '🌿' },
  ];

  const listingTypes = [
    { value: 'sale', label: currentText.forSale, icon: '💰' },
    { value: 'rent', label: currentText.forRent, icon: '🔑' },
  ];

  const amenitiesList = [
    { value: 'pool', label: currentText.pool, icon: '🏊' },
    { value: 'garage', label: currentText.garage, icon: '🚗' },
    { value: 'garden', label: currentText.garden, icon: '🌳' },
    { value: 'security', label: currentText.security, icon: '🛡️' },
    { value: 'gym', label: currentText.gym, icon: '💪' },
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch) {
      onLiveSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const actualValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      ...filters
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      propertyType: '',
      listingType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      amenities: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ) || searchQuery !== '';

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-2xl border-0 bg-card/98 backdrop-blur-xl xl:min-h-[600px] 2xl:min-h-[700px]">
      <CardContent className="p-6 lg:p-8 xl:p-10 2xl:p-12">
        <div className="space-y-4 lg:space-y-6 xl:space-y-8">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 xl:h-7 xl:w-7 text-primary" />
            <Input
              placeholder={currentText.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-14 xl:pl-16 h-14 lg:h-16 xl:h-20 2xl:h-24 text-base lg:text-lg xl:text-xl 2xl:text-2xl border-2 border-border focus:border-primary bg-background text-foreground placeholder:text-muted-foreground rounded-xl shadow-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <Home className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-primary" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-foreground">
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <DollarSign className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-primary" />
                  <SelectValue placeholder={currentText.listingType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-foreground">
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground rounded-lg text-base xl:text-lg 2xl:text-xl">
                <div className="flex items-center gap-2 xl:gap-3">
                  <MapPin className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-primary" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all" className="text-foreground">{currentText.any}</SelectItem>
                <SelectItem value="jakarta" className="text-foreground">Jakarta</SelectItem>
                <SelectItem value="bali" className="text-foreground">Bali</SelectItem>
                <SelectItem value="surabaya" className="text-foreground">Surabaya</SelectItem>
                <SelectItem value="bandung" className="text-foreground">Bandung</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground hover:bg-muted rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
            >
              <Filter className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
              {currentText.advancedFilters}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 lg:space-y-6 xl:space-y-8 pt-4 lg:pt-6 xl:pt-8 border-t border-border">
              {/* Price Range */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <Input
                  placeholder={currentText.from}
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
                />
                <Input
                  placeholder={currentText.to}
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="h-12 lg:h-14 xl:h-16 2xl:h-20 border-border bg-background text-foreground rounded-lg text-base xl:text-lg 2xl:text-xl px-4 xl:px-6"
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-3 lg:space-y-4">
                  <label className="text-sm lg:text-base xl:text-lg font-medium text-foreground flex items-center gap-2">
                    <Bed className="h-4 w-4 xl:h-5 xl:w-5" />
                    {currentText.bedrooms}
                  </label>
                  <div className="flex gap-2 lg:gap-3 flex-wrap">
                    <Button
                      variant={filters.bedrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bedrooms', '')}
                      className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                    >
                      {currentText.any}
                    </Button>
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bedrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bedrooms', option)}
                        className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <label className="text-sm lg:text-base xl:text-lg font-medium text-foreground flex items-center gap-2">
                    <Bath className="h-4 w-4 xl:h-5 xl:w-5" />
                    {currentText.bathrooms}
                  </label>
                  <div className="flex gap-2 lg:gap-3 flex-wrap">
                    <Button
                      variant={filters.bathrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bathrooms', '')}
                      className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                    >
                      {currentText.any}
                    </Button>
                    {bathroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bathrooms', option)}
                        className="text-sm lg:text-base xl:text-lg h-10 lg:h-12 xl:h-14 px-3 xl:px-4"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 lg:space-y-4">
                <label className="text-sm lg:text-base xl:text-lg font-medium text-foreground">{currentText.amenities}</label>
                <div className="flex gap-2 lg:gap-3 flex-wrap">
                  {amenitiesList.map((amenity) => (
                    <Badge
                      key={amenity.value}
                      variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform text-sm lg:text-base xl:text-lg px-3 lg:px-4 py-2 lg:py-3 h-10 lg:h-12 xl:h-14 rounded-lg"
                      onClick={() => handleAmenityToggle(amenity.value)}
                    >
                      {amenity.icon} {amenity.label}
                      {filters.amenities.includes(amenity.value) && (
                        <X className="h-4 w-4 xl:h-5 xl:w-5 ml-2" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 lg:gap-4 pt-4 lg:pt-6">
            <Button
              onClick={handleSearch}
              className="flex-1 h-14 lg:h-16 xl:h-20 2xl:h-24 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base lg:text-lg xl:text-xl 2xl:text-2xl"
            >
              <Search className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
              {currentText.search}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="h-14 lg:h-16 xl:h-20 2xl:h-24 px-6 xl:px-8 border-border text-muted-foreground hover:bg-muted rounded-lg text-base lg:text-lg xl:text-xl 2xl:text-2xl"
              >
                <X className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 mr-2 xl:mr-3" />
                {currentText.clearAll}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedModernSearchPanel;
